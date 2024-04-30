class ApiError extends Error {
  message: string;
  userMessage: string;
  statusCode: number;

  constructor(message: string, userMessage: string, statusCode: number) {
    super(message);
    this.message = message;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
