export class AppError extends Error {
  public err_code: number = 500;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message);
    this.err_code = 400;
    this.name = "BAD_REQUEST"
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
    this.err_code = 404;
    this.name = "NOT_FOUND"
  }
}