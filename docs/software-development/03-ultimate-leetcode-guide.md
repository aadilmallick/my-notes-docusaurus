## Arrays

### Array data structure in depth

Here is the Big O complexity:

- **reading: $O(1)$** constant time for index-based access
- **inserting: $O(n)$** linear time for insertion
- **deletion: $O(n)$** linear time for deletion

## HashSets and HashMaps

### Hash Table basics

A **hash table** is an unordered list of key-value pairs, where by using a **hash function**, we map keys to unique array indices called **buckets**, and in the buckets we store the values.

> [!NOTE]
> The reason Hash Tables are sometimes preferred instead of arrays or linked lists is because searching for, adding, and deleting data can be done really quickly, even for large amounts of data, where all CRUD operations on a hash table are $\Omega(1)$ on average.

Here's some important terminology to understand:

- **Hash code:** A number generated from an element's unique value (key), to determine what bucket that Hash Set element belongs to.
- **Bucket:** A Hash Set consists of many such buckets, or containers, to store elements. If two elements have the same hash code, they belong to the same bucket. The buckets are therefore often implemented as arrays or linked lists, because a bucket needs to be able to hold more than one element.
- **Bucket space / hash table size**: the underlying size of the data structure for the hash table, which is often an array.
- **Hash table capacity**: the number of buckets currently filled in the hash table. Knowing what capacity the hash table has allows it to have smart, efficient resizing on the fly to enlarge its bucket space.

Hash tables can be implemented either as hash tables or hash sets.

- **hash sets**: used for quick adding and checking if an element is in the set. Impossible to accurately retrieve data, so it's not used for data access.
	- **insertion and deletion**: $O(1)$ average case, but faster than hash maps.
	- **checking if an element is in the set**: $O(1)$ average case, faster than hash maps.
	- **uniqueness and storage**: every element in the set is a unique key, and the value is the same as the key.
- **hash maps**: designed for efficient adding and reading, although a bit slower than hash sets for both adding and reading. You can access data and retrieve it through hash maps.
	- **insertion and deletion**: $O(1)$ average case
	- **checking if an element is in the set**: $O(1)$ average case
	- **uniqueness and storage**: made of key-value pairs and uses collision-chaining

The main difference arises in how both deal with hash collisions, which is when a hash function assigns a key to an index that is already used .

- **hash sets:** Hash collisions are solved through **chaining,** which is when you have each bucket as an array that stores values whose keys hash to the same bucket.
- **hash maps:** Hash collisions are solved through **open addressing,** where if we want to store an element but there is already an element in that bucket, the element is stored in the next available bucket.

#### Hash functions

A hash table has some underlying data structure like a set or array, where hash functions take in a key (string, number, etc.) and map it to a unique array index for that key.

Here are the rules for what a good hash function must be:

1. **fast, runs in constant time**: A hash function must in constant time and not have increased runtime complexity depending on the size of the hash table. 
	- A good enough hash function has runtime independent of the hash table size and capacity, and a great hash function has the same constant time complexity regardless of key length.
2. **distributes uniformly**: A good hash function distributes keys uniformly across the **bucket space**, which is just the size of the underlying storage data structure of a hash table. 
	- Hash tables are useless if all keys are clustered together into a single bucket, so this property is very important.
3. **deterministic**: the only way a hash table works is if the hash function is deterministic, meaning the same key hashes to the same bucket every time.

The third rule leads to a key finding:

> [!NOTE]
> **keys must be immutable:** hash functions depend on the values of keys and are deterministic, so the keys must be immutable data types, like tuples rather than arrays, otherwise the hash changes and is no longer deterministic for the same reference object.


**a simple hash function**

We can create a useful, quick hash function by using the ASCII character code for each char a string key, like so:

