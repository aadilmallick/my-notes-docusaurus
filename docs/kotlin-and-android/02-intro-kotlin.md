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

You can do a normal `while` loop like so:

```kotlin

while (condition) {

  // code block to be executed

}

```

Or use a `do/while` loop, where the code in the `do` block runs before the `while` condition is evaluated, so the code block always runs at least once, even if `while` condition is not true

```kt
var counter = 0

// while always run at least once, even if `while` condition is not true
do {
	println("Counter is $counter")
	counter++
} while (counter < 0)
```
##### **When statements**

`when` statements are basically if ternary operators and switch statements fucked and had a baby.

Here are the rules:

1. The "default" case in a `when` statement is an `else` block.
2. Instead of single-statement case blocks with `->`, you can expand each case to be a multi-statement case with `-> {}` syntax.


Here's a full example:

```kt
var someVariable = 0

when {
    someVariable > 3 -> println("The value was greater than 3")
    someVariable > 2 -> println("The value was greater than 2")
    else -> {
        println("Not greater")
    }
}

when (someVariable) {
    0, 1 -> println("The value was 0 or 1")
    2 -> println("The value is 2")
    3 -> println("The value is 3")
    in 4..Int.MAX_VALUE -> println("The value was greater than 3")
}

```

##### `try/catch`

Here is a basic try-catch:

```kt
try {
	println("Hello World!")
}
catch (e: Exception) {
	println(e.message)
}
```

But it gets even more interesting when we use ternary expressions as shown in the next section. 

#### Ternary expressions

Ternary expressions offer syntactic sugar over retrieving a value from `if/else` logic or `when` logic and store that in a variable

Here are the two main use cases for ternary expressions:

- **conditionally storing a value for a variable**: immediately store different values in a variable depending on a condition.
- **returning a conditional value from a function**: immediately different values from a function depending on a condition.

##### `if/else` ternary

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

```kt
var greeting = if (14 < 18) "Good day." else "Good evening."
```

Since ternary expressions just return a value, you can also set it as an immediate return value for a function, making for extremely concise syntax:

```kt
fun getMessage(input: Int) = if (input > 3) {
    "Greater than 3"
} else {
    "Not greater than 3"
}
```
##### `when` ternary

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

Since ternary expressions just return a value, you can also set a `when` ternary as an immediate return value for a function, making for extremely concise syntax:

```kt
fun getMessageWithWhen(input: Int) = when (input) {
    3 -> "Value is 3"
    else -> "Value is not 3"
}
```

##### `try/catch` ternary

A `try/catch` ternary allows you to try returning a certain value in a `try` block, and if that throws an error, then it returns the return value from the `catch` block

```kt
// stores string
val message = try {
    "The value is ${10 / 0}"
} catch (error: Throwable) {
    "Error was thrown"
}
```


You can also handle more specific errors with multiple `catch` blocks:

```kt
val message = try {
    throw IllegalStateException()
    "The value is ${10 / 0}"
} catch (error: ArithmeticException) {
    "Error was thrown"
} catch (error: java.lang.IllegalStateException) {
    "Error was IllegalState"
}

println(message)

```

### Type casting

- `as`: type cast a variable to another type or class type, throws `ClassCastException` if it can't complete the cast.
- `as?`: type cast a variable to another type or class type safely, instead of throwing a `ClassCastException` if it can't complete the cast, it returns `null`
- `is`: boolean check to see if a variable is of a certain type or is an object instance of a class.

#### Type casting with `as`

```kt
/**
 * PRINTS:
 * ----------
 * can't cast string to int
 * able to successfully cast string to int false
 */
fun main(args: Array<String>) {
    // able to cast broad class type "Any" to narrow class type "Int", if value is int
    var generic: Any = 5
    var int = generic as Int

    val failedToCastStringToNumber = try {
        // not able to cast string value to int
        var generic2: Any = "string"
        var int2: Int = generic2 as Int
        true
    } catch (e: ClassCastException) {
        println("can't cast string to int")
        false
    }
    println("able to successfully cast string to int $failedToCastStringToNumber")
}
```

#### Type checking with `is`

The `is` keyword allows you to check if a variable *is* a certain data type or object instance.

You can also negate an `is` statement with `!is` to check if a variable *is* NOT a certain data type of object instance.

```kt
fun checkType(input: Any) {
    if (input is String) {
        println("Input is a String")
    }

    if (input !is Int) {
        println("Input is not an Int")
    }
}

fun main() {
    val aGenericVariable: Any = 5

    checkType(aGenericVariable)
}

```

#### Smart casting

**Smart casting** is a compiler feature in Kotlin that automatically tracks your type checks (`is` and `!is`) and converts a generic reference to a specific type. This eliminates the need for redundant, explicit casting operators (like Java's old casting syntax or Kotlin's explicit `as` operator).

The Kotlin compiler uses **flow-sensitive analysis** (also known as data-flow analysis) to monitor the execution path of your code.

Here's an example of how smart casting helps you scope down any generic type to a specific type like a string:

1. **The Condition Check:** When the compiler hits an `if (input is String)` block, it verifies that the execution path inside the `if` brackets is _only_ accessible if `input` is truly a `String`.
2. **The Scope Update:** Inside that specific branch, the compiler changes its internal metadata for `input`, treating it as a `String` rather than `Any`.
3. **Automatic Access:** You can immediately call `String` functions (like `.length` or `.lowercase()`) without writing a manual cast.

```kt
fun process(input: Any) {
    if (input is String?) {
	    if (input == null || input?.length == 0) {
		    return
	    }
        // The compiler smart-casts 'input' to non-null String here
        println(input.length) 
    }
    // Outside the block, 'input' is back to being 'Any'
    // println(input.length) // Error!
}
```

The compiler's flow tracking extends beyond simple `if` blocks to logical expressions and control flows.

##### 1. Inside Conditional Expressions (`&&`)

Because the logical AND operator (`&&`) evaluates from left to right and short-circuits, the compiler knows the right side of the expression will _only_ execute if the left side evaluates to `true`.


```kt
// Smart cast happens right inside the condition!
if (input is String && input.length > 5) {
    println("Long string")
}
```

##### 2. Early Returns (`!is`)

If you invert the check using `!is` and exit the function early via a `return`, `throw`, or `break`, the compiler recognizes that any code executing _after_ that check must have a valid type.

```kt
fun printLength(input: Any) {
    if (input !is String) return // Guard clause exits if not a String
    
    // The compiler knows execution can only reach here if it IS a String
    println(input.length) // Perfectly valid smart cast
}
```

##### 3. Inside `when` Expressions

When you use type checks as branches inside a `when` statement, the compiler handles each scope independently.

