export type AsyncValue<T> =
  | { status: "ready", value: T}
  | { status: "pending" | "failed"}