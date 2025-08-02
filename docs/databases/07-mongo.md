

## mongodb shell

### Running mongo through a docker container

Here's how you can run a mongo container and immediately run its shell client, `mongosh` inside of it.

```bash
docker exec -it mongo:latest mongosh
```

### mongo database auth and management

#### db auth

In this section we'll go over some of the basic db management that's important to learn with mongo. First off, if your database requires authentication, there are two ways to do so:

- **connection url**: by connecting to a secret connection URL that contains your credentials, you are essentially connecting to a authenticated session with the database
- **database authentication commands**: You can run database authentication commands which

**method 1 - connection URL**

---

The connection url for an authenticated mongodb session would look like this:

```bash
mongosh "mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@localhost:27017"
```

**method 2 - database methods**

---

1. switch to the admin user

```bash
use admin
```

2. Authenticate with the mongo db root username, which will then prompt you top enter your password. Here is what the outlook would look like:

```bash
admin> db.auth("mongo_username_here")
Enter password
*****{ ok: 1 }
```

#### db management

In a mongo database, you have several databases you can create called `db` resources, and in each db you have "tables" called `collections` resources.

- `help` : brings up a list of stuff you can do
- `show dbs` : shows the list of databases in current directory. Empty databases that exist will not show up since they are empty.
- `use <database-name>` : It goes to the specified database if it exists, or it creates it.
- `db` : shows the name of the current database
- `show collections` : shows all collections in the database

**database management methods**

---

You also have database management methods, where the syntax is very similar to python. We have the global variable `db`, which points to the current database.

You can create a collection like so, with the `db.createCollection()` command.

```ts
db.createCollection("new_collection");
```

You can drop the current database with `db.dropDatabase()`

### Collection CRUD

For every method and thing you use in mongo, you will always use the `db.<collection>.<method>()` type of syntax to perform queries, CRUD, and other stuff to the documents in a collection.

- For all intents and purposes, documents `doc` are stuctured just like javascript objects.
- A query object `query` is simply a javascript object with bson features.

> [!TIP]
> You can do `db.<collection-name>.help()` to see a list of all possible collection operations. You can do `db.help()` to see a list of all possible database operations.

#### C: insertion

- `db.<collection>.insertOne(doc)` : inserts the specified the document into the collection.
- `db.<collection>.insertMany(doclist)` : inserts the specified documents from the list into the collection.

```python
db.websites.insertOne({name : "hhmi.org", status: 200})
```

#### R: reading

- `db.<collection>.find()` : returns list of all documents in the collection.
- `db.<collection>.find(query)` : returns a list of all documents in the collection that match the criteria.
- `db.<collection>.findOne()` : returns the first document in the collection.
- `db.<collection>.find(query)` : returns the first document in the collection that matches the query criteria.

```python
# finds all documents with name="charlie" and age=4.

db.dogs.find({name : "charlie" , age : 4})
```

You then have additional querying methods that you can on after a `.find()` call:

##### Conditional Querying

The basis of mongo queries is based on mongo operators. For reading operations, we use these conditional operators:

Mongo operators begin with a `$`. With those operators, put them inside an object like this:

```
key : {operator: value}
```

- `'property.subproperty'` : Often you will have nested properties, where a key has a value of an object with its own keys and values. You can only access surface level properties in the document, and to access any nested properties you need string and dot property syntax.
- `$eq` : The equality operator. You pass a value here, corresponding to the type of the property
- `$gt` : the greater than operator. You pass a number here.
- `$gte` : the greater than or equal to operator. You pass a number here.
- `$lt` : the less than operator. You pass a number here.
- `$lte` : the less than or equal to operator. You pass a number here.
- `$ne` : The inequality operator. You pass a value here, corresponding to the type of the property
- `$in` : The in operator: matches values in the specified array
- `$nin` : The not in operator: matches all values not in the specified array.
- `$exists`: the exists operator, returning true only when the property exists on the document. You pass a boolean here.
- `$regex `: used for string matching. Pass a string value

Here is some examples of using these operators:

```python
db.websites.find({status: {$in: [200, 201, 202]}}) # check if status in array
db.websites.find({status: {$gte: 200}}) # check if status >= 200
db.websites.find({status: {$exists: true}}) # check if "status" property exists

# multiple conditions at once
db.websites.find({status: {$exists: true}, name: {$exists: true}})

# finds all pets with name starting with "bruh"
db.pets.find({name: {$regex: "^bruh"}})
```