1. Get the alphabetic number of a char by subtracting 96 from the ASCII range (normalizes the ASCII range of 1-128 to the alphabetic range of 1-26)
`
```js
"a".charCodeAt(0) - 96 // outputs 1
"d".charCodeAt(0) - 96 // outputs 4
"z".charCodeAt(0) - 96 // outputs 26
```

2. Add all the char codes together, so the hash function runtime is dependent on the key length, not on the hash table size.
3. Ensure that the summed up char codes can point to a valid index in the hash table data structure, which we can do via modular arithmetic and modding by the hash table size:

```ts
function hash(key: string, bucketSpaceSize: number) {
	// add up all char codex
	const total = key.reduce((char, total) => {
		const alphabetIndex = char.codeAt(0) - 96
		return total + alphabetIndex
	}, 0)
	
	// mod by bucket space size to return valid bucket index
	return total % bucketSpaceSize
}
```

Above is an example of a simple hash function that gets the job done, but has two main flaws:

1. **not constant**: time complexity increases with key size, so it's not exactly constant, but it's at least independent of hash table size, which is the key requirement.
2. **bad distribution**: a lot of the keys get clustered at bucket index 0, so we have to fix that.

**a better hash function**

A better hash function implementation uses primes and only loops over a subset of the key string to calculate a hash for the key:

```ts
function* firstHundredChars(key: string) {
	const MAX_LENGTH = Math.min(key.length, 100)
	for (const char of key.slice(0, MAX_LENGTH)) {
		yield char
	}
}

function hash(key: string, bucketSpaceSize: number) {
	const WEIRD_PRIME = 37
	
	// add up all char codes
	const total = [...firstHundredChars(key)].reduce((accumulator, char) => {
		const alphabetIndex = char.charCodeAt(0) - 96
		return (accumulator * WEIRD_PRIME + alphabetIndex) % bucketSpaceSize
	}, 0)
	
	return total
}

console.log(hash("purple", 10)) // 0
console.log(hash("orange", 10)) // 6
```

> [!NOTE]
> Good hash functions leverage prime numbers to minimize clustering and evenly distribute values across the bucket space.

#### Hash collisions

A **hash collision** arises when a hash function assigns a key to an index that is already used up, so it must find a way to efficiently reassign the key to another unused index.

There are two techniques for dealing with hash collisions:

- **separate chaining**: making a bucket that has a collision into an array and storing the values or key value pairs that hash to that bucket within the bucket array.
- **linear probing**: Upon a collision we search the bucket space for any empty buckets and put the key value pair in there and when bucket capacity gets filled up we resize the hash table to increase the bucket space size.

**separate chaining**

Upon a hash collision, we just set the bucket as an array and then append collision values to the array. hash sets and hash tables vary in what they store in the buckets upon a collision:

- **hash set:** No need for retrieval, so a hash set simply appends values to the bucket array, omitting the key
- **hash table:** Needs the key for retrieval of the specific value, so a hash table appends tuples of (key, value) pairs to the bucket array so when retrieving a value, the hash table directly identifies the corresponding key-value pair.

**linear probing**

Upon a collision, we search the array for any empty indices and just put the (key, value) pair there.

When too many spots get filled, we resize the hash table.


### HashSet implementation


### HashMap implementation

**hashtable set**

1. Accept `key` and `value` pair
2. Hash the key and map it to a bucket index
3. Via separate chaining, append (key, value) tuple to the bucket array

**hashtable get**

1. Accept `key`
2. Hash the key and map it to a bucket index
3. Search the bucket array at the bucket index for the stored (key, value) and return the one whose key matches `key`

## Dynamic programming

dynamic programming is a technique to solve complex problems by breaking it down into smaller sub problems and solving those just once, and then storing the result of those small sub problems.

Dynamic programming has two main use cases:

- **greedy algorithm optimization**: Finding the best optimized algorithm for greedy algorithms and arriving at the best solution 
- **finding number of solutions**: Finding the number of solutions to a problem or the number of solutions a problem has. 

 There are two types of dynamic programming problems:

1. **overlapping subproblems**: Fibonacci is an example of a dynamic programming problem with overlapping subproblems, since to compute the `n+1`'th fibonnaci number, you need to calculate fibonacci for `n`, `n-1`, etc and thus you end up recomputing stuff you’ve already done a long time ago.
2. **optimal substructure**: A problem has optimal substructure if its sub-problems have optimal solutions and thus, you can create an optimal solution from the optimal solutions of those sub problems.

There are 2 main approaches to solving dynamic programming:

1. Memoization: Memoization plus recursion is a way of memorizing past recursive computations so you avoid redoing the unnecessary work of that branch.

2. Tabulation: This is a bottom-up approach where you focus on solving an individual subproblem and build up from that to the bigger ones. 


### Memoization

For fibonacci, we have so many repeated calculations that the computational complexity is $O(1.6^n)$ which is exponential.

We can improve the performance of Fibonacci by memoizing past results and storing them in a cache, which is called memoization. This way, we don't recompute parts of the computation tree of Fibonacci that we have already computed before. 

```tsx
function createMemoizedFibonacci() {
    const fibMap = new Map<number, number>()
    const fibonacci = (n: number) : number => {
        if (n <= 1) return 1

        if (fibMap.has(n)) return fibMap.get(n)!

        const fibNumber = fibonacci(n-1) + fibonacci(n-2)
        fibMap.set(n, fibNumber)
        return fibNumber
    }

    return {
        fibonacci,
        fibMap
    }
}

