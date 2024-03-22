// Custom error classes
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

// Error handling functions
export const handleBadRequest = (message: string): never => {
  throw new BadRequestError(message);
};

export const handleInternalServerError = (message: string): never => {
  throw new InternalServerError(message);
};
