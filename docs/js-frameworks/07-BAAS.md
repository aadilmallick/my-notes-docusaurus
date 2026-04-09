## Supabase

### CLI

The supabase CLI can be installed here

Here is how you can set up your project:

1. Run `supabase login` to login
2. Run `supabase init` to initialize supabase for your project
3. Run `supabase link` to link your local supabase config to a project on supabase so you can connect to the cloud

```bash
supabase link --project-ref <project-id>
```

#### secrets

You can use the `supabase secrets` command to perform CRUD operations on secrets and upload them to the cloud.

- `supabase secrets set <KEY>=<VALUE>`: sets a secret env pair in the cloud
- `supabase secrets list`: shows all secrets you have associated with your supabase project

Here is how to setup multiple secrets at once by pointing to an env file to upload:

```sh
supabase secrets set --env-file .env
```

### SDK

#### SDK setup

1. Install the supabase SDK `@supabase/supabase-js` package.

2. Create a supabase client by going to the project api and copying over the connection strings.

On the main dashboard, this is what the project connection stuff will look like:

![](https://i.imgur.com/fZxrUR3.jpeg)

Here is where you can go to get the public and secret keys:


![](https://i.imgur.com/ta7bfzE.jpeg)


- **public key**: suitable for use on the client and basically only works client side
- **secret key**: only works server-side

Then you can implement that in typescript like so:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdmin(
  supabaseUrl: string,
  supabaseSecretKey: string
) {
  return createClient(supabaseUrl, supabaseSecretKey!);
}
```

#### DB querying

Supabase is a super light wrapper over postgreSQL, and all db queries return an error and data object. Nothing is strongly typed, so it serves to create your own wrapper over supabase.

Here is a basic example of all the CRUD operations:

- `supabase.from(tableName)`: sets up a chain of creating postgres query statements
- `.delete()`: creates a DELETE statement
- `.eq(field, value)`: equivalent to a WHERE statement with checking equality of the specified field to the specified value
- 

```ts
async function deleteTaskByID(id: string) {
	const {data, error} = await supabase.from("tasks") // on tasks table
										.delete() // DELETE FROM
										.eq("id", id) // WHERE id = ?
}

async function orderTasks() {
	const {data, error} = await supabase.from("tasks")
										.select("*")
										.order_by("created_at": {
											ascending: true
										})
}

async function insertTask(task: Task) {
	const {data, error} = await supabase.from("tasks")
										.insert(task)
										.single() // need this to specify single

}

async function insertManyTasks(tasks: Task[]) {
	const {data, error} = await supabase.from("tasks")
										.insert(tasks)
}

async function updateTask(taskId: string, task: Partial<Task>) {
	const {data, error} = await supabase.from("tasks")
										.update(task)
										.eq("id", taskId)

}
```

Here's an abstraction over common supabase DB operations:

```ts
export class SupabaseDbManager<T extends Record<string, any>> {
  constructor(
    public supabase: SupabaseClient,
    public tableName: string,
    private options?: {
      idField?: string;
    }
  ) {}

  private get id() {
    return this.options?.idField ?? "id";
  }
  getBuilder() {
    return this.supabase.from(this.tableName);
  }

  async insert(data: T): Promise<T> {
    const { data: createdData, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return createdData as T;
  }

  async insertMany(data: T[]) {
    const response = await this.supabase.from(this.tableName).insert(data);
    return response;
  }

  async update(id: string, data: Partial<T>) {
    const response = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq(this.id, id);
    return response;
  }

  async delete(id: string) {
    const response = await this.supabase
      .from(this.tableName)
      .delete()
      .eq(this.id, id);
    return response;
  }
}
```

#### File storage

You can take advantage of supabase file storage by uploading files and downloading files:

```ts
export class SupabaseStorageManager {
  constructor(public supabase: SupabaseClient) {}

  async uploadFile(file: File, path: string) {
    const { data, error } = await this.supabase.storage
      .from("files")
      .upload(path, file);
    if (error) throw error;
    return data;
  }

  async downloadFile(path: string) {
    const { data, error } = await this.supabase.storage
      .from("files")
      .download(path);
    if (error) throw error;
    return data;
  }
}
```
### Auth

#### Setting up auth

To set up auth on supabase for google, you first need to get an OAuth client id and secret from the google cloud page. You can set the authroized javascript origins to localhost and include the callback url and origin that supabase provides.

![](https://i.imgur.com/PNRuIHZ.jpeg)

You then paste in your client secret and id here:


![](https://i.imgur.com/qZplAqr.png)


The final step you need to do is to register redirect URLs to your app with supabase. Go to the `/auth/url-configuration` route in supaabase to do so.
#### Auth

Here is a supabase auth client you can create:

```ts
```

Here's an abstraction over common supabase auth operations:

```ts
export class SupabaseAuthManager {
  constructor(public supabase: SupabaseClient) {}

  async loginWithGoogle() {
    const res = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      // options: {

      // }
    });
    return res;
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  onAuthStateChange(options: {
    onSignedIn: (session: Session) => void;
    onSignedOut: () => void;
  }) {
    const { data: authListener } = this.supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          options.onSignedIn(session!);
        } else if (event === "SIGNED_OUT") {
          options.onSignedOut();
        }
      }
    );

    return {
      unsubscribe: () => {
        authListener.subscription.unsubscribe();
      },
    };
  }

  async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getSession() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
}
```


### Edge functions 

Edge functions are serverless cloud functions you create that supabase hosts that you can request like an API endpoint. An example would be something like this:

![](https://i.imgur.com/xCG7W3P.jpeg)

#### Setup

Edge functions are individual files that live in the `supabase/functions` directory, and are run in Deno with typescript.


![](https://i.imgur.com/SpBdbao.jpeg)


Here is how to set up for supabase functions:

1. Run `supabase init` and click "yes" when asked to generate deno settings.
2. Run `deno init` to create a `deno.json` and allow for installing packages.
3. Install the deno packages you want using `deno add` within the `supabase/functions` folder. 
	- For example, once you do `deno add npm:zod`, you can use zod anywhere in your cloud functions.

The best project structure for supabase functions is like so, where you have access to a complete deno environment, therefore you can do the following:

- **shared code**: for best practice, keep all shared code in a `_shared` folder. You can share code across the functions by importing other files into those functions.
- **tests**: you can test functions using the deno testing framework.
 
![](https://i.imgur.com/HKAlx50.jpeg)

#### Sharing code between functions

The `deno.json` is necessary for shared code, as that's the new and improved way over import maps for telling functions where your code lives. You can create it with `deno init`.

Each function should have its own `deno.json` file to manage dependencies and configure Deno-specific settings. This ensures proper isolation between functions and is the recommended approach for deployment. When you update the dependencies for one function, it won't accidentally break another function that needs different versions.

![](https://i.imgur.com/7O9BuJ5.jpeg)

Some npm packages may not ship out of the box types and you may need to import them from a separate package. You can specify their types with a `@deno-types` directive:

```ts
// @deno-types="npm:@types/express@^4.17"
import express from 'npm:express@^4.17'
```

To include types for built-in Node APIs, add the following line to the top of your imports:

```ts
/// <reference types="npm:@types/node" />
```
#### Authentication in edge functions

By default, JWT auth is enabled for edge functions, meaning a user has to be logged in via supabase auth before they can programmatically invoke a function.

That means that when you invoke a function like so, a bearer auth header is automatically passed with the header value being the supabase anon key.

```ts
const { data, error } = await supabase.functions.invoke("create-checkout", {
  body: {
    customerName: "John"
  }
})
```


To create an edge function without authentication, you must disable the JWT auth for the function in the function settings in the dashboard.

![](https://i.imgur.com/Qfz4MF2.jpeg)

> [!WARNING]
> Disabling JWT auth makes a supabase cloud function work like any old API route, therefore you must be extremely careful with who you let call your API. CORS is necessary to prevent malicious actors when disabling JWT.

#### Function local development

Here is what you can do to develop with functions locally:

- `supabase functions serve [function-name]`: serves the specified function by name locally.
- `supabase functions serve [function-name] --no-verify-jwt`: serves the specified function by name locally without JWT auth
- `supabase functions serve --env-file [env-file-path]`: injects the env vars in the specified env file path into the function execution context when developing locally.

And you deploy a function to supabase like so:

```bash
supabase functions deploy [function-name]
```

#### Accessing secrets

In supabase function code you have access to the environment variables that are **supabase secrets**. Here are some examples of the secrets automatically set by supabase and thus available in the environment variables injected into a function execution context.

- `SUPABASE_URL`: The API gateway for your Supabase project
- `SUPABASE_ANON_KEY`: The `anon` key for your Supabase API. This is safe to use in a browser when you have Row Level Security enabled
- `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` key for your Supabase API. This is safe to use in Edge Functions, but it should NEVER be used in a browser. This key will bypass Row Level Security
- `SUPABASE_DB_URL`: The URL for your Postgres database. You can use this to connect directly to your database

Since supabase functions run using deno, you can retrieve any environment variable like so:

```ts
Deno.env.get("SOME_SECRET_KEY")
```

#### Using supabase client in edge functions

A major use case of edge functions is using supabase storage, auth, and database in a way to bypass RLS restrictions.

It's best practice to store the supabase clients in some sort of shared code like in a `_shared` folder:

```ts
import { createClient } from 'npm:@supabase/supabase-js@2'

