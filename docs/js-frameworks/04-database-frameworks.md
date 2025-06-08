## Prisma

### Setup

1. Install these dependencies:

```shell
npm install @prisma/client
npm i -D prisma
```

2. Run `npx prisma init`
3. Change anything in the `schema.prisma`, for example if you want to use a different database connection URL or a different sql engine like SQLite or Postgres

### Schemas

The schemas in prisma are basically syntactic sugar for creating tables in SQL, and create type-safe ORMs you can use to query those tables with. You define your schemas in the `schema.prisma` file:

![prisma schemas](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748136973/image-clipboard-assets/t3dqouqb8uhmbry9cvmm.webp)

Here is what a `schema.prisma` file would look like for SQLite:

```ts
datasource db {
  provider = "sqlite".       // specify using swqlite
  url      = "file:./dev.db" // specify the file to use
}

generator client {
  provider = "prisma-client-js"
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
}
```

After each change to the `schema.prisma`, you have to do a database migration, which is super simple with just these commands:

```bash
npx prisma migrate dev --name <migration-name>
npx prisma generate
```

#### using the prisma client


For example, you would create a prisma client like so and then query them like so:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

prisma.user // query user table
prisma.entry // query entries table
```



## Drizzle

### Drizzle vs Prisma

Drizzle is built for performance on serverless environments, but in a server environment, prisma would also work well. Ease of use is with prisma.

### Setup

When using drizzle, you have to setup migration generation scripts and a script to actually run that migration. The `drizzle-kit` package from npm makes this super easy:

The below command generates a migration sql file in the flavor of postgresql from a typescript file containing all your drizzle tables. Let's go in depth with the options there are on the `drizzle-kit generate` command:

```bash
drizzle-kit generate \
--schema ./drizzle/schema.ts \
--dialect postgresql \
--out=./drizzle/migrations
```

- `--schema`: the typescript file with named exports of drizzle tables.
- `--dialect`: the flavor of sql to convert the tyepscript into, like expo sqlite, sqlite, postgresql, mysql, etc.
	- Your choices are `postgresql` or `mysql` or `sqlite` or `turso` or `singlestore` or `gel`
- `--out`: the output folder where the migration sql file should be created.

If you don't want to bother with this and instead do everything in one fell swoop, you can just use a `drizzle.config.ts` file at the root of your project:

```ts title="drizzle.config.ts"
import { defineConfig } from "npm:drizzle-kit";
import { drizzleConstants } from "./drizzle/drizzleConstants.ts";

export default defineConfig({
  out: "../drizzle/migrations", // outDir of migrations
  schema: "../drizzle/schema.ts", // schema file of drizzle tables
  dialect: "postgresql",    // flavor of sql
  dbCredentials: {
    url: drizzleConstants.dbUrl,  // db connnection url
  },
});

```

You can then use these commands once you have the config in place:

- `npx drizzle-kit push`: does everything at once
- `npx drizzle-kit generate`: generates the migrations
- `npx drizzle-kit migrate`: applies the migrations

**schema**
****

The schema file should look like this:

```ts
import { integer, pgTable, varchar, timestamp } from "npm:drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: varchar().notNull(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

```

### CRUD

THe drizzle api is very similar to raw SQL, except everything is nice and typed.

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { usersTable } from "./db/schema";
import { env } from "./envFactory";
import { PgSelectQueryBuilderBase } from "drizzle-orm/pg-core";

const db = drizzle(env.NEON_DB_URL);

async function createUser(user: typeof usersTable.$inferInsert) {
  const result = await db.insert(usersTable).values(user);
  console.log(result);
}

async function getUserById(id: number) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  console.log(result);
}

async function updateUser(
  id: number,
  user: Partial<typeof usersTable.$inferInsert>
) {
  const result = await db
    .update(usersTable)
    .set(user)
    .where(eq(usersTable.id, id));
  console.log(result);
}

async function deleteUser(id: number) {
  const result = await db.delete(usersTable).where(eq(usersTable.id, id));
  console.log(result);
}
```

### Schemas

#### Basic tables

#### Relations

Relations are ways of basically specifying how you want to join data in SQL and are essential to put in place if you want proper joining. 

> [!NOTE]
> These relations do not impose foreign key constraints those should be established when creating the tables.

![](https://i.imgur.com/em0BekG.png)

You can also pass in the schema and their corresponding tablename to the `db` object in order to get Prisma-like querying:

```ts
const db = drizzle(env.NEON_DB_URL, {
  schema: {
    users: usersTable,
  },
});

db.query.users.findMany({
  where: eq(usersTable.age, 20),
  with: {
    posts: true,
  },
});
```