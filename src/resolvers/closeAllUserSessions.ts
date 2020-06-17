import { Student } from "../entity/Student";
import { getConnection } from "typeorm";

export const closeAllUserSessions = async (controlNumber: string) => {
  try {
    await getConnection()
      .getRepository(Student)
      .increment({ controlNumber }, "tokenVersion", 1);
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
};
