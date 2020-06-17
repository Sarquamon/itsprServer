import { Student } from "../entity/Student";
import { sign } from "jsonwebtoken";

export const createAccessToken = (user: Student) => {
  return sign(
    { userId: user.controlNumber, email: user.email },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "7m",
    }
  );
};

export const createRefresToken = (user: Student) => {
  return sign(
    {
      userId: user.controlNumber,
      email: user.email,
      tokenVersion: user.tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "365d",
    }
  );
};

export const createResetPasswordToken = (user: Student) => {
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  return sign(
    {
      userId: user.controlNumber,
      email: user.email,
      tokenExpires,
    },
    process.env.RESET_PASSWORD_TOKEN_SECRET!,
    {
      expiresIn: "24h",
    }
  );
};

export const createActivateAccountToken = () => {
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);

  return sign(
    {
      tokenExpires,
    },
    process.env.ACTIVATE_ACCOUNT_TOKEN_SECRET!,
    {
      expiresIn: "24h",
    }
  );
};
