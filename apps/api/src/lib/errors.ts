/**
 * Uygulama hataları. Hata işleyici bu sınıfları HTTP durum kodlarına çevirir.
 */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Kimlik doğrulaması gerekli') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Kayıt bulunamadı') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Çakışan bir işlem var, lütfen tekrar deneyin') {
    super(409, 'CONFLICT', message);
  }
}

export class UpstreamError extends AppError {
  constructor(message: string) {
    super(502, 'UPSTREAM_ERROR', message);
  }
}