const {fibonacci, fibMap} = createMemoizedFibonacci()
```

This results in a $O(n)$ fibonacci implementation

### Tabulation

Tabulation is simply just writing a recurrence relation one to one in code, and using an array to do so, avoiding recursion.

- We iteratively add elements to an array, and use those elements as variables in the recurrence relation.
- Because there are no recursive calls, we save memory.

```tsx
function tabulatedFibonacci(n: number) {
    const fib = [0, 1, 1]
    for (let i = 3; i <= n; i++) {
        // fib[i] = fib[i-1] + fib[i-2]
        fib.push(fib[i-1] + fib[i-2])
    }
    return fib[n]
}

console.log(tabulatedFibonacci(100))
```

> [!NOTE]
> **tabulation vs memoization**
> ***
> The problem with memoizing recursive calls is that after 10,000 recursive calls in a row, you exceed the call stack.
> 
> - Tabulation is iterative and thus doesn’t overflow the callstack, as opposed to memoization which overflows the callstack.
> - Tabulation and memoization are both $O(n)$ approaches, but memoization has worse space complexity.  

In tabulation, the order you solve subproblems matters, so you have to pay special attention to the dependencies of certain subproblems. This is called the **topological sort order,** which is a fancy word to describe how a recurrence relation should be formed for tabulation without creating cycles. 

> [!NOTE]
> You should mainly think of tabulation as building from the bottom up, where you solve the smallest subproblem first, which is usually the base case in recursion. Then you build up from smaller subproblems from the bottom of the tree until you get to the top of the tree, which is the root, or the original problem you're trying to solve. 

### Problems

#### Greedy algorithm: Minimum coins

For some problems, the greedy algorithm works, where on each recursive call you choose to go down the branch with the largest value.

Whether or not the greedy algorithm works for this coins problems depends on the denomination.

> [!NOTE]
> If for a set of coins, the greedy solution always works, it is called canonical.

![](https://i.imgur.com/m4fBLP0.jpeg)

Here is how you would solve the problem in a greedy way:

- You want to find the first coin where `curTotal >= coin`. Recurse with that coin, add that coin.
- Keep using that coin until that denomination is greater than the curTotal, so you have to move to the next smallest denomination, recurse with that, not adding the coin.

```ts
const denominations = [200, 100, 50, 20, 10, 5, 2, 1]
const sortedDenominations = denominations.sort((a, b) => b - a)

function minCoins(denominations: number[], total: number) {
    /**
     * Treat a subproblem as (denomination, total) => total - denomination
     */
    const minCoinsHelper = (denominationStartIndex: number, curTotal: number) : number => {
        // choose the largest denomination that goes into curTotal
        let i = denominationStartIndex
        if (curTotal -  denominations[i] > 0) {
            // if the current largest denomination works, use that coin
            return 1 + minCoinsHelper(i, curTotal - denominations[i])
        }
        // if we found a perfect denomination, return 1
        if (curTotal - denominations[i] === 0) {
            return 1
        }
        if (curTotal -  denominations[i] < 0) {
            // else, use the next smallest denomination
            i += 1
            return 0 + minCoinsHelper(i, curTotal)
        }
        
    }

    return minCoinsHelper(0, total)
}

