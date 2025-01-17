import * as tsvfs from "@typescript/vfs";
import type { ExecutionContext } from "ava";
import ts from "typescript";

import {
  getTypeImmutability,
  Immutability,
  isImmutableType,
  isMutableType,
  isReadonlyDeepType,
  isReadonlyShallowType,
  type ImmutabilityCache,
  type ImmutabilityOverrides,
} from "../src";

/**
 * Type guard to check if a Statement has a type.
 */
export function hasTypeNode(
  node: ts.Statement
): node is ts.Statement & { type: ts.TypeNode } {
  return Object.hasOwn(node, "type");
}

/**
 * Create a TS environment to run the tests in.
 */
function createTSTestEnvironment(code: string) {
  const compilerOptions: ts.CompilerOptions = {
    lib: ["ES2021"],
    target: ts.ScriptTarget.ES2021,
  };

  const fsMap = tsvfs.createDefaultMapFromNodeModules(compilerOptions, ts);
  fsMap.set("index.ts", code);

  const system = tsvfs.createSystem(fsMap);
  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    ["index.ts"],
    ts,
    compilerOptions
  );

  const program = env.languageService.getProgram();
  if (program === undefined) {
    throw new Error("Failed to get program.");
  }

  const ast = env.getSourceFile("index.ts");
  if (ast === undefined) {
    throw new Error("Failed to get ast.");
  }

  return { program, ast };
}

/**
 * Get the first type defined in the given code.
 */
function getType(code: string, line?: number) {
  const { ast, program } = createTSTestEnvironment(code);

  if (line !== undefined && line > ast.statements.length) {
    throw new Error(`No statement found.`);
  }

  const statement = ast.statements[(line ?? ast.statements.length) - 1]!;
  const checker = program.getTypeChecker();
  const type = checker.getTypeAtLocation(statement);

  return {
    type,
    typeNode: hasTypeNode(statement) ? statement.type : undefined,
    checker,
  };
}

/**
 * Run tests against "getTypeImmutability".
 */
export function runTestImmutability(
  t: Readonly<ExecutionContext<unknown>>,
  test:
    | string
    | Readonly<{
        code: string;
        line?: number;
        overrides?: ImmutabilityOverrides;
        cache?: ImmutabilityCache;
      }>,
  expected: Immutability,
  message?: string
): void {
  const { code, line, overrides, cache } =
    typeof test === "string"
      ? { code: test, line: undefined, overrides: undefined, cache: undefined }
      : test;

  const { checker, type, typeNode } = getType(code, line);

  const actual = getTypeImmutability(
    checker,
    typeNode ?? type,
    overrides,
    cache
  );
  t.is(Immutability[actual], Immutability[expected], message);

  const immutable = isImmutableType(checker, type, overrides, cache);
  t.is(expected >= Immutability.Immutable, immutable);

  const readonlyDeep = isReadonlyDeepType(checker, type, overrides, cache);
  t.is(expected >= Immutability.ReadonlyDeep, readonlyDeep);

  const readonlyShallow = isReadonlyShallowType(
    checker,
    type,
    overrides,
    cache
  );
  t.is(expected >= Immutability.ReadonlyShallow, readonlyShallow);

  const mutable = isMutableType(checker, type, overrides, cache);
  t.is(expected === Immutability.Mutable, mutable);
}
