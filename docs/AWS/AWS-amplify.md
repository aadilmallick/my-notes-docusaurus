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

### App building basics

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


```ts
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