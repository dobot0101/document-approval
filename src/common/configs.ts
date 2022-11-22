import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT ? process.env.PORT : '8000'

if (!process.env.JWT_SECRET_KEY) {
  throw new Error(`JWT_SECRET_KEY 없음`)
}
if (!process.env.DB_HOST) {
  throw new Error(`DB_HOST 없음`)
}
if (!process.env.DB_PORT) {
  throw new Error(`DB_PORT 없음`)
}
if (!process.env.DB_USERNAME) {
  throw new Error(`DB_USERNAME 없음`)
}
if (!process.env.DB_PASSWORD) {
  throw new Error(`DB_PASSWORD 없음`)
}
if (!process.env.DB_DATABASE) {
  throw new Error(`DB_DATABASE 없음`)
}
if (!process.env.TEST_DB_DATABASE) {
  throw new Error(`TEST_DB_DATABASE 없음`)
}

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const DB_HOST = process.env.DB_HOST
const DB_PORT = Number(process.env.DB_PORT)
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const TEST_DB_DATABASE = process.env.TEST_DB_DATABASE

export const configs = {
  PORT,
  JWT_SECRET_KEY,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  TEST_DB_DATABASE,
}
