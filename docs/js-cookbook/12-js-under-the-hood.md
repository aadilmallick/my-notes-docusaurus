# JavaScript under the hood

## V8

### High level overview

THe V8 engine has two main components: **heap** and **call stack**

- **heap**: in-memory store of all the objects and variables a program has.
- **call stack**: manages the execution of the program, and single-threaded by nature for JavaScript.

#### Execution contexts

IN the call stack, every function invoked creates its own **execution context**.

> [!NOTE]
> For functions, the execution context means that every time a function is called, a new environment is created to handle that specific call. This environment stores: the function's local variables, arguments passed to the function, the value of this, and a reference to its outer (parent) scope for closure access. So basically, each function call runs in its own little "box" with its own data.

The main problem behind the call-stack in JS is its single-threaded nature, which means it can only compute one execution context at a time, the one at the top of the stack. 

This means blocking operations like this are all too common in JavaScript:

```ts
function veryHeavyOperation() {
  for (let i = 0; i < 100_000_000_000; i++) {
    console.log("there is some heavy operation happening at the moment...");
  }
}
function veryImportantTask() {
  console.log("This is a very important console.log!");
}
veryHeavyOperation();
veryImportantTask(); // will not run until heavy op execution context finishes
```

#### Callback queue

The blocking operations in javascript are solved via the introduction of callbacks, where you could delegate code to execute at some point in the future, giving inherent asynchronicity to JS.

