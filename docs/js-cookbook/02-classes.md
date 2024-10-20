# Classes and regex

## Classes

### method chaining

You can chain methods together on your class by returning `this` inside every method.

```ts
class DateClass {
  public chain1() {
    console.log("chain1");
    return this;
  }

  public chain2() {
    console.log("chain2");
    return this;
  }

  public chain3() {
    console.log("chain3");
    return this;
  }
}

const date = new DateClass();
date.chain1().chain2().chain3();
```

### Static inheritance

Classes inherit all static methods and properties from parent classes. You can take further advantage of this by using `super` for overriding static properties and methods from the parent. 

```ts
class Parent {
    static attributes = ["hello"]
}

class Child extends Parent {
    static attributes = [...super.attributes, "dog"]
}

console.log(Child.attributes) // ["hello", "dog"]
```

## Regex 

### Regex In JS

**Regex data type**

You can specify a regex data type by typing in two forward slashes  and putting all the regex in between them.

- Regular expression flags goes after the slash forward slash.

```javascript
const r1 = /^big.*titties$/ig
```

**string methods**

- `string.match(regex: RegExp)` : tests the passed in regex on the string. Returns an array of the capture groups. **Returns `string[]`**
- `string.search(regex: regExp)` : returns the index of the first match in the string. **Returns `number`**
- `string.split(regex: regExp)` : Splits on the regex matc, returns string array. **Returns `string[]`**
- `string.replace(regex: RegExp, newText : string)` : replaces every match in the string with the new text specified.

**regex method**

- `regex.test(string)` : tests the passed in string against the regex. Returns a boolean of whether it passed or not.
- `regex.exec(string)` : returns an array of matches of the capture groups.

### Regex Theory

#### Regex Flags

Regex flags are what you put after the final forward slash. Here are the different useful flags:
- `g` : global. Does not return after first match.
- `i` : case insensitive
- `m` : multiline

#### Character sets

Character sets are thing things you put in between brackets like `[A-Z]`. **Metacharacters** are special escaped sequences that represent something else, like how `\d` represents a digit. 

- Putting a `^` at the first character of a character set excludes everything in that character set.
- Characters you need to escape with a backslash: `-`, `^`, `\`, `]`

**Basic metacharacters**

- `\d` : represents [0-9]
- `\w` : represents any alphanumeric character
- `\s` : represents whitespace

There are also the negative equivalents you get by putting the `^` at the fornt of the character set.

- `\D` : represents all characters not `\d`, all non-numeric.
- `\W` : represents all characters not `\w`, all non-alphanumeric.
- `\S` : represents all characters not `\s`, all non-whitespace

#### Repetition

**Greediness** is what causes regex to naturally match the entire line, and then backtrack to match the characters it needs to match.
- greedy regex matches as much as it possibly can.
- Regex expressions are naturally greedy. We need to use a `?` to make them lazy.

**Laziness** is the opposite of greediness. We can make regex lazy by putting a `?` after a repetition character, like `*?` and `+?`.
- Lazy regex matches as little as possible

**Specific repeition characters**

- `{3}` : match exactly three times
- `{3,6}` : match between 3 to 6 times
- `{3,}` : match at least 3 times
- `*`: match 0 or more times
- `+`: match 1 or more times

**Lazy repetition**

- `+?` : match at least one character, or as few characters as possible of the preceding token
- `*?` : match at least zero characters, or as few characters as possible of the preceding token
- `??` : matches 0 characters

#### Anchors + Word boundaries

When we use anchors, we need to use the multiline flag to let anchors work on each line.

- `^` : anchors at the start
- `$` : anchors at the end

##### Word boundaries

- `\b` : specifes a word boundary, a non-word character.
- `\B`: specifies a word character, bounding a word between an alphanumeric character.

**Examples**

- `\bplan\b` : specifies that we want the word "plan" by itself, where you match a non-word character, then the word, and then another non-word character.
- `\bplan\B` : specifies that we need word characters after "plan" but not before, like "planning"

##### Matching beginning and ending of string

- `\A` : matches beginning of the string. 
	- The `^` in multiline flag mode will match the beginning of each line in a string.
	- The `\A` will only match the beginning of a string, ignoring the fact that the string is multiline.
- `\Z` : matches end of the string.
	-  `\Z` matches only at the end of the string, even when the string is multiline.

#### Capturing groups

> **Unnamed capturing group references**

**Capturing groups do not grab the pattern**. They grab the natural text that matches the pattern in a string.

Refer back to capturing groups by a backslash and then a number, like `\1` to refer the first capturing group.

- group back references only what is captured, not the pattern. Only use group back references if you want the text to be the exact same as what was captured.

> **non-capturing group**

Put a `?:` at the start of the group, indicating you don't want this to be a capturing group.

For example, `(?:hello)` groups the "hello" text but does not capture it.

> **naming capturing groups**

To name a capture group, use the `?<nameOfGroup>` syntax. 

The group back reference for named capturing groups starts with a `\k`, to indicate named references, and is like this: `\k<nameOfGroup>`

#### Lookahead groups

- Lookahead groups start with `?=`, and define match patterns but don't consume any characters.
- Negative lookahead groups are the opposite of lookahead groups, and start with `?!`.
- Lookbehind groups start with `?<=`, and at the point in the pattern, it looks behind for a match pattern you specify.
- Negative lookbehind groups start with `?<!`, and is the opposite of a lookbehind.

```js
const text = "I have $59 but not 59 hoes"
const regex = /(?<=\$)\d+/g

console.log(text.match(regex)) // matches $59
```

### Capturing groups JS

Using capturing groups allows us to parse the captured data in javascript. We can get data from capturing groups by using the `regex.exec(str)` method, which returns an array of matches.

All capturing group matches start at index `[1]`, since the full string input will always be the first match.

```ts
const string = "1-2-3"
const regex = /(\d)-(\d)-(\d)/g

// returns ["1-2-3","1","2","3"], so 4 groups. The first group is always the entire match
const match_arr = regex.exec(string)
```