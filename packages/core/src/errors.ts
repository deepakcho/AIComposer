/** Typed error codes so adapters and plugins can branch on failures. */
export const ErrorCode = {
  EDITOR_DESTROYED: 'EDITOR_DESTROYED',
  UNKNOWN_COMMAND: 'UNKNOWN_COMMAND',
  UNKNOWN_FORMAT: 'UNKNOWN_FORMAT',
  UNKNOWN_TRIGGER: 'UNKNOWN_TRIGGER',
  PLUGIN_SETUP_FAILED: 'PLUGIN_SETUP_FAILED',
} as const;

export type PromptErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class PromptEditorError extends Error {
  readonly code: PromptErrorCode;

  constructor(code: PromptErrorCode, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'PromptEditorError';
    this.code = code;
  }
}

export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === 'string' ? value : JSON.stringify(value));
}
