Here is how you can use SQLite in node:

## Node SQLite

```ts
import sqlite3 from "npm:sqlite3";

// create promisify util
const promisify = (fn: (...args: any[]) => void) => {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err: any, result: any) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };
};

type ParamsType = any[] | Record<string, any>;
/**
 * A wrapper class for node-sqlite that provides promisified methods
 * for common database operations.
 */
export class SqliteDatabase {
  private db: sqlite3.Database;

  /**
   * Creates a new SQLite database connection.
   * @param dbPath Path to the SQLite database file
   */
  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
  }

  /**
   * Runs a SQL query with optional parameters.
   * @param sql The SQL query to run
   * @param params Optional parameters for the query
   * @returns A promise that resolves when the query completes
   */
  run(sql: string, params: ParamsType): Promise<sqlite3.RunResult> {
    return promisify(this.db.run.bind(this.db))(
      sql,
      params
    ) as Promise<sqlite3.RunResult>;
  }

  /**
   * Executes a SQL query with optional parameters and returns all matching rows.
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @returns A promise that resolves with an array of rows
   */
  all<T = any>(sql: string, params: ParamsType): Promise<T[]> {
    return promisify(this.db.all.bind(this.db))(sql, params) as Promise<T[]>;
  }

  /**
   * Gets the first row from a SQL query.
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @returns A promise that resolves with the first row or undefined if no rows match
   */
  get<T = any>(sql: string, params: ParamsType): Promise<T | undefined> {
    return promisify(this.db.get.bind(this.db))(sql, params) as Promise<
      T | undefined
    >;
  }

  /**
   * Executes a SQL query and calls the callback for each row.
   * @param sql The SQL query to execute
   * @param params Optional parameters for the query
   * @param callback Function to call for each row
   * @returns A promise that resolves when all rows have been processed
   */
  forEach<T = any>(
    sql: string,
    params: ParamsType,
    callback: (row: T, index: number) => void
  ): Promise<void> {
    return promisify(this.db.each.bind(this.db))(
      sql,
      params,
      callback
    ) as Promise<void>;
  }

  /**
   * Executes multiple SQL statements from a string.
   * @param sql Multiple SQL statements separated by semicolons
   * @returns A promise that resolves when execution completes
   */
  exec(sql: string): Promise<void> {
    return promisify(this.db.exec.bind(this.db))(sql) as Promise<void>;
  }
  /**
   * Closes the database connection.
   * @returns A promise that resolves when the connection is closed
   */
  close(): Promise<void> {
    return promisify(this.db.close.bind(this.db))() as Promise<void>;
  }
}

```

## Better SQLite

Better SQLite is a node library that is completely synchronous yet faster than normal sqlite libraries.

Install like so:

```bash
npm i better-sqlite3
npm i --save-dev @types/better-sqlite3
```

Here is how to set up a database

```ts
import Database from 'better-sqlite3';
const db = new Database('foobar.db');
db.pragma('journal_mode = WAL'); // turn on WAL mode
```

To use better sqlite3, you need to understand the two main ways of running queries:

1. **exec approach**: Using the `db.exec()` method, you can just straight up run SQL queries that don't require any parameters. Beware, this does not have SQL injection protection support.
2. **statements**: You can create prepared statements that represent queries you can run again and again using the `db.prepare()` method.

### Using statements

With statements, there are two ways to inject parameters:

- **anonymous parameters**: Declare placeholders with a `?` and then place arguments in an array to get injected.
- **named parameters**: Declare named placeholders with a `$`, `:`, or `@` prefix and then place arguments in an object (key-value map) without the prefix to get injected.

This is how using with anonoymous params works:

```ts
const stmt = this.db.prepare("SELECT age FROM cats WHERE name = ?");
const cat = stmt.get(["Joey"]);
```

```ts
const stmt = db.prepare('INSERT INTO people VALUES (?, ?, ?)');

// The following are equivalent.
stmt.run('John', 'Smith', 45);
stmt.run(['John', 'Smith', 45]);
stmt.run(['John'], ['Smith', 45]);
```

This is how using with named parameters works:

```ts
const stmt = db.prepare('INSERT INTO people VALUES (@name, @name, ?)');
stmt.run(45, { name: 'Henry' });
```
`
```ts
// The following are equivalent.
const stmt = db.prepare('INSERT INTO people VALUES (@firstName, @lastName, @age)');
const stmt = db.prepare('INSERT INTO people VALUES (:firstName, :lastName, :age)');
const stmt = db.prepare('INSERT INTO people VALUES ($firstName, $lastName, $age)');
const stmt = db.prepare('INSERT INTO people VALUES (@firstName, :lastName, $age)');

stmt.run({
  firstName: 'John',
  lastName: 'Smith',
  age: 45
});
```

### Class

Here is how to use it:

```ts
// import .d.ts for this
// @ts-types="npm:@types/better-sqlite3"
import Database from "npm:better-sqlite3";

export class BetterSQLite {
  private db!: Database.Database;
  private static instance: BetterSQLite | null = null;

  constructor(
    dbPath: string,
    options: {
      enableLogging?: boolean;
      enableSingleton?: boolean;
    } = {}
  ) {
    if (options.enableSingleton) {
      if (BetterSQLite.instance) {
        return BetterSQLite.instance;
      }
      BetterSQLite.instance = this;
    }

    this.db = new Database(dbPath, {
      verbose: (...args: any[]) => {
        if (!options.enableLogging) {
          return;
        }
        console.log("[Database log]", ...args);
      },
    });
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  close() {
    this.db.close();
  }

  runQuery(query: string, params: any[] | Record<string, any>) {
    return this.db.prepare(query).run(params);
  }

  exec(query: string) {
    return this.db.exec(query);
  }

  prepare<T extends any[] | Record<string, any>>(query: string) {
    return new SQLiteStatement<T>(query, this.db);
  }
}

class SQLiteStatement<T extends any[] | Record<string, any>> {
  private stmt: Database.Statement;

  constructor(private query: string, db: Database.Database) {
    this.stmt = db.prepare(query);
  }

  get(params: T): T {
    this.validateParams(params);
    return this.stmt.get(params) as T;
  }

  run(params: T) {
    this.validateParams(params);
    this.stmt.run(params);
  }

  all(params: T): T[] {
    this.validateParams(params);
    return this.stmt.all(params) as T[];
  }

  private validateParams(params: any[] | Record<string, any>): void {
    if (Array.isArray(params)) {
      if (!this.query.includes("?")) {
        throw new Error("You must use ? to bind parameters in array");
      }
      const questionCount = (this.query.match(/\?/g) || []).length;
      if (questionCount !== params.length) {
        throw new Error(
          "You must provide the same number of parameters as ? in the query"
        );
      }
    }
    if (typeof params === "object") {
      if (
        !this.query.includes("@") &&
        !this.query.includes("$") &&
        !this.query.includes(":")
      ) {
        throw new Error(
          "You must use @ or $ or : to bind parameters in object"
        );
      }
    }
  }
}
```