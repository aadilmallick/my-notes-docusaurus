

## Intro cryptography

### Basics

#### Terminology

Here are the two types of security to understand.

- **unconditional security:** A system that guarantees security regardless of the computational abilities of an adversary, and the key isn’t compromised. One-time pad falls into this category.
- **conditional security:** Can’t guarantee security, but make it extremely expensive and computationally improbable to break security. RSA falls into this category.

There's a difference between secrecy and perfect secrecy

- **perfect secrecy**: A cipher has perfect secrecy if and only if there are as many possible keys as possible plaintexts, and every key is equally likely.

There's a difference between encoding and encryption

- Encoding changes format
- encryption destroys information patterns without a key

#### **Kerckhoff’s principles**

1. Ciphertext should be undecipherable without the correct key
2. Encryption key is allowed to be different from decryption key
3. A new key can always be generated, so losing a key is not critical.

#### entropy

The formula to find the number of bits of entropy in a probabilistic system is log base 2 of the number of possibilities.

- For example, the number of bits of entropy when flipping a coin is $\log_2(2) = 1$ bit of entropy.

## Basic cryptographic techniques

### One-time pad

one time pad is a random bit string of 1s and 0s as long as the message $m$ you want to encrypt, and is xored with the message to create unbreakable ciphertext


> [!NOTE]
> **the protocol**
> 
> ---
> 
> You start off with a message $m$ you want to encrypt that is $n$ bits long.
> 
> 1. You create a one time pad $o$ that is $n$ bits long
> 2. Do bitwise xor $m \oplus o$ to get the resulting cipher text
> 
> To decrypt, just perform bitwise xor again with the one time pad and the cipher text.

The one time pad is a cryptographic encryption technique with **perfect secrecy** because of the irreversibility of bitwise XOR. There is absolutely no way an attacker can determine with certainty which one time pad produced the resulting ciphertext.

However, there are three major downsides to the one-time pad approach:

1. **reuse of key damages secrecy:** If the pad is reused, statistical analysis can reveal information about the original messages, defeating its perfect secrecy. This makes it impractical for most real-world applications like the internet due to the difficulty of key exchange
2. **runtime complexity:** The one time pad must be as long as the original message, so if a 10gb video file needs to be encrypted, you would need to generate a 10gb secret one time pad, which is not feasible.
3. **lack of authenticity:** The one time pad is perfect encryption but you never get something for nothing. In return, the one time pad is a type of encryption that lacks any sort of authenticity, meaning that any adversary can modify the data and pass it off as someone else’s.

#### main weakness of one-time pad

In fact, if an attacker gets their hands on two ciphertexts that use the same one-time pad, then they can get xor them together, which mathematically returns an XOR of the plain texts.