console.log(minCoins(sortedDenominations, 734)) // should output 8, three 200s, one 100, one 20, one 10, and two 2s
```

#### Dynamic programming: Minimum coins


![](https://i.imgur.com/vibdYBa.jpeg)

For this new version of minimum coins, the denominations matter and change the problem. For this version, greedy solution will not work, so you have to resort to dynamic programming.

> [!NOTE]
> Dynamic programming is just brute force with memorizing sub-tree computation.

To solve the desired problem `minimum_coins(coins, m)`, we can break that down into subproblems with the ultimate base case being `minimum_coins(coins, 0) = 0`

We create subproblems as subtracting a choice of denomination from the current total and setting that as the new current total, or the subproblem value. Basically we solve the subproblems and create branches for them using all the denominations, returning when we reach the base case

![](https://i.imgur.com/sDLr7SU.jpeg)

In this case, a subproblem can have a solution or not have a solution:

- **has a solution**: a subproblem has a solution if later down the recursion tree it evaluates to the base case `minimum_coins(coins, 0) = 0`.
- **does not have a solution**: a subproblem does not have a solution if its denomination is larger than the subproblem value.

To speed up this recursive problem and avoid recomputation of trees, you must use dynamic programming and store solutions either through memoization or tabulation. 

> [!NOTE]
> With dynamic programming, the time complexity is $O(m \times k)$, where $m$ is the total sum and $k$ is the number of denominations. This is because we explore all possible solutions to find the optimal one, computing all possible subproblems.

##### Memoization solution

We use a recursive helper function that takes in one argument, `curTotal: number`.

1. If  `curTotal` equals 0, that means that we found a branch where we have perfect change, so we just return 0.
2. if `curTotal` is less than 0, that means that we reach an impossible branch where the denomination, no matter what, is larger than the current total. So we should just return undefined or something, and then we ignore that when we do the `Math.min()` for the branches.
3. And then we loop through all the denominations, recursing on the denominations that are less than curr total, adding 1. 

```ts
function minCoinsDynamic(denominations: number[], total: number) {
  // Subproblem cache mapping: curTotal -> absolute minimum number of coins
  const cache = new Map<number, number>()

  const helper = (curTotal: number): number => {
    // 1. Base Cases
    if (curTotal === 0) return 0
    if (curTotal < 0) return Infinity
    
    // 2. Fix B: Check cache at the start of the subproblem
    if (cache.has(curTotal)) {
      return cache.get(curTotal)!
    }

    // 3. Branch out for every denomination
    const coinCounts = denominations.map((denomination): number => {
      const remainder = curTotal - denomination
      
      // Fix A & C: Ensure every path returns a valid numeric result
      return 1 + helper(remainder)
    })

    // 4. Find the best choice for this curTotal and store it
    const minCoinsForTotal = Math.min(...coinCounts)
    cache.set(curTotal, minCoinsForTotal)

    return minCoinsForTotal
  }

  const result = helper(total)
  return result === Infinity ? -1 : result
}

console.log(minCoinsDynamic([1, 4, 5], 13)) // Output: 3
```


##### Tabulation solution

```ts
function minCoinsTabulated(denominations: number[], total: number) {
  /**
   * This bottom up approach involves starting at the base case min_coins(coins, 0) = 0, iteratively solving the subproblems from the bottom up,
   *  and then building up to the biggest subproblem, the original problem min_coins(coins, total)
   * 
   * 
   */

  // 1. store base case min_coins(coins, 0) = 0
  const tabulated = new Map<number, number>();
  tabulated.set(0, 0)

  // 2. iterate through the subproblems, loop until min_coins(coins, total)
  for (let i = 1; i <= total; i+=1) {
    // min_coins(coins, i) = for each denomination => Math.min( min_coins(coins, i - denomination) ), only if i >= denomination
    const branches = denominations.map(coin => {
        // recurse if i >= coin, else not
        return (i - coin) >= 0 ? i - coin : null
    })
    .filter(b => b !== null)

    tabulated.set(i, 1 + Math.min(
        // guaranteeed memoization, since we would have solved all subproblems before
        ...(branches.map(b => tabulated.get(b)!))
    ))
  }

  return tabulated.get(total)
}

