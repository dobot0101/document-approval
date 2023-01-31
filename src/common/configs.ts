const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_TESTDB, JWT_SECRET_KEY } =
  process.env

if (!JWT_SECRET_KEY) {
  throw new Error(`JWT_SECRET_KEY 없음`)
}
if (!MYSQL_HOST) {
  throw new Error(`DB_HOST 없음`)
}
if (!MYSQL_USER) {
  throw new Error(`DB_USERNAME 없음`)
}
if (!MYSQL_PASSWORD) {
  throw new Error(`DB_PASSWORD 없음`)
}
if (!MYSQL_DB) {
  throw new Error(`DB_DATABASE 없음`)
}
if (!MYSQL_TESTDB) {
  throw new Error(`TEST_DB_DATABASE 없음`)
}

export const configs = {
  JWT_SECRET_KEY,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DB,
  MYSQL_TESTDB,
}
