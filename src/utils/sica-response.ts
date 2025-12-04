export class SicaResponse<T> {
  private readonly data?: T;
  private readonly message: string;
  private readonly status: number;

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
    this.message = message;
    this.status = status;
  }
}