```kt
fun evaluate(input: Any) = when (input) {
    is Int -> input + 10           // Smart cast to Int
    is String -> input.uppercase()  // Smart cast to String
    else -> "Unknown type"
}
```

##### When smart casting fails

Smart casting relies completely on the compiler's guarantee that the variable's value **cannot change** between the type check and its subsequent usage. If the compiler cannot prove a variable is immutable, it disables smart casting for safety.

Smart casting is **forbidden** in the following scenarios:

- **Mutable Local Variables (`var`):** If a local `var` is modified inside a concurrent lambda or modified between the type check and the usage, the compiler throws an error.
- **Open/Mutable Properties (`val` or `var` fields):** If a property belongs to a class and is accessible by other threads or classes, its state cannot be guaranteed. A custom getter (`val x: Any get() = ...`) can return a different type every time it is called, making smart casting unsafe.

```kt
class Demo {
    var mutableProperty: Any = "Hello"

    fun unstableCheck() {
        if (mutableProperty is String) {
            // ERROR: Smart cast is impossible because 'mutableProperty' 
            // could be modified by another thread right now!
            // println(mutableProperty.length) 
        }
    }
}

```


#### Safe casts (combining `as?` with `?:`)

In Kotlin, combining the **safe cast operator (`as?`)** with the **Elvis operator (`?:`)** is the standard, idiomatic way to handle type casting while safely providing a default fallback behavior or exiting a execution flow when a type mismatch occurs.

- `as`: type cast a variable to another type or class type, throws `ClassCastException` if it can't complete the cast.
- `as?`: type cast a variable to another type or class type safely, instead of throwing a `ClassCastException` if it can't complete the cast, it returns `null`

```kt
val obj: Any = 123
val str: String? = obj as? String // Fails, evaluates to null (no crash)

```

The Elvis operator (`?:`) checks the value on its left side. If that value is **not null**, it returns it. If the value on its left side **is null**, it executes and returns the expression on its right side.

```kt
val name: String? = null
val displayName = name ?: "Guest" // Evaluates to "Guest"
```

When you chain them together (`obj as? Type ?: fallback`) here is what happens:

1. the safe cast attempts to run first. 
2. If it returns `null` due to a type mismatch, the Elvis operator intercepts that `null` and runs its fallback code.

You can use this combination to safely parse generic data structures (like a JSON map or configuration bundle) and guarantee a fallback value if the data type isn't what you expected.

```kt
fun getMultiplier(configValue: Any): Int {
    // Attempt to cast to Int; if it fails (returns null), default to 1
    return configValue as? Int ?: 1
}

fun main() {
    println(getMultiplier(5))       // Output: 5 (Cast succeeds)
    println(getMultiplier("hello")) // Output: 1 (Cast fails, Elvis falls back)
}

```

##### Pattern B: Guard Clauses and Early Returns

In application development, this pattern is frequently used to validate inputs at the top of a function. If the passed argument is not the expected type, you can use `return` or `throw` on the right side of the Elvis operator to stop execution.

```kt
fun processPayload(payload: Any) {
    // Guard clause: Safe cast to String or exit the function immediately
    val text = payload as? String ?: return 
    
    // The compiler now knows 'text' is a non-nullable String
    println("Processing text of length: ${text.length}")
}

fun criticalOperation(data: Any) {
    // Guard clause: Safe cast to User or crash with a specific error
    val user = data as? User ?: throw IllegalArgumentException("Invalid user profile data provided")
    
    // Safely proceed with the 'user' object
    println("Logged in as ${user.username}")
}

```

##### Summary Comparison of Casting Strategies

|Code Pattern|If Cast Succeeds|If Cast Fails|Safety Rating|
|---|---|---|---|
|`obj as String`|Returns `String`|Throws `ClassCastException` 💥|**Dangerous**|
|`obj as? String`|Returns `String?`|Returns `null`|**Safe, but leaves type nullable**|
|`obj as? String ?: ""`|Returns `String`|Returns default value `""`|**Excellent (Idiomatic)**|
|`obj as? String ?: return`|Returns `String`|Exits function early|**Excellent (Idiomatic)**|


### Functions

When returning something in a function, you need to provide type annotations for both the parameters and the return type.

```kotlin
fun aFunctionReturning(x: Int): String {
    return "I'm a function $x"
}
```

> [!NOTE]
> The return type can be inferred from the type of what is being returned.


When passing in arguments, you can do these pythonic things:

- set default values for parameters

```kt
fun greet(name: String = "Aadil") {
	println("Hello $name")
}

greet()
```

- use **named keyword arguments**, which allow you to specify argument in whatever order you want, as long as they are all named.

```kt
fun greet(name: String) {
	println("Hello $name")
}

greet(
	name="Aadil"
)
```

#### Void functions

Here is an example of a void function, where if you don't return anything, it returns the inferred `Unit` type:

```kt
fun voidfnInferred() {
    println("Hello World!")
}

fun voidfnExplicit(): Unit {
    println("Hello World!")
}
```

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

**Level 3**: immediate return, inferred returned type


You can return a value straight up, inferring the return type from the return value

```kt
fun greeting() = "hello"
fun salute(name: String) = "hello $name"
```


#### Lambda functions

Lambda functions are syntactic sugar over creating a function by storing the function directly as a variable. 

Here are some rules to understand about lambdas:

1. **Return value**: The return value of a lambda is whatever the last value referenced in a lambda function is, because there is no `return` statement allowed in a lambda.



The basic syntax of a lambda function is to type annotate it as an arrow function, like `() => ReturnType`, and then set it equal to a pair of `{}` and type your code inside, like this, via two ways:

- **explicit lambda type annotation**: giving a type annotation for the function, which gives type annotations for both the function arguments and return type.
- **implicit lambda type annotation**: inferring the return type annotation, which is only possible if you don't have any arguments.

```kotlin
// level 1: explicit lambda type annotation
val myFunc_level1: () -> String = {
    "hello"
}

// level 2: implicit lambda type annotation, 
// inferred as () -> String type function
val myFunc_level2 = {
    "hello"
}

// level 3: implicit lambda type annotation
// inferred as (myvar: string) -> String type function
val myFunc_level3 = { myvar : String ->
    "hello $myvar"
}
```

If you don’t plan on returning something, type annotate the return type as `Unit`, Kotlin’s version of void

```kotlin
val greet: () -> Unit = {
    println("hello")
}
```


**Level 2: lambda function with parameters**

The weird thing here is that in the return type annotation, you don’t specify the arguments, you just specify the type of the arguments, and then you actually define the arguments within the code block itself.

In the example below, the `(Int, Int)` type annotates and specifies two integer parameters for the lambda, and then we name them within the code block as `x, y`, with no `return` statement
.
```kotlin
val sum: (Int, Int) -> Int = { x, y ->
    x + y
}
```


**Level 3: implicit `it`**

