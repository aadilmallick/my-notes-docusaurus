## Basics

![](https://docs.amplify.aws/images/gen2/how-amplify-works/nextImageExportOptimizer/amplify-flow-opt-1920.WEBP)

### Gen 1 v Gen 2

 - **Gen 1**: In Gen 1, you would use Studio's console or the CLI to provision infrastructure; 
 - **Gen 2**: in Gen 2, you author TypeScript code in files following a file-based convention (such as `amplify/auth/resource.ts` or `amplify/auth/data.ts`)

With TypeScript types and classes for resources, you gain strict typing and IntelliSense in Visual Studio Code to prevent errors. A breaking change in the backend code immediately reflects as a type error in the co-located frontend code. 

> [!NOTE]
> The file-based convention follows the "convention over configuration" paradigm—you know exactly where to look for resource definitions when you group them by type in separate files.

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

### App building basics

#### Local development

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
> The `npx ampx sandbox` command should run concurrently to your `npm run dev`. You can think of the cloud sandbox as the "localhost-equivalent for your app backend".


> [!NOTE]
> Once the cloud sandbox has been fully deployed (~5 min), you'll see the `amplify_outputs.json` file updated with connection information to a new isolated authentication and data backend.



#### Data

The `@aws-amplify/backend` library offers a TypeScript-first `Data` library for setting up fully typed real-time APIs (powered by AWS AppSync GraphQL APIs) and NoSQL databases (powered by Amazon DynamoDB tables). After you generate an Amplify backend, you will have an `amplify/data/resource.ts` file, which will contain your app's data schema. The `defineData` function turns the schema into a fully functioning data backend with all the boilerplate handled automatically.

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

You can customize your authentication flow with customized sign-in and registration flows, multi-factor authentication (MFA), and third-party social providers. Amplify deploys an Amazon Cognito instance in your AWS account when you add auth to your app.

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


## App Building

### Backend SDK basics

You can use `define*` functions to _define_ your resources. For example, you can define authentication:



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