- **The problem**: when do you push the callback into the call stack to get executed? The order of function execution is extremely important, thus you can't just push it whenever. 
- **The answer**: The **task queue**/**callback queue** is an integral part of the V8 engine designed to hold callbacks and event handlers to get executed at some point in the future, as soon as when the call stack is free. The background Web APIs are the component that decide when to push the callback to the task queue.

Thus a complete flow of asynchronous callback executions works as follows:

1. Some code has a callback that is intended to execute asynchronously or at some point in the future. The code gets pushed to the call stack, registers the callback in memory, then the code gets popped from the call stack.
2. The Web APIs are handled by the browser and can thus run in their own thread and do execution, separate from your program. They run as soon as the execution context calling them is finished.
3. As soon as the Web API finishes executing and gets back the data, it pushes the callback to the task queue with that data.
4. The **event loop** continuously checks if the call stack is free, and if so, pops the first callback off the queue and pushes it to the call stack for immediate execution.

![event loop example](https://www.deepintodev.com/_next/image?url=%2Fimages%2Feventloop.png&w=1200&q=75)


#### Microtask queue

The microtask queue is a special version of the callback queue equipped for dealing with promises. only the `.then`, `.catch`, `.finally` callbacks will be pushed to the microtask queue.

> [!IMPORTANT]
> There is something really important that you should know here. **Event loop prioritizes Microtask Queue**! So event loop will first look at the Microtask queue, if call stack is available, it will take those functions into the call stack. Only after when Microtask queue is empty, it will go and check the task queue.

Let's do an in-depth example of the entire flow using this promise-based code:

```ts
fetch("https://mybackendserver.com/api/users/...").then((res) =>
  console.log(res)
);

console.log("DeepIntoDev");
```

1. The `fetch()` function is added to the call stack, creating a `Promise` object and the `.then()` callback (attached to the object) in the execution context.
2. The `console.log("DeepIntoDev")` is pushed to the call stack and synchronously executed
3. The Web API handles sending the network request through the browser, which happens in a separate thread.
4. After the web API gets data back from the network, it then pushes the previously registered `.then()` callback attached to the previously created promise to the microtask queue.
5. The event loop continuously checks if the call stack is available, and if so, pops off the first callback in the microtask queue and pushes it to the call stack for immediate execution.

![microtask queue diagram](https://www.deepintodev.com/_next/image?url=%2Fimages%2Ffulfilled.png&w=1200&q=75)

### V8 behind the scenes

This is a high level overview of how the browser parses and executes javascript code:

1. HTML parser sees a script tag and immediately sends network request to download contents of that script tag as binary
2. A **byte stream decoder** works on decoding the bytes of the `<script>` into meaningful tokens, demarcating each token as a "keyword", "punctuator", "identifier", etc., for later use for using these high level tokens to form a context free language with the help of the parser.
3. The **parser** takes these high level tokens and creates and AST (abstract syntax tree), which is then a full-fledged way of representing a programming language in a way that can be easily compiled into machine code.
4. The **ignition interpreter**, which is part of the v8 ENGINE, is responsible for converting the AST into machine-agnostic and OS-agnostic bytecode.
5. The **Turbofan Optimizer**, another part of the V8 engine, converts the bytecode into machine code, which can then get executed by the browser.

Read this article to understand the entire process:

[How V8 JavaScript Engine Works Behind the Scenes](https://www.deepintodev.com/blog/how-v8-javascript-engine-works-behind-the-scenes)

We have the following code;

```js
Promise.resolve().then(() => console.log(32));

setTimeout(() => console.log(9), 5);

queueMicrotask(() => {
  console.log(11);
  queueMicrotask(() => console.log(4));
});

console.log(3);
```

What will be the output?

The correct answer will be;

```js
3 32 11 4 9
```

First, we have `Promise.resolve()`, this line will create a promise object but it will instantly be resolved. Since promise is already resolved, `.then` function will directly be pushed to microtask queue.

Then, `setTimeout` will initiate the timer and after 5 milliseconds have passed, callback function will be pushed to task queue.

Then, we have `queueMicrotask` which will push the function into microtask queue.

In the last line, we have `console.log(3)` so that function will directly go into call stack and be executed. So 3 will be logged to the console.

Our script is done and call stack is empty. Now event loop will check the microtask queue first. It will see the first function that is in the microtask queue is `console.log(32)` so 32 will be logged to the console.

Now, it goes to other function in the microtask queue which is `queueMicrotask(()=>{ console.log(11); queueMicrotask(()=>console.log(4)) });` this one. Now it will take this function to the call stack and will log 11 to the console. Then it sees another function that needs to be taken to the microtask queue. It takes `()=>console.log(4)` and pushes it to the microtask queue. Since microtask queue is still not empty, we will not go to task queue and first finish the microtask queue. That's why 4 will be printed on the screen.

Finally, our microtask queue is empty and now event loop can go to task queue to move that function to call stack. It will print 9 to the console.

## Garbage Collection

JS is a garbage collected language, meaning you don't have to manually manage memory in a JS application. 

However, it often misses performance benefits of eager garbage collection because there is no possible algorithm to decide whether or not you can garbage collect a variable. 

JS just runs the garbage collector periodically to see if a value isn't being used. All local variables in a function are automatically cleaned up once the function finishes executing. 

### Garbage collection techniques

#### Dereferencing variables

We can manually free up space for a variable so the garbage collector can clean it up. We can do this by setting variables to null. You should do this especially for global variables. 

```ts
function createPerson(name){
  let localPerson = new Object();
  localPerson.name = name;
  return localPerson;
}

let globalPerson = createPerson("Alice");

// do something with globalPerson

globalPerson = null;
```

To clean up an property value on an object, just set that to null instead of manually deleting it with the `delete` keyword. 

```ts
const person = {
	name: "asdfasfsadf",
	height: "5'10"
}

person.name = null
```

#### Avoid creating objects with an object pool

When large numbers of objects are being created within a short amount of time, the V8 engine sees this as **object churn** and applies the garbage collection process more aggressively, slowing down the app. 

For example, if you create 100 `Vector` object instances in a loop and then garbage collect them, this would register as object churn. 

To avoid this, just don't create objects. Instead, modify them and recycle them by using the concept of an **object pool**:

```ts
// vectorPool is the existing object pool
let v1 = vectorPool.allocate();
let v2 = vectorPool.allocate();
let v3 = vectorPool.allocate();

v1.x = 10;
v1.y = 5;
v2.x = -3;
v2.y = -6;

addVector(v1, v2, v3);

console.log([v3.x, v3.y]); // [7, -1]

vectorPool.free(v1);
vectorPool.free(v2);
vectorPool.free(v3);

// If the objects had properties referencing other objects,
// those would need to be set to null here as well
v1 = null;
v2 = null;
v3 = null;
```

## The Scope

By understanding the scope, you can very easily write more performant code. In a nutshell: **global variables are bad**.

> [!NOTE]
> It is always slower to access a global variable than it is to access a local variable, because the scope chain must be traversed. Anything you can do to decrease the amount of time spent traversing the scope chain will increase overall script performance.

Perhaps the most important thing you can do to improve the performance of your scripts is to be wary of global lookups. Global variables and functions are always more expensive to use than local ones because they involve a scope chain lookup.

In the example below, we speed up the code by copying the `document` object into a local variable instead of just continually referencing it globally. 

```ts
function updateUI() {
  let doc = document;
  let imgs = doc.getElementsByTagName("img");
  for (let i = 0, len = imgs.length; i < len; i++) {
    imgs[i].title = '${doc.title} image ${i}';
  }
 
  let msg = doc.getElementById("msg");
  msg.innerHTML = "Update complete.";
}
```

## Objects

### Property Lookups

Accessing properties on an object is $O(n)$ performance because it has to look through the prototype chain for the property, so try to avoid doing it:

```ts
const obj = {
	name: "Afasdfasd"
}

obj.name // bad! O(n)
```