import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  mongoUri: string;
  rabbitmqHost: string;
  awsSesHost: string;
  awsSesPort: number;
  awsSesUsername: string;
  awsSesPassword: string;
  awsSesSenderEmail: string;
}

export const config: Config = {
  nodeEnv: String(process.env.NODE_ENV),
  mongoUri: String(process.env.MONGO_URI),
  rabbitmqHost: String(process.env.RABBITMQ_HOST),

  awsSesHost: String(process.env.AWS_SES_HOST),
  awsSesPort: Number(process.env.AWS_SES_PORT),
  awsSesUsername: String(process.env.AWS_SES_USERNAME),
  awsSesPassword: String(process.env.AWS_SES_PASSWORD),
  awsSesSenderEmail: String(process.env.AWS_SES_SENDER_EMAIL),
};
