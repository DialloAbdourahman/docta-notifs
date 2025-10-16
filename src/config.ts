import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  mongoUri: string;
  // awsAccessKey: string;
  // awsSecretKey: string;
  // awsS3Bucket: string;
  // awsS3Region: string;
  rabbitmqHost: string;
}

export const config: Config = {
  nodeEnv: String(process.env.NODE_ENV),
  mongoUri: String(process.env.MONGO_URI),

  // awsAccessKey: String(process.env.AWS_ACCESS_KEY),
  // awsSecretKey: String(process.env.AWS_SECRET_KEY),
  // awsS3Bucket: String(process.env.AWS_S3_BUCKET),
  // awsS3Region: String(process.env.AWS_S3_REGION),
  rabbitmqHost: String(process.env.RABBITMQ_HOST),
};
