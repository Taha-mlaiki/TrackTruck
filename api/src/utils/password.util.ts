import bcrypt from "bcrypt";

const SALT = 10;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT);
};

export const comparPwd = async (password: string, hashedPass: string) => {
  return bcrypt.compare(password, hashedPass);
};