When you only have one argument in a lambda function, it will be named `it` by default and you don’t have to define it within the code block like you had to do for multiple parameters.

```kotlin
// implicit `it` argument when there is only one argument
// you can still name it if you want to
val greet: (String) -> String = {
   "Hello $it"
}
```


#### Functions as first-class objects

Here is an example of functions being considered as objects:

- `fn.invoke(varargs Any)`: invoke the function, pass in the required arguments.

```kt
// create a lambda with void typing
var voidfn: () -> Unit = {
    println("Hello world!")
}

fun main(args: Array<String>) {
	// these two do the same thing
    voidfn()
    voidfn.invoke()

	val greet = {name: String -> 
		"hello $name"
	}
	greet("Aadil")
	greet.invoke("Aadil")
}
```

**Passing in functions as parameters**

When passing in functions as parameters to another function, the type annotation of that function argument will be enough to just pass the function object in as is.

If a function is the last argument in a function header, then you can use **trailing lambda syntax**, where you can add the lambda outside the parentheses of the supplied parameters.

```kt
fun printCalculatedValue(value1: Int, value2: Int, calculator: (Int, Int) -> Int) {
    println("The value is: ${calculator(value1, value2)}")
}

fun main() {
	// trailing lambda syntax
    printCalculatedValue(2, 2) { value1, value2 ->
        value1 + value2
    }

	// normal
    printCalculatedValue(2, 2, { value1, value2 ->
        value1 - value2
    })
}
```

Here's an example:

```kt
fun printFormattedName(fname: String, lname: String, formatName: (s1: String, s2: String) -> String) {
    var formattedName = formatName(fname, lname)
    println(formattedName)
}

fun main(args: Array<String>) {
    printFormattedName("Aadil", "Mallick") { fname, lname ->
        "$fname porky $lname"
    }
}
```

#### Extension functions

Kotlin has a similar idea to adding methods to an object prototype. They are called **extension functions**, where `this` refers to the instance of the class we are extending the method from.

```kotlin
/*: * Extension functions
    You can add functions to any Type! Careful OOP extremists!
*/

// extenion function
fun Int.millisForHours() = this * 60 * 60 * 1000

// extension property
val Int.isEven: Boolean
    get() = this % 2 == 0

fun main(vararg args: String) {
    println("I am also public and global")
    println(4.millisForHours())
    println(4.isEven)
}
```

Here is how you can create generic extension functions, which is very useful:

```kt
fun <T> T.log() = println(this)
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

This is also powerful when combined with arrays, since you can either pass in the array as is to a `varargs` argument or spread it out.



![](https://i.imgur.com/3gt6DuG.jpeg)

### Loops and iteration

#### Ranges and infix functions

In kotlin, a range is like `1..5`, which creates an iterable of numbers, but you can also loop through a range of chars:

```kt
// LEVEL 1: loop through number sequence

for (nums in 5..15) {
  println(nums)
}

// LEVEL 2: loop through char sequence
for (chars in 'a'..'x') {
  println(chars)
}
```

In kotlin, you can use infix functions to generate iterables on the fly:

```kt
for (i in 1..10) {
	println("Counter: $i")
}

// inclusive with step
for (i in 1..10 step 3) {
	println("Counter: $i")
}

// exclusive
for (i in 1 until 10) {
	println("Counter: $i")
}

// exclusive with step
for (i in 1 until 10 step 3) {
	println("Counter: $i")
}

// inclusive decrement
for (i in 10 downTo 1) {
	println("Counter: $i")
}

// inclusive decrement with step
for (i in 10 downTo 1 step 3) {
	println("Counter: $i")
}
```

**casting range to a list**

We wrap a range in parenthesis and then call the `toList()` or `toMutableList()` methods to cast the range into a list

```kotlin
var myList = (1..20).toList()
```

## Generics and types

In Kotlin, ==**generics** allow you to write reusable code by parameterizing types== (e.g., creating a `List<T>` instead of separate list classes for every data type).

However, Kotlin targets the Java Virtual Machine (JVM), which enforces **Type Erasure**. Understanding how Kotlin ensures type safety while navigating this JVM limitation requires looking at compile-time checks, runtime constraints, and Kotlin-specific keywords like `inline` and `reified`.

## Collections

### Collections Intro

In Kotlin, all iterable data structures inherit from the `Collection<T>` abstract class, which means you can perform standard operation across all different concrete collections, even if they seem different.

Each collection has a mutable and immutable variant.

Here are the three main different collections in Kotlin, along with their mutable and immutable variants:

- **lists**: immutable variant is `List<T>`, mutable is `MutableList<T>`
- **sets**: immutable variant is `Set<T>`, mutable is `MutableSet<T>`
- **maps**: immutable variant is `Map<T>`, mutable is `MutableMap<T>`

But since all these concrete collection subclasses inherit from the `Collection<T>` class, they also implement all the standard collections functionality:

- **iterating over items**: includes standard `for` loop iteration and iteration methods.
- **element access**: Includes standard element access via standardized methods and bracket-notation access.
- **generator functionality**: includes powerful methods like `.take()` and `.filter()`.

Here are all the immutable and mutable collections:

**immutable collections**

- `listOf()`
- `setOf()`
- `mapOf()`
- `arrayOf()`

**mutable collections**

- `mutableListOf()`
- `mutableSetOf()` : ordered set
- `hashMapOf()` : unordered map
- `mutableMapOf()` : ordered map
- `hashSetOf()` : unordered set

#### Arrays, lists, and sets

Arrays, lists, and sets are the most similar in the collections family, and all have the exact same methods and ways for data access, adding elements, etc.

#### Maps

Maps are fundamentally a list of key-value pairs, which is a list of `Pair<K, V>(key, value)` data class instances under the hood.

Thus for things like iteration, filtering, and looping, the iteration variable is in reality a `Pair<K, V>(key, value)` instance and you should keep that in mind.

If you want to treat maps as normal iterables like arrays, lists, and sets, you can access a `List<K>` of the map's keys from a `map.keys` property.


#### Collections basic properties

- `collection.size`: returns the size the collection
#### Collections data access

Here's how each data access method works and the differences between them for different collection instances:

- `collection.first()`: returns the first element in the collection
- `collection.last()`: returns the last element in the collection


For bracket syntax, you have differences in all of them:

- **array/list**: Has indexed-based access to specific elements via `collection[index]` syntax
- **set**: cannot access individual elements since hash sets don't allow data access and are not indexed-based.
- **map**: Can access specific elements via `collection[key]` syntax

#### Collections data modification

On all collections, you can modify elements, but only mutable variants of concrete collections can add or remove elements.

Here is how you can add or remove elements across collections:

- **lists**
	- `mutableList.add<T>(value)`
	- `mutableList.remove<T>(value)`
	- `mutableList.removeAt<T>(index)`: able to remove an element at a specific index
- **sets**
	- `mutableSet.add<T>(value)`
	- `mutableSet.remove<T>(value)`
- **maps**
	- `map[key] = value`
	- `map.put(key, value)`
	- `map.remove(key)`

### Collections iteration

#### for-loop iteration

You can loop through all collections with a `for/in` loop, but for maps, the iteration variable will be a `Pair<K, V>` instance.

```kt
val languages: Set<String> = setOf("Java", "Kotlin", "Scala")

