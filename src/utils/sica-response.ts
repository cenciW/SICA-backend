export class SicaResponse<T> {
  private readonly data?: T;
  private readonly messageText: string;
  private readonly statusCode: number;

  constructor({
    message,
    status = 200,
    data,
  }: {
    message: string;
    status?: number;
    data?: T;
  }) {
    this.data = data;
    this.messageText = message;
    this.statusCode = status;
  }
}
