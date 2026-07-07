import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME || process.env.SQL_DB_NAME || "store_rating_db";
const dbUser = process.env.DB_USER || process.env.SQL_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || process.env.SQL_PASSWORD || "postgres";
const dbHost = process.env.DB_HOST || process.env.SQL_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT || "5432";

console.log(`Connecting to database: ${dbName} as user: ${dbUser} on host: ${dbHost}:${dbPort}`);

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: parseInt(dbPort, 10),
  dialect: "postgres",
  logging: false,
  dialectOptions: {},
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
