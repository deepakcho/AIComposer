/** Typed error codes so adapters and plugins can branch on failures. */
export const ErrorCode = {
  EDITOR_DESTROYED: 'EDITOR_DESTROYED',
  UNKNOWN_COMMAND: 'UNKNOWN_COMMAND',
  UNKNOWN_FORMAT: 'UNKNOWN_FORMAT',
  UNKNOWN_TRIGGER: 'UNKNOWN_TRIGGER',
  PLUGIN_SETUP_FAILED: 'PLUGIN_SETUP_FAILED',
} as const;

export type AIComposerErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AIComposerError extends Error {
  readonly code: AIComposerErrorCode;

  constructor(code: AIComposerErrorCode, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'AIComposerError';
    this.code = code;
  }
}

export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === 'string' ? value : JSON.stringify(value));
}