console.log(minCoinsTabulated([1, 4, 5], 13)) // Output: 3
```

#### Dynamic programming: number of solutions


![](https://i.imgur.com/FTOcB4Q.jpeg)

We want to solve the problem: `numSolutions(coins, total)`, so we break it down into couting the number of solutions for the subproblem `numCoins(coins, m)`, which we know how to solve.

 We know the base case `numSolutions(coins, 0) = 1`, which we get from `numCoins(coins, 0) = 0`, which is a solution for $m = 0$, thus the number of solutions for the base case `numCoins(coins, 0)` equals 1.

Using this logic, we can solve this via dynamic programming, since it makes use of computation trees and subproblems we already know how to solve.


##### Memoization way

##### Tabulation way

Here is the basic recurrence relation, which just says that the number of solutions for a subproblem `numCoins(coins, i)`

$$numSolutions(coins, m) = \sum_{c \in coins} numSolutions(coins, m - c)$$

```ts
function numSolutionsForCoins(denominations: number[], total: number) {
  /**
   * This bottom up approach involves starting at the base case min_coins(coins, 0) = 0, iteratively solving the subproblems from the bottom up,
   *  and then building up to the biggest subproblem, the original problem min_coins(coins, total)
   * 
   * 
   */

  // 1. store base case numSolutions(coins, 0) = 1
  const tabulated = new Map<number, number>();
  tabulated.set(0, 1)

  // 2. iterate through the subproblems, loop until min_coins(coins, total)
  for (let m = 1; m <= total; m+=1) {
    let curNumSolutions = 0;

    for (const coin of denominations) {
        const subproblem = m - coin
        // invalid subproblem, don't do anything
        if (subproblem < 0) continue;

        // else, perform recurrence relation
        // numSolutions(coins, m) = sum(coin => numSolutions(coins, m - coin))
        curNumSolutions += tabulated.get(subproblem)!
    }
    tabulated.set(m, curNumSolutions)
  }

  return tabulated.get(total)
}

console.log(numSolutionsForCoins([1, 4, 5], 5)) // Output: 3
```

##### Maze problem


![](https://i.imgur.com/YOvtFKm.jpeg)

To solve this, think in terms of sub-problems. Each time you move down or right, you're dealing with a smaller grid, as previous rows or columns become inaccessible. Recurse until you reach a 1x1 grid, which is your base case. Frame the problem in terms of these sub-problems to find a solution.

> [!NOTE]
> Note that your solution only counts if you reach the base case, the single grid in the bottom right corner, which constitutes one solution.


![](https://i.imgur.com/fibW7Z4.jpeg)

Here is the solution:

```ts
class Point {
    constructor(public x: number, public y: number) {}

    toHash() {
        return `(${this.x},${this.y})`
    }
}

function* range(start: number, end: number) {
    for (let i = start; i < end; i+=1) {
        yield i
    }
}

function grid(m: number, n: number) {
    // map of starting point to number of ways to get to bottom corner, if only can move down or right
    const tabulated = new Map<string, number>()

     // Base case: Starting anywhere in the first column, there is 1 way to move down/right
    for (let row of range(1, m + 1)) {
        tabulated.set(new Point(row, 1).toHash(), 1)
    }

    // Base case: Starting anywhere in the first row, there is 1 way to move down/right
    for (let col of range(1, n + 1)) {
        tabulated.set(new Point(1, col).toHash(), 1)
    }


    // Now, row-1 and col-1 are guaranteed to exist in the Map!
    for (let row of range(2, m + 1)) {
        for (let col of range(2, n + 1)) {
        const fromLeft = tabulated.get(new Point(row, col - 1).toHash())!
        const fromAbove = tabulated.get(new Point(row - 1, col).toHash())!
        
        tabulated.set(new Point(row, col).toHash(), fromLeft + fromAbove)
        }
    }

    return tabulated.get((new Point(m, n)).toHash())!
}

