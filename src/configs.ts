import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT ? process.env.PORT : '8000'

if (!process.env.JWT_SECRET_KEY) {
  throw new Error(`JWT_SECRET_KEY isn't exist`)
}
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

export const configs = {
  PORT,
  JWT_SECRET_KEY,
}
