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

**Db**
****
The basic drizzle database needs these components:

- **connection URL**: the connection url to your database, which should obviously be the same database as the driver you specified in your drizzle config.
- **schema**: Lets drizzle know about your database tables and perform operations with them.

The basic syntax of creating a drizzle db driver is as so:

```ts
import { drizzle } from "drizzle-orm/pg-core";

const db = drizzle(options)
```

Here are the properties you can pass in to the options object:

- `connection`: an object of options configuring the database connection
- `logger`: a boolean that if set to true, turns on verbose logging
- `schema`: an object mapping the table name to the drizzle table schema 

```ts
import { drizzle } from "drizzle-orm/libsql";
import { notesTable } from "./schemas";

const dbPath = process.env.DB_FILE_NAME;
if (!dbPath) {
  throw new Error("DB_FILE_NAME is not set");
}

const db = drizzle({
  connection: {
    url: dbPath,
  },
  logger: true,
  schema: { notesTable },
});

export default db;
```


#### Sqlite 

For sqlite, you can either use an online database connection URL for drivers such as turso with libsql, so you can just use a file url and point to a local sqlite file:

```ts
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle({
  connection: {
    url: "file:notes.db",
  },
});

export default db;
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

#### C: insertion

You can insert an entire record, specifying values for all fields like so:

Or you can specify only specific fields:

```ts
db.insert(notesTable).values({
  title: "hello world",
  createdAt: new Date().toISOString(),
});
```

You can also chain on the `.returning()` method to return the inserted record(s), like so:

```ts
const result = await db
  .insert(notesTable)
  .values({
	title: "hello World"
	createdAt: new Date().toISOString(),
  })
  .returning();
const createdNote = result[0];
```

You have these chaining methods available on insertions in postgresql:

- `.returning()`: returns the inserted records
- `.onConflictDoUpdate()`: performs an upsert if the record with the same ID is already in the database.
- `.onConflictDoNothing()`: errors out if the record with the same ID is already in the database.

#### R: selection

There are two different ways of doing SELECT statements in drizzle:

- **selecting**: Use `db.select()`, which is a lower level syntax.
- **querying**: Use `db.query`, which is a prisma-compatible syntax. This needs you to provide the schema when you're instanting the drizzle DB.

**selecting**

```ts
async function getNotes() {
  return await db.select().from(notesTable);
}
```

**querying**

```ts
async function getNotes() {
  return await db.query.notesTable.findMany({
    columns: {
      content: true,
      title: true,
      priority: true,
      id: true,
      createdAt: true,
    },
    orderBy: (notesTable, { desc }) => [desc(notesTable.createdAt)],
    limit: 10,
  });
}
```
### Schemas

#### Basic tables

Here are the methods you can use to create columns for your tables:

- `uuid(column_name)`: creates a string field populated with a random uuid
- `varchar(column_name, {length: n})`: creates a `VARCHAR` column with a specified length.

You also have these additional chaining methods to provide default values and also type inference at runtime:

- `$default(cb)`: invokes the callback function and sets whatever was returned as the default value for the field. This is useful for dynamically creating default values.
- `$type<T>`: sets type inference for drizzle to a specific generic type you pass in, allowing for stricter, more helpful type intellisense, especially if you don't want to resort to enums.

```ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notesTable = sqliteTable("notes", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  content: text().notNull().$default(() => ""),
  createdAt: text().notNull().$default(() => new Date().toISOString()),
  priority: text().notNull().default("low").$type<"low" | "medium" | "high">(),
});

```

#### Relations

You can create foreign key relations like so:


![](https://i.imgur.com/lJF9x8q.jpeg)

But to get type intellisense with joining tables in drizzle, you'll need a way to let drizzle know about those foreign key constraints. You can do that through **relations**

Relations are ways of basically specifying how you want to join data in SQL and are essential to put in place if you want proper joining. 

> [!NOTE]
> These relations do not impose foreign key constraints those should be established when creating the tables.

![](https://i.imgur.com/em0BekG.png)


When you set up relations, you can then use joining syntax through the `with` key when using `db.query` syntax.

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

### Joins

You can do joins the prisma way with relations or you can use drizzle joining methods like so:

![](https://i.imgur.com/xvGAUtM.jpeg)