for (language in languages) {  
    println(language)  
}
```

Since `Pair<K, V>` instances have a `key` and `value` property, keep that in mind, and you also have destructuring capabilities:

```kt
var testScores = mapOf(Pair("Junie", 87), Pair("Julie", 87), Pair("Sea", 87))

// loop over list of Pair<K, V> instances
for (record in testScores) {
	println("user ${record.key} has score ${record.value}")
}

// destructured Pair<K, V> instances
for ((id, score) in testScores) {
	println("user ${id} has score ${score}")
}
```

#### `collection.forEach()`

For lists, sets, and arrays, the `collection.forEach()` works as expected:

```kt
val readOnlyList = listOf(1, 2, 3)
val readOnlySet = setOf(1, 2, 3)

readOnlyList.forEach { println(it) }
readOnlySet.forEach { println(it) }

readOnlyList.forEach { num -> println(num) }
readOnlySet.forEach { num -> println(num) }
```

For maps, the iterating element is a `Pair<K, V>` instance, so to access the key and value you will have to use the `pair.key` or `pair.value` syntax.

```kt
val readOnlyMap = mapOf(1 to "a", 2 to "b", 3 to "c")
readOnlyMap.forEach { record -> println("${record.key} : ${record.value}") }
```

Or you can access the `map.keys` or `map.values` to get the keys array or values array respectively and then iterate over that.


#### `collection.map()`

The `collection.map()` iteration method returns a new list:

```kt
val readOnlyList = listOf(1, 2, 3)
val readOnlySet = setOf(1, 2, 3)

var doubleList = readOnlyList.map { it * 2}
doubleList = readOnlySet.map { it * 2 }
```

And for maps, again the iterating element is a `Pair<K, V>` instance, so to access the key and value you will have to use the `pair.key` or `pair.value` syntax:

```kt
var keys = readOnlyMap.map { it -> it.key }
```


#### `collection.filter()`

The `collection.filter()` iteration method returns a new list of only the elements that pass the predicate

```kt
val readOnlyList = listOf(1, 2, 3)
val readOnlySet = setOf(1, 2, 3)

var newlist = readOnlyList.filter { it > 2 }
newList = readOnlySet.filter { it > 2 }
```

And for maps, again the iterating element is a `Pair<K, V>` instance, so to access the key and value you will have to use the `pair.key` or `pair.value` syntax:

```kt
val readOnlyMap = mapOf(1 to "a", 2 to "b", 3 to "c")

readOnlyMap.filter { it.key > 1 }
        .map { it -> it.key }
        .sorted()
        .forEach { key -> println(key) }
```

#### Other iteration methods:

- `collection.sorted()`: returns the collection as sorted, works only on lists.
- `collection.take(n)`: returns the first n elements in the collection
### Sequences

**Sequences** in Kotlin are basically the Kotlin-version of Python generators.

The main difference is how they process data: 

- Kotlin iterables (like List or Set) apply operations eagerly, creating intermediate collections for each step, which can be less efficient for large data sets.
- Sequences process elements lazily, applying all operations one-by-one per element until a result is reached, which can improve performance by avoiding unnecessary processing, especially with large collections or when only part of the data is needed.

There are two ways to create sequences:

```kt
val languages = listOf("kotlin", "java")

// method 1: create sequence from `sequenceOf<T>(vararg T)`
var sequence : Sequence<String> = sequenceOf(*languages.toTypedArray())

// method 2: get sequence from `Collection<T>.asSequence()`
sequence = languages.asSequence()
```


Why use sequences? This use case illustrates perfectly, where if we want only a small subset of the collection, it's a waste to use so much processing power to run all $O(n)$ operations for each collection iteration method.

```kt
val languages = listOf("kotlin", "java")

// method 1: create sequence from `sequenceOf<T>(vararg T)`
var sequence : Sequence<String> = sequenceOf(*languages.toTypedArray())

// method 2: get sequence from `Collection<T>.asSequence()`
sequence = languages.asSequence()

sequence.filter { it.length > 1 }
	.map {it.length}
	.take(1)
```

When we use sequences, we just do the bare minimum, processing elements one at a time instead of loading entire collections into memory.


### Array and list basics

#### **element access**

Same as always. `arr[n]` access the nth element of the array


```kt
var cars = arrayOf("Volvo", "BMW", "Ford", "Mazda")

println(cars[0]) // Volvo
```

#### **check if element exists**

Use the `in` operator to check if an element is in the array

```kotlin
if (value in arr) {
  // ...
}
```

#### array iteration

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

Or you can use the list iteration methods to loop over an array.

#### Spreading a collection


If you want to spread out a collection as arguments into a function that takes in a variable amount of arguments, then use the spread operator, `*` , in front of the collection name

```kotlin
add(1, 2, 3) // valid

val list = arrayOf(1, 2, 3)
add(*list) // also valid
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

##### `forEach`

Here is level 1, where we pass in a function

```kotlin
val names = mutableListOf<String>("John", "Paul", "George", "Ringo")

names.forEach(fun (name: String) {
	println(name)
	// code here
})
```

Here is level 2, where we use a lambda function but name our argument:

```kotlin
val names = mutableListOf<String>("John", "Paul", "George", "Ringo")

names.forEach {name ->
	println(name)
  // code here
}
```

Here is level 3, where we use a lambda function, and just the implicit parameter `it` .

```kotlin
val names = mutableListOf<String>("John", "Paul", "George", "Ringo")

names.forEach {
	println(it)
  // code here
}
```

##### `forEachIndexed`

Basically the same as `forEach()` , but in the lambda, you are now passed two arguments:

1. index
2. element

```kotlin
val names = mutableListOf<String>("John", "Paul", "George", "Ringo")
names.forEachIndexed {index, element ->
	// code here
}
```

##### `filter`

```kotlin
var myList = (1..10).toList()
val filteredList = myList.filter { element -> element % 2 == 0 }
```


### Arrays

Arrays are like lists except that they have no immutable variants and their size is decided at runtime.

Other that that, you can perform the same list iteration methods on arrays and instantiate them in roughly the same way:

