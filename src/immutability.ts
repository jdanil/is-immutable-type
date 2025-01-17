/**
 * The immutability values are sorted in ascending order.
 */
export enum Immutability {
  Unknown = Number.NaN,
  // MutableDeep = 1,
  Mutable = 2,
  // MutableShallow = 2,
  // Readonly = 3,
  ReadonlyShallow = 3,
  ReadonlyDeep = 4,
  Immutable = 5,
  Calculating = Number.POSITIVE_INFINITY,
}
