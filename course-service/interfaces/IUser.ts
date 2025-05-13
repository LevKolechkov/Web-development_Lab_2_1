export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  role: string;
}