```kt
// method 1: use `arrayOf()`
// smart enough to type as ints: Array<Int?>
var ints = arrayOf(1, 2, 3, 4, 5, null)

// method 2: instantiate array, specify size beforehand, make every element null
ints = arrayOfNulls<Int>(5)

// method 3: instantiate array size, lambda populates elements
ints = Array(5, { i -> (i + 1) * i })

for (int in ints) {
	println(int)
}

for (i in 0 until ints.size) {
	print(ints[i])
}

ints.forEach {int -> print(int) }
```

#### normal arrays

You can create arrays using the `arrayOf()` method, and pass in a comma separated list of values as arguments.

```kotlin
var myArr = arrayOf(val1, val2, val3, ...)
```

In general, there are three ways to create normal arrays:

1. **use `arrayOf<T>(varargs: T)`**: instantiates fixed array with elements.
2. **use `arrayOfNulls<T>(size: Int)`**: Allocates array size, inits all elements to null
3. **instantiate `Array<T>(size: Int, init: (index: Int) -> T)`**: Allocates array size, for each element in array, execute lambda to get the initial value of that element.

```kt
// method 1: use `arrayOf()`
// smart enough to type as ints: Array<Int?>
var ints = arrayOf(1, 2, 3, 4, 5, null)

// method 2: instantiate array, specify size beforehand, make every element null
ints = arrayOfNulls<Int>(5)

// method 3: instantiate array size, lambda populates elements
ints = Array(5, { i -> (i + 1) * i })
```

#### `intArray`

You can create specialized, performant, compact integer arrays with `intArrayOf()` method.

### List

Lists in Kotlin are instances of the `List<T>` collection subclass, and have mutable and immutable variants, where lists are by default immutable:

- `List<T>`: immutable lists, created with `listOf()` most commonly
- `MutableList<T>`: mutable lists, created with `mutableListOf()` most commonly

```kt
// method 1: use `listOf()` to create list with elements
var list: List<Int> = listOf(1, 2, 3, 4, 5)

// method 2: instantiate List<T> class with lambda to populate elements from index
list = List<Int>(5, { index -> index + 1 })

// method 3: create an empty list
val emptyStringList = emptyList<String>()

// by default, list is immutable in kotlin, you have to use mutable variants
val mutableList = mutableListOf<String>()
mutableList.add("a")
mutableList.add("b")
mutableList.add("c")
mutableList[0] = "z"
mutableList.removeAt(0)
mutableList.remove("c")
```

#### Common list methods

These are the methods that are common to all `List<T>` subclasses, covering both mutable and immutable lists.

#### **immutable list**

We use the `listOf()` constructor and pass in all the values we want to put into the immutable list.

```kotlin
// Lists, we use List<Type> and the type of the collection inside the generic
// The literal uses the listOf constructor
// countries is IMMUTABLE!
val countries: List<String> = listOf("Argentina", "Brazil", "Canada", "Denmark")
```

You have three ways to create an immutable list in Kotlin:

1. `listOf()`: create a list with elements already defined
2. **instantiate a `List<T>` class**: specify the list size and then supply a lambda that populates each element with a value.
3. **use `emptyList<T>` to create an empty list**

```kt
// method 1: use `listOf()` to create list with elements
var list: List<Int> = listOf(1, 2, 3, 4, 5)

// method 2: instantiate List<T> class with lambda to populate elements from index
list = List<Int>(5, { index -> index + 1 })

// method 3: create an empty list
val emptyStringList = emptyList<String>()
```
#### **mutable list**

We use the `mutableListOf()` constructor to get back a `MutableList` instance, which has methods to add and remove elements

```kotlin
val cities: MutableList<String> = mutableListOf("Alameda", "Buenos Aires", "Cali")
cities.add("Dali")
```

### **sets**

There are three types of set in Kotlin:

- **set**: an immutable, ordered set, instantiated with the `setOf()` function.
- **hash set**: a mutable, unordered set, instantiated with the `hashsetOf()` function.
- **mutable set**: a mutable, ordered set, instantiated with the `mutablesetOf()` function

```kt
// method 1: use `setOf<T>(varargs: T)` to return Set<T> instance
val languages: Set<String> = setOf("Java", "Kotlin", "Scala")

for (language in languages) {
	println(language)
}

println(languages.contains("Kotlin"))

val mutableLanguages = mutableSetOf("Java", "Scala")
// won't work, cuz set
mutableLanguages.add("Java")
```
#### normal immutable set

```kt
val languages: Set<String> = setOf("Java", "Kotlin", "Scala")
```
#### hash set

Use the `hashSetOf()` constructor to get back a traditional set.

```kotlin
val strings = hashSetOf("a", "b", "c", "c")
```

#### Set methods

- `set.elementAt(index)` : returns the element at the specified index
- `set.indexOf(element)` : returns the index of where the element was found
- `set.lastIndexOf(element)` : returns the last index of where the element was found
- `set.first()` : returns the first element in the set
- `set.last()` : returns the last element in the set
- `set.contains(element)` : returns a boolean, whether or not the set contains the specified element.
- `set.isEmpty()` : returns a boolean, true if the set is empty

For mutable sets like a mutable set or a hash set, you can use these methods:

- `set.add(element)` : adds the specified element
- `set.remove(element)` : removes the specified element from the set
### maps

There are two types of maps in Kotlin:

- **map**: an immutable, ordered map, instantiated with the `mapOf()` function.
- **hash map**: a mutable, unordered map, instantiated with the `hashMapOf()` function.
- **mutable map**: a mutable, ordered map, instantiated with the `mutableMapOf()` function.

```kt
// method 1: use Pair() class to define a key-value pair
var testScores = mapOf(Pair("Junie", 87), Pair("Julie", 87), Pair("Sea", 87))

// method 2: use infix function `to` as synctactic sugar over Pair() instance
testScores = mapOf("Junie" to 87, "Julie" to 87, Pair("Sea", 87))

testScores.containsKey("Junie")
testScores.containsValue(87)

for (record in testScores) {
	println("user ${record.key} has score ${record.value}")
}

for ((id, score) in testScores) {
	println("user ${id} has score ${score}")
}

testScores.keys.forEach { key -> println("user ${key} has score ${testScores[key]}") }

val mutableTestScores = testScores.toMutableMap()

// method 1: set key-value pair via standard bracket notation
mutableTestScores["Junie"] = 91

// method 2: add value with .put(), which is the old way
mutableTestScores.put("Julie2", 91)
mutableTestScores.putAll(testScores)
```

#### Creating maps

There are two ways to create maps:

1. Creating a list of `Pair()` instances and passing that into a `mapOf()` method.

```kt
// method 1: use Pair() class to define a key-value pair
var testScores = mapOf(Pair("Junie", 87), Pair("Julie", 87), Pair("Sea", 87))
```

2. using a `<key> to <value>` syntactic sugar over creating a list of pair instances and passing that into a `mapOf()` method.

