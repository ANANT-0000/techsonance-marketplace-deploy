import { SanitizedErrorResponse, InternalErrorCode } from "./error.types";
import { ERROR_MAPPING } from "./error.constants";

export class SecureErrorHandler {
  /**
   * Safe entry point to ingest any raw backend error payload and
   * return a sanitized, client-safe error response.
   *
   * @param rawError The raw error caught in the application/middleware.
   */
  public static handle(rawError: any): SanitizedErrorResponse {
    // 1. Determine Internal Code based on raw payload markers
    const internalCode = this.classifyError(rawError);

    // 2. Fetch the corresponding safe configuration mapping
    const mapping = ERROR_MAPPING[internalCode] || ERROR_MAPPING[InternalErrorCode.UNKNOWN_SYSTEM_ERROR];

    // 3. Construct and return the safe response payload
    return {
      statusCode: mapping.statusCode,
      errorCode: internalCode,
      message: mapping.message,
      action: mapping.action,
    };
  }

  /**
   * Helper to analyze raw payloads safely without exposing structural details.
   */
  private static classifyError(rawError: any): InternalErrorCode {
    if (!rawError) {
      return InternalErrorCode.UNKNOWN_SYSTEM_ERROR;
    }

    const messageString = String(rawError.message || "").toLowerCase();
    const codeString = String(rawError.code || "");

    // Payment Gateway / Razorpay Failures
    if (
      messageString.includes("payment gateway") ||
      messageString.includes("razorpay") ||
      messageString.includes("gateway credentials")
    ) {
      return InternalErrorCode.PAYMENT_GATEWAY_FAILURE;
    }

    // Connection failures
    if (
      codeString === "ECONNREFUSED" ||
      messageString.includes("connection failed") ||
      messageString.includes("cannot connect")
    ) {
      return InternalErrorCode.DATABASE_CONNECTION_FAILURE;
    }

    // Unique Constraint
    if (
      codeString === "23505" ||
      messageString.includes("unique constraint") ||
      messageString.includes("already exists")
    ) {
      return InternalErrorCode.UNIQUE_CONSTRAINT_VIOLATION;
    }

    // Foreign Key Constraint
    if (
      codeString === "23503" ||
      messageString.includes("foreign key constraint") ||
      messageString.includes("violates key")
    ) {
      return InternalErrorCode.FOREIGN_KEY_VIOLATION;
    }

    // Record Not Found
    if (
      codeString === "P2025" ||
      messageString.includes("not found") ||
      messageString.includes("no record found")
    ) {
      return InternalErrorCode.RECORD_NOT_FOUND;
    }

    // Timeout
    if (messageString.includes("timeout") || messageString.includes("deadline")) {
      return InternalErrorCode.TRANSACTION_TIMEOUT;
    }

    return InternalErrorCode.UNKNOWN_SYSTEM_ERROR;
  }
}
