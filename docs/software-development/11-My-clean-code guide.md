
## First: what your style already says about you

From your heap, graph, and Dijkstra code, your natural tendencies are:

- You **think in data structures**, not just steps
    
- You like **expressive types & classes**
    
- You try to **model the domain**, not just “get it working”
    
- You explore language features (private fields, valueOf, generics)
    

That’s good. The downside is:

> you abstract _too early_, before the shape of the problem settles.

So the goal is **not** “abstract less”, but:

> **abstract later and with sharper boundaries**

---

## Core principle that will level you up fast

### 🔑 _Write it ugly once. Then abstract only what hurts._

Most people hear this advice but don’t actually follow it. Here’s what it means **in practice**:

### Phase 1 — **Solve with primitives**

- Use Maps, arrays, plain objects
    
- No helper classes
    
- No clever reuse
    
- No “future-proofing”
    

Example (good _first_ Dijkstra):

```ts
const dist = new Map<T, number>();
const prev = new Map<T, T | null>();
```

This phase gives you:

- clarity of invariants
    
- understanding of what changes vs what stays stable
    

---

### Phase 2 — **Feel the friction**

Ask:

- What variables move together?
    
- What logic repeats?
    
- What concepts have invariants?
    

In your case:

- `dist + prev` travel together
    
- path reconstruction repeats
    
- PQ logic is reusable
    

---

### Phase 3 — **Abstract exactly one level**

Now create abstractions that:

- group related state
    
- enforce invariants
    
- do _one_ thing
    

This is where `MinPriorityQueue` shines 👍  
This is where `WeightedPathMap` was _one abstraction too far_.

---

## A mental checklist before creating a class

Before writing a new class, ask:

### 1️⃣ Does this class enforce an invariant?

Good example:

> “Heap property must always hold”

Bad example:

> “Holds some data I don’t want to pass around”

---

### 2️⃣ Would a `Map` + function be clearer?

If yes → don’t make a class yet.

Your `WeightedPathMap` started as:

> “just a Map with helpers”

That’s usually a red flag.

---

### 3️⃣ Can I describe this in one sentence?

If you can’t explain it _without “and”_ — it’s doing too much.

❌ “Stores path, calculates distance, reconstructs path, initializes map”  
✅ “Stores predecessor pointers”

---

## Design rule that fits your brain

### 🔥 **State lives in data. Logic lives in functions.**

Your design drifted when logic _started living in data structures_.

Better split:

```ts
// Data
Map<T, number>       // distance
Map<T, T | null>     // previous

// Logic
relax()
reconstructPath()
```

Classes should mainly:

- protect state
    
- enforce invariants
    
- hide implementation
    

Not “be smart”.

---

## How to design good abstractions (practical heuristics)

### 🧠 Heuristic 1: Stable vs unstable code

Abstract **stable things** only.

In Dijkstra:

- PQ logic = stable
    
- Graph adjacency = stable
    
- Path map internals = unstable
    

You abstracted the unstable part too early.

---

### 🧠 Heuristic 2: Direction of dependency

High-level algorithms should **depend on interfaces**, not implementations.

Good:

```ts
pq.enqueue(node, priority)
```

Bad:

```ts
pathMap.calculateDistance(...)
```

Algorithms shouldn’t “know” how paths are stored.

---

### 🧠 Heuristic 3: Abstractions should reduce cognitive load

If reading code requires _remembering hidden rules_, abstraction failed.

Your `valueOf()` trick is clever — but hidden.

Great abstraction = boring, obvious, predictable.

---

## Style-specific advice for _you_

### You should:

✅ Write a clean “reference version” first  
✅ Delay class creation  
✅ Be suspicious of “helper” classes  
✅ Prefer **explicit over clever**

### You should avoid:

❌ Abstracting storage + logic together  
❌ Encoding algorithm steps inside data objects  
❌ Premature generalization (`WeightedEdge.equals`, JSON hashing, etc.)

---

## How to practice this deliberately

### Exercise 1 — Two-pass rule

For every non-trivial problem:

1. Solve it with **zero classes**
    
2. Rewrite once with **minimum abstractions**
    

Compare versions.

---

### Exercise 2 — “Delete 30%”

After you finish:

- delete 30% of your abstractions
    
- see if clarity improves
    

If yes → abstraction was premature.

---

### Exercise 3 — Narrate invariants

Force yourself to write comments like:

```ts
// invariant: dist[v] is the shortest known distance so far
```

If you can’t state an invariant, abstraction isn’t ready.

---