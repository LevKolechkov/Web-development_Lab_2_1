export interface IResponse extends Document {
  requestId: string;
  path: string;
  method: string;
  status: number;
  result: string[];
  error: string[];
}
