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

Edge functions are individual files that live in the `supabase/functions` directory, and are run in Deno with typescript.


![](https://i.imgur.com/SpBdbao.jpeg)

This is what an edge function completely looks like:

1. Grab the Supabase client  and populate it with your environment variables
2. Create a server using `Deno.serve`
3. Check headers for authorization and use that to get authenticated supabase user
4. Do work and then return a response.

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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    console.log("🔄 Creating task with AI suggestions...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
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