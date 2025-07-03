# JavaScript under the hood

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