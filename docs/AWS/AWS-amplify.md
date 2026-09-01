## Basics

### How amplify works

Behind the scenes, amplify is just a **glue service** that uses CloudFormation and CDK to basically abstract over provisioning infra for you, where Amplify manages the infra and all you manage is the code.

![](https://docs.amplify.aws/images/gen2/how-amplify-works/nextImageExportOptimizer/amplify-flow-opt-1920.WEBP)
Here is a list of all the services you can enable with Amplify, where all you do is write the code to use the service and then Amplify will provision the required infra and manage it for you behind the scenes.


![](https://i.imgur.com/X9MrCln.jpeg)

### Gen 1 v Gen 2

 - **Gen 1**: In Gen 1, you would use Studio's console or the CLI to provision infrastructure; 
 - **Gen 2**: in Gen 2, you author TypeScript code in files following a file-based convention (such as `amplify/auth/resource.ts` or `amplify/auth/data.ts`)

AWS Amplify Gen 2 is a **code-first** rework of Amplify. Instead of running an interactive CLI (`amplify add auth`, `amplify push`) that mutates a hidden configuration, you **write your entire backend as TypeScript** inside your app's repository. 

That backend code — auth rules, data models, storage buckets, Lambda functions — lives next to your frontend code, gets type-checked, and can be reviewed in a normal pull request.

#### Why gen2 is better

With TypeScript types and classes for resources, you gain strict typing and IntelliSense in Visual Studio Code to prevent errors. A breaking change in the backend code immediately reflects as a type error in the co-located frontend code. 

> [!NOTE]
> The file-based convention follows the "convention over configuration" paradigm—you know exactly where to look for resource definitions when you group them by type in separate files.

AWS Amplify Gen 2 is a **code-first** rework of Amplify. Instead of running an interactive CLI (`amplify add auth`, `amplify push`) that mutates a hidden configuration, you **write your entire backend as TypeScript** inside your app's repository

> [!NOTE]
> You do **not** need to install a global Amplify CLI for Gen 2. Gen 2 tooling is invoked through `npx ampx` from inside your project.

Key ideas that make Gen 2 different:

- **Backend-as-code**: You define resources (`defineAuth`, `defineData`, `defineStorage`, `defineFunction`) in `.ts` files under an `amplify/` folder. There's no proprietary DSL — it's just TypeScript, so you get autocomplete and compile-time errors.
- **End-to-end type safety**: The shape of your data schema flows automatically into your frontend code. If you rename a field in your schema, your React component that uses it will fail to compile.
- **Per-developer cloud sandboxes**: Every developer can spin up their own isolated, real AWS backend (`npx ampx sandbox`) for local development — no more shared dev environments stepping on each other.
- **Git-based deployment**: Your Git branch is the source of truth. Connecting a repository to the Amplify Console means every push can trigger a full-stack deployment (frontend build + backend infrastructure).
- **Built on CDK**: Under the hood, Gen 2 constructs generate AWS CDK, so you can drop down to raw CDK constructs whenever the built-in categories (Auth, Data, Storage, Functions) aren't enough.

#### New feature: CDK support

Gen 2 currently ships first-class support for four backend categories: **Auth**, **Data**, **Storage**, and **Functions**. Anything beyond that (custom AWS services, third-party integrations) can be added using AWS CDK constructs directly inside `backend.ts`.
#### New feature: Staging environments

If deploying your `dev` git branch, a staging dev environment is created and becomes linked to the `dev` git branch, allowing you to provision cloud resources in a staging/test environment and then when you finally push up to main, the cloud resources are provisioned in production.

![](https://docs.amplify.aws/images/gen2/how-amplify-works/nextImageExportOptimizer/fullstack-opt-1920.WEBP)

### Quick demo (amplify V1): host static React site

1. Create a React app with Vite
2. Run the `amplify init` command, which walks you through your project root and which AWS profile to use.
3. Setup hosting for the app by running `amplify add hosting`
4. Publish the app by running `amplify publish`

### Installation

To get started with AWS Amplify we recommend that you use our [quickstart](https://docs.amplify.aws/react/start/quickstart/) starter template. However, for some use cases, it may be preferable to start from scratch, either with a brand new directory or an existing frontend app. In that case we recommend to use [npm](https://npmjs.com/) with [`create-amplify`](https://www.npmjs.com/package/create-amplify).

#### Manual installation

1. Run `npm create amplify@latest` to go through the app creation wizard
2. Create a vite app with `npm create vite@latest`
3. Install necessary backend dependencies

```bash
npm add --save-dev @aws-amplify/backend@latest @aws-amplify/backend-cli@latest typescript
```

3. Next, create the entry point for your backend, `amplify/backend.ts`, with the following code:

```ts
import { defineBackend } from '@aws-amplify/backend';

defineBackend({});
```

4. Now you can run `npx ampx sandbox` to create your first backend!
#### Bootstrapping the environment

1. Run the `npx ampx sandbox` command to bootstrap amplify with your locally stored AWS credentials, for a specific profile:

```bash
npx ampx sandbox # boostrap with default profile

npx ampx sandbox --profile admin-developer # bootstrap with specific profile
```

### Examining folder structure

This is what a bare-bones folder structure should look like:

```
├── amplify/                     # All backend code lives here
│   ├── auth/
│   │   └── resource.ts          # defineAuth(...)
│   ├── data/
│   │   └── resource.ts          # defineData(...) + your schema
│   ├── storage/
│   │   └── resource.ts          # defineStorage(...)  (added as needed)
│   ├── functions/
│   │   └── my-function/
│   │       ├── resource.ts      # defineFunction(...)
│   │       └── handler.ts       # Lambda handler code
│   ├── backend.ts               # Wires everything together
│   ├── tsconfig.json
│   └── package.json             # (optional, for ESM scoping)
├── src/                          # Your React application
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── amplify_outputs.json         # Generated — backend connection info (gitignore in teams, or commit for solo projects)
├── package.json
└── tsconfig.json
```

The convention is simple: **one folder per backend category, one `resource.ts` file that exports a defined resource**, and a top-level `backend.ts` that imports and composes them. 

#### `amplify_outputs.json`

This file is generated (not hand-written). It contains your deployed backend's endpoint URLs, region, API keys or Cognito pool IDs, and other connection metadata. Your frontend reads it once to configure the Amplify client:

```ts
// src/main.tsx
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
```

It's regenerated automatically every time you deploy (sandbox or cloud), so treat it like a build artifact — don't hand-edit it.

### Local development

There are two ways to begin local development:

- **push first, then sandbox**: Create a Github Repo and push it to amplify, which is connected to your AWS account and thus generates the credentials-based `amplify_outputs.json` for you.
- **sandbox first, then push**: Run `npx ampx sandbox` with your AWS credentials to generate the credentials-based `amplify_outputs.json`

#### **push first, then sandbox**

1. In amplify studio, once you have deployed your app, click on a branch then go to **deployments ➡️ deployed backend resources ➡️ download `amplify_outputs.json`**

![](https://docs.amplify.aws/images/gen2/getting-started/react/nextImageExportOptimizer/amplify-outputs-download-opt-1920.WEBP)

2. Then store the `amplify_outputs.json` in the root of the project.

> [!NOTE]
> The **amplify_outputs.json** file contains backend endpoint information, publicly-viewable API keys, authentication flow information, and more. 
> 
> - The Amplify client library uses this outputs file to connect to your Amplify Backend. 
> - You can review how the outputs file is imported within the `main.tsx` file and then passed into the `Amplify.configure(...)` function of the Amplify client library.

3. Once you are done making changes, run the `npx ampx sandbox` command, which provisions your cloud resources in a staging development environment and deploys a cloud sandbox.

> [!NOTE]
> Once the cloud sandbox has been fully deployed (~5 min), you'll see the `amplify_outputs.json` file updated with connection information to a new isolated authentication and data backend.

#### **sandbox first, then push**

The `npx ampx sandbox` command should run concurrently to your `npm run dev`. 

> [!NOTE]
> You can think of the cloud sandbox as the "localhost-equivalent for your app backend".

```bash
npx ampx sandbox
```

This command:

1. Watches your `amplify/` folder for changes.
2. Deploys a **real, isolated AWS backend** scoped to you (named using your OS username + app name, so teammates never collide).
3. Regenerates `amplify_outputs.json` automatically whenever your backend code changes, so your running frontend picks up new resources on save.

Think of it as "hot reload for your backend." You edit `amplify/data/resource.ts`, save, and within seconds the sandbox redeploys the changed CloudFormation resources and your React app is instantly wired to the new schema.

#### `npx ampx sandbox`

To tear down a sandbox when you're done (it does incur minor AWS costs while running):


```bash
npx ampx sandbox delete
```

Useful flags:

```bash
# named sandbox, useful for feature branches
npx ampx sandbox --identifier my-feature   

# deploy once and exit (good for CI)
npx ampx sandbox --once                     
```

#### Setting sandbox secrets


### Amplify backend basics
#### Data

The `@aws-amplify/backend` library offers a TypeScript-first `Data` library for setting up fully typed real-time APIs (powered by AWS AppSync GraphQL APIs) and NoSQL databases (powered by Amazon DynamoDB tables). 

After you generate an Amplify backend, you will have an `amplify/data/resource.ts` file, which will contain your app's data schema. The `defineData` function turns the schema into a fully functioning data backend with all the boilerplate handled automatically.

```ts
const schema = a.schema({
  Chat: a.model({
    name: a.string(),
    message: a.hasMany('Message', 'chatId'),
  }),
  Message: a.model({
    text: a.string(),
    chat: a.belongsTo('Chat', 'chatId'),
    chatId: a.id()
  }),
}).authorization((allow) => allow.owner());
```

On your app's frontend, you can use the `generateClient` function, which provides a typed client instance, making it easy to integrate CRUD (create, read, update, delete) operations for your models in your application code.

```ts
// generate your data client using the Schema from your backend
const client = generateClient<Schema>();

// list all messages
const { data } = await client.models.Message.list();

// create a new message
const { errors, data: newMessage } = await client.models.Message.create({
  text: 'My message text'
});
```


#### Auth

Auth works similarly to data. You can configure the authentication settings you want for your app in `amplify/auth/resource.ts`. If you want to change the verification email's subject line, you can change out the default generated code with the following:


```ts
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Welcome 👋 Verify your email!'
    }
  }
});
```

You can customize your authentication flow with customized sign-in and registration flows, multi-factor authentication (MFA), and third-party social providers. 

> [!NOTE]
> Amplify deploys an Amazon Cognito instance in your AWS account when you add auth to your app.

Then, you could use the Amplify `Authenticator` component or the client libraries to add user flows.

Here is an example with the `withAuthenticator` HOC


```tsx
import { withAuthenticator } from '@aws-amplify/ui-react';

function App({ signOut, user }) {
  return (
    <>
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
    </>
  );
}

export default withAuthenticator(App);
```

Or you can just use the context provider:

```tsx title="App.tsx"
import type { Schema } from '../amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();

  // ...

  return (
    <main>
      {/* ... */}
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
```

```tsx title="index.tsx"
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import App from './App.tsx';
import outputs from '../amplify_outputs.json';
import './index.css';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);
```

Then to connect authenticated access control with data, you can specify authorization rules on the data model:

```ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a.model({
    content: a.string(),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // This tells the data client in your app (generateClient())
    // to sign API requests with the user authentication token.
    defaultAuthorizationMode: 'userPool',
  },
```

#### Backend SDK basics

You can use `define*` functions to _define_ your resources and then import them all into the `backend.ts`

For example, you can define authentication:


```ts title="amplify/auth/resource.ts"
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true
  }
});
```

Or define your data resource:


```ts title="amplify/data/resource.ts"
import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a.model({
      content: a.string(),
      isDone: a.boolean()
    })
    .authorization(allow => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema
});
```

Each of these newly defined resources are then imported and set in the backend definition:



```ts title="amplify/backend.ts"
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

defineBackend({
  auth,
  data
});
```



#### Amplify with CDK

Gen 2 is layered on top of [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/api/v2/)—the Data and Auth capabilities in `@aws-amplify/backend` wrap L3 AWS CDK constructs. As a result, extending the resources generated by Amplify does not require any special configuration. The following example adds Amazon Location Services by adding a file: `amplify/custom/maps/resource.ts`.

```ts
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as locations from 'aws-cdk-lib/aws-location';
import { Construct } from 'constructs';

export class LocationMapStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the map resource
    const map = new locations.CfnMap(this, 'LocationMap', {
      configuration: {
        style: 'VectorEsriStreets' // map style
      },
      description: 'My Location Map',
      mapName: 'MyMap'
    });

    new CfnOutput(this, 'mapArn', {
      value: map.attrArn,
      exportName: 'mapArn'
    });
  }
}
```

This is then included in the `amplify/backend.ts` file so it gets deployed as part of your Amplify app.

```ts
import { Backend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { LocationMapStack } from './locationMapStack/resource';

const backend = new Backend({
  auth,
  data
});

new LocationMapStack(
  backend.getStack('LocationMapStack'),
  'myLocationResource',
  {}
);
```

### Connecting to existing AWS resources

Amplify client libraries can be used **independently** without the Amplify backend workflow. If you have AWS resources provisioned with CDK, Terraform, CloudFormation, or the AWS Console, you can connect Amplify libraries directly to those resources.

This gives you the full power of Amplify's client APIs — authentication flows, data queries, file management, and more — while keeping complete control over your infrastructure.

You can configure the libraries in two ways:

- **Manual `amplify_outputs.json`** — Create the configuration file with your resource details
- **Programmatic configuration** — Build the configuration in code (ideal for testing and environment switching)

Both approaches support all Amplify services: **Auth**, **Data**, **Storage**, **Analytics**, **Geo**, and **Notifications**.



## Authentication

Amplify's `defineAuth` wraps Amazon Cognito, and can either provision all auth infra for you or attach to existing auth infra you created and then controls that.

### Managed Amplify auth

#### Email/password setup

A minimal email/password setup:

```ts
// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
```

#### Google setup

```ts
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile'],
      },
      callbackUrls: ['http://localhost:5173/', 'https://myapp.com/'],
      logoutUrls: ['http://localhost:5173/', 'https://myapp.com/'],
    },
  },
});
```



## Amplify with React

### Setup

1. Install client-side libraries:

```bash
npm install aws-amplify

# optional, for the <Authenticator> component
npm install @aws-amplify/ui-react   
```

## Amplify with NextJS