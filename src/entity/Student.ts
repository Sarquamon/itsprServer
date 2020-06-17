import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity("students")
export class Student extends BaseEntity {
  @Field()
  @PrimaryColumn({ name: "numeroControl", type: "varchar", length: 10 })
  controlNumber: string;

  @Field()
  @Column({ type: "varchar", length: 20, unique: true })
  curp: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 14, unique: true, nullable: true })
  rfc?: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column({ name: "contra" })
  password: string;

  @Field()
  @Column({ name: "nombres" })
  names: string;

  @Field()
  @Column({ name: "apellidoPaterno" })
  lastname: string;

  @Field()
  @Column({ name: "apellidoMaterno" })
  secondLastname: string;

  @Field()
  @Column({ name: "carrera" })
  career: string;

  @Field()
  @Column({ name: "estadoCivil" })
  civilState: string;

  @Field(() => String, { nullable: true })
  @Column({
    name: "numeroCelular",
    type: "varchar",
    length: "14",
    nullable: true,
  })
  cellphone?: string;

  @Field(() => String)
  @Column({
    name: "numeroTelefono",
    type: "varchar",
    length: "14",
    nullable: true,
  })
  telephone?: string;

  @Field()
  @Column({ name: "fechaNac", type: "date" })
  birthday: string;

  @Field()
  @Column({ name: "estadoNac" })
  birthState: string;

  @Field()
  @Column({ name: "ciudadNac" })
  birthplace: string;

  @Field()
  @Column({ name: "calleHogar" })
  homeStreet: string;

  @Field(() => Int)
  @Column({ name: "numeroHogar" })
  homeNumber: number;

  @Field()
  @Column({ name: "coloniaHogar" })
  homeNeighborhood: string;

  @Field()
  @Column({ name: "municipioHogar" })
  homeMunicipality: string;

  @Field(() => Int)
  @Column({ name: "codigoPostalHogar" })
  homePostalCode: number;

  @Field()
  @Column({ name: "ciudadHogar" })
  homeCity: string;

  @Field()
  @Column({ name: "estadoHogar" })
  homeState: string;

  @Field()
  @Column({ name: "escuelaProc" })
  school: string;

  @Field()
  @Column({ name: "municipioEscuelaProc" })
  schoolMunicipality: string;

  @Field()
  @Column({ name: "estadoEscuelaProc" })
  schoolState: string;

  @Field()
  @Column({ name: "fechaEgresoEscuelaProc" })
  gradDate: number;

  @Field(() => Int)
  @Column({ name: "califPromedioEscuelaProc" })
  avgCalif: number;

  @Field()
  @Column()
  area: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: "numeroIMSS", type: "int", nullable: true })
  imssNumber?: number;

  @Field(() => String, { nullable: true })
  @Column({ name: "clinicaIMSS", type: "varchar", length: 80, nullable: true })
  clinic?: string;

  @Field()
  @Column({ name: "tipoSangre" })
  bloodType: string;

  // @Field()
  // @Column({ name: "alergias", nullable: true })
  // alergies: string;

  // @Field()
  // @Column({ name: "tratamientoPsico", nullable: true })
  // psychoBackground: string;

  @Field(() => String, { nullable: true })
  @Column({
    name: "empresaTrabajo",
    type: "varchar",
    length: 80,
    nullable: true,
  })
  workCompany?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 50, nullable: true })
  tutor?: string;

  @Column({ type: "boolean", default: false })
  activeUser: boolean;

  @Column({ type: "varchar", length: 300, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: "date", nullable: true })
  resetPasswordTokenExpires?: Date;

  @Column({ type: "int", default: 0 })
  tokenVersion: number;
}
