## IntelliJ with Kotlin

Kotlin requires the **JDK** (Java Development Kit) to run JVM applications like Kotlin.

### Creating a new project


When creating a new project in Kotlin, make sure to follow these steps:



![](https://i.imgur.com/foUt6Sn.jpeg)


1. Select console project
2. Select new version of JDK

Now a `main.kt` file should be created


![](https://i.imgur.com/wH6Z3fp.jpeg)

## Basics

### Variables

In kotlin, you use the `var` and `val` keywords to declare variables. Here are the differences between them:
  
- `var` : mutable variables
- `val` : immutable variable constants.

> [!NOTE]
> So use `var` when you expect your variable to change values, and use `val` when you expect your variable to remain constant.

```kt
var name = "John"
val birthyear = 1975
```

You define constants with `const val`, but global constants are not allowed. You have to define them within an `object`

```kotlin
object TaxCalculator {
    const val SALES_TAX = 8.2
}
```

But there is a difference between constants and immutable variables.

- **constant:** must be defined at compiled time, and is also immutable
- **immutable:** does not need to be defined at compile time, but you are not able to reassign it.

In summary:

- `var` : defines a mutable variables
- `val` : defines an immutable variables
- `const val` : defines a constant

#### Data types and type annotation

You can type annotate your variables like this in kotlin:

```kt
val name : String = "John"
```

Here is the list of data types in kotlin

- `String`
- `Int`
- `Double`
- `Char`
- `Boolean`

#### Null safety

Kotlin does not allow assigning null to non-nullable types by default to help prevent null pointer exceptions, which are a common source of bugs in many programming languages like Java. 

> [!NOTE]
> By making types non-nullable unless explicitly declared otherwise (with a question mark), Kotlin encourages safer code and reduces runtime crashes.

To let a variable also be possible null, you have to put a `?` after the type annotation.

Of course, this means you have to use some operators when you want to access properties and methods on a potentially null variable.

```kotlin
var myName: String        // What's the value? Null? IMPOSSIBLE
var myLastname: String?   // It can handle a null value
```

**non-null assertion operator**

The `!!` before accessing a property overrides the compiler, and is basically the developer guaranteeing that a variable at that point in time will not be null.

Avoid using this if you can, because this leads to unsafe access.

```kotlin
// not-null assertion operator
val lengthForSure = myLastname!!.length
```

**optional chaining operator**

The `?` before accessing a property will return null if the variable is null, and successfully do the property access if the variable is not null

```kotlin
// returns null if myLastname is null, else returns myLastname.length
val length = myLastname?.length
```

**elvis operator**

The `?:` operator is used to specify a default value if the optional chaining with `?` fails.

```kotlin
// returns name.count if name is not null, else returns 0
val lengthOrDefault = name?.count ?: 0
```

### Numbers

In kotlin, you have many different numeric data types, depending on their size, sign, and decimal vs non-decimal type:

- `Int`: 32-bit integers
- `Short`: 16-bit integers
- `Byte`: 8-bit integers
- `Long`: 64-bit integers, referred to with an `L` suffix after the number

For each of these integer types, you can also access the unsigned version by suffixing a `U` at the end of the number.

Then you have the decimal versions:

- `Float`: 32-bit decimal, referred to with an `f` suffix after the number

```kt
val int: Int = 0
val byte: Byte = 0
val short: Short = 0
val long: Long = 0

val uint: UInt = 0U
val ubyte: UByte = 0U
val ushort: UShort = 0U
val ulong: ULong = 0UL

val float: Float = 0.0f
val double: Double = 0.0
```

Also you don't have to explicitly type-annotate numbers as being a certain numeric type. Kotlin is smart enough to infer which specific numeric type a variable is supposed to be, depending on its value:

- Kotlin infers an integer literal as an Int by default if the value fits within 32 bits. 
- If the value is larger than what 32 bits can hold, Kotlin infers it as a Long. 

> [!NOTE]
> You can also explicitly specify a Long literal by appending an 'L' to the number (for example, `10L`). This helps Kotlin know you want the value treated as a Long even if it fits within 32 bits.



#### Type conversion

It is possible to convert any numeric type to any other numeric type.

- converting larger numeric type to smaller numeric type means losing precision  
- converting smaller numeric type to larger numeric type is fine

To convert from one type to another, you have to use these methods belonging to a variable:

- `num.toInt()` : returns the integer version of the number
- `num.toDouble()` : returns the double version of the number

#### Number methods

```kt
val int: Int = 0
val double: Double = 0.0

println(double.toInt())
println(int.toFloat())
```



### Strings and chars

There are two types of alphabetic types in kotlin:

- `Char`: represents a single character value, denoted via single quotes
- `String`: represents a multi-character value, denoted via double quotes

> [!NOTE]
> In Kotlin, the plus operator can't concatenate two chars because a char is designed to hold only a single character, not multiple characters. 
> 
> - When you try to combine two chars directly, the compiler throws an error since it expects a single character per char literal. 
> - To combine characters, you should use strings instead, which can hold multiple characters. You can concatenate strings using the plus operator or use Kotlin's string templates for more efficient and readable string formatting.

#### String builder

In Kotlin, strings are **immutable**, so whenever you concatenate strings together, in reality you're just creating a new string.

There are two ways to overcome this performance issue:

- **Stringbuilder method**: A `StringBuilder` is a more performant way to construct strings in Kotlin.
- **Template string interpolation**: creates one string and uses the string builder underneath the hood.

#### String basics

**String access**

- `str[n]` : position based indexing


**string properties**

  
- `str.length` : returns the length of the string

  
**checking for string equality**


The `str1.compareTo(str2)` method compares str1 to str2, and returns 0 if they are equal.


#### **string methods**

##### String-checking methods

These are methods to check if a string is empty or not

```kt
fun main(args: Array<String>) {
    var str = args.contentToString()
    println(str.isEmpty()) // returns true if empty string
    println(str.isNotEmpty()) // returns true if not empty string
    println(str.isBlank()) // returns true if only whitespace
    println(str.isNullOrBlank()) // returns true if null or only whitspace
    println(str.isNullOrEmpty()) // returns true if null or empty string
}
```

These are methods to check if a string contains a certain substring:

- `str.startsWith(prefix: String)`: Checks if the string starts with a specified prefix.

- `str.endsWith(suffix: String)`: Checks if the string ends with a specified suffix.

- `str.contains(charSequence: String)`: Checks if the string contains a specified character sequence.
##### String manipulation methods
- `str.toUpperCase()`: Converts all characters in the string to uppercase.

- `str.toLowerCase()`: Converts all characters in the string to lowercase.


- `str.substring(startIndex: Int)`: Returns a substring starting from the specified index.

- `str.substring(startIndex: Int, endIndex: Int)`: Returns a substring within the specified range.
  
- `str.trim()`: Removes leading and trailing whitespaces from the string.

- `str.replace(oldstr: String, newstr: String)`: Replaces occurrences of a specified character sequence.

  
- `str.indexOf(substr: String)` : returns the index of the first occurrence of the specified substring within the string.

```kt
var txt = "Hello World"
println(txt.toUpperCase())   // Outputs "HELLO WORLD"
println(txt.toLowerCase())   // Outputs "hello world"
```

#### Multi-line strings and template interpolation

You can create multiline strings with `"""`

You can use template string interpolation with `$` if just interpolating a variable, or with `${}` if interpolating an expression.

```kotlin
var bruh = "bruh"
var multistring = """
|This is a multiline string
|with $bruh, whose age is ${2*2+15}
|
"""
```

```kt
var firstName = "John"
var lastName = "Doe"
println("My name is $firstName $lastName")
```
### Conditionals

- `==` : for structural equality
- `===` : for referential equality

#### Boolean operators

- `&&` : logical AND
- `||` : logical OR
- `!` : logical NOT

#### Ternary expressions

With this ternary expression in Kotlin, we can directly use if/else logic to set the value of a variable.

```kotlin
var myvar = if (condition) {
  // value if condition is true
} else {
  // value if condition is false
}
```

You can even shorten this to a more familiar Python-ish ternary expression:

```kotlin
var myvar = if (condition) value_if_true else value_if_false
```

```
var greeting = if (14 < 18) "Good day." else "Good evening."
```
#### logical flow

##### **If/else**

  

```kotlin

if (condition1) {

  // block of code to be executed if condition1 is true

} else if (condition2) {

  // block of code to be executed if the condition1 is false and condition2 is true

} else {

  // block of code to be executed if the condition1 is false and condition2 is false

}

```

  

##### **While loop**

  

```kotlin

while (condition) {

  // code block to be executed

}

```

##### **When statements**

```kt
var day = 4

var result = when (day) {
  1 -> "Monday"
  2 -> "Tuesday"
  3 -> "Wednesday"
  4 -> "Thursday"
  5 -> "Friday"
  6 -> "Saturday"
  7 -> "Sunday"
  else -> "Invalid day."
}
println(result)
```

### Functions

When returning something in a function, you need to provide type annotations for both the parameters and the return type.

```kotlin
fun aFunctionReturning(x: Int): String {
    return "I'm a function $x"
}
```

When passing in arguments, you can do these pythonic things:

- set default values for parameters
- use keyword arguments

#### Basic functions

**Level 1: basic function**

```kotlin
fun sum(x: Int, y: Int) : Int {
    return x + y
}
```

**Level 2: implicit return**

If your function is a one-liner, you can skip the `{}` and the `return` statement, and instead use an `=`.

```kotlin
fun sum(x: Int, y: Int) : String = x + y
```

#### Lambda functions

**Level 3: lambda function without parameters**

The basic syntax of a lambda function is to type annotate it as an arrow function, like `() => ReturnType`, and then set it equal to a pair of `{}` and type your code inside, like this:

```kotlin
val myFunc: () -> String = {
	return "hello"
}
```

If you don’t plan on returning something, type annotate the return type as `Unit`, Kotlin’s version of void

```kotlin
val greet: () -> Unit = {
    println("hello")
}
```

**Level 4: lambda function with parameters**

The weird thing here is that in the return type annotation, you don’t specify the arguments, you just specify the type of the arguments, and then you actually define the arguments within the code block itself.

In the example below, the `(Int, Int)` type annotates and specifies two integer parameters for the lambda, and then we name them within the code block as `x, y`, with no `return` statement
.
```kotlin
val sum: (Int, Int) -> Int = { x, y ->
    x + y
}
```


**Level 5: implicit `it`**

When you only have one argument in a lambda function, it will be named `it` by default and you don’t have to define it within the code block like you had to do for multiple parameters.

```kotlin
// implicit `it` argument when there is only one argument
// you can still name it if you want to
val greet: (String) -> String = {
   "Hello $it"
}
```
#### Extension functions

Kotlin has a similar idea to adding methods to an object prototype. They are called **extension functions**, where `this` refers to the instance of the class we are extending the method from.

```kotlin
/*: * Extension functions
    You can add functions to any Type! Careful OOP extremists!
*/
fun Int.isEven() : Boolean {
    return this % 2 == 0
}
// this refers to the specific Int instance calling this method
println("is 2 even?: ${2.isEven()}")
```

#### **Variable number of arguments**

By declaring a parameter in your function with the `vararg` keyword, you are letting kotlin know that you intend to pass an arbitrary amount of arguments, and it will get stored in one variable as a list.

```kotlin
fun add(vararg numbers: Int) : Int {
    var sum = 0
    for (number in numbers) {
        sum += number
    }
    return sum
}
```

## Collections

### Collection interface

#### Spreading a collection


If you want to spread out a collection as arguments into a function that takes in a variable amount of arguments, then use the spread operator, `*` , in front of the collection name

```kotlin
add(1, 2, 3) // valid

val list = arrayOf(1, 2, 3)
add(*list) // also valid
```

### Lists

#### Arrays

You can create arrays using the `arrayOf()` method, and pass in a comma separated list of values as arguments.

```kotlin
var myArr = arrayOf(val1, val2, val3, ...)
```

**array access**

Same as always. `arr[n]` access the nth element of the array


```kt
var cars = arrayOf("Volvo", "BMW", "Ford", "Mazda")

println(cars[0]) // Volvo
```

**check if element exists**

Use the `in` operator to check if an element is in the array

```kotlin
if (value in arr) {
  // ...
}
```

**loop through array**

Use the **for-in** loop to loop through the elements of an array.

```kotlin
for (element in arr) {
  // ...
}
```

```kt
for (x in cars) {
  println(x)
}
```
#### **immutable list**

We use the `listOf()` constructor and pass in all the values we want to put into the immutable list.

```kotlin
// Lists, we use List<Type> and the type of the collection inside the generic
// The literal uses the listOf constructor
// countries is IMMUTABLE!
val countries: List<String> = listOf("Argentina", "Brazil", "Canada", "Denmark")
```

#### **mutable list**

We use the `mutableListOf()` constructor to get back a `MutableList` instance, which has methods to add and remove elements

```kotlin
val cities: MutableList<String> = mutableListOf("Alameda", "Buenos Aires", "Cali")
cities.add("Dali")
```

#### List iteration


You have list iteration methods that accept lambda functions

```kt
var cars = arrayOf("Volvo", "BMW", "Ford", "Mazda")

// default `it` parameter
cars.forEach {
  println(it)
}
```
### **set**

Use the `hashSetOf()` constructor to get back a traditional set.

```kotlin
val strings = hashSetOf("a", "b", "c", "c")
```

### **hashmap**

Use the `hashMapOf()` method to get back a hash map. You need to provide generics.

```kotlin
val map = hashMapOf<Int, String>(1 to "a", 2 to "b")
map.put(3, "c")
```

Here are a list of useful map methods:

- `map.put(key, value)` : add the key-value pair to the map