```kt

// method 2: use infix function `to` as synctactic sugar over Pair() instance
testScores = mapOf("Junie" to 87, "Julie" to 87, Pair("Sea", 87))
```

#### map properties

```kotlin
val map = mapOf(1 to "One", 2 to "Two" , 3 to "Three", 4 to "Four")
map.keys // list of keys
map.values // list of values
map.size // returns map size
```

- `map.keys` : returns a list of the keys in the map
- `map.values` : returns a list of the values in the map
- `map.size` : returns the length of the map

#### Hashmap

Use the `hashMapOf()` method to get back a hash map. You need to provide generics.

```kotlin
val map = hashMapOf<Int, String>(1 to "a", 2 to "b")
map.put(3, "c")
```

For mutable maps like a hash map, here are the methods you can use:

- `hashMap.put(key, value)` : add the specified key value pair
- `hashMap.remove(key)` : removes the specified key from the map, along with its corresponding value.


#### map iteration

The `map.forEach()` method is a lambda method that takes in two args for the callback: `key` and `value` .

You get to iterate over all the keys and values in the map.

```kotlin
val map = mapOf(1 to "a", 2 to "b")

map.forEach { (key, value) ->
	// have access to key and value
}
```
## Classes

### Basics

Classes in kotlin have `public`, `private`, and `protected` identifiers, as well as the `this` keyword.

```kotlin
class Person {
    // property
    public var id : Int = 0
    // function - method
    fun print() {
        println("Person id: ${this.id}")
    }
}
```

**Class properties**

To create properties in a class, just declare variables within the class header.

```kotlin
class MyClass {
  var var1 = ""
  var var2 = ""
}
```

You can then access those properties on an instance via dot-property syntax.


**Adding methods**

```kt
// constructor that accepts argumetns and makes them class properties
class Car(var brand: String, var model: String, var year: Int) {

  // method
  fun drive() {
    println("Wrooom!")
  }

  // method with parameters
  fun speed(maxSpeed: Int) {
    println("Max speed is: " + maxSpeed)
  }
}
```

**instantiating the class**

Much like Python, you do not use the `new` keyword. Instead you just call the class like a function.

```kotlin
var myObjInstance = MyClass()
```

#### Constructors + properties

The basic form of a class constructor is like this.

Whatever arguments you pass in, if you declare them with `var` or `val`, they will automatically become class properties.

```kotlin
class MyClass(arguments) {
	// code here
}
```


In Kotlin, the constructor is in the class header, and you have two ways of setting properties on a class:

- **Method 1 (classic - constructor populating property values)**: You can accept arguments, and then create class properties and set them equal to the arguments passed in.

```kotlin
class MyClass(var1: Type1, var2: Type2, ...) {
  // class properties here
  var _var1 = var1
  var _var2 = var2
  // ... and so on
}
```

- **Method 2 (syntactic sugar - set class properties in constructor signature)**: If you want to skip the assignment step, you can simply declare the arguments in the constructor with the `var` or `val` keywords to get them automatically assigned as class properties, and then add access modifier keywords like `private` or `public`.

```kotlin
class MyClass(private var var1: Type1, private var var2: Type2, ...) {
  // nothing else to do
}
```



**Level 1: basic constructor**

```kt
// LEVEL 1: accepting arguments, setting them in class properties

class Person(firstname: String, lastname: String) {
    // accept constructor arguments, use them to set class properties.
    private var firstname: String = firstname
    private var lastname: String = lastname
    private var age: Int = 0
}
```

**level 2: set access modifiers and class properties in constructor**

This is pretty much the same way you set it in TypeScript

```kt
// LEVEL 2: set class properties implicitly in constructor

class Person(private var firstname: String, private var lastname: String) {
    private var age: Int = 0
}
```

#### Secondary constructors

**secondary constructors** are constructor overloads you can provide to a class.

Secondary constructors let you provide alternative ways to construct an object. They use the `constructor` keyword and must call the primary constructor (or another secondary constructor):

```kt
class User(val id: Int, val name: String) {
    constructor(name: String) : this(0, name)  // calls primary with id=0
    constructor() : this(0, "Unknown")         // calls primary with defaults
}

// Now you can construct three ways:
User(1, "Alice")      // primary
User("Bob")           // secondary
User()                // secondary
```

> [!NOTE]
> Each secondary constructor delegates to the primary via `this(...)`, ensuring initialization logic runs consistently. 


We can provide constructor overloading by providing default values for the arguments in constructor overloads

```kotlin
class User(val id: Int) {
    private var name= "Unnamed $id user"
		
		// overloads with id = 0
    constructor(name: String): this(0) {
        this.name = name
    }
		
		// no overloads, accepts one more argument
    constructor(id: Int, name: String): this(id) {
        this.name = name
    }
}
```

#### `init` blocks and constructor execution lifecycle

An `init` block is code that runs after an object is created, regardless of which constructor was used (primary or secondary)

The `init` block is used to run code after the constructor runs.

```kotlin
class Request(val url: String) {
    private var timeout = 10;
    init {
				// runs after Request() is executed
        print("fetching url $url")
    }
}
```

It's declared with the `init` keyword and no parentheses:

```kt
class User(val id: Int, val name: String) {
    init {
        println("User created: $name")
    }
}
```

- When you create `User(1, "Alice")`, the `init` block executes automatically after the object is instantiated.

> [!NOTE]
> You can also use init blocks alongside secondary constructors—the init block always runs after any constructor completes.

### Interfaces


Interfaces are a way to enforce classes to implement certain methods and adhere to their methods signatures.

To implement an interface, simply type annotate the class as the interface.

```kt
interface Actions {
    fun buttfuck()
    fun isOlder(age: Int) : Boolean
}

// type annotate as Actions interface
class Person(private var firstname: String, private var lastname: String) : Actions {
    private var age: Int = 0
    override fun epsteinfilesreveal() {
        TODO("Not yet implemented")
    }

    override fun isOlder(age: Int) : Boolean {
       return this.age > age
    }
}
```

#### Overriding methods

We specify we want to override a method on the class inheriting from the interface with the `override fun` keyword

```kotlin
interface Listener {
    fun listen()
    fun introduce(age: Int, name: String) : String
}

class Human: Listener {
    override fun listen() {
        print("I'm listening!")
    }

    override fun introduce(age: Int, name: String): String {
        return "My name is $name and I'm $age years old"
    }
}
```

#### **Inherit from multiple interfaces**

Just do the type annotation, and use a commma to separate out the list of interfaces.

```kotlin
class MyClass : Interface1, Interface2 {
  // code here
}
```

#### **DEFAULT METHODS**

One thing you can do in kotlin is that interfaces are more like abstract classes now. You can have default method implementations that classes don't need to override.

