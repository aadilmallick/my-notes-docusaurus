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