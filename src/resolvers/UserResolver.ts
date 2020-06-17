import {
  Query,
  Resolver,
  Arg,
  Mutation,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Student } from "../entity/Student";
import { hash, verify } from "argon2";
import { expressContext } from "src/contexts/expressContext";
import {
  createRefresToken,
  createAccessToken,
  createResetPasswordToken,
  createActivateAccountToken,
} from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import sgMail from "@sendgrid/mail";
import { closeAllUserSessions } from "./closeAllUserSessions";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async revokeStudentRefreshTokens(
    @Ctx() { payload }: expressContext,
    @Arg("password", () => String) password: string
  ) {
    const controlNumber = payload!.userId;

    const student = await Student.findOne({ where: { controlNumber } });

    if (!student) {
      throw new Error("User not found");
    }

    const valid = await verify(student.password, password);

    if (!valid) {
      throw new Error("Wrong password");
    }

    const closedSessions = await closeAllUserSessions(controlNumber);

    if (!closedSessions) {
      throw new Error("Could not close sessions");
    }

    return true;
  }

  @Query(() => String)
  async resetStudentPassword(
    @Arg("email", () => String) email?: string,
    @Arg("curp", () => String) curp?: string
  ) {
    const student = await Student.findOne({ where: [{ email }, { curp }] });

    if (!student) {
      throw new Error("User not found");
    }

    const resetPasswordToken = createResetPasswordToken(student);
    const resetPasswordTokenExpires = new Date();

    resetPasswordTokenExpires.setHours(
      resetPasswordTokenExpires.getHours() + 24
    );

    await Student.update(student.controlNumber, {
      resetPasswordToken,
      resetPasswordTokenExpires,
    });

    const msg = {
      from: "salo711@hotmail.com",
      to: student.email,
      subject: "Recuperación de contraseña",
      dynamicTemplateData: {
        names: student.names,
        lastname: student.lastname,
        secondLastname: student.secondLastname,
        url: `${process.env.URL}/j/recoverpwd?token=${resetPasswordToken}&useremail=${student.email}`,
      },
      templateId: "d-1d848ef301c24c8cb6f6963efbab76ab",
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(error.response.body);
      throw new Error("Mail not sent");
    }

    return true;
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  logout(@Ctx() { payload }: expressContext) {
    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => [Student])
  students() {
    return Student.find();
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: expressContext
  ): Promise<LoginResponse> {
    const user = await Student.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const valid = await verify(user.password, password);

    if (!valid) {
      throw new Error("Wrong password");
    }

    sendRefreshToken(res, createRefresToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }

  @Mutation(() => Boolean)
  async registerStudent(
    @Arg("curp", () => String) curp: string,
    @Arg("rfc", () => String) rfc: string,
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Arg("names", () => String) names: string,
    @Arg("lastname", () => String) lastname: string,
    @Arg("secondLastname", () => String) secondLastname: string,
    @Arg("career", () => String) career: string,
    @Arg("civilState", () => String) civilState: string,
    @Arg("cellphone", () => String) cellphone: string,
    @Arg("telephone", () => String) telephone: string,
    @Arg("birthday", () => String) birthday: string,
    @Arg("birthState", () => String) birthState: string,
    @Arg("birthplace", () => String) birthplace: string,
    @Arg("homeStreet", () => String) homeStreet: string,
    @Arg("homeNumber", () => Number) homeNumber: number,
    @Arg("homeNeighborhood", () => String) homeNeighborhood: string,
    @Arg("homeMunicipality", () => String) homeMunicipality: string,
    @Arg("homePostalCode", () => Number) homePostalCode: number,
    @Arg("homeCity", () => String) homeCity: string,
    @Arg("homeState", () => String) homeState: string,
    @Arg("school", () => String) school: string,
    @Arg("schoolMunicipality", () => String) schoolMunicipality: string,
    @Arg("schoolState", () => String) schoolState: string,
    @Arg("gradDate", () => Number) gradDate: number,
    @Arg("avgCalif", () => Number) avgCalif: number,
    @Arg("area", () => String) area: string,
    @Arg("imssNumber", () => Number) imssNumber: number,
    @Arg("clinic", () => String) clinic: string,
    @Arg("bloodType", () => String) bloodType: string,
    // @Arg("alergies", () => String) alergies: string,
    // @Arg("psychoBackground", () => String) psychoBackground: string,
    @Arg("workCompany", () => String) workCompany: string,
    @Arg("tutor", () => String) tutor: string
  ) {
    const student = await Student.findOne({ where: [{ curp }, { email }] });

    if (student) {
      throw new Error("Existing User");
    }

    try {
      const hashedPwd = await hash(password);

      const date = new Date();
      const yy = date.getFullYear().toString().substr(-2);

      await Student.insert({
        controlNumber: yy + "6P050" + date.getMonth(),
        curp,
        rfc,
        email,
        password: hashedPwd,
        names,
        lastname,
        secondLastname,
        career,
        civilState,
        cellphone,
        telephone,
        birthday,
        birthState,
        birthplace,
        homeStreet,
        homeNumber,
        homeNeighborhood,
        homeMunicipality,
        homePostalCode,
        homeCity,
        homeState,
        school,
        schoolMunicipality,
        schoolState,
        gradDate,
        avgCalif,
        area,
        imssNumber,
        clinic,
        bloodType,
        // alergies,
        // psychoBackground,
        workCompany,
        tutor,
      });
    } catch (error) {
      console.log("Error: ", error);
      return false;
    }

    const activateAccountToken = createActivateAccountToken();

    const msg = {
      from: "salo711@hotmail.com",
      to: email,
      subject: "Activa tu cuenta",
      dynamicTemplateData: {
        names: names,
        lastname: lastname,
        secondLastname: secondLastname,
        url: `${process.env.URL}/h/activate?token=${activateAccountToken}`,
      },
      templateId: "d-1db254d776564308965a5611f8f4e92b",
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(error.response.body);
      throw new Error("Mail not sent");
    }

    return true;
  }
}
