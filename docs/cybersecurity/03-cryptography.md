## email and password auth 

### Salts and hashing

How do we keep the unique combination of a user's email and password secure? While we store emails in plain text, we must **hash** passwords.

- **hashing**: A hash is a deterministic, one-way, random garbling of a string which makes it impossible to decrypt a hash.

However, the main problem with just hashing passwords is that they are deterministic. This means that a hacker can figure out the plain-text string that results in the specified hash, time permitting. To solve this issue, we use **salts**.

- **salt**: a random string added to the password before hashing. This salt value is stored alongside the hash value in the database.

Salts serve two purposes:

1. **Prevents Rainbow Table Attacks**: Rainbow tables are precomputed tables of hash values for common passwords. By adding a salt, you make it unlikely that a rainbow table will contain the hash value for a specific password + salt combination.
2. **Makes Hash Values Unique**: Even if two users have the same password, the addition of unique salts ensures their hash values will be different.

Salts ensure that even if two users have the same password, their hash values will be different, making rainbow tables ineffective.

For example, instead of hashing the super common password `"password"`, we will append a special salt string, unique, random, and stored for each user in a database.

We would instead hash `"password-salt"` for each user. Because a salt is unique, it completely changes the hash value for any password you add.

Here's why salting prevents rainbow table attacks:

- **Unique Hash Values**: With salts, each password + salt combination produces a unique hash value. This means an attacker would need a separate rainbow table for each unique salt value.
- **Computational Overhead**: Creating a rainbow table for a single salt value would require significant computational resources and time. With bcrypt's slow hashing algorithm, this becomes even more impractical.
- **Storage Requirements**: To store rainbow tables for all possible salt values, an attacker would need an enormous amount of storage space.

Now let's talk about implementation.

#### **using node crypto**

The basic flow of adding a enw user and hashing their password with node crypto is like so:

1. Create a random 16-byte salt
2. Append the salt to the plain text password
3. Hash the salted plain text password
4. Stored the hashed password, email, and salt for the user in the database.

Here is a reusable model that can convert itself to JSON, be stored along with the user db record, and create itself from JSON in order to authenticate a user with the same hashing specifications:

```ts
import crypto from "node:crypto";

export class CryptoPasswordModel {
  private salt: string;
  private iterations: number;
  private keyLength: number;
  private digest: string;

  constructor(options?: {
    salt?: string;
    iterations?: number;
    keyLength?: number;
    digest?: string;
  }) {
    if (options) {
      this.salt = options.salt || crypto.randomBytes(16).toString("hex");
      this.iterations = options.iterations || 10;
      this.keyLength = options.keyLength || 64;
      this.digest = options.digest || "sha256";
    } else {
      this.salt = crypto.randomBytes(16).toString("hex");
      this.iterations = 10;
      this.keyLength = 64;
      this.digest = "sha256";
    }
  }

  async hash(password: string) {
    const { promise, resolve, reject } = Promise.withResolvers<Buffer>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey);
      }
    );
    const hash = await promise;
    return hash.toString("hex");
  }

  toJSON() {
    return {
      salt: this.salt,
      iterations: this.iterations,
      keyLength: this.keyLength,
      digest: this.digest,
    };
  }

  static fromJSON(json: {
    salt: string;
    iterations: number;
    keyLength: number;
    digest: string;
  }) {
    return new CryptoPasswordModel({
      salt: json.salt,
      iterations: json.iterations,
      keyLength: json.keyLength,
      digest: json.digest,
    });
  }

  async verify(password: string, hash: string) {
    const { promise, resolve, reject } = Promise.withResolvers<boolean>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey.toString("hex") === hash);
      }
    );
    const result = await promise;
    return result;
  }
}
```

For example, this would be how signing up works:

```ts
async function signUpUser(email: string, password: string) {
  // 1. if email already exists in DB, throw error

  // 2. hash password
  const model = new CryptoPasswordModel();
  const hashedPassword = await model.hash(password);

  // 3. add to DB, along with salt itself
  const user = await addUserToDB({
    email,
    password: hashedPassword,
    hashingInfo: model.toJSON(),
  });
  return user; // newly created user with id
}
```

To sign in a user and authenticate them, here is the flow:

1. Accept the email and password from the user via form
2. Find the db user record with the same email, if exists. Else throw error.
3. Get the salt from the db user record, and with it, hash the plaintext password.
4. If the newly hashed password and the stored db user record password are equal, then the user is authenticated. Else, user entered incorrect password.

Here is the flow:

```ts
async function signInUser(email: string, password: string) {
  // 1. get the user with same email from db
  const storedUser = await db.findOne({ email: email });
  if (!storedUser) throw new Error("email not found, user doesn't exist");

  // 2. get crypto specs
  const model = CryptoPasswordModel.fromJSON(storedUser.hashingInfo);

  // 3. compare hashes. If equal, authenticate user.
  const matches = await model.verify(password, storedUser.password);
  return matches;
}
```

#### **using Bcrypt**

Bcrypt does this automatically for us, where we only have to specify the number of salt rounds.

```ts
const bcrypt = require("bcrypt");

async function signInUser(email: string, password: string) {
  // 1. hash the password with 10 salt rounds
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 2. get the user with same email from db
  const storedUser = await db.findOne({ email: email });
  if (!storedUser) throw new Error("email not found, user doesn't exist");

  // 3. compare hashes. If they are equal, user is authenticated.
  let matches = storedUser.password === hashedPassword;

  // 3a. or, use bycrypt.compare(plainTextpassword, hashedPassword)
  matches = await bcrypt.compare(password, storedUser.password);
  return matches;
}
```

Here's an example of a bcrypt hash string:

Bash

```
$2b$10$nOUIs5kJ7naTuTFkBy1veuJq8Bhn7F6K9eWgQXhja4z8fu48.seedU
```

In this example:

- `$2b$` is the algorithm version
- `10$` is the cost factor
- `nOUIs5kJ7naTuTFkBy1veu` is the salt value (22 characters)
- `Jq8Bhn7F6K9eWgQXhja4z8fu48.seedU` is the hash value

When comparing passwords, bcrypt extracts the salt value (`nOUIs5kJ7naTuTFkBy1veu`) from the stored hash string and uses it to hash the provided password. This ensures that the same salt value is used for both the original hash and the comparison hash, allowing bcrypt to accurately verify the password.