However, if you want to override, just use the `override fun` syntax and call the super implementation of the function first.

```kotlin
interface MyInterface {
  fun defaultFunc() {
    // some default implementation
  }
}

class MyClass : MyInterface {
  override fun defaultFunc() {
    super.defaultFunc()
    // code here
  }
}
```

Here's an example of using an interface sort of like an abstract class

- **using default method implementation**

```kt
// LEVEL 2: interface with default method implementation

interface Actions {
    fun fuck() {
        println("This guy is getting fucked")
    }
}

class Person: Actions {
  // no need to override function
}
```

- **overriding default method implementation**

```kt
// LEVEL 3: interface with default method implementation, override it

interface Actions {
    fun fuck() {
        println("This guy is getting fucked")
    }
}

class Person: Actions {
    override fun fuck() {
        // 1. must call this first
        super.fuck()
        println("he now has a disease")
    }
}
```
### Inheritance

By default, you cannot inherit from other classes. To make a class inheritable, you have to put the `open class` keyword modifier on it.

You can then inherit from that class by doing a type annotation

```kotlin
open class ParentClass {}

class ChildClass: ParentClass() {}
```

**Basic example: level 1**

To establish a class as a parent class children class should inherit from, use the `open` keyword.

```kotlin
open class MyParentClass {
  val x = 5
}
```

Then to inherit from a parent class, just type annotate the child class with the parent class's type.

```kotlin
class MyChildClass: MyParentClass() {
  fun myFunction() {
    println(x) // x is now inherited from the superclass
  }
}

```

#### Overriding methods

To override methods, you must follow these steps:

1. In the parent class, declare the method as `open`
2. In the child class, declare that you want to override the parent class method with the `override func` keyword

```kotlin
open class ParentClass {
    open fun greet() {
        print("Hello")
    }
}

class ChildClass: ParentClass() {
    override fun greet() {
        print("Hi")
    }
}
```

### Object

#### Objects in Kotlin

Objects in kotlin are similar to objects in javascript, where they are just containers for properties and methods.

By convention, we titlecase the object identifier.

```kotlin
object Rocky {
    val paws = 4
    fun meow() {
        println("Meow!")
    }
}
```

Objects can be used globally in kotlin, where they can be used to access global constants and methods easily.

#### Companion objects

Kotlin doesn't have static members like Java does. Instead, each class has a **companion object**—a single object instance attached to the class itself—where you put functions, constants, and variables that belong to the class rather than to individual instances.

Everything in the companion object is accessible via the class name (e.g., `User.collection`) and is shared across all instances of that class. The companion object is created automatically when the class loads, even if you never create an instance.

```kt
class Person(private var firstname: String, private var lastname: String)  {
    companion object {
	    val people = mutableListOf(Person("Josh", "Allen"))
        fun createPerson(fname: String, lname: String) : Person {
            return Person(fname, lname)
        }
    }
}

// then call like this:
Person.createPerson("John", "Doe")
```


A companion object is Kotlin’s version of `static`. Any properties or methods put inside a `companion object` will belong to the class itself rather than the object instance.

```kotlin
class Request(val url: String) {
    private var timeout = 10;
    init {
        print("fetching url $url")
    }
    companion object {
        fun create(url: String): Request {
            return Request(url)
        }
        val methods = listOf("GET", "POST", "PUT", "DELETE")
    }
}
```

#### Delegates

The **delegate pattern** is an OOP design pattern that leverages object composition to achieve the same code reuse as inheritance, but in a more flexible way.

Kotlin supports delegation in two primary ways:

1. **interface delegation**: allows to to delegate the implementation of an interface to some other object implementing that interface

```kt
interface Logger {
    fun log(tag: String, message: String)
}

class LoggerImpl : Logger {
    override fun log(tag: String, message: String) {
        println("$tag: $message")
    }
}

// now DelegatedLogger.log() just executes LoggerImpl.log()
// think of it as using LoggerIMpl as the overriding class for the interface
// and DelegatedLogger inherits from LoggerImpl basically
class DelegatedLogger(private val delegate: Logger) : Logger by delegate {}
```

2. **property delegation**: allows you to subscribe to changes on a class property or variable, running side effects whenever it changes:

```kts
class ViewModel {
    
    // subscribes to run this side effect each time currentQuery changes
    var currentQuery: String by Delegates.observable(initialValue = "") { property, oldValue, newValue -> 
        println("$oldValue -> $newValue")
    }

    fun search(query: String) {
        currentQuery = query
    }
}
```

**Lazy delegates** allow us to defer initialization of a property until it is first accessed, which you can do via a `by lazy` keyword then pass in an initialization lambda.


```kt
interface Logger {
    fun log(tag: String, message: String)
}

class LoggerImpl : Logger {
    override fun log(tag: String, message: String) {
        println("$tag: $message")
    }
}

// now DelegatedLogger.log() just executes LoggerImpl.log()
// think of it as using LoggerIMpl as the overriding class for the interface
// and DelegatedLogger inherits from LoggerImpl basically
class DelegatedLogger(private val delegate: Logger) : Logger by delegate {}

class ViewModel {
    // only runs instantiation code once we try to access ViewModel.logger
    val logger: Logger by lazy {
        println("initializing logger")
        DelegatedLogger(LoggerImpl())
    }

    fun search(query: String) {
        logger.log(tag = "search", message = query)
    }
}
```

### Data classes

**Data classes** automatically generate useful methods for classes that hold data: `toString()` shows all properties and their values, `equals()` compares instances by their property values (not identity), and `copy()` lets you clone with selective property changes.

```kt
data class Product(val id: Int, val name: String, val price: Double)

val p1 = Product(1, "Laptop", 999.99)
val p2 = Product(1, "Laptop", 999.99)

println(p1)                    // Product(id=1, name=Laptop, price=999.99)
println(p1 == p2)             // true (compares by property values, not identity)
println(p1 === p2)            // false (different objects in memory)
```

**Three key generated methods:**

1. **`toString()`** — shows all properties and values instead of the useless default class name + hash code.
    
2. **`equals()`** — compares two instances by their property values. Two `Product` objects with the same `id`, `name`, and `price` are equal, even if they're separate instances.
    
3. **`copy()`** — clones the object with selective property changes:

```kt
val p1 = Product(1, "Laptop", 999.99)
val p2 = p1.copy(price = 799.99)  // Same id and name, new price
println(p2)                        // Product(id=1, name=Laptop, price=799.99)
```

### Sealed classes

**Sealed classes** are classes you can't instantiate. They're typically used as containers for global utilities or constants, especially useful in Android where you can't have truly global functions.

> [!NOTE]
> Typically a sealed class is used with companion objects because you can't instantiate them. They're simply data containers. 

