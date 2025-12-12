import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
