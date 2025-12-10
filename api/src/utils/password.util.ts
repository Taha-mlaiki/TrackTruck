import bcrypt from "bcryptjs";

const SALT = 10;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT);
};

export const comparPwd = async (password: string, hashedPass: string) => {
  return bcrypt.compare(password, hashedPass);
};


/* ! the question that I have during the reading the code :
1 . why we create config / index.ts , why not using just process.env in each time we want 
2 . why we create core folder what does usually include 
3 .  can you explain the class inside the AppError line by line what it does
*/