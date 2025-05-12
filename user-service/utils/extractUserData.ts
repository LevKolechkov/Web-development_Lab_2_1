import { IUser } from "../interfaces/IUser";

export const extractUserData = (body: IUser) => {
  const { firstName, lastName, login, password, role } = body;

  if (!firstName || !lastName || !login || !password || !role) {
    return {
      isValid: false,
      message: "All fields (firstName, lastName, login, password) are required",
    };
  }

  return {
    isValid: true,
    data: { firstName, lastName, login, password, role },
  };
};
