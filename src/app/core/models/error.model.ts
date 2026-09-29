/**
 * Zajednicki model za greske sa servera.
 * Svi GlobalExceptionHandleri u backendu koriste record ErrorResponse.
 */

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

/**
 * @Valid greske se NE vraćaju kao ErrorResponse nego kao Map<String,String>
 * (polje -> poruka), npr. { "email": "Email nije validan" }.
 */
export type ValidationErrors = Record<string, string>;
