import dotenv from "dotenv";
import joi from "joi";

// Config .env
dotenv.config();

// Make Schema For Validating .env
const envSchema = joi
  .object({
    PORT: joi.number().min(3000).required(),
    SECRET_KEY: joi.string().required(),
    TOKEN_EXP: joi.string().required(),
  })
  .unknown(true)
  .required();

const { error, value } = envSchema.validate(process.env);

// if .env File Dont Config Correctly Throw Error
if (error?.message) {
  throw new Error(error?.message);
}

// For Type Intelisence export All variables From .env
export const config = {
  PORT: value.PORT,
  SECRET_KEY: value.SECRET_KEY,
  TOKEN_EXP: value.TOKEN_EXP,
};