```


## Patterns

### Two pointer (arrays)

Two pointer techniques consist you maintaining two references to indices in an array, where you can move the pointer and read the underlying value the pointer points to at will. 

This technique has three main benefits:

1. **Reduce the number of iterations you need**: Many $O(n^2)$ problems where you perform a nested loop over an array to check all two-pair combinations can be reduced to an $O(n)$ runtime complexity with the two pointers pattern.
2. **track a relationship between two places**: knowing what indices the fast and slow pointers point to at all times helps you detect cycles and the middle of a data structure.
3. **avoid extra space**: pointers are primitive index values, so they have very low overhead.

> [!NOTE]
> When to use two pointers? Whenever you think you have to brute force an array iteration in $O(n^2)$ time, think to yourself, "can I solve this problem by walking the array once from both sides?" If so, then you should use two pointers. Here are the main use cases that fit this pattern:
> 
> - **comparing pair combinations across an array**
> - **detecting symmetry of elements within array halves**

Here are the three different types of pointer problems, differentiated based on the direction we move the pointers in:

1. **same direction:** problems that have pointers move in the same direction are related to solving problems in a single pass.
2. **fast, slow pointers**: this is where one pointer moves faster than the other so you are at two different points in the array.
3. **opposite directions:** problems that have pointers move in the opposite direction are related to finding symmetry or pairs in an array.
    - **two sum** is an example of a two pointers problem that can be solved with moving the pointers starting from opposite ends of the list.


#### **opposite directions, same speed (method 1)**

Start the pointers at the edges of the input. Move them towards each other until they meet.

1. Start one pointer at the first index `0` and the other pointer at the last index `input.length - 1`.
2. Use a while loop until the pointers are equal to each other.
3. At each iteration of the loop, move the pointers towards each other. This means either increment the pointer that started at the first index, decrement the pointer that started at the last index, or both. Deciding which pointers to move will depend on the problem we are trying to solve.

```
function fn(arr):
    left = 0
    right = arr.length - 1

    while left < right:
        Do some logic here depending on the problem
        Do some more logic here to decide on one of the following:
            1. left++
            2. right--
            3. Both left++ and right--
```

Two pointers in opposite directions for problems like reversing a string or finding if a string is a palindrome gives the best possible runtime at $O(N)$.

##### **isPalindrome - opposite directions, same speed**

- **pointers:** two pointers, `left = 0` and `right = length - 1`
- **pointer speed and direction:** We move in opposite directions at same speed, so we iterate via `left -= 1` and `right -= 1` in each iteration of the loop.
- **pointer iteration condition:** pointers move at same speed, so they have same iteration condition, and that is the left pointer not meeting the right pointer.


Here it is all together

```python
def check_if_palindrome(s):
		# create two same speed, opposite direction pointers
    left = 0
    right = len(s) - 1

		# loop condition: left and right don't cross
    while left < right:
        if s[left] != s[right]:
            return False
        
        # iteration condition: while both chars on opposite side are equal
        left += 1
        right -= 1
    
    return True
