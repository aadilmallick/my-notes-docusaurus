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

### Numbers

#### Number methods

#### Type conversion

To convert from one type to another, you have to use these methods belonging to a variable:

- `num.toInt()` : returns the integer version of the number
- `num.toDouble()` : returns the double version of the number
### Strings

**String access**

- `str[n]` : position based indexing


**string properties**

  
- `str.length` : returns the length of the string

  
**checking for string equality**


The `str1.compareTo(str2)` method compares str1 to str2, and returns 0 if they are equal.


#### **string methods**

  
  

- `str.toUpperCase()`: Converts all characters in the string to uppercase.

- `str.toLowerCase()`: Converts all characters in the string to lowercase.

- `str.startsWith(prefix: String)`: Checks if the string starts with a specified prefix.

- `str.endsWith(suffix: String)`: Checks if the string ends with a specified suffix.

- `str.substring(startIndex: Int)`: Returns a substring starting from the specified index.

- `str.substring(startIndex: Int, endIndex: Int)`: Returns a substring within the specified range.
  
- `str.trim()`: Removes leading and trailing whitespaces from the string.

- `str.replace(oldstr: String, newstr: String)`: Replaces occurrences of a specified character sequence.

- `str.contains(charSequence: String)`: Checks if the string contains a specified character sequence.
  
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

**If/else**

  

```kotlin

if (condition1) {

  // block of code to be executed if condition1 is true

} else if (condition2) {

  // block of code to be executed if the condition1 is false and condition2 is true

} else {

  // block of code to be executed if the condition1 is false and condition2 is false

}

```

  

**While loop**

  

```kotlin

while (condition) {

  // code block to be executed

}

```

**When statements**

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

## Collections

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