```kt
sealed class Result {
    companion object {
        fun success(data: String): Success = Success(data)
        fun error(message: String): Error = Error(message)
    }
    
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
}
```


The sealed class itself can't be instantiated, but its subclasses can—and the companion object provides a convenient way to construct them.
### Enum classes

**Enum classes** define a fixed set of named values. Each value can have associated data—for example, `Color(value: Int)` lets each color constant hold an integer.

```kt
enum class Color(val rgb: Int) {
	RED(0xFF0000)
}
```

You can also add companion objects to enum classes, since they're just a class:

```kt
enum class Color(val value: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF);
    
    companion object {
        fun fromHex(hex: Int): Color? {
            return values().find { it.value == hex }
        }
    }
}
```

- `Color.RED` has the value `0xFF0000`

## Modules and third-party packages

### How modules and top-level globals work

Kotlin follows Python, where a file is treated as a module, and each variable, function, and object in a file is automatically exported and available for other files to use.

Basically, a file is treated as syntactic sugar for a class, and top-level variables, constants, functions, and classes, are all considered "public" for use.

```kts
const val globalVal = "I am global"

public var globalMutableVar = "I am globally mutable"

private var localMutableVar = "I am private, only allowed to use in this file"

fun main(vararg args: String) {
    println("I am also public and global")
}
```

There are three access modifiers you can set

- `public`: makes the object able to be publicly used across the codebase. 
	- By default, any top-level object, variable, or function has the `public` modifier implicitly applied, and thus becomes a global.
- `private`: the object is only available within the file, cannot be used publicly in other files.
- `internal`: makes the variable accessible within the given module but not the entire project. 

> [!IMPORTANT]
> Global variables are problematic because they are easy to use, even if convenient, because of these core reasons:
> 
> 1. Makes it harder to know what to import
> 2. Destroys encapsulation if a variable was meant to only be used within a certain file.

Avoid using global variables, and instead either group them together within objects or declare them `private` or `internal`.

### Useful, small modules
#### Random values

```kts
import kotlin.random.Random

fun getRandom(max: Int) = Random.nextInt(max)
```

### Testing

1. Set up your `build.gradle.kts` to have the JUnit dependency:

```kts title="build.gradle.kts"
plugins {
    kotlin("jvm") version "2.1.0"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnit()
}

application {
    mainClass.set("MainKt")
}
```

2. If not created, ensure you have a `settings.gradle.kts` like so:

```kts title="settings.gradle.kts"
rootProject.name = "mynewporj"
```

3. Run the `./gradleew.bat test` command:

```bash
.\gradlew.bat test --console=plain 2>&1 | Out-String
```

4. Now you can write tests like this:

```kts
import kotlin.test.Test
import kotlin.test.assertEquals

class SampleTest {
    @Test
    fun `sorted lines are ordered`() {
        val lines = listOf("c", "b", "a")
        assertEquals(listOf("a", "b", "c"), lines.sorted())
    }

    @Test
    fun `1 + 1 = 2`() {
        assert(1 + 1 == 2)
    }

    @Test(expected = Throwable::class)
    fun `illegal characters are not allowed`() {
        val illegal = 8 / 0
    }
}
```

#### Mocking data with mockito

Mockito is a third-party library that allows us to add mocks into our JUnit tests.

1. Install mockito by adding it as a dependency

```kt
plugins {
    kotlin("jvm") version "2.1.0"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.mockito:mockito-core:5.11.0")
}

tasks.test {
    useJUnit()
}

application {
    mainClass.set("MainKt")
}
```

2. Refresh the gradle with `CTRL + SHIFT + O`


![](https://i.imgur.com/ku0UPP3.jpeg)

3. Now you can add tests like so:

```kts
import org.mockito.Mockito
import kotlin.test.Test
import kotlin.test.assertEquals

class DummyClass {
    fun hello() {
        println("function implementation")
    }
}

private fun runHello(dummyClass: DummyClass) {
    println("starting Hello")
    dummyClass.hello()
    println("ending Hello")
}

class SampleTest {
    @Test
    fun `mock out DummyClass`() {
        val mockedClass = Mockito.mock(DummyClass::class.java)
        runHello(mockedClass)

        // verify that DummyClass.hello() mock was called at least once
        Mockito.verify(mockedClass).hello()
    }
}
```

## Async and Coroutines

## Building CLI apps

### Accepting arguments

The `main.kt` file must have the `main(vararg args: String)` analog to Java so it acts as the main entrypoint for running a kotlin project and then passing arguments to it via the command line.

The `args` array is just a string list of the CLI arguments passed when running the project.

```kt title="main.kt"
/**
 * args[0] - first CLI arg
 */
fun main(vararg args: String) {
    println("first argument: ${args[0]}")
}
```

To enable passing CLI values to the entrypoint in IntelliJ, follow these steps:

1. Edit the run configuration for the project


![](https://i.imgur.com/HuSiADr.jpeg)

2. Add the arguments you want to pass


![](https://i.imgur.com/cXAfHuh.jpeg)

```kt
fun main(vararg args: String) {
    if (args.isEmpty()) {
        println("Usage: pass something plz")
    }
    println("first argument: ${args[0]}")
}

```

### Accepting user input

Accept user input with the `readln()` function:

```kt
print("Enter your name: ")
// ensures non-null input
val name = readln()
print("Enter your age: ")
val age = readln().toInt()
```

### Files

All files in Kotlin are represented through the `File(filepath: String)` class.

```kt
val scoresFile = File("scores.txt")
if (!scoresFile.exists())  {
	scoresFile.createNewFile()
}
scoresFile.writeText("$name $age\n")

scoresFile.forEachLine { line -> println(line) }

scoresFile.readLines().sorted().forEach { println(it) }

val outputFile = File("sorted-scores.txt")
outputFile.createNewFile()
outputFile.toPath().writeLines(scoresFile.readLines().sorted())
```

#### File creation


1. Create a `File` instance:

```kt
val scoresFile = File("scores.txt")
```

2. If the file instance doesn't exist, checking via `file.exists()`, then create it:

```kt
if (!scoresFile.exists())  {
	scoresFile.createNewFile()
}
```

In summary:

- `file.exists()`: returns a boolean for whether or not the file exists
- `file.createNewFile()`: synchronously creates the file.

#### Reading file content

```kt
val scoresFile = File("scores.txt")

scoresFile.forEachLine { line -> println(line) }

scoresFile.readLines().sorted().forEach { println(it) }
```

You have two different ways of reading the contents of a file, both of which involve going line by line via a sequence for better memory performance:

- `file.forEachLine(lambda: (line: String) -> Unit)`: for each line in the file, execute the lambda on it.
- `file.readLines()`: returns a `Sequence<String>` representing the sequence of all the lines in the file, and then you can use it as a normal sequence.