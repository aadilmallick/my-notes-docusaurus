## Intro

All linux systems come equipped with the `make` command, which you can think of as a generic process-watcher hot reload system.

Every `make` command runs and watches a `MakeFile` in the current directory, which looks like so, which is a list of **directives**.

```bash
paper.pdf: paper.tex plot-data.png. # directive
	pdflatex paper.tex              # rule
	
plot-%.png: %.dat plot.py           # directive
	./plot.py -i $*.dat -o $@       # rule
```

The main advantage of `make` is that it only reruns the process if and only if the dependencies change.

### Basic structure

A Makefile consists of rules defining how to build targets from prerequisites. Each rule looks like this:  

```
target: prerequisites
    command
    command
```

- **Target:** What you're building (e.g., an executable).
- **Prerequisites:** Files or other targets needed to build it.
- **Commands:** Shell commands to run, prefixed with a tab (not spaces!).

### Variables

Variables in Makefiles act like constants or macros, making your file reusable and easier to maintain. Define them with `VAR = value`, and reference with `$(VAR)`.

**Types of assignment:**

- `=` : Lazy evaluation (value computed when used).
- `:=` : Immediate evaluation.
- `?=` : Set only if not already defined.
- `+=` : Append to existing value.

Use built-in functions like `$(shell command)` for dynamic values.

#### Special variables

- `%`: placeholder for some wildcard text. Think of this as the same as a regex capturing group.
- `$*`: reference substitution to whatever was captured by `%`. Think of this as the same as regex capturing group reference.
- `$@`: name of the target, like name of the output file.
- `$<` : First prerequisite.
- `$^` : All prerequisites.