You also have the `$and` and `$or` operators to join multiple conditional operators:

```python
# find website with name "hhmi.org" and status 200
db.websites.find({ $and: [{name: "hhmi.org"}, {status: {$gte : 200}}]})

# find all websites where either name property or status property exists
db.websites.find({ $or: [{name: {$exists: true}}, {status: {$exists: true}} ]})
```

Here is some basic example of querying with the query operators, but you can chain each read method with a querying method, of which you have these:

- **sorting**: uses `.sort()`
- **counting**: uses `.count()`
- **limiting**: uses `.limit()` and `.skip()` for an offset.

```python
# 1. query all websites with status >= 200
db.websites.find({status: {$gte: 200}})
		# 2. limit to first 10
			.limit(10)
		# 3. sort by name in ascending order
			.sort({name : 1})

```

##### Query Methods

**sorting**

---

Use the `sort()` method after finding to sort all the found documents in a specific manner.

- `db.<collection>.find().sort(query)` : does a sort, ascending or descending, based on the query.

Ascending order is represented by the number 1, while descending order is represented by -1. Here are sorting examples:

```python
db.dogs.find().sort({age: -1})
db.websites.find().sort({name : 1})
```

**counting**

---

Use the `count()` method after finding to count the number of documents found.

- `db.<collection>.find().count()` : counts the number of documents in the collection.
- `db.<collection>.find(query).count()` : counts the number of documents in the collection that satisfy the query criteria.

**limiting**

---

Similarly, the `limit(n)` method works to limit the number of returned documents.

- `db.<collection>.find().limit(n)` : Returns the first n documents in the collection.
- `db.<collection>.find(query).limit(n)` : Returns the first n documents in the collection that satisfy the query criteria.

##### Projections

Projections are just a fancy word for what you know in mongoose as `select()` - just selecting the fields you want to show up in the results.

