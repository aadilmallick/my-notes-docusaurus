## Prisma

### Setup

1. Install these dependencies:

```shell
npm install @prisma/client
npm i -D prisma
```

2. Run `npx prisma init`

### Schemas

The schemas in prisma are basically syntactic sugar for creating tables in SQL, and create type-safe ORMs you can use to query those tables with.

![prisma schemas](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748136973/image-clipboard-assets/t3dqouqb8uhmbry9cvmm.webp)

For example, you would create a prisma client like so and then query them like so:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

prisma.user // query user table
prisma.entry // query entries table
```

