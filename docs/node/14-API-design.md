## Better fetching

This simple drop-in axios replacement has type safety, flexibility, and just overall ease of use:

```ts
async function betterFetch({
  url,
  method,
  body,
  json = true,
  headers,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  json?: boolean;
  headers?: Headers;
}) {
  const res = await fetch(url, {
    method,
    body: body && json === true && JSON.stringify(body),
    headers: json
      ? {
          Accept: "application/json",
          "Content-Type": "application/json",
        }
      : headers,
  });

  if (!res.ok) {
    throw new Error(`API Error ${method} ${url}`);
  }

  return res;
}

type Methods = "GET" | "POST" | "PUT" | "DELETE";

type RequestReponse<K, V> = Partial<
  Record<
    Methods,
    {
      payload: K;
      response: V;
    }
  >
>;

type FetcherOptions = {
  json?: boolean;
  headers?: Headers;
};

export class Fetcher<T extends RequestReponse<any, any>> {
  constructor(private readonly url: string) {
    this.url = url;
  }

  static async get(url: string, options: FetcherOptions = {}) {
    return betterFetch({
      url,
      method: "GET",
      ...options,
    });
  }

  static async post(url: string, payload: any, options: FetcherOptions = {}) {
    return betterFetch({
      url,
      method: "POST",
      body: payload,
      ...options,
    });
  }

  static async put(url: string, payload: any, options: FetcherOptions = {}) {
    return betterFetch({
      url,
      method: "PUT",
      body: payload,
      ...options,
    });
  }

  static async delete(url: string, options: FetcherOptions = {}) {
    return betterFetch({
      url,
      method: "DELETE",
      ...options,
    });
  }

  async GET() {
    const response = await betterFetch({
      url: `${this.url}`,
      method: "GET",
    });
    const payload = await response.json();
    return payload as T["GET"] extends { response: infer R } ? R : never;
  }

  async POST(payload: T["POST"] extends { payload: infer P } ? P : never) {
    const response = await betterFetch({
      url: `${this.url}`,
      method: "POST",
      body: payload,
    });
    return response.json() as T["POST"] extends { response: infer R }
      ? R
      : never;
  }

  async PUT(payload: T["PUT"] extends { payload: infer P } ? P : never) {
    const response = await betterFetch({
      url: `${this.url}`,
      method: "PUT",
      body: payload,
    });
    return response.json() as T["PUT"] extends { response: infer R }
      ? R
      : never;
  }

  async DELETE(payload: T["DELETE"] extends { payload: infer P } ? P : never) {
    const response = await betterFetch({
      url: `${this.url}`,
      method: "DELETE",
      body: payload,
    });
    return response.json() as T["DELETE"] extends { response: infer R }
      ? R
      : never;
  }
}
```

Here's how to use it:

```ts
const fetcher = new Fetcher<{
  GET: {
    payload: null;
    response: { name: string; age: number }[];
  };
}>("http://localhost:4001/api/trpc/dog.getDogs?batch=1&input=%7B%7D");
const data = await fetcher.GET(); // appropriately typed
```

## OpenAPI

OpenAPI is a standard that describes a REST API from a yaml file describing each route, the parameters it takes, and the responses it gives. You have several advantages when using this standard:

- **type safety**: You can have type safety for fetching API routes across the backend and frontend.
- **easy documentation**: documentation tools like Swagger can make docs automatically from openAPI specifications.

### OpenAPI json

This is what an openapi yaml file looks like:

```yml
openapi: 3.0.0
info:
  title: My Awesome API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: A list of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
  /users/{id}:
    get:
      summary: Get a user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: A single user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
```

Here is an explanation of each key:

* `openapi`: Specifies the version of the OpenAPI specification being used.
* `info`: Provides metadata about the API, including title and version.
* `paths`: Defines the individual API endpoints.
    * `<path>` (e.g., /users ): The relative path to the endpoint.
    * `<http_method>` (e.g., get ): The HTTP method supported by the endpoint.
    * `summary`: A brief description of the endpoint's purpose.
    * `parameters`: Defines the parameters required by the endpoint.
        * `name`: The parameter name.
        * `in`: Where the parameter is located (e.g., `path`, `query`, `header`, `cookie`).
        * `required`: Whether the parameter is mandatory.
        * `schema`: The data type and structure of the parameter.
* `responses`: Defines the possible responses from the endpoint based on status codes.
    * `<status_code>` (e.g., 200, 404 ): The HTTP status code.
    * `description`: A description of the response.
    * `content`: Defines the content of the response body.
        * `<media_type>` (e.g., application/json ): The content type.
        * `schema`: The data structure of the response body, often referencing a schema defined in components.
* `components`: Defines reusable data schemas, security schemes, and other definitions.
* `schemas`: Defines reusable data models.
    * `<schema_name>` (e.g., User ): The name of the schema.
    * `type`: The type of the schema (e.g., `object`, `array`, `string`, `integer`).
    * `properties`: Defines the properties of an object schema.
        * `<property_name>` (e.g., id, name ): The name of the property.
        * `type`: The data type of the property.
        * `description`: A description of the property.
* `$ref`: A reference to another definition within the OpenAPI specification.


### Ensuring fullstack type safety for API routes

**creating types from openapi json file (method 1)** 
****

```bash
npx openapi-typescript openapi.json -o types.ts
```

then once you have these types, you can have complete type safety on the client side when fetching your API by using the `openapi-fetch` library.

**method 2**
****
![](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748124274/image-clipboard-assets/p4ozqfpjgl9igmh9ijh7.webp)

Using the `openapi-generator-cli` tool can help you create fullstack type safety from an openapi yaml.

### Creating Swagger docs

Using a swagger SDK in your backend allows you to set up swagger document from an openapi yaml file.

```ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const app = express();
app.use(express.json());

const openapiPath = './openapi.yaml';
const file = fs.readFileSync(openapiPath, 'utf8');
const swaggerDocument = YAML.parse(file);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ... your other API routes ...

app.listen(3000, () => {
  console.log('Backend listening on port 3000');
  console.log('Swagger UI available at http://localhost:3000/api-docs');
});

```

## TRPC

trpc is a tool that kind of works liek server actions in NextJS: it provides type safety across the frontend and backend when dealing with API requests and AJAX fetching, and has pros and benefits for its use:


| pros                                                | cons                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| great for when working on small to medium projects  | not good at large scale                                           |
| great for when using typescript across the codebase | not good when dealing with many 3rd party libraries or languages. |
| great for when not many libraries                   |                                                                   |

### basic flow

There are three main steps when setting up TRPC:

1. connect TRPC to a server, like express, nextjs, or normal http server through an adapter
2. create TRPC methods that will be exposed to the client through a TRPC router.
3. use the TRPC methods on the frontend

**TRPC router setup**
****