```

##### **reversing a string**

```python
class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        
        Problem type: two pointers, opposite direction, same speed
        """
        left = 0
        right = len(s) - 1
        
        # general iteration condition: pointers don't meet or cross
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right = right - 1
```

##### **sorted twoSum - opposite directions, different speeds**

- **pointers:** two pointers, `left = 0` and `right = length - 1`
- **pointer iteration patterns**
    - `left`: increment left when the two sum is less than target
    - `right`: decrement right when the two sum is greater than target
- **pointer iteration condition:** In sorted twoSum, we have a $O(n)$ runtime, so the iteration condition is `left < right` for both pointers.

```python
def sorted_two_sum(nums: list[int], target):
		# 1. initialize pointers
    left = 0
    right = len(nums) - 1

		# 2. pointer iteration condition
    while left < right:
        
        twosum = nums[left] + nums[right]
        if curr == target:
            return True
            
        # right pointer iteration
        if curr > target:
            right -= 1
            
        # left pointer iteration
        else:
            left += 1
    
    return False
```

#### **two pointers, two iterables (method 2)**

Another way to use two pointers is on two iterables, one for each iterable.

1. Create two pointers, one for each iterable. Each pointer should start at the first index.
2. Use a while loop until one of the pointers reaches the end of its iterable.
3. At each iteration of the loop, move the pointers forward. This means incrementing either one of the pointers or both of the pointers. Deciding which pointers to move will depend on the problem we are trying to solve.
4. Because our while loop will stop when one of the pointers reaches the end, the other pointer will not be at the end of its respective iterable when the loop finishes. Sometimes, we need to iterate through all elements - if this is the case, you will need to write extra code here to make sure both iterables are exhausted.

```
function fn(arr1, arr2):
    i = j = 0
    while i < arr1.length AND j < arr2.length:
        Do some logic here depending on the problem
        Do some more logic here to decide on one of the following:
            1. i++
            2. j++
            3. Both i++ and j++

    // Step 4: make sure both iterables are exhausted
    // Note that only one of these loops would run
    while i < arr1.length:
        Do some logic here depending on the problem
        i++

    while j < arr2.length:
        Do some logic here depending on the problem
        j++
```

Time complexity of this general algorithm is $O(n + m)$

##### **merge sort subarray combination**

Given two sorted subarrays like `[1, 4, 7, 20]` and `[3, 5, 6]`, we can combine them together into a sorted array in $O(n)$ time via two pointers.

The trivial solution is to combine the arrays and then sort them with quick sort or merge sort to get $O(n \log n)$ time, but using two pointers, we can sort it in $O(n)$ time, which is exacrtly what merge sort does.

We use two pointers for the two subarrays, giving one pointer to each subarray.

- At each step, we add the smaller element pointed by the two current pointers, and then increment the pointer whose element was smaller.
- Once we exhaust one iterable’s pointer, we simply append the rest of the other subarray starting from its pointer’s current position.

We implement it like so:

```python
def combine(arr1, arr2):
    # ans is the answer
    ans = []
    i = j = 0
    
    # iteration condition for both pointers: no iterable exhausted
    while i < len(arr1) and j < len(arr2):
		    
		    # iterable 1 iteration condition
        if arr1[i] < arr2[j]:
            ans.append(arr1[i])
            i += 1
        
        # iterable 2 iteration condition
        else:
            ans.append(arr2[j])
            j += 1
    
    # exhaustion condition for 1st pointer if not exhausted
    while i < len(arr1):
        ans.append(arr1[i])
        i += 1
    
    # exhaustion condition for 2nd pointer if not exhausted
    while j < len(arr2):
        ans.append(arr2[j])
        j += 1
    
    return ans
```

### Sliding Window (arrays)

Sliding window is simply two pointers deciding the subarray size, start, and end within an array. 

> [!NOTE]
> When to use? If a problem asks you to find a contiguous slice of an array or string that satisfies some criteria, then that is when you should use sliding window technique.

There are two types of sliding window problems:

- **fixed window**: the window size is fixed
- **dynamic window**: the window size expands or contracts to satisfy criteria



The idea behind a sliding window is to maintain two variables, `left` and `right`. At any given time, `left` represents the left bound of our window, and `right` represents the right bound of our window.

Here is the basic formula:

1. Loop from `window_size` → `length`, with the right side of window being the iteration variable, so that gives us the `right` pointer.
    
2. In the loop, calculate `left` of the window as so:
    
```python
left = right - window_size
```
    
3. Reevaulate the calculation based on the window, decide whether it is optimal, valid, or invalid, and update the optimal solution as a result.

#### Fixed window problems

In a fixed window problem, you maintain the same size of the window and move the left and right bounds by the same amount each time. That way, the window always stays the same size. 

Here is the template for a fixed window problem:

```python
def sliding_window_fixed(arr, window_size):
	# 0. initialize initial bounds of first window
	left = 0
	right = window_size
	# 1. initialize answer
	answer = arr[0: window_size]
	# 2, initialize running window
	running_window = arr[0: window_size]
	
	# 3. iterate as long as right bound of window is within array
	for right in range(window_size, len(arr)):
		# 4. recalculate window bounds
		left = right - window_size
		running_window = arr[left:right]
		
		# 5. calculate running window and compare to optimal answer,
		# override previous optimal answer if this new one is most optimal
		answer = optimal(answer, calculation(running_window))
		
	return answer
```

#### Dynamic window problems

There are two techniques related to dynamic sliding windows that will help you solve problems:

- **expand window:** Fix one pointer to the same index while incrementing or decrementing the other pointer to expand the window.
- **contract window:** Fix one pointer to the same index while incrementing or decrementing the other pointer to contract the window.

The dynamic sliding window concept basically is changing the size of the window to try and always maintain a valid window or reevaulate a larger window.

But what if after adding a new element, the subarray becomes invalid?

1. For example, let's say adding a new element on the right makes the sum of the subarray too large. 
2. We need to "remove" some elements from our window until it becomes valid again. To "remove" elements, we can continuously increment `left`, which shrinks our window, until it becomes valid again.

As we add and remove elements, we are "sliding" our window along the input.

- The window's size is constantly changing - it grows as large as it can until it's invalid, and then it shrinks until it's valid once more.
- However, it always slides along to the right until it reaches the end of the input. Therefore, we always shrink using `left`, and not `right` unless we’re traversing backwards through the array.
- Conceptualize slowly inching forward like a caterpillar: sometimes we arch our back and contract by incrementing `left`, and then we expand by incrementing `right`

So here is the formula for dynamic sliding window:

1. Determine initial window size, Initialize `left` and `right` to be the left bound and right bound of the window respectively.
    
    ```python
    window_size = right - left + 1
    ```
    
2. Initialize window calculation variable `curr` that acts as some sort of running total, initialized by the initial `left` and `right` window, but recalculated during every loop iteration.
    
3. Enter a while loop with pointer iteration condition set to `right < length`
    
    1. Recalculate `curr` based on current window
    2. If window is invalid, shrink it by incrementing `left`
    3. Once window is valid again, increment `right`

Here is a general pseudocode template:

```python
function fn(arr):
    left = 0
    for (int right = 0; right < arr.length; right++):
        Do some logic to "add" element at arr[right] to window

        while WINDOW_IS_INVALID:
            Do some logic to "remove" element at arr[left] from window
            left++

        Do some logic to update the answer
```

### Prefix sum (arrays)

Prefix sum is a technique that can be used on arrays (of numbers, usually). T

The idea is to create an array `prefix` where `prefix[i]` is the sum of all elements up to the index `i` (inclusive).

For example, given `nums = [5, 2, 1, 6, 3, 8]`, we would have `prefix = [5, 7, 8, 14, 17, 25]` and have these prefix sums:

```
nums = [5, 2, 1, 6, 3, 8]

prefix_sum
```

> [!NOTE]
> Prefix sums allow us to find the sum of any subarray in $O(1)$ time by just building them up front.

If we want the sum of the subarray from `i` to `j` (inclusive), then the formula is:

```python
 prefix[j] - prefix[i - 1]
```

- `prefix[i - 1]`: represents the sum of all elements before index `i`, so basically the sum of the first `i` elements in the array.

**building a prefix sum**

Here is the pseudocode to build a prefix sum:

```
Given an array nums,

prefix = [nums[0]]
for (int i = 1; i < nums.length; i++)
    prefix.append(nums[i] + prefix[prefix.length - 1])
```

Here it is in python:

```python
def build_prefix_sum(nums: List[int]):
	prefix = [nums[0]]
	for i in range(1, len(nums)):
	    prefix.append(nums[i] + prefix[-1])
	return prefix

```

### Frequency Counter (hashmaps)

When dealing with comparing elements from two iterables, we can avoid the O(n^2) runtime that naive solutions offer and instead use frequency counters to get a O(n) runtime on these types of problems.

```python
def createFrequencyMap(items):
	frequency_map = {}
	for item in items:
		if item not in frequency_map:
			frequency_map[item] = 1
		else:
			frequency_map[item] += 1
```

#### Example (Anagrams)

```ts
function createFrequencyMap<T>(iterable: T[]) {
    const map = new Map<T, number>
    iterable.forEach(value => {
        const frequency = map.get(value)
        map.set(value, frequency ? frequency + 1 : 1)
    })
    return map
}

function validAnagram(str1: string, str2: string): boolean {
    const frequencyMap1 = createFrequencyMap([...str1])
    const frequencyMap2 = createFrequencyMap([...str2])
    for (let key of frequencyMap1.keys()) {
        if (frequencyMap1.get(key) !== frequencyMap2.get(key)) {
            return false
        }
    }
    return true
}
```

#### Example (Two Sum)

Given an array of integers `nums` and an integer `target`, return _indices of the two numbers such that they add up to `target`_.

You may assume that each input would have **_exactly_ one solution**, and you may not use the _same_ element twice.

You can return the answer in any order.

**Example 1:**

```
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].
```


**Example 2:**

```
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]
```

**Example 3:**

```
**Input:** nums = [3,3], target = 6
**Output:** [0,1]
```

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        """
        Let's say (target - nums[0]) is in the array nums, at nums[i].
        That means nums[i] + nums[0] = target. We will use this trick
        and a hashmap to achieve remembering complement values and finding
        if the complement is in the hashmap. 
        """

        # maps (target - nums[i]) : i
        num_to_index_map = {}

        for index, number in enumerate(nums):
            complement = target - number
            print(complement)

            # found a matching complement for a previous value in array
            if f"{complement}" in num_to_index_map:
                return [index, num_to_index_map[f"{complement}"]]
            
            num_to_index_map[f"{number}"] = index
        return []
```