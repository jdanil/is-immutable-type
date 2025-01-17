// eslint-disable-next-line unicorn/import-style
import "typescript";

declare module "typescript" {
  interface TypeChecker {
    // internal TS APIs

    /**
     * @returns `true` if the given type is an array type:
     * - `Array<foo>`
     * - `ReadonlyArray<foo>`
     * - `foo[]`
     * - `readonly foo[]`
     */
    isArrayType(type: Type): type is TypeReference;

    /**
     * @returns `true` if the given type is a tuple type:
     * - `[foo]`
     * - `readonly [foo]`
     */
    isTupleType(type: Type): type is TupleTypeReference;

    /**
     * Return the type of the given property in the given type, or undefined if no such property exists
     */
    getTypeOfPropertyOfType(type: Type, propertyName: string): Type | undefined;

    /**
     * The recursion identity of a type is an object identity that is shared among multiple instantiations of the type.
     * We track recursion identities in order to identify deeply nested and possibly infinite type instantiations with
     * the same origin. For example, when type parameters are in scope in an object type such as { x: T }, all
     * instantiations of that type have the same recursion identity. The default recursion identity is the object
     * identity of the type, meaning that every type is unique. Generally, types with constituents that could circularly
     * reference the type have a recursion identity that differs from the object identity.
     */
    getRecursionIdentity(type: Type): object;
  }

  interface Type {
    /**
     * If the type is `any`, and this is set to "error", then TS was unable to resolve the type
     */
    intrinsicName?: string;
  }
}