![](https://i.imgur.com/iIEdohD.png)

You pass an object of the fields you want to include as a second argument to the `find()` family of collection methods, like so:

- To disallow a field, set `false` as the value, and to allow a field, set `true` . You have to explicitly disallow the `_id` field to get it to not show.

```python
# include the fields name and age, but exlicity remove _id
db.pets.find({type: "cat"}, {name: true, age: true, _id: false}).limit(3)
```

#### U: updating

When updating a document in mongo, you first have to query for it (preferably by id) and then pass in a second object of **update operators** that will modify the document the way you specify.

- `db.<collection>.updateOne(query, updateobj)` : updates the first data that matches the criteria.
- `db.<collection>.updateMany(query, updateobj)` : updates all documents that matches the criteria.

```python
# finds the first document whose name is charlie and sets that document's age attribute to 4

db.dogs.updateOne( {name : "charlie"} , {$set : {age : 4}})
```

Here are the different update operators:

- `$set`: takes in an object of key-value pairs and carries out those modifications on the document.
- `$unset`: takes in an object of key-value pairs and removes those keys from the document.
- `$inc`: takes in an object of key-value pairs and increments the specified properties by the specified amounts. Passing in negative numbers has the same behavior as decrementing.

**unset keys example**

---

This example shows us removing the `name` property from a document via the `$unset` operator.

![](https://i.imgur.com/d0dIE2j.png)

**increment example**

```python
# find object, and increment its `status` property by 1
db.websites.updateOne(
	{_id: ObjectId('6838a9ce580be6ac1e65d0fb')},
	{$inc : {status: 1}}
)
```

#### D: deletion

- `db.<collection>.deleteOne(query)` : deletes the first document that matches the query criteria.
- `db.<collection>.deleteMany(query)` : deletes all data that matches the query criteria.

```python
db.websites.deleteOne({_id: ObjectId('6838a9ce580be6ac1e65d0fb')})
```

### Indexes

You can also implement indices on your mongo database, and you can diagnose on which fields to put indices on by explaining queries through the `query.explain("executionStats")` method like so:

```python
db.students.find({ name: "Larry" }).explain("executionStats")
```

There are two things to look out for when looking at the stats:

- **strategy:** The efficiency of the search. If `COLSCAN`, then that is the worst, meaning O(n) time. If `FETCH`, that is better, meaning `O(log n)` time
- **num records looked at:** You want this to be less than the number of all the documents in the database.

#### Creating indices

The below code creates an index for the `name` property on a document, and applies a unique constraint that prevents duplicates.

```bash
db.pets.createIndex({ name: 1 }, { unique: true });
```

- `name: 1`: sets an index on the `name` field, sorting the documents by their name in ascending order.
- `unique: true`: makes sure that the `name` field can only have unique values, which speeds up the index and makes it more useful for querying.

There are two types of indices in mongo:

- **B-tree indices**: What you get when you create an ascending or descending index, creating a B-tree of records, sorting based on that field.
- **text indices**: An index for full text search.

#### Fetching and deleting indices

You can create an index with the `db.<collection>.createIndex()`, and you pass in an object of options that create indices for that field. You can choose to sort a field in ascending order or descending order. This method returns an index name you can use to reference the created index.

```python
db.students.createIndex({ name : 1 }) # sort field ascending, creat index
```

To find all your indices, you can use the `db.<collection>.getIndexes()` method:

```python
db.students.getIndexes()
```

You can delete an index with the `db.<collection>.dropIndex(index_name)` method.

### Aggregation

Using the `db.<collection>.aggregate()` method in mongo provides a flexible pipeline to perform aggregation transformations on your data and get valuable insights.

Aggregation is split up into **stages**, each prefixed with a `$`, run in sequence. Changing the order of these buckets would come out to a very different result.

```javascript
db.pets.aggregate([
  {
    $match: {
      type: "dog",
    },
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 }, // increase sum by 1
      },
    },
  },
  {
    $sort: {
      count: -1,
    },
  },
]);
```

- `$match`: the selector of documents to match. It is just a query object
- `$bucket`: performs group by operations, grouping by a field and then performing some aggregation like count, min, max.
  - `groupBy`: the field to group by. The field should be prefixed with a dollar sign `$` to let mongo know it's a field and not a value.
  - `boundaries`: the buckets/groups to split up the field into
  - `default`: the default bucket.
  - `output`: the output of the grouping, where the actuall aggregation occurs. You define the new field names here.
- `$sort`: sorts the fields in the way you specify.

For more info, go here:

```embed
title: "Aggregation Stages - Database Manual - MongoDB Docs"
image: "https://www.mongodb.com/docs/assets/meta_generic.png"
description: "Contains a list of aggregation stages used to build aggregation pipelines."
url: "https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/"
favicon: ""
aspectRatio: "50.083333333333336"
```

### Connecting mongodb to node

The below example shows how you would connect to the `mongodb` library using express

```jsx
const express = require("express");
const { MongoClient } = require("mongodb");

const connectionString = "mongodb://localhost:27017";
const app = express();

async function init() {
  // 1. create a new mongo client
  const client = new MongoClient(connectionString, {
    useUnifiedTopology: true,
  });
  // 2. connect to database
  await client.connect();

  // 3. get database and collection
  const db = await client.db("shelter");
  const collection = db.collection("pets");

  return collection;
}
```

1. Create a client

   ```jsx
   const client = new MongoClient(connectionString, {
     useUnifiedTopology: true,
   });
   ```

2. Connect the client

   ```jsx
   await client.connect();
   ```

3. Get the database and collection

   ```jsx
   const db = await client.db("shelter");
   const collection = db.collection("pets");
   ```

4. Run collection methods to query the collection

   ```jsx
   await collection.find({ age: { $gt: 10 } });
   ```

#### Connection Class


```ts
import { MongoClient } from 'mongodb'

export class DBMongo {
  static async connect(mongoUri: string) {
    try {
      const client = new MongoClient(mongoUri)
      await client.connect()
      return {
        isConnected: true,
        client,
      }
    }
    catch (error) {
      console.error('Error while connecting:', error)
      return {
        isConnected: false,
        client: null,
      }
    }
  }

  static async connectWithRetries(mongoUri: string, retries: number = 3) {
    for (let i = 0; i < retries; i++) {
      console.log(`Connecting to MongoDB... (${i + 1}/${retries})`)
      const result = await this.connect(mongoUri)
      if (result.isConnected) {
        return result
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    throw new Error('Failed to connect to MongoDB')
  }

  static async disconnect(client: MongoClient) {
    await client.close()
  }
}

export const dbConfig = {
  dbName: 'health-dashboard',
  websiteCollection: 'websites',
  taskCollection: 'tasks',
}
```

#### Schema Example

```ts
// import { Schema, Document, model, Collection } from "mongoose";
import { dbConfig } from './DB'
import { Collection, Document, MongoClient } from 'mongodb'

export interface WebsiteV1 {
  name: string
  url: string
  createdAt: Date // will be created by default.
  updatedAt: Date
  info?: Record<string, unknown>
}

interface WebsiteDoc extends WebsiteV1, Document {}

class Website {
  constructor(public data: WebsiteV1 & { _id: string }) {}

  /**
   * Used as an override to JSON.stringify() calls
   */
  toJSON() {
    return {
      ...this.data,
      _id: this.data._id,
    }
  }
}

class WebsiteModelV1 {
  private static instance: WebsiteModelV1 | null = null
  private collection: Collection<WebsiteDoc>

  private constructor(client: MongoClient) {
    const db = client.db(dbConfig.dbName)
    const collection = db.collection<WebsiteDoc>(dbConfig.websiteCollection)
    this.collection = collection
  }

  static getInstance(client: MongoClient): WebsiteModelV1 {
    if (!WebsiteModelV1.instance) {
      WebsiteModelV1.instance = new WebsiteModelV1(client)
    }
    return WebsiteModelV1.instance
  }

  async create(website: Pick<WebsiteV1, 'name' | 'url' | 'info'>) {
    const date = new Date()
    const data = {
      ...website,
      createdAt: date,
      updatedAt: date,
    }
    const doc = await this.collection.insertOne(data)
    const createdWebsite = new Website({
      ...data,
      _id: doc.insertedId.toString(),
    })
    return createdWebsite
  }

  /**
   *
   * @param website supports partial updates of deeply nested objects for the "info" key, or creates new website
   * if it doesn't exist yet.
   * @returns
   */
  async upsert(website: Pick<WebsiteV1, 'name' | 'url' | 'info'>, options?: {
    returnWebsite?: boolean
  }) {
    const foundWebsite = await this.collection.findOne({ $or: [{ name: website.name }, { url: website.url }] })
    if (!foundWebsite) {
      console.log('website not found ... creating website document', website)
      return await this.create(website)
    }
    else {
      await this.collection.updateOne({ _id: foundWebsite._id }, {
        $set: {
          info: {
            ...foundWebsite.info,
            ...website.info,
          },
          updatedAt: new Date(),
        },
      })
      if (options?.returnWebsite) {
        const doc = await this.collection.findOne({ _id: foundWebsite._id })
        return new Website({
          ...doc!,
          _id: doc!._id.toString(),
        })
      }
      else {
        return null
      }
    }
  }

  async getAll() {
    const docs = await this.collection.find().toArray()
    return docs.map(
      doc =>
        new Website({
          ...doc,
          _id: doc._id.toString(),
        }),
    )
  }
}

export { WebsiteModelV1 }

export interface TaskV1 {
  name: string
  createdAt: Date // will be created by default.
  data?: Record<string, unknown>
  schedule: string
}

interface TaskDoc extends TaskV1, Document {}

class Task {
  constructor(public data: TaskV1 & { _id: string }) {}

  /**
   * Used as an override to JSON.stringify() calls
   */
  toJSON() {
    return {
      ...this.data,
      _id: this.data._id,
    }
  }
}

class TaskModelV1 {
  private static instance: TaskModelV1 | null = null
  private collection: Collection<TaskDoc>

  private constructor(client: MongoClient) {
    const db = client.db(dbConfig.dbName)
    const collection = db.collection<TaskDoc>(dbConfig.taskCollection)
    this.collection = collection
  }

  static getInstance(client: MongoClient): TaskModelV1 {
    if (!TaskModelV1.instance) {
      TaskModelV1.instance = new TaskModelV1(client)
    }
    return TaskModelV1.instance
  }

  async create(task: Pick<TaskV1, 'name' | 'schedule' | 'data'>) {
    const date = new Date()
    const data = {
      ...task,
      createdAt: date,
    }
    const doc = await this.collection.insertOne(data)
    const createdTask = new Task({
      ...data,
      _id: doc.insertedId.toString(),
    })
    return createdTask
  }

  async getTodaysTasks() {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    const docs = await this.collection.find({ createdAt: { $gte: startOfDay, $lt: endOfDay } }).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => new Task({ ...doc, _id: doc._id.toString() }))
  }

  async getN(limit: number) {
    const docs = await this.collection.find()
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()
    return docs.map(
      doc =>
        new Task({
          ...doc,
          _id: doc._id.toString(),
        }),
    )
  }

  async getAll() {
    const docs = await this.collection.find().toArray()
    return docs.map(
      doc =>
        new Task({
          ...doc,
          _id: doc._id.toString(),
        }),
    )
  }
}

export { TaskModelV1 }

```

## mongoose

### Connecting to databases

You can connect to your mongo database through a connection URL:

```ts
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/test");

const Cat = mongoose.model("Cat", { name: String });

const kitty = new Cat({ name: "Zildjian" });
kitty.save().then(() => console.log("meow"));
```

When your database has authentication attached to it, the connection uri will look like this, where the most important part is a query parameter of `authSource=admin` to specify authentication procedures.

```bash
MONGO_INITDB_ROOT_USERNAME=mongo
MONGO_INITDB_ROOT_PASSWORD=mongo
MONGO_INITDB_DATABASE=db
# authSource=admin is necessary here
MONGO_URI="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongo_db:27017/${MONGO_INITDB_DATABASE}?authSource=admin"
```

### Creating schemas

Creating schemas is pretty easy in mongoose. The basic schema of adding data to yoru databse is as follows:

1. Create a schema
2. Create a model from that schema
3. Save documents to that model

```ts
const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
  score: Number,
  rating: String,
});

export const Movie = mongoose.model("Movie", movieSchema);
```

You can then create documents and save them like this:

```ts
const amadeus = new Movie({
  title: "Amadeus",
  year: 1984,
  score: 8.2,
  rating: "R",
});
amadeus.save();
```

#### Schema with validation

```ts
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favoriteMeals: [String],
    bestFriend: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);
```

Here's an example of a more advanced schema:

```ts
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 2,
    maxLength: 25,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  age: {
    type: Number,
    min: 1,
    max: 100,
  },
  email: {
    type: String,
    validate: {
      validator: (e) => e.includes("@"),
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  bestFriend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
```

#### Schemas with typescript

The correct way to use mongo with typescript is to create an interface that extends the `Document` type and then use that as a generic type.

```ts
import { Document, Schema, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

// 3. Create a Model.
const User = model<IUser>("User", userSchema);

export default User;
```

#### Nested Schemas

You can create nested schemas or foreign table relationship schemas by including fields of type `Schema.Types.ObjectId`:

- The posts model has a many-to-one relationship with an author, referencing the `'User'` collection.
- The posts model has a one-to-many relationship with comments under the `comments` key, which is an array of objects.
- Comments has a many-to-one relationships with the authors table, referencing the `'User'` collection, but each comment can also have an anonymous author.

```ts
// In src/models/post.ts
import { Document, Schema, model, Types } from "mongoose";
import { IUser } from "./user";

// Define an interface for comments
export interface IComment {
  text: string;
  author?: IUser["_id"]; // Optional reference to the author
  createdAt: Date;
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser["_id"];
  createdAt: Date;
  comments: IComment[]; // Array of comments
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      // Define the schema for comments
      text: { type: String, required: true },
      author: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Post = model<IPost>("Post", postSchema);

export default Post;
```

#### schema custom class

```ts
import mongoose, {
  Schema,
  Document,
  model,
  IfAny,
  ObtainDocumentType,
  ResolveSchemaOptions,
  DefaultSchemaOptions,
  Default__v,
} from "mongoose";
import { constants } from "../../utils/constants";

export class SchemaWrapper<T extends Document> {
  constructor(public schema: Schema<T>) {}

  onBeforeSave(cb: (doc: T) => boolean | Promise<boolean>) {
    this.schema.pre("save", async function (this, next) {
      const doc = this as T;
      const shouldSave = await cb(doc);
      if (!shouldSave) {
        next(new Error("Document not saved"));
      } else {
        next();
      }
    });
  }

  onAfterSave(cb: (doc: T) => boolean | Promise<boolean>) {
    this.schema.post("save", async function (doc, next) {
      const shouldSave = await cb(doc as T);
      if (!shouldSave) {
        next(new Error("Document not saved"));
      } else {
        next();
      }
    });
  }

  //   createVirtual(name: string, options: mongoose.VirtualTypeOptions) {
  //     this.schema.virtual(name, options);
  //   }

  createVirtual<K extends keyof T>(
    name: K,
    options: {
      get: (doc: T) => T[K];
      set?: (doc: T, value: T[K]) => void;
    }
  ) {
    this.schema.virtual(name as string, {
      get: function (this) {
        const doc = this as T;
        return options.get(doc);
      },
      set: function (this, value: T[K]) {
        const doc = this as T;
        options.set?.(doc, value);
      },
    });
  }
}

export class DBMongoose {
  static async connect(mongoUri: string) {
    try {
      await mongoose.connect(mongoUri);
      return true;
    } catch (error) {
      console.error("Error while connecting:", error);
      return false;
    }
  }

  static async disconnect() {
    await mongoose.disconnect();
  }

  static async onDisconnect(cb: () => void) {
    mongoose.connection.on("disconnected", cb);
  }
}
```

### CRUD with mongoose

All CRUD methods in mongoose are asynchronous. The following esamples will use this schema, which has complete

#### C: creating

- `model.insertMany(docs)`: inserts an array of documents all at once
- `model.insertOne(doc)`: inserts a single document
- `model.save(doc)`: saves a document to the database

```ts
const data = await Movie.insertMany([
  { title: "Amelie", year: 2001, score: 8.3, rating: "R" },
  { title: "Alien", year: 1979, score: 8.1, rating: "R" },
  { title: "The Iron Giant", year: 1999, score: 7.5, rating: "PG" },
  { title: "Stand By Me", year: 1986, score: 8.6, rating: "R" },
  { title: "Moonrise Kingdom", year: 2012, score: 7.3, rating: "PG-13" },
]);
```

```ts
const newUser: IUser = new User({
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30,
});
const savedUser = await newUser.save();
```

#### R: reading

- `model.find()`: in a mongoose query object and returns a list of documents that match the query.
- `model.findOne()` : takes in a mongoose query object and returns the first document that matches the query.
- `model.findByID()` : takes in a string id and returns the document that matches the object id.

```ts
const docs = await Movie.find({year : {$lt : 2001}})
docs.forEach(doc => /* do stuff here */)
```

```ts
const doc = await Movie.findOne({ year: { $lt: 2001 } });
```

```ts
const users = await User.find({});
console.log("All users:", users);

const userByName = await User.findOne({ name: "John Doe" });
console.log("User found by name:", userByName);
```

#### U: updating

```ts
const updatedUser = await User.findOneAndUpdate(
  { email: "john.doe@example.com" }, // 1) find query
  { age: 31 }, // 2) update properties
  { new: true } // 3) Return the updated document
);
console.log("User updated:", updatedUser);
```

#### D: deleting

```ts
const result = await User.deleteOne({ email: "john.doe@example.com" });
console.log("User deleted:", result);
```

### Dealing with documents

Each document type in mongoose has a bunch of methods and properties and by itself is not human readable, so let's get into it:

- `doc.toObject()`: returns the document as an object with just its standard properties included on the schema, not including virtuals.
- `doc.toJSON()`: returns the document as a JSON object with no methods.

### Virtuals

Virtuals in mongoose are ways to add on-the-fly properties to your schemas with getters and setters, eliminating the need for duplicating transform logic across your codebase. You can hook into the getters and setters for these virtuals:

```ts
// 1. create document type

// 2. create schema
const websiteSchema = new Schema<WebsiteV1>({
  name: { type: String, required: true, lowercase: true },
  url: { type: String, required: true, lowercase: true },
  createdAt: { type: Date, default: new Date(Date.now()), immutable: true },
  info: { type: Object, required: false },
});

// 3. create virtuals
const virtual = websiteSchema.virtual("dateString");

virtual.get(function (this: WebsiteV1Doc) {
  return this.createdAt.toDateString();
});

virtual.set(function (this: WebsiteV1Doc, value: string) {
  throw new Error("dateString is read only");
});
```

### Middleware/Hooks

Middleware or hooks in mongoose are ways to hook into the lifecycle of documents, like before and after saving, updating, deleting, etc., and are hooked into with the `schema.pre()` and the `schema.post()` methods:

- `schema.pre(event, cb)`: hooks into before the specified event activates, triggers callback
- `schema.post(event, cb)`: hooks into after the specified event activates, triggers callback

```ts
userSchema.pre("save", function (next) {
  // this = the document
  console.log(`saving user ${this.name}`);
  // continue action
  next();
});

userSchema.post("save", function (doc, next) {
  console.log("successfully saved user!");
  // continue action
  next();
});
```

The middleware must invoke the `next()` function in order for the operation to continue successfully.
