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
****
The connection url for an authenticated mongodb session would look like this:

```bash
mongosh "mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@localhost:27017"
```

**method 2 - database methods**
****

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
****
You also have database management methods, where the syntax is very similar to python. We have the global variable `db`, which points to the current database.

You can create a collection like so, with the `db.createCollection()` command.

```ts
db.createCollection("new_collection")
```

You can drop the current database with `db.dropDatabase()`
### Collection CRUD

For every method and thing you use in mongo, you will always use the `db.<collection>.<method>()` type of syntax to perform queries, CRUD, and other stuff to the documents in a collection.

- For all intents and purposes, documents `doc` are stuctured just like javascript objects.
- A query object `query` is simply a javascript object with bson features.

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

Here is some examples of using these operators:

```python
db.websites.find({status: {$in: [200, 201, 202]}}) # check if status in array
db.websites.find({status: {$gte: 200}}) # check if status >= 200
db.websites.find({status: {$exists: true}}) # check if "status" property exists

# multiple conditions at once
db.websites.find({status: {$exists: true}, name: {$exists: true}})
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
****
Use the `sort()` method after finding to sort all the found documents in a specific manner.

- `db.<collection>.find().sort(query)` : does a sort, ascending or descending, based on the query.

Ascending order is represented by the number 1, while descending order is represented by -1. Here are sorting examples:

```python
db.dogs.find().sort({age: -1})
db.websites.find().sort({name : 1})
```

**counting**
****
Use the `count()` method after finding to count the number of documents found.

- `db.<collection>.find().count()` : counts the number of documents in the collection.
- `db.<collection>.find(query).count()` : counts the number of documents in the collection that satisfy the query criteria.

**limiting**
****
Similarly, the `limit(n)` method works to limit the number of returned documents.

- `db.<collection>.find().limit(n)` : Returns the first n documents in the collection.
- `db.<collection>.find(query).limit(n)` : Returns the first n documents in the collection that satisfy the query criteria.
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
****
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

### Unsetting Properties

### Incrementing Properties
## mongoose

### Connecting to databases

You can connect to your mongo database through a connection URL:

```ts
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');

const Cat = mongoose.model('Cat', { name: String });

const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => console.log('meow'));
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
  rating: String
});

export const Movie = mongoose.model('Movie' , movieSchema);
```

You can then create documents and save them like this:

```ts
const amadeus = new Movie({
	title : 'Amadeus', 
	year : 1984, 
	score : 8.2, 
	rating : 'R'
})
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
    bestFriend: mongoose.Schema.Types.ObjectId
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
import { Document, Schema, model } from 'mongoose';

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
  createdAt: { type: Date, default: Date.now }
});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);

export default User;

```

#### Nested Schemas

You can create nested schemas or foreign table relationship schemas by including fields of type `Schema.Types.ObjectId`:

- The posts model has a many-to-one relationship with an author, referencing the `'User'` collection.
- The posts model has a one-to-many relationship with comments under the `comments` key, which is an array of objects.
- Comments has a many-to-one relationships with the authors table, referencing the `'User'` collection, but each comment can also have an anonymous author.

```ts
// In src/models/post.ts
import { Document, Schema, model, Types } from 'mongoose';
import { IUser } from './user';

// Define an interface for comments
export interface IComment {
  text: string;
  author?: IUser['_id']; // Optional reference to the author
  createdAt: Date;
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  createdAt: Date;
  comments: IComment[]; // Array of comments
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [{ // Define the schema for comments
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
});

const Post = model<IPost>('Post', postSchema);

export default Post;

```

### CRUD with mongoose

All CRUD methods in mongoose are asynchronous. The following esamples will use this schema, which has complete 

#### C: creating

- `model.insertMany(docs)`: inserts an array of documents all at once
- `model.insertOne(doc)`: inserts a single document
- `model.save(doc)`: saves a document to the database


```ts
  const data = await Movie.insertMany([
      { title: 'Amelie', year: 2001, score: 8.3, rating: 'R' },
      { title: 'Alien', year: 1979, score: 8.1, rating: 'R' },
      { title: 'The Iron Giant', year: 1999, score: 7.5, rating: 'PG' },
      { title: 'Stand By Me', year: 1986, score: 8.6, rating: 'R' },
      { title: 'Moonrise Kingdom', year: 2012, score: 7.3, rating: 'PG-13' }
  ])
```

```ts
const newUser: IUser = new User({
	name: 'John Doe',
	email: 'john.doe@example.com',
	age: 30
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
const doc = await Movie.findOne({year : {$lt : 2001}})
```

```ts
const users = await User.find({});
console.log('All users:', users);

const userByName = await User.findOne({ name: 'John Doe' });
console.log('User found by name:', userByName);
```

#### U: updating

```ts
const updatedUser = await User.findOneAndUpdate(
	{ email: 'john.doe@example.com' }, // 1) find query
	{ age: 31 },   // 2) update properties
	{ new: true } // 3) Return the updated document
);
console.log('User updated:', updatedUser);
```

#### D: deleting

```ts
const result = await User.deleteOne({ email: 'john.doe@example.com' });
console.log('User deleted:', result);
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
const virtual = websiteSchema.virtual("dateString")

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
userSchema.pre("save", function(next) {
    // this = the document
    console.log(`saving user ${this.name}`)
    // continue action
    next()
    
})

userSchema.post("save", function(doc, next) {
    console.log("successfully saved user!")
    // continue action
    next()
})
```

The middleware must invoke the `next()` function in order for the operation to continue successfully.