
## Firebase development environment

### Installation and setup

1. Install the firebase tools

```bash
npm install -g firebase-tools
```

2. Run `firebase login` to login to your firebase account

```bash
firebase login
```

3. Connect to a specific project with `firebase use`

```bash
firebase use studio-22872200-65a87
```

4. Run the `firebase init` command to initialize your project

```bash
firebase init
```

At the heart of any local Firebase workflow are two configuration files created in your root directory when you run `firebase init`:

1. **`firebase.json`**: This is your workspace's command center . It defines how Firebase services are configured locally. It tells the CLI where your Security Rules files are stored (e.g., `firestore.rules`), where your Cloud Functions code lives, and which ports the local emulators should use .
    
2. **`.firebaserc`**: This file stores your project aliases  It maps your local directory to your cloud-hosted Firebase project, `studio-22872200-65a87`, typically under the alias `default` 
    

**Essential CLI Setup Commands**

- **`firebase login`**: Authenticates the CLI with your Google account 
    
- **`firebase projects:list`**: Displays all projects associated with your account, letting you verify access to `studio-22872200-65a87` 
    
- **`firebase use --add`**: Associates a Firebase project with an alias (like `development` or `production`) so you can quickly switch environments . 
    
- **`firebase init`**: An interactive wizard that lets you add Firebase services (like Firestore, Storage, or Functions) to your local setup one by one 

### Local dev

1. Initialize the emulators

```sh
firebase init emulators
```

2. Start the emualtors at `localhost:4000`

```bash
firebase emulators:start
```

This is how you connect yoru frontend app to firebase emulators:

```ts
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

// Only connect to emulators during local development
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

```

```ts
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = { /* Your web app config */ };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);

if (window.location.hostname === "localhost") {
  // Point to the Auth emulator (requires the http:// prefix)
  connectAuthEmulator(auth, "http://127.0.0.1:9099");

  // Point to the Storage emulator (host and port are separate arguments)
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
```

You have key formatting differences between auth and db:

- **Auth Emulator**: Expects a full URL string as the second parameter (e.g., `"http://127.0.0.1:9099"`) [docs/emulator-suite/connect_auth].
    
- **Storage Emulator**: Expects the host IP and the numeric port as separate arguments (e.g., `"127.0.0.1"`, `9199`) [docs/emulator-suite/connect_storage].
    
#### **Understanding Port Configurations**

Because the Emulator Suite runs entirely on your local machine, each Firebase service behaves like a mini-server and requires a unique port to communicate [docs/emulator-suite/install_and_configure]. Here are the default ports you will typically use [docs/emulator-suite/install_and_configure]:

- **Emulator Suite UI**: `4000` (The visual dashboard to view data) [docs/emulator-suite/install_and_configure]
    
- **Cloud Firestore**: `8080` [docs/emulator-suite/install_and_configure]
    
- **Firebase Authentication**: `9099` [docs/emulator-suite/install_and_configure]
    
- **Cloud Storage**: `9199` [docs/emulator-suite/install_and_configure]
    
- **Cloud Functions**: `5001` [docs/emulator-suite/install_and_configure]
    

These mappings are saved inside your `firebase.json` file under the `"emulators"` key.

```json title="firebase.json"
"emulators": {
  "firestore": { "port": 8080 },
  "auth": { "port": 9099 },
  "ui": { "enabled": true, "port": 4000 }
}
```

#### Testing with emulators

To write automated tests, Firebase provides the `@firebase/rules-unit-testing` library (v9). This library allows you to easily mock user authentication and verify how Firestore responds.

1. Create a `firestore.rules` file
2. Create a unit test that loads the rule

```ts
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import fs from "fs";

let testEnv = await initializeTestEnvironment({
  projectId: "studio-22872200-65a87",
  firestore: {
    rules: fs.readFileSync("firestore.rules", "utf8"),
  },
});

```

**simulating auth states**

- **Authenticated**:

```ts
const aliceDb = testEnv.authenticatedContext("alice").firestore();
```
    
- **Unauthenticated**: 

```ts
const publicDb = testEnv.unauthenticatedContext().firestore();
```

Then you can test like so:

```ts
// Test that Alice can read her own document
await assertSucceeds(getDoc(doc(aliceDb, "users/alice")));

// Test that an unauthenticated user cannot write
await assertFails(setDoc(doc(publicDb, "users/alice"), { data: "test" }));
```

## Firebase service accounts

### How to authenticate with admin SDK

1. In the firebase console, go to **project settings** then to **service accounts**.


![](https://i.imgur.com/ObsYTi4.jpeg)


2. Generate the private key JSON and store it.
3. Add this code to get the firebase admin config


```ts
var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```