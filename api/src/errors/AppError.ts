
export class AppError extends Error {
  public status: number;
  public details: any;
  constructor(status = 500, message = "Internal Server Error", details?: any) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
