/**
 * Erreur renvoyée par l'API. `code` permet aux écrans de réagir sans
 * analyser le texte du message (qui, lui, est destiné à l'utilisateur).
 */
export class ApiError extends Error {
  readonly code: 'not_found' | 'invalid_input' | 'unavailable';

  constructor(code: ApiError['code'], message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}
