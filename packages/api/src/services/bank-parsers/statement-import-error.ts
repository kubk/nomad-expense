export class StatementFormatError extends Error {
  readonly originalError: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = "StatementFormatError";
    this.originalError = originalError;
  }
}

export class StatementParseError extends Error {
  readonly originalError: unknown;

  constructor(originalError: unknown) {
    super("Unable to parse statement transactions");
    this.name = "StatementParseError";
    this.originalError = originalError;
  }
}
