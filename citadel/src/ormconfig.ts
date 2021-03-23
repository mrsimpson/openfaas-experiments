import { ConnectionOptions } from "typeorm"

const test = process.env.NODE_ENV === "test"

const options = {
  type: test ? "sqlite" : "postgres",
  synchronize: test,
  logging: process.env.LOGLEVEL === "debug",
  entities: [__dirname + "/entity/*{.ts,.js}"],
  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  subscribers: [],
  cli: {
    migrationsDir: "src/migrations",
  },
} as ConnectionOptions

let ORMConfig: ConnectionOptions

// a database DB-URL may contain all DB-related information. Else, we'll use the dedicatd variables
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgresql:")) {
  ORMConfig = Object.assign({ url: process.env.DATABASE_URL }, options)
} else {
  ORMConfig = Object.assign(
    {
      host: process.env.PGHOST || "localhost",
      port: process.env.PGPORT || 5432,
      username: process.env.PGUSER || "curb",
      password: process.env.PGPASSWORD || "curb",
      database: test ? ":memory:" : "curb",
    },
    options
  )
}

console.log(
  "ORM Config: " +
    JSON.stringify({
      ...ORMConfig,
      password: (ORMConfig as { password: string }).password ? "is set" : "NOT SET!",
    })
)

// this type of export seems to be necessary for the TypeORM to pick it up
// see https://github.com/typeorm/typeorm/issues/4068#issuecomment-533040049
export = ORMConfig
