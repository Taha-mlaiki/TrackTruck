
//! understand how appError work in the background 
export class AppError extends Error {
  public status: number;
  public details: any;
  constructor(status = 500, message = "Internal Server Error", details?: any) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