![](https://i.imgur.com/fEBTNG8.jpeg)




![](https://i.imgur.com/JyYlOD4.jpeg)

> [!NOTE]
> This is the main reason why it’s called “one-time pad” - if you reuse it even once, then an attacker can simply xor the ciphertexts together and get back an xor of the plaintexts, which hides pretty much nothing.

#### Javascript implementation

==**A One-Time Pad (OTP) encryption system can be perfectly implemented in JavaScript using the Bitwise XOR (`^`) operator.**== When you XOR a data byte with a key byte, it encrypts the data; XORing the encrypted byte with the exact same key byte decrypts it back to its original form


> [!NOTE]
> To satisfy the rules of a mathematically unbreakable OTP, your implementation must use a cryptographically secure random key that is: 
> 
> 1. **the exact same length as the message**
> 2. **never reused**
> 3. **kept entirely secret**


```js
// Helper to convert strings to byte arrays and vice-versa
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Generates a cryptographically secure random key of a specific byte length.
 * @param {number} length 
 * @returns {Uint8Array}
 */
function generateKey(length) {
    const key = new Uint8Array(length);
    // Uses the environment's secure cryptographic RNG
    crypto.getRandomValues(key); 
    return key;
}

/**
 * Encrypts or decrypts bytes using the XOR operation.
 * Because XOR is symmetric, this single function handles both actions.
 * @param {Uint8Array} dataBytes 
 * @param {Uint8Array} keyBytes 
 * @returns {Uint8Array}
 */
function xorTransform(dataBytes, keyBytes) {
    if (dataBytes.length !== keyBytes.length) {
        throw new Error("Key length must exactly match the data length.");
    }
    
    const result = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
        result[i] = dataBytes[i] ^ keyBytes[i]; // XOR operation
    }
    return result;
}

// ==========================================
// Example Usage:
// ==========================================

const secretMessage = "Hello World! 🔐";
console.log("Original Message:", secretMessage);

// 1. Convert plaintext string to a byte array
const secretBytes = encoder.encode(secretMessage);

// 2. Generate a secure pad matching the message length
const padKey = generateKey(secretBytes.length);

// 3. Encrypt the data
const encryptedBytes = xorTransform(secretBytes, padKey);
// Represent cipher text safely as a Hex string for transmission/storage
const cipherHex = Array.from(encryptedBytes).map(b => b.toString(16).padStart(2, '0')).join('');
console.log("Ciphertext (Hex):", cipherHex);

// 4. Decrypt the data (using the exact same key)
const decryptedBytes = xorTransform(encryptedBytes, padKey);
const recoveredMessage = decoder.decode(decryptedBytes);
console.log("Decrypted Message:", recoveredMessage);

```

Here are two caveats to understand with this implementation:

- **The Randomness Factor**: Standard `Math.random()` is predictable and **must never** be used for cryptography. You must always rely on `crypto.getRandomValues()` (browsers) or `crypto.randomBytes()` (Node.js) to generate the pad.
- **Key Distribution**: The key must be as large as the message itself. If you already have a perfectly secure, private side-channel capable of transmitting a massive key file to your recipient, you could just use that same channel to send the secret message directly, rendering the OTP redundant for most standard web applications


Here's an example of using OTPs in server-side encryption in a real app setting:

1. Request to server to encrypt with one time pad

```js
// Ensure your pad is exactly 128 bytes (Uint8Array)
// In a true OTP, this pad must be uniquely mapped to a specific request ID
const preSharedPad = new Uint8Array([/* 128 random cryptosecure bytes */]); 

async function sendEncryptedKey() {
    const apiKey = "your_api_key_here";
    
    // 1. Encode API key to bytes and pad/truncate to exactly 128 bytes
    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(apiKey);
    const targetLength = 128;
    const paddedBytes = new Uint8Array(targetLength);
    paddedBytes.set(rawBytes); // Fills remaining space with 0s

    // 2. XOR transformation
    const ciphertextBytes = new Uint8Array(targetLength);
    for (let i = 0; i < targetLength; i++) {
        ciphertextBytes[i] = paddedBytes[i] ^ preSharedPad[i];
    }

    // 3. Convert to Base64 to safely transmit over HTTP
    const ciphertextBase64 = btoa(String.fromCharCode(...ciphertextBytes));

    // 4. Send to Netlify Function
    const response = await fetch('/.netlify/functions/my-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            padId: "pad_sequence_001", // Tell the server which pad to use
            encryptedKey: ciphertextBase64
        })
    });
    
    return response.json();
}

```

2. Server decrypts with same one time pad

```js
// Netlify function handler (v2 syntax)
export default async (request, context) => {
    try {
        const { padId, encryptedKey } = await request.json();

        // 1. Look up the exact matching 128-byte pad based on padId
        // WARNING: You must mark this padId as "USED" in a database immediately 
        // to prevent replay attacks and ensure it is truly a "one-time" use.
        const preSharedPad = new Uint8Array([/* matching 128 random bytes */]);

        // 2. Decode the Base64 ciphertext back to bytes
        const ciphertextBytes = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));

        if (ciphertextBytes.length !== 128) {
            return new Response("Invalid payload length", { status: 400 });
        }

        // 3. Reverse the XOR transformation
        const decryptedBytes = new Uint8Array(128);
        for (let i = 0; i < 128; i++) {
            decryptedBytes[i] = ciphertextBytes[i] ^ preSharedPad[i];
        }

        // 4. Convert bytes back to string and trim trailing null bytes padding
        const decoder = new TextDecoder();
        const fullString = decoder.decode(decryptedBytes);
        const originalApiKey = fullString.replace(/\0+$/, ''); // Cleans trailing zeros

        // Now you can use originalApiKey securely within your cloud function
        console.log("Decrypted API Key successfully");

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

```

## Hashing

### Intro hash functions

A hash function must have these 4 properties:

1. **unlikely collisions:** very hard to find hash collision
2. **fast:** very fast and cheap to compute
3. **fixed size output:** each variable size input results in a fixed size hash (called **digest**)
4. **irreversible:** Hashes are very hard to reverse and find input from output.

Here are the resistances cryptographic hash functions should have:

- **Preimage resistance / noninvertible**: Given a hash, it’s extremely difficult to find the plaintext that gives you that hash. In other words, a hash is essentially **invertible**, as in you cannot get the original input from the output.
- **Second preimage resistance**: It’s extremely difficult to find another message that has the same hash as a given message.
- **Collision resistance**: It’s extremely difficult to find two different messages that have the same hash.

### Hash collisions


The smaller the hash, (MD5 - 128 Bits) the more likely you get a collision after you computer half the values, like $2^{128}$, as according to the famous birthday problem, where you’re more likely to have at least one collision when dealing with half the data set, as in, it requires $O(\sqrt N )$ time to find a collision.

We should stop using SHA-256 because it only has 256 bits, which means that it will likely have collisions after $2^{128}$ values are computed.

- **MD5**: Produces a 128-bit hash. It was widely used but is now considered broken in terms of collision resistance.
- **SHA-1**: Generates a 160-bit hash. Vulnerabilities have been found, and it is no longer recommended for cryptographic security.
- **SHA-256 and SHA-512**: Part of the SHA-2 family, these functions generate hashes of 256 bits and 512 bits, respectively, and are currently considered secure.
- **SHA-3**: The latest member of the Secure Hash Algorithm family, providing stronger security and designed to complement SHA-2.

### Salts and hashing for emails

**hash and salts**

How do we keep the unique combination of a user's email and password secure? While we store emails in plain text, we must **hash** passwords.

- **hashing**: A hash is a deterministic, one-way, random garbling of a string which makes it impossible to decrypt a hash.

However, the main problem with just hashing passwords is that they are deterministic. This means that a hacker can figure out the plain-text string that results in the specified hash, time permitting. To solve this issue, we use **salts**.

- **salt**: a random string added to the password before hashing. This salt value is stored alongside the hash value in the database.

**salts**

Salts arose from a need to prevent rainbow table attacks.


> [!NOTE]
> **a short history: rainbow table attacks**
> 
> ---
> 
> Hackers could steal databases of hashed passwords and then run frequency analysis to see which hashes match, suggesting the same matching passwords. They could then use frequency analysis to discover those passwords.
> 
> 1. They hashed millions of possible passwords and stored them, in what’s called a **rainbow table,** which is a mapping of a preimage to its hash.
> 2. They launched large attacks on the real database of passwords by hashing each password in the rainbow table and comparing each hash to the ones in the database.
> 3. If a hashed password from the database matched one in the rainbow table, the attackers now know the preimage of that password.  


A salt is a **large, random, and unique string of data** that is generated for each user when their password is first stored.

Now, rather than just storing the hash, we store the salt along with the hash.

1. create a random salt and store it in the database
2. compute `hash(password + salt)`

Salts serve two purposes:

1. **Prevents Rainbow Table Attacks**: Rainbow tables are precomputed tables of hash values for common passwords. By adding a salt, you make it unlikely that a rainbow table will contain the hash value for a specific password + salt combination.
2. **Makes Hash Values Unique**: Even if two users have the same password, the addition of unique salts ensures their hash values will be different.

Salts ensure that even if two users have the same password, their hash values will be different, making rainbow tables ineffective.

1. For example, instead of hashing the super common password `"password"`, we will append a special salt string, unique, random, and stored for each user in a database.
2. We would instead hash `"password-salt"` for each user. Because a salt is unique, it completely changes the hash value for any password you add.

Here's why salting prevents rainbow table attacks:

- **Unique Hash Values**: With salts, each password + salt combination produces a unique hash value. This means an attacker would need a separate rainbow table for each unique salt value.
- **Computational Overhead**: Creating a rainbow table for a single salt value would require significant computational resources and time. With bcrypt's slow hashing algorithm, this becomes even more impractical.
- **Storage Requirements**: To store rainbow tables for all possible salt values, an attacker would need an enormous amount of storage space.

> [!NOTE]
> Because a salt is randomly generated on the fly, this prevents rainbow table attacks because there are so many possible salts, and no single hash output uses the exact same salt value.


> [!NOTE]
> Salts completely eradicate rainbow table attacks because now the same password hashed multiple times will be different since each salt is unique and randomly generated.


**KDFs**

Salts and hashes are great, but hashes are very fast to compute, meaning anybody can brute force via a rainbow table because it's computationally feasible to do so.

That's where KDFs come in.

KDFs are the same thing as hash functions but intentionally computationally expensive so it takes an attacker much longer to try out all the hashes.

- **Bcrypt:** Bcrypt is a **tunably time-hard KDF**, meaning you can tune how many rounds (how much time it takes) to hash.


> [!NOTE]
> If you’ve ever used bcrypt before, than you’ve used a KDF, or **key derivation function**.

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

### MACs

A MAC is a small piece of information that verifies the integrity and authenticity of a message. It is generated using a secret key shared between the sender and the recipient, ensuring that only those who possess the key can validate the MAC.

A **MAC** is basically a digital signature for symmetric cryptography.

- **Inputs:** A message (of any length) and a **Secret Key**.
- **Output:** A fixed-length "Tag" (often called the MAC), which results from hashing the key together with the original message.

Here is an example of how MAC’s are used to verify authenticity and integrity:

1. Alice sends MAC of message and original message
2. Bob encrypts original message with key and sees if it equals the MAC. If so, integrity is preserved.

In depth:

1. **Alice** wants to send a message `M`. She calculates `Tag = MAC(Key, M)`.
2. She sends both `M` and `Tag` to Bob.
3. **Bob** receives them. He calculates his own tag using the same secret key: `CheckTag = MAC(Key, M)`.
4. **Verification:** If `CheckTag` matches the `Tag` Alice sent, Bob knows two things:
    - **Authenticity:** The message _must_ have been created by someone with the Secret Key (Alice).
    - **Integrity:** The message has not been changed by even a single bit (or the tags wouldn't match)