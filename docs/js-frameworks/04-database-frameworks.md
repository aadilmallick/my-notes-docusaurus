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