// For user-facing operations (respects RLS)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

// For admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

In development, you can load environment variables in two ways:

1. Through an `.env` file placed at `supabase/functions/.env`, which is automatically loaded on `supabase start`
2. Through the `--env-file` option for `supabase functions serve`. This allows you to use custom file names like `.env.local` to distinguish between different environments.

#### Function examples

##### Stripe Edge function

This is what an edge function completely looks like:

1. Grab the Supabase client  and populate it with your environment variables
2. Create a server using `Deno.serve`
3. Check headers for authorization and use that to get authenticated supabase user
4. Do work and then return a response.

By default, all edge functions need an `Authorization` and `apikey` header, both of which should be set to the supabase publishable anon key if you have JWT auth for functions turned on.

```ts
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
	
  // 1. handle cors
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    console.log("🔄 Creating task with AI suggestions...");
    
    // 2. ensure supabase user is logged in
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // 3. Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // 4. Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Create the task
    const { data, error } = await supabaseClient
      .from("tasks")
      .insert({
        title,
        description,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Get label suggestion from OpenAI
    const prompt = `Based on this task title: "${title}" and description: "${description}", suggest ONE of these labels: work, personal, priority, shopping, home. Reply with just the label word and nothing else.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 16,
    });

    const suggestedLabel = completion.choices[0].message.content
      ?.toLowerCase()
      .trim();

    console.log(`✨ AI Suggested Label: ${suggestedLabel}`);

    // Validate the label
    const validLabels = ["work", "personal", "priority", "shopping", "home"];
    const label = validLabels.includes(suggestedLabel) ? suggestedLabel : null;

    // Update the task with the suggested label
    const { data: updatedTask, error: updateError } = await supabaseClient
      .from("tasks")
      .update({ label })
      .eq("task_id", data.task_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify(updatedTask), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in create-task-with-ai:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```


### DB

#### Security policies

This is what a security policy will look like to enable row level security


![](https://i.imgur.com/3d3MRzR.jpeg)

#### Migrations

Since supabase just runs on postgres, you can write normal psotgresql and make changes to your cloud DB. You follow these steps:

1. Create a `supabase/migrations` folder and write all the SQL files that describe the migration there. They will be run in alphabetical order.
2. Run `supabase db push` command to run all the SQL files in the `supabase/migrations` folder.

To do a complete rest on your project and clear the db to start fresh, run this command:

```bash
supabase db reset --linked
```

#### Setup with stripe

Here I will walk you through a complete supabase setup with stripe.

The first step is to run this migration:

Then to add fields to your user:

Add triggers to automatically create customer ID for a user once they're created in supabase, which is much easier than manually adding the customer id.


## Firebase

## Appwrite