---
id: python
title: Python
blurb: Target modern Python 3.12+. Work in isolated virtual environments, declare projects with `pyproject.toml`, and lean on a formatter, a linter, a type checker and pytest from the first module rather than bolting them on later.
checkpoint_beginner: Beginner checkpoint :: Build a command-line expense tracker. Subcommands, `dataclass` models, `Decimal` money, JSON persistence, input validation with useful error messages, full type hints, pytest coverage of the money maths, and an installable local package.
checkpoint_intermediate: Intermediate checkpoint :: Build a tested service — a small web API or an automation job. A layered package, strict `mypy`, a real database with migrations, validated input, safe configuration from the environment, structured logging, a Dockerised local environment, and CI that runs the whole check suite.
checkpoint_advanced: Advanced capstone :: Choose a workflow engine, an ingestion pipeline, a production API, a developer tool, or a reusable library. Require architecture notes, typed public contracts, deliberate concurrency with backpressure, durable state, a security pass, profiling evidence, observability, packaging, deployment, and a written failure-recovery playbook.
---

### Module 1 — The toolchain and your first program

> track: spine
> stage: toolchain
> level: Beginner
> minutes: 25

**Learn.**
Python is an *interpreted* language: the `python` command reads your source, compiles it to bytecode, and runs that bytecode on a virtual machine. Nothing is compiled ahead of time, which is why a syntax error three functions down still lets the first two run — until the interpreter reaches it.

Install from python.org or your package manager, then confirm with `python3 --version`. You will meet Python three ways. The **REPL** (`python3` with no arguments) evaluates one expression at a time and prints the result — ideal for questions like "what does `7 // 2` give me?". A **script** (`python3 app.py`) runs a file top to bottom. A **module** (`python3 -m http.server`) runs installed code by name.

The single most important habit is the **virtual environment**. `python3 -m venv .venv` creates an isolated interpreter and package directory; `source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows) puts it first on your `PATH`. Without one, `pip install` writes into your system Python and two projects wanting different versions of the same library will fight. Every project gets its own, always, and `.venv/` goes in `.gitignore`.

Declare dependencies in `pyproject.toml` rather than installing ad hoc, so the project can be rebuilt from a clean machine.

**Practice.**
Create a project directory with a virtual environment and a `pyproject.toml`. Write `greet.py` that prints a greeting, then run it three ways: directly, with `-m`, and by importing it in the REPL. Deactivate the environment and observe what breaks.

**Misconceptions.**
- "Python is not compiled." It is — to bytecode, cached in `__pycache__`. It is simply not compiled to machine code ahead of time.
- "I will make a venv when the project gets big." Dependency conflicts arrive on the second project, not the tenth.
- "`python` and `python3` are the same." On many systems `python` is either absent or Python 2. Be explicit.

**Questions.**
1. [recall] What are the three ways to invoke Python covered here, and when is each the right one?
2. [recall] What problem does a virtual environment solve that `pip install --user` does not?
3. [predict] A syntax error sits on the last line of a 100-line script. What happens when you run it? {The first 99 lines run, then it fails | Nothing runs — it fails before executing anything | The bad line is skipped} = 1
4. [recall] What is `__pycache__` and why should it not be committed?
5. [apply] Write the exact commands to create, activate and deactivate a virtual environment on your operating system.
6. [read] What does `python3 -m http.server` do? {Runs a file named http.server | Runs the installed http.server module as a script | Installs the http.server package} = 1
7. [recall] Why does `.venv/` belong in `.gitignore` when `pyproject.toml` does not?
8. [apply] You clone a project with a `pyproject.toml` and no `.venv`. What do you run to get working?
9. [recall] What does it mean that Python is dynamically typed but also strongly typed?

### Module 2 — Values, types and the numeric tower

> track: spine
> stage: values
> level: Beginner
> minutes: 30

**Learn.**
Every value in Python is an **object** with a type, an identity and a value. `type(x)` reports the first, `id(x)` the second. There are no primitives hiding underneath — `1` is a full `int` object with methods.

The built-in scalars are `int`, `float`, `bool`, `str`, `bytes`, `complex` and `NoneType`. `int` is arbitrary precision: `2 ** 1000` is exact, with no overflow. `float` is IEEE-754 double precision and therefore *approximate* — `0.1 + 0.2 == 0.3` is `False`, because none of those three are representable in binary. This is not a Python bug; it is what binary floating point is. For money use `decimal.Decimal`, for exact ratios use `fractions.Fraction`.

`bool` is a subclass of `int`: `True == 1` and `True + True == 2`. That is occasionally useful (`sum(flags)` counts them) and occasionally a trap.

`None` is a singleton meaning "no value". Test it with `is None`, never `== None`, because `==` can be overridden by a class while `is` compares identity.

Conversion is explicit: `int("42")`, `str(42)`, `float("3.5")`. Python will not silently coerce `"1" + 1` — it raises `TypeError`, which is the "strongly typed" half of "dynamically, strongly typed".

**Practice.**
Write a script demonstrating float imprecision, then fix the same calculation with `Decimal`. Show `2 ** 200` printing exactly. Prove `bool` is an `int` subclass with `isinstance`.

**Misconceptions.**
- "Floats are broken." They are exact binary fractions; decimal fractions like 0.1 have no finite binary form, just as 1/3 has none in decimal.
- "`is` and `==` are interchangeable." `is` compares identity. It appears to work for small integers only because CPython caches them.
- "`int` can overflow." It cannot. It grows to fit memory.

**Questions.**
1. [recall] What three things does every Python object have?
2. [predict] What does `0.1 + 0.2 == 0.3` evaluate to? {True | False | TypeError} = 1
3. [recall] Why is `Decimal` the right type for money and `float` the wrong one?
4. [predict] What is the value of `True + True`? {TypeError | 2 | True} = 1
5. [recall] Why must `None` be tested with `is` rather than `==`?
6. [read] What does `"1" + 1` raise, and what does that tell you about Python's typing? {Nothing, it gives "11" | Nothing, it gives 2 | TypeError, because Python is strongly typed} = 2
7. [apply] Compute 10% tax on $19.99 exactly, to the cent, and explain your type choice.
8. [recall] What is the difference between dynamic typing and weak typing?
9. [apply] Show why `a is b` can be `True` for `a = 256; b = 256` and `False` for `a = 257; b = 257`.

### Module 3 — Names, binding and mutability

> track: spine
> stage: bindings
> level: Beginner
> minutes: 30

**Learn.**
This is the module that decides whether Python surprises you for years. A variable in Python is not a box holding a value. It is a **name bound to an object**. `x = [1, 2]` creates a list and points the name `x` at it. `y = x` points a second name at *the same list* — it does not copy.

So `y.append(3)` changes what `x` sees, because there is one list with two names. But `y = y + [3]` builds a *new* list and rebinds `y`, leaving `x` untouched. Mutation versus rebinding is the whole distinction.

Types split into **mutable** (`list`, `dict`, `set`, most custom classes) and **immutable** (`int`, `float`, `str`, `tuple`, `frozenset`, `bytes`). Immutability means the object cannot change after creation — `s.upper()` returns a new string rather than modifying `s`.

This produces the most-reported Python "bug": the mutable default argument.

```python
def add(item, bucket=[]):   # evaluated ONCE, at definition
    bucket.append(item)
    return bucket
```

Every call without `bucket` shares one list, which grows forever. The fix is `bucket=None`, then `if bucket is None: bucket = []` inside.

Copying: `list(x)` or `x[:]` makes a **shallow** copy — a new outer list holding the same inner objects. `copy.deepcopy(x)` recurses.

**Practice.**
Write a function with a mutable default and call it three times to watch the bug. Fix it with the `None` sentinel. Then build a nested list, shallow-copy it, mutate an inner element, and show both copies changed.

**Misconceptions.**
- "Python passes by value / by reference." Neither. It passes the *object reference by value* — you can mutate the object but not rebind the caller's name.
- "`tuple` is deeply immutable." The tuple cannot be rebound, but a list *inside* it can still be mutated.
- "`=` copies." It never copies. It binds.

**Questions.**
1. [recall] Explain the difference between mutating an object and rebinding a name.
2. [predict] `x = [1]; y = x; y.append(2); print(x)` prints what? {[1] | [1, 2] | [2]} = 1
3. [predict] `x = [1]; y = x; y = y + [2]; print(x)` prints what? {[1] | [1, 2] | [2]} = 0
4. [recall] Why is a mutable default argument evaluated only once, and what is the correct fix?
5. [read] `t = ([1], 2)` — can you do `t[0].append(3)`? {No, tuples are immutable | Yes, the tuple holds a mutable list | Only with copy} = 1
6. [recall] What is the difference between a shallow and a deep copy?
7. [apply] Write a function that takes a list and returns a sorted copy without modifying the caller's list.
8. [apply] Given `a = {"k": [1]}`, produce a copy where mutating the inner list does not affect the original.
9. [recall] Why does `s.upper()` not change `s`?

### Module 4 — Operators, expressions and truthiness

> track: spine
> level: Beginner
> minutes: 25

**Learn.**
Arithmetic: `+ - * /` behave as expected, but `/` **always** yields a `float` — `4 / 2` is `2.0`. Use `//` for floor division and `%` for remainder. Both floor toward negative infinity, so `-7 // 2` is `-4`, not `-3`, and `-7 % 2` is `1`. `**` is exponentiation.

Comparison operators chain the way mathematics does: `0 <= x < 10` is one expression, evaluated efficiently, not `(0 <= x) < 10`.

Boolean operators `and`, `or`, `not` **short-circuit** and return an *operand*, not a bool. `a or b` returns `a` if `a` is truthy, otherwise `b` — which is why `name = user_name or "guest"` works as a default. Careful: it treats `0` and `""` as missing. When you mean "if not None", say so.

**Truthiness**: every object is usable in a boolean context. Falsy are `False`, `None`, `0`, `0.0`, `""`, `[]`, `{}`, `set()`, and anything whose `__len__` returns 0. Everything else is truthy. So `if items:` is the idiomatic empty check, not `if len(items) > 0:`.

The walrus `:=` assigns inside an expression: `if (n := len(data)) > 10:` binds and tests at once.

**Practice.**
Write a function normalising a user record that uses `or` for defaults, then find the input where that gives the wrong answer and fix it with an explicit `is None`.

**Misconceptions.**
- "`and`/`or` return booleans." They return one of their operands.
- "`-7 // 2` is `-3`." It floors, giving `-4`.
- "`if x:` and `if x is not None:` mean the same." They differ for `0`, `""` and `[]`.

**Questions.**
1. [predict] What does `4 / 2` evaluate to? {2 | 2.0 | TypeError} = 1
2. [predict] What does `-7 // 2` evaluate to? {-3 | -4 | -3.5} = 1
3. [recall] What does `a or b` actually return, and why does that make it useful for defaults?
4. [recall] List the falsy built-in values.
5. [read] `0 or "fallback"` gives what, and why is that a hazard for a quantity field? {0 | "fallback" | True} = 1
6. [apply] Rewrite `if len(items) > 0:` idiomatically.
7. [recall] What does the walrus operator do that plain assignment cannot?
8. [predict] Is `1 < 2 < 3` valid Python, and what does it mean? {Invalid syntax | True, chained comparison | (1<2)<3 which is True<3} = 1
9. [apply] Write a check that treats `0` as a real value but `None` as missing.

### Module 5 — Control flow

> track: spine
> stage: control-flow
> level: Beginner
> minutes: 30

**Learn.**
Python uses **indentation** for blocks — no braces. Four spaces per level, consistently; mixing tabs and spaces raises `TabError`.

`if` / `elif` / `else` needs no parentheses. There is no `switch`; since 3.10 there is `match`, which is structural pattern matching rather than a C-style switch — it destructures shapes, not just compares values.

`for` iterates over any **iterable**, not an index range. `for item in items:` is the idiom; reach for `range(len(items))` only when you genuinely need the index, and prefer `enumerate(items)` when you need both. `zip(a, b)` walks two sequences together and stops at the shorter.

`while` repeats until its condition goes false. `break` exits the nearest loop, `continue` skips to the next iteration.

Python's oddest control-flow feature is `for ... else`. The `else` runs when the loop finished *without* hitting `break` — useful for search: if nothing broke, nothing was found. Read it as "no-break", not "otherwise".

**Practice.**
Write a linear search using `for ... else` that reports both hit and miss without a flag variable. Then rewrite a nested `range(len(...))` loop using `enumerate` and `zip`.

**Misconceptions.**
- "`for ... else` runs if the loop body did not." It runs if the loop was not `break`-ed.
- "`for i in range(len(x))` is normal." It is a C habit; iterate the object.
- "Indentation is cosmetic." It is syntax.

**Questions.**
1. [recall] When does the `else` on a `for` loop execute?
2. [predict] `for i in range(3): pass` — how many iterations, and what is the last value of `i`? {3 iterations, i=3 | 3 iterations, i=2 | 4 iterations, i=3} = 1
3. [recall] What is the difference between `break` and `continue`?
4. [read] `list(zip([1,2,3], ["a","b"]))` gives what? {[(1,'a'),(2,'b'),(3,None)] | [(1,'a'),(2,'b')] | Error} = 1
5. [apply] Rewrite `for i in range(len(names)): print(i, names[i])` idiomatically.
6. [recall] How does `match` differ from a C-style `switch`?
7. [apply] Write a loop that finds the first negative number and reports "none found" without using a flag.
8. [recall] Why does mixing tabs and spaces raise an error rather than being tolerated?
9. [apply] Iterate two lists in parallel and stop cleanly when the shorter ends.

### Module 6 — Functions, arguments and scope

> track: spine
> stage: functions
> level: Beginner
> minutes: 35

**Learn.**
`def` creates a function object and binds a name to it. Functions are **first class**: pass them, return them, store them in lists.

Parameters come in kinds. Positional-or-keyword is the default. `*args` collects extra positionals into a tuple; `**kwargs` collects extra keywords into a dict. A bare `*` in the signature forces everything after it to be keyword-only — `def connect(host, *, timeout=30)` means `timeout` must be named, which stops `connect("db", 5)` from being ambiguous a year later. A `/` forces everything before it to be positional-only.

Default values are evaluated **once**, at definition time. See Module 3 for why that matters.

Scope follows **LEGB**: Local, Enclosing, Global, Built-in. Assigning to a name anywhere in a function makes it local *for the whole function*, which is why reading it before that assignment raises `UnboundLocalError` rather than falling back to the global. `global` and `nonlocal` opt out, and both are usually a smell.

Every function returns something; without a `return` it returns `None`.

Docstrings are the first statement in the body, available as `__doc__` and to `help()`.

**Practice.**
Write a `retry(fn, attempts=3, *, delay=1.0)` helper that takes a callable, retries it, and forces `delay` to be keyword-only. Add a docstring and full type hints.

**Misconceptions.**
- "`*args` means pointers." It means "collect the rest".
- "A function without `return` returns nothing." It returns `None`.
- "Reading a global inside a function always works." Not if you also assign that name in the function.

**Questions.**
1. [recall] What do `*args` and `**kwargs` collect, and what types are they?
2. [recall] What does a bare `*` in a parameter list do, and why would you want it?
3. [predict] A function with no `return` statement returns what? {None | 0 | Nothing at all} = 0
4. [recall] Spell out LEGB and what each level means.
5. [read] Assigning to a global name inside a function without declaring `global` causes what on an earlier read? {It reads the global | UnboundLocalError | SyntaxError} = 1
6. [apply] Write a signature where `host` is positional-only and `timeout` is keyword-only.
7. [recall] When are default argument values evaluated?
8. [apply] Write a function taking any number of numbers and returning their mean, handling the empty case.
9. [recall] What makes functions "first-class objects" in Python?

### Module 7 — Strings and text

> track: spine
> level: Beginner
> minutes: 30

**Learn.**
`str` is an immutable sequence of Unicode code points. Every method that "changes" a string returns a new one.

**f-strings** are the modern way to build text: `f"{name} scored {score:.1f}"`. The format spec after `:` controls width, precision, alignment and thousands separators — `f"{n:>8,.2f}"` right-aligns in 8 columns with commas and two decimals. `f"{value!r}"` inserts `repr()`, invaluable in logs because it shows quotes and escapes. Since 3.8, `f"{x=}"` prints `x=<value>`, which is the fastest debug print there is.

Slicing is `s[start:stop:step]`, `stop` exclusive. `s[::-1]` reverses.

Useful methods: `.strip()`, `.split()`, `.join()`, `.replace()`, `.startswith()`, `.casefold()` for case-insensitive comparison (stronger than `.lower()`).

Build strings from many pieces with `"".join(parts)`, not `+=` in a loop: strings are immutable, so `+=` copies the whole accumulated string each time, making the loop quadratic.

`str` versus `bytes`: text versus raw octets. Encode to go out (`s.encode("utf-8")`), decode to come in. Files opened in text mode do this for you; binary mode does not.

**Practice.**
Write a report formatter aligning names and right-aligned currency in columns using f-string specs. Then benchmark `+=` against `"".join` over 100,000 pieces.

**Misconceptions.**
- "Strings are mutable because `s += 'x'` works." That rebinds `s` to a new string.
- "`len(s)` is the number of characters." It is the number of code points; some user-perceived characters span several.
- "`.lower()` is enough for case-insensitive comparison." `.casefold()` handles cases like German `ß`.

**Questions.**
1. [recall] Why is `"".join(parts)` preferred over `+=` in a loop?
2. [read] What does `f"{3.14159:.2f}"` produce? {3.14 | 3.142 | 3.14159} = 0
3. [recall] What is the difference between `str` and `bytes`, and when do you convert?
4. [predict] What does `"hello"[::-1]` give? {"olleh" | "hello" | Error} = 0
5. [recall] What does `!r` do in an f-string, and why is it useful in logs?
6. [apply] Format a float as currency, right-aligned in 10 columns with thousands separators.
7. [recall] Why does `.casefold()` beat `.lower()` for comparison?
8. [apply] Split a CSV line, strip each field, and rejoin with tabs.
9. [read] `"abc"[1:]` gives what? {"ab" | "bc" | "abc"} = 1

### Module 8 — Lists, tuples, dicts and sets

> track: spine
> stage: data-structures
> level: Beginner
> minutes: 40

**Learn.**
Four built-ins carry most Python programs, and choosing the right one is most of the performance you will ever need.

**`list`** — ordered, mutable, indexable. Append and pop from the end are O(1); `insert(0, x)` and `pop(0)` are O(n) because everything shifts. Membership `x in lst` is O(n).

**`tuple`** — ordered, immutable. Cheaper, hashable if its contents are, and it signals "this is a fixed record" rather than "a collection I will grow".

**`dict`** — a hash map of keys to values, insertion-ordered since 3.7. Lookup, insert and delete are O(1) average. Keys must be **hashable**, which means effectively immutable — this is why a list cannot be a key but a tuple can.

**`set`** — an unordered collection of unique hashable items, with O(1) membership. Converting a list to a set to test membership in a loop turns O(n·m) into O(n+m), and it is the single most common easy win in beginner code.

Dict essentials: `d.get(k, default)` avoids `KeyError`; `d.setdefault(k, [])` fetches-or-creates; `collections.defaultdict(list)` does that automatically; `collections.Counter` counts occurrences in one line.

**Practice.**
Take a list of 10,000 records and write a function finding items whose id appears in a second list — first with a nested loop, then with a set. Time both. Then group records by category using `defaultdict`.

**Misconceptions.**
- "Dicts are unordered." Not since 3.7 — insertion order is guaranteed.
- "Tuples are just immutable lists." They are conventionally *records* with meaning per position.
- "`in` is fast." It is O(1) on sets and dicts, O(n) on lists.

**Questions.**
1. [recall] What is the complexity of `x in lst` versus `x in some_set`, and why?
2. [recall] What makes an object hashable, and why can't a list be a dict key?
3. [predict] `lst.insert(0, x)` on a 1,000,000-element list is roughly what cost? {O(1) | O(n), everything shifts | O(log n)} = 1
4. [read] What does `d.get("missing", 0)` do? {Raises KeyError | Returns 0 | Inserts 0} = 1
5. [apply] Group a list of `(category, item)` pairs into a dict of lists without writing an `if key not in` check.
6. [recall] When is a tuple the better choice than a list?
7. [apply] Rewrite a nested membership loop using a set and state the complexity change.
8. [recall] What does `collections.Counter` give you that a plain dict does not?
9. [predict] Are dict keys iterated in insertion order in Python 3.12? {Yes, guaranteed | No, arbitrary | Only if sorted} = 0

### Module 9 — Comprehensions and the iteration protocol

> track: spine
> level: Intermediate
> minutes: 30

**Learn.**
A comprehension builds a collection from an iterable in one expression: `[f(x) for x in xs if cond(x)]`. There are list, dict (`{k: v for ...}`), set (`{x for ...}`) and generator (`(x for ...)`) forms. They are faster than an append loop because the interpreter skips the repeated method lookup, and clearer *when they stay short*. A comprehension with three `for` clauses and two conditions is worse than the loop it replaced — that is the honest boundary.

Behind them sits the **iteration protocol**. `for` calls `iter(obj)` to get an iterator, then `next()` until `StopIteration`. Anything implementing `__iter__` works with `for`, unpacking, `in`, `zip`, `sorted` and the rest. This is why the same syntax walks a list, a file, a dict and a database cursor.

The generator form `(x*2 for x in big)` is **lazy**: it produces values on demand and holds one at a time, so it can run over a 10 GB file. `sum(x*2 for x in big)` never builds a list.

**Practice.**
Rewrite three nested-loop transformations as comprehensions, then deliberately write one so dense you would reject it in review and convert it back. Read a large file's line lengths with a generator and confirm memory stays flat.

**Misconceptions.**
- "Comprehensions are always better." Past two clauses, readability loses.
- "A generator expression is a tuple comprehension." There is no tuple comprehension; parentheses give a generator.
- "You can reuse a generator." It is exhausted after one pass.

**Questions.**
1. [recall] Which two methods make an object iterable and drive a `for` loop?
2. [predict] `g = (x for x in range(3)); list(g); list(g)` — what is the second result? {[0,1,2] | [] | Error} = 1
3. [recall] Why can a generator process a file larger than memory?
4. [read] `{x: x**2 for x in range(3)}` produces what? {A set | A dict | A generator} = 1
5. [apply] Convert a nested loop that filters and transforms into a single comprehension.
6. [recall] When should a comprehension be rewritten as an explicit loop?
7. [recall] What exception ends iteration, and who raises it?
8. [apply] Sum the squares of a million numbers without allocating a million-element list.
9. [recall] Why is there no tuple comprehension?

### Module 10 — Modules, packages and imports

> track: spine
> stage: composition
> level: Intermediate
> minutes: 30

**Learn.**
A **module** is a `.py` file; a **package** is a directory of modules, conventionally with `__init__.py`. `import x` binds the module object to `x`; `from x import y` binds `y` directly.

Import runs the module's top-level code **once** per process, then caches it in `sys.modules`. That is why module-level side effects are dangerous: importing something should not open a database connection.

`if __name__ == "__main__":` distinguishes "run directly" from "imported". When run directly `__name__` is `"__main__"`; when imported it is the module's name. Put your entry point behind it so importing your script does not execute it.

Prefer **absolute imports** (`from myapp.models import User`) over relative ones. Relative imports (`from .models import User`) work inside a package but break when a file is run directly.

**Circular imports** happen when two modules import each other. The real fix is almost always a design one — extract the shared piece into a third module — rather than moving the import inside a function.

`sys.path` determines where imports are searched. Manipulating it in code is a smell; installing your project (`pip install -e .`) is the correct answer.

**Practice.**
Restructure a single 400-line script into a package with `models`, `services` and `cli` modules, an entry point behind the `__main__` guard, and absolute imports. Install it editable and run it by module name.

**Misconceptions.**
- "Import runs the file every time." It runs once and caches.
- "`__init__.py` is required." Not since 3.3 (namespace packages), but it is still the clearer default.
- "Circular imports are fixed by importing inside functions." That hides a structural problem.

**Questions.**
1. [recall] What is the difference between a module and a package?
2. [predict] Importing the same module in three files runs its top-level code how many times? {Three | Once | Once per function} = 1
3. [recall] What does `if __name__ == "__main__":` accomplish?
4. [read] What is `sys.modules` for? {The list of installed packages | The cache of already-imported modules | The import search path} = 1
5. [recall] Why prefer absolute imports over relative ones?
6. [apply] Given two modules importing each other, describe the structural fix.
7. [recall] Why is module-level I/O a problem?
8. [apply] Lay out a package with models, services and a CLI entry point.
9. [recall] What does `pip install -e .` do and why is it better than editing `sys.path`?

### Module 11 — Errors and exceptions

> track: spine
> stage: errors
> level: Intermediate
> minutes: 35

**Learn.**
Exceptions are Python's error channel. Raise with `raise ValueError("msg")`, handle with `try` / `except` / `else` / `finally`.

Catch **narrowly**. `except Exception:` swallows bugs you needed to see; bare `except:` also catches `KeyboardInterrupt` and `SystemExit`, so Ctrl-C stops working. Catch the exception you can actually handle.

The four clauses each have a job. `try` holds the risky call — as few lines as possible. `except` handles a specific failure. `else` runs only when nothing was raised, keeping the success path out of the `try`. `finally` always runs, even through a `return` or an exception, which is where cleanup lives.

**Chaining** preserves the cause. `raise ValueError("bad config") from err` keeps the original traceback, which is what makes production failures diagnosable. A bare `raise` inside `except` re-raises unchanged.

Define your own hierarchy for a library — a base `AppError`, with specific subclasses — so callers can catch at whatever granularity suits them.

EAFP ("easier to ask forgiveness than permission") is idiomatic Python: try the operation and handle failure, rather than checking every precondition first. It is also race-free, where a check-then-act is not.

**Practice.**
Write a config loader raising a custom `ConfigError` chained from the underlying `OSError` or `JSONDecodeError`. Prove `finally` runs on the `return` path. Then find code with `except Exception: pass` and narrow it.

**Misconceptions.**
- "Exceptions are for exceptional cases only." Python uses them for ordinary control flow, e.g. `StopIteration`.
- "`finally` is skipped if you return in `try`." It runs first.
- "`except Exception` catches everything." It misses `KeyboardInterrupt` and `SystemExit`, which inherit from `BaseException`.

**Questions.**
1. [recall] What does each of `try`, `except`, `else` and `finally` do?
2. [predict] A `return` inside `try` with a `finally` present — does `finally` run? {No | Yes, before returning | Only on exception} = 1
3. [recall] Why is bare `except:` harmful?
4. [read] What does `raise X from err` preserve? {Nothing extra | The original exception as the cause | The stack depth} = 1
5. [recall] What does EAFP mean, and why is it race-free where check-then-act is not?
6. [apply] Write a custom exception hierarchy for a library with a shared base class.
7. [recall] Which base class do `KeyboardInterrupt` and `SystemExit` inherit from, and why does it matter?
8. [apply] Rewrite `if os.path.exists(p): open(p)` in EAFP style and explain the race it removes.
9. [recall] When should you re-raise rather than handle?

### Module 12 — Files, paths and context managers

> track: spine
> level: Intermediate
> minutes: 30

**Learn.**
Always use `with` for files: `with open(p, encoding="utf-8") as f:`. The context manager closes the handle on the way out, including when an exception unwinds — a bare `open()` leaks handles until the garbage collector happens to run, and on CPython that is soon but not guaranteed.

**Always pass `encoding`.** Without it Python uses a platform default, so code that works on your Linux machine mangles text on a Windows one. `encoding="utf-8"` is the answer almost always.

Text mode decodes to `str` and translates newlines; binary mode (`"rb"`) gives raw `bytes`. Read a large file by iterating it (`for line in f:`) rather than `.read()`, which pulls the whole thing into memory.

`pathlib.Path` replaces string path juggling. `Path("data") / "raw" / "x.csv"` composes with `/`, works on every OS, and carries `.exists()`, `.read_text()`, `.mkdir(parents=True, exist_ok=True)` and `.glob()`. Prefer it to `os.path` in new code.

Write your own context manager with `contextlib.contextmanager`: everything before `yield` is setup, everything after is teardown that runs even on exception.

**Practice.**
Write a `Path`-based function that walks a directory tree, reads every `.txt` with explicit encoding, and returns total word counts — streaming, never loading a whole file. Add a `@contextmanager` timer that reports elapsed time even when the body raises.

**Misconceptions.**
- "CPython closes files for me." Refcounting usually does, promptly-ish. It is not a guarantee, and not true on other implementations.
- "Encoding defaults are fine." They are platform-dependent and a classic cross-OS bug.
- "`pathlib` is just sugar." It removes a whole class of separator and quoting bugs.

**Questions.**
1. [recall] What does `with` guarantee that a bare `open()` does not?
2. [recall] Why should `encoding` always be passed explicitly?
3. [predict] `for line in f:` versus `f.read().split("\n")` on a 5 GB file — which survives? {Both | Only the iteration | Only read()} = 1
4. [read] What does `Path("a") / "b"` produce? {The string "a/b" | A Path for a/b, OS-correct | A division error} = 1
5. [recall] What is the difference between text and binary mode?
6. [apply] Write a context manager that times its block and reports even if the block raises.
7. [recall] Which two methods must a class implement to be a context manager?
8. [apply] Recursively find every `.json` under a directory using `pathlib`.
9. [recall] Why is `.read()` on an unknown-sized file risky?

### Module 13 — Classes, dataclasses and the object model

> track: spine
> level: Intermediate
> minutes: 40

**Learn.**
`class` defines a type. `__init__` initialises an instance — it is not a constructor; `__new__` allocates, and you rarely touch it. `self` is the instance, passed explicitly, which is why it appears in every method signature.

Attributes live in two places. **Instance attributes** (`self.x = 1`) are per object. **Class attributes** sit on the class and are shared — which is fine for constants and a bug for mutable defaults, exactly as with default arguments.

Methods come in three kinds. Regular methods take `self`. `@classmethod` takes `cls` and is the idiomatic alternative constructor (`User.from_json(...)`). `@staticmethod` takes neither and is really just a function living in a namespace.

Prefer **composition** to inheritance. Inherit when there is a genuine "is-a" relationship *and* you want the base's behaviour; otherwise hold a reference. Deep hierarchies are where Python codebases go to die.

`@dataclass` removes the boilerplate for classes that mostly carry data: it generates `__init__`, `__repr__` and `__eq__`. `frozen=True` makes instances immutable and hashable. `field(default_factory=list)` is the correct way to default a mutable attribute.

Properties turn a method into an attribute: `@property` for the getter, `@x.setter` for validation. They let you add computation later without changing callers.

**Practice.**
Model an `Order` with `@dataclass`, a `Decimal` total computed as a `@property`, a `from_dict` classmethod, and a frozen `Money` value type. Then take a three-level inheritance chain and flatten it with composition.

**Misconceptions.**
- "`__init__` is the constructor." It initialises an already-allocated object.
- "Class attributes are per-instance defaults." They are shared; mutating one mutates it for all.
- "`self` is magic." It is an ordinary first parameter, named by convention.

**Questions.**
1. [recall] Difference between an instance attribute and a class attribute?
2. [predict] A mutable class attribute mutated through one instance affects what? {Only that instance | Every instance | Nothing} = 1
3. [recall] When is `@classmethod` the right choice over `@staticmethod`?
4. [read] What does `@dataclass` generate for you? {Only __init__ | __init__, __repr__ and __eq__ | Nothing, it is a type hint} = 1
5. [recall] Why is `field(default_factory=list)` required instead of `= []`?
6. [apply] Add validation to an existing public attribute without breaking callers.
7. [recall] Give a concrete test for choosing inheritance over composition.
8. [apply] Write an immutable, hashable value type with `@dataclass`.
9. [recall] What does `frozen=True` change about a dataclass?

### Module 14 — Dunder methods and the data model

> track: spine
> level: Intermediate
> minutes: 30

**Learn.**
Python's "magic" is a published protocol. Operators and built-ins delegate to **dunder** methods, so your types can participate in the language rather than sitting outside it.

`__repr__` should be unambiguous and, ideally, `eval`-able — it is what you see in a debugger and a traceback. `__str__` is the human-facing form. If you write only one, write `__repr__`; `str()` falls back to it.

`__eq__` defines `==`. Define `__hash__` alongside it whenever instances go in sets or dict keys — defining `__eq__` alone sets `__hash__` to `None` and makes the type unhashable, which is deliberate: two objects that compare equal must hash equal.

`__len__`, `__getitem__`, `__contains__` and `__iter__` make a class behave like a container. `__enter__`/`__exit__` make it a context manager. `__call__` makes an instance callable.

`__slots__` replaces the per-instance `__dict__` with a fixed layout, cutting memory substantially for classes instantiated in the millions — at the cost of dynamic attributes.

**Practice.**
Build a `Vector` supporting `+`, `*`, `==`, `len()`, indexing and iteration, with a correct `__repr__`. Then measure memory of a million instances with and without `__slots__`.

**Misconceptions.**
- "Dunders are private internals." They are the public extension protocol.
- "`__str__` is enough." Debuggers and logs use `__repr__`.
- "Defining `__eq__` is harmless." It silently makes your type unhashable.

**Questions.**
1. [recall] What is the difference in purpose between `__repr__` and `__str__`?
2. [predict] Defining `__eq__` without `__hash__` makes instances what? {Still hashable | Unhashable | Immutable} = 1
3. [recall] Which dunders make an object work in a `for` loop?
4. [read] What does `__call__` enable? {Calling the class | Calling an instance like a function | Class construction} = 1
5. [recall] What does `__slots__` trade away for its memory saving?
6. [apply] Implement `+` for a value type without mutating either operand.
7. [recall] Why must equal objects hash equal?
8. [apply] Make a class usable with `with`.
9. [recall] If you write only one of the two string dunders, which and why?

### Module 15 — Type hints and static checking

> track: spine
> level: Intermediate
> minutes: 30

**Learn.**
Annotations describe intent: `def total(items: list[Item]) -> Decimal:`. Python does **not** enforce them at runtime — they are metadata. Their value comes from `mypy` or `pyright`, which read them and reject mismatches before the code runs, and from editors, which use them for completion and navigation.

Modern syntax is built in: `list[int]`, `dict[str, int]`, `int | None`. The old `typing.List` and `Optional[int]` still work but are no longer needed.

`Optional[X]` is exactly `X | None`. Being explicit about nullability is where type checkers pay for themselves — most production `AttributeError`s are a `None` nobody expected.

Useful vocabulary: `Any` (opt out, use sparingly), `Sequence`/`Iterable`/`Mapping` for parameters — accept the widest type you can and return the most specific. `TypedDict` for JSON-shaped dicts, `Protocol` for structural typing ("anything with a `.read()`"), `Literal` for fixed value sets, and `TypeVar`/generics for containers.

Adopt gradually: annotate new code and module boundaries first, run `mypy` in CI, and tighten settings over time. `strict = true` on a fresh module is realistic; on a legacy one it is a wall.

**Practice.**
Annotate an existing module fully and run `mypy --strict` until clean. Replace a loosely typed dict parameter with a `TypedDict`, then define a `Protocol` for a dependency and check that two unrelated classes satisfy it.

**Misconceptions.**
- "Type hints slow Python down." They are not evaluated at runtime in normal use.
- "Hints guarantee correctness." Only a checker does, and only for what it can see.
- "`Any` is a safe default." It disables checking wherever it spreads.

**Questions.**
1. [recall] Does the interpreter enforce annotations? What enforces them?
2. [read] What is `Optional[int]` equivalent to in modern syntax? {int | None | list[int] | Any} = 0
3. [recall] Why accept `Iterable` in a parameter but return `list`?
4. [predict] `def f(x: int) -> int: ...` called as `f("a")` at runtime does what? {TypeError immediately | Runs; only a checker objects | SyntaxError} = 1
5. [recall] What problem does `Protocol` solve that a base class does not?
6. [apply] Type a function returning either a parsed record or `None`, and show the caller narrowing it.
7. [recall] When is `TypedDict` the right tool?
8. [apply] Describe a realistic order for adopting types in an untyped codebase.
9. [recall] What is the danger of scattering `Any`?

### Module 16 — The standard library worth knowing

> track: spine
> level: Intermediate
> minutes: 30

**Learn.**
Python ships with enough to avoid most dependencies. Knowing what is already there is a genuine skill.

`collections` — `defaultdict`, `Counter`, `deque` (O(1) at both ends, unlike a list), `namedtuple`. `itertools` — `chain`, `groupby` (requires sorted input, a classic trap), `islice`, `product`, `combinations`. `functools` — `lru_cache` for memoisation, `partial`, `wraps` for writing decorators, `reduce`.

`datetime` — and its one rule: store and compute in **UTC**, convert to local only for display. Use timezone-aware objects (`datetime.now(timezone.utc)`); naive datetimes silently compare wrong. `zoneinfo` provides the tz database with no dependency.

`json` for serialisation, with `default=` for types it does not know. `re` for regular expressions — compile them once at module level when used repeatedly. `logging` rather than `print` for anything long-lived. `argparse` for CLIs. `dataclasses`, `enum`, `decimal`, `statistics`, `secrets` (never `random`) for tokens, `hashlib`, `subprocess`, `sqlite3`, `unittest`, `tempfile`.

**Practice.**
Rewrite a script that hand-rolls counting, grouping and memoisation using `Counter`, `groupby` and `lru_cache`. Then find every naive `datetime` in a codebase and make it timezone-aware.

**Misconceptions.**
- "You need `pandas` to count things." `Counter` and `defaultdict` cover a great deal.
- "`itertools.groupby` groups a list." It groups *consecutive* runs; sort first.
- "`random` is fine for tokens." Use `secrets`.

**Questions.**
1. [recall] What does `collections.deque` do better than `list`, and where?
2. [predict] `itertools.groupby` on unsorted input gives what? {Correct groups | Fragmented consecutive runs | An error} = 1
3. [recall] Why store datetimes in UTC?
4. [read] What does `functools.lru_cache` do? {Limits recursion | Caches results by arguments | Frees memory} = 1
5. [recall] Why `secrets` rather than `random` for tokens?
6. [apply] Count word frequencies and return the top five in two lines.
7. [recall] What is `functools.wraps` for?
8. [apply] Replace a hand-written memo dict with `lru_cache` and note the behaviour difference.
9. [recall] Name three standard-library modules that remove a common third-party dependency.

### Module 17 — Iterators, generators and laziness

> track: spine
> level: Advanced
> minutes: 35

**Learn.**
A **generator function** contains `yield`. Calling it runs no code — it returns a generator object. Each `next()` runs to the next `yield` and suspends, keeping local state on a frame that stays alive between calls. That suspension is the whole idea.

This buys **laziness**: values are produced on demand, so a pipeline over a 100 GB file holds one record at a time. Chain generators into stages — read, parse, filter, transform — and each stage pulls from the one before. Memory stays flat regardless of input size.

`yield from` delegates to a sub-generator, flattening nested iteration.

Generators are also **single-pass and stateful**. Once exhausted they stay exhausted; if you need two passes, materialise with `list()` or build it twice. A generator passed to two consumers will surprise the second.

`itertools.tee` duplicates a stream, but buffers whatever the slower consumer has not read — occasionally the right tool, often a memory leak.

Beyond iteration, generators underpin coroutines: `async def` is built on the same suspend-and-resume machinery.

**Practice.**
Build a three-stage generator pipeline over a large log file — parse, filter errors, extract fields — and confirm memory stays flat with `tracemalloc`. Then hit the double-consumption bug deliberately and fix it.

**Misconceptions.**
- "A generator runs when called." It runs on first `next()`.
- "Generators are just lazy lists." They cannot be indexed, re-iterated or measured with `len()`.
- "`return` in a generator returns a value." It ends iteration; the value rides on `StopIteration`.

**Questions.**
1. [recall] What happens when you *call* a generator function?
2. [predict] Iterating an exhausted generator a second time yields what? {The same values | Nothing | An error} = 1
3. [recall] How does a generator pipeline keep memory flat over a huge file?
4. [read] What does `yield from` do? {Returns a list | Delegates to a sub-generator | Ends the generator} = 1
5. [recall] Why can't you call `len()` on a generator?
6. [apply] Convert a function that builds and returns a large list into a generator.
7. [recall] What does `itertools.tee` cost you?
8. [apply] Write a pipeline reading a file, filtering, and summing — without materialising anything.
9. [recall] How do generators relate to `async def`?

### Module 18 — Closures and decorators

> track: spine
> level: Advanced
> minutes: 35

**Learn.**
A **closure** is a function that captures names from an enclosing scope and keeps them alive after that scope returns. The captured variable is a live reference, not a snapshot — which is why building closures in a loop and expecting each to capture that iteration's value is a classic bug. Bind it with a default argument (`lambda x=x: ...`) to snapshot it.

A **decorator** is a function taking a function and returning a replacement. `@log` is exactly `f = log(f)`. Because the replacement is a different object, always apply `functools.wraps` — without it the decorated function loses its `__name__`, `__doc__` and signature, and every tool that introspects it breaks.

A decorator with arguments needs one more layer: a factory that takes the arguments and returns the actual decorator. Three levels of nesting, which is why they are worth writing carefully and reading slowly.

Decorators are how `@property`, `@staticmethod`, `@lru_cache`, `@dataclass` and most web frameworks' routing work. Use them for genuine cross-cutting concerns — logging, timing, retry, caching, access control — and not for business logic, which becomes invisible when hidden behind one.

**Practice.**
Write `@retry(times=3, delay=0.5)` with correct `wraps`, preserving the signature. Then write a timing decorator and stack them, confirming the order in which they apply.

**Misconceptions.**
- "Decorators run at call time." The decoration happens at definition; the wrapper runs at call.
- "`wraps` is cosmetic." Without it, introspection, docs and some frameworks break.
- "Closures capture values." They capture variables.

**Questions.**
1. [recall] What is `@dec` shorthand for?
2. [predict] Closures created in a `for` loop capture what? {Each iteration's value | The final value of the variable | Nothing} = 1
3. [recall] What does `functools.wraps` preserve, and what breaks without it?
4. [read] How many nested functions does a decorator *with arguments* need? {One | Two | Three} = 2
5. [recall] Name three standard decorators and what each does.
6. [apply] Write a decorator that retries on exception with a configurable count.
7. [recall] When does decoration happen relative to calling?
8. [apply] Fix a loop-created closure so each captures its own value.
9. [recall] What belongs in a decorator, and what does not?

### Module 19 — Concurrency: threads, processes and asyncio

> track: spine
> level: Advanced
> minutes: 45

**Learn.**
Choosing wrongly here costs more than any other decision in this path, and the choice follows from one question: **is the work I/O-bound or CPU-bound?**

The **GIL** (Global Interpreter Lock) lets only one thread execute Python bytecode at a time in CPython. So threads do *not* speed up CPU-bound work — they add overhead. But the GIL is released during I/O, so threads are genuinely effective for network calls, disk reads and database queries.

- **I/O-bound, moderate concurrency** → `threading` or `concurrent.futures.ThreadPoolExecutor`.
- **I/O-bound, very high concurrency** → `asyncio`. One thread, an event loop, thousands of sockets. `async def` defines a coroutine; `await` suspends it and lets the loop run others. The rule that matters: **one blocking call poisons the whole loop**, because there is only one thread. Use async-native libraries throughout, or push blocking work to `run_in_executor`.
- **CPU-bound** → `multiprocessing` or `ProcessPoolExecutor`. Separate processes, separate interpreters, real parallelism — at the cost of process startup and pickling everything across the boundary.

Shared mutable state across threads needs a `Lock`. Better still, share nothing: pass data through `queue.Queue`, which is already thread-safe.

Python 3.13 ships an experimental free-threaded build without the GIL. It is not yet the default, and the guidance above still holds for production.

**Practice.**
Take a script fetching 100 URLs serially and rewrite it three ways: thread pool, asyncio with `gather`, and process pool. Time all four. Explain why the process pool is slowest here and would be fastest for hashing those payloads.

**Misconceptions.**
- "Threads make Python parallel." Not for CPU work, because of the GIL.
- "asyncio is faster than threads." It scales further for I/O; it is not inherently faster, and it is worse for CPU work.
- "One blocking call in async is fine." It stalls every other coroutine on that loop.

**Questions.**
1. [recall] What is the GIL and which workloads does it constrain?
2. [predict] A CPU-bound task across 4 threads in CPython runs how fast versus 1 thread? {~4× faster | About the same or slower | 2× faster} = 1
3. [recall] When is `asyncio` the right choice over a thread pool?
4. [read] What does one blocking call inside a coroutine do? {Blocks only that coroutine | Stalls the whole event loop | Raises an error} = 1
5. [recall] What does `multiprocessing` cost you that threading does not?
6. [apply] Decide the model for: 500 concurrent HTTP requests; hashing 10,000 files; one slow database query.
7. [recall] Why is `queue.Queue` preferable to a shared list with a lock?
8. [apply] Convert a serial I/O loop to `asyncio.gather` and say what could go wrong.
9. [recall] What does `await` actually do to the current coroutine?

### Module 20 — Testing, linting and the quality toolchain

> track: spine
> stage: tooling
> level: Advanced
> minutes: 40

**Learn.**
**pytest** is the standard. Tests are plain functions named `test_*` using bare `assert` — pytest rewrites assertions to show the actual values on failure, so no assertion vocabulary is needed. `@pytest.fixture` provides reusable setup with teardown after `yield`. `@pytest.mark.parametrize` runs one test over many inputs, which is where most of the value is: the same test body against twenty cases.

Test **behaviour, not implementation**. A test asserting internal call order breaks on every refactor while proving nothing about correctness. Assert on outputs and observable effects.

Mock at boundaries only — the network, the clock, the filesystem — with `unittest.mock` or `monkeypatch`. Mocking your own code usually means the design needs a seam, not a mock.

Coverage (`pytest --cov`) shows what was *executed*, not what was *verified*. 100% coverage with no assertions proves nothing. Treat it as a map of untested areas, not a target.

Around tests sit the rest: **ruff** (linting and formatting, fast, replaces flake8/isort/black for most projects), **mypy** or **pyright** for types, **pre-commit** to run all of it before a commit lands, and CI to run it again where it cannot be skipped. Add `pytest-cov`, `hypothesis` for property-based testing, and `tox`/`nox` when you must support several Python versions.

**Practice.**
Take an untested module to meaningful coverage with parametrised tests. Add a fixture with teardown, mock exactly one external call, and wire ruff + mypy + pytest into pre-commit and CI.

**Misconceptions.**
- "100% coverage means tested." It means executed.
- "Mock everything for isolation." Over-mocked tests assert that your mocks work.
- "Formatting is bikeshedding." Automating it ends the argument permanently.

**Questions.**
1. [recall] Why does pytest let you use bare `assert`?
2. [recall] What does `@pytest.mark.parametrize` give you over a loop inside one test?
3. [predict] A test asserting internal call order does what during a refactor? {Passes | Breaks without indicating a real defect | Catches the bug} = 1
4. [read] What does coverage actually measure? {Lines verified by assertions | Lines executed during tests | Branches proven correct} = 1
5. [recall] Where is mocking appropriate, and where is it a design signal?
6. [apply] Write a fixture providing a temporary database and cleaning it up afterwards.
7. [recall] What does `ruff` replace, and why does that matter?
8. [apply] Describe a CI pipeline for a typed, tested Python package.
9. [recall] What is property-based testing good at that example-based testing is not?

### Module 21 — Performance, profiling and memory

> track: spine
> level: Advanced
> minutes: 35

**Learn.**
**Measure first.** Intuition about Python performance is unreliable; the bottleneck is regularly somewhere nobody suspected. `cProfile` gives per-function call counts and cumulative time — start there to find *where*. `timeit` measures a small snippet accurately, handling warm-up and repetition. `tracemalloc` attributes memory to the lines that allocated it. Line-level tools (`line_profiler`, `memory_profiler`) narrow it further.

Then apply the wins in order of size:

1. **Better algorithm or data structure.** Turning an O(n²) membership scan into a set lookup beats every micro-optimisation combined.
2. **Do less work.** Cache with `lru_cache`, avoid recomputation, filter earlier in the pipeline.
3. **Move the loop out of Python.** NumPy, or a library whose inner loop is C.
4. **Micro-optimise.** Local-variable lookup beats attribute lookup; `join` beats `+=`. Only worth it in a hot loop you have measured.
5. **Leave Python for the hot path.** C extension, Cython, or a Rust module via PyO3.

On memory: every object carries overhead — a small `int` is 28 bytes, an empty `dict` around 64. `__slots__` cuts per-instance cost. Generators avoid materialising intermediates. Reference cycles are collected by the cyclic GC, but a cycle holding a large buffer stays alive until it runs.

**Practice.**
Profile a deliberately slow script, identify the real bottleneck, and fix it algorithmically. Record before-and-after timings. Then use `tracemalloc` to find a leak caused by an ever-growing module-level cache.

**Misconceptions.**
- "I know where the slow part is." Profile; you frequently do not.
- "Micro-optimising helps." Not compared to fixing the complexity class.
- "Python has no GC beyond refcounting." It also has a cyclic collector.

**Questions.**
1. [recall] What is the correct first step in any optimisation, and why?
2. [recall] What does `cProfile` tell you that `timeit` does not?
3. [predict] Which yields more: replacing a list scan with a set, or rewriting a loop with local variables? {The set | The locals | Equal} = 0
4. [read] What does `tracemalloc` report? {CPU time | Memory allocation by line | Call counts} = 1
5. [recall] How does `__slots__` reduce memory?
6. [apply] Describe how you would find and fix an unbounded module-level cache.
7. [recall] Why does CPython need a cyclic collector on top of refcounting?
8. [apply] Given a profile where 90% of time is in one function, what do you check first?
9. [recall] Name the optimisation strategies in order of typical payoff.

### Module 22 — Packaging and distribution

> track: spine
> level: Advanced
> minutes: 30

**Learn.**
`pyproject.toml` is the single modern configuration file — project metadata, dependencies, build backend, and usually the settings for ruff, mypy and pytest too. It replaced `setup.py`, `setup.cfg` and `requirements.txt` for most projects.

Distinguish **applications** from **libraries**. An application pins exact versions for reproducibility (a lock file). A library declares permissive ranges, because pinning in a library forces conflicts on everyone who depends on it.

Two artefacts: a **wheel** (`.whl`, pre-built, installs fast, preferred) and an **sdist** (`.tar.gz`, source, needs a build step). Publish both. `python -m build` produces them; `twine upload` publishes; test against TestPyPI first.

Version with **semantic versioning**: major for breaking, minor for additions, patch for fixes. Once published, a version is immutable — publish a new one rather than replacing.

Entry points in `pyproject.toml` create console commands, so `pip install yourtool` yields a `yourtool` executable.

Tooling: `pip` plus `venv` is the baseline; `uv` is dramatically faster and increasingly standard; `pipx` installs applications in isolation; `poetry`/`pdm` bundle dependency resolution with packaging.

**Practice.**
Package a project with full `pyproject.toml` metadata, a console entry point, and classifiers. Build both artefacts, install the wheel into a clean venv, and confirm the command works. Publish to TestPyPI.

**Misconceptions.**
- "`requirements.txt` is still the standard." It is for pinned application deployments, not for declaring a package.
- "Pin everything, always." Pinning in a library breaks downstream resolution.
- "A wheel and an sdist are interchangeable." A wheel skips the build; an sdist does not.

**Questions.**
1. [recall] What does `pyproject.toml` replace?
2. [recall] Why do libraries use ranges where applications pin?
3. [read] What is the difference between a wheel and an sdist? {None | Wheel is pre-built, sdist needs building | Wheel is source} = 1
4. [predict] Can you re-upload a fixed version 1.2.0 to PyPI? {Yes, it overwrites | No, versions are immutable | Only within 24h} = 1
5. [recall] What does semantic versioning communicate in each position?
6. [apply] Add a console entry point so installing gives a runnable command.
7. [recall] What is TestPyPI for?
8. [apply] Decide the dependency strategy for a library and for a deployed service.
9. [recall] What does `pipx` solve that `pip install` does not?

### Module 23 — CPython internals worth understanding

> track: spine
> level: Advanced
> minutes: 30

**Learn.**
You do not need to read CPython's source, but a few internals explain behaviour you will otherwise find arbitrary.

**Everything is an object**, including functions, classes and modules. Attribute lookup on an instance checks the instance `__dict__`, then the class, then the MRO. The **MRO** (method resolution order, C3 linearisation) is why multiple inheritance resolves deterministically and why `super()` follows the MRO rather than jumping to a parent.

**Memory** is reference counting plus a cyclic collector. When a refcount hits zero the object is freed immediately — which is why CPython usually closes files promptly — and the cycle collector handles the rest, in generations.

**Interning**: small integers (−5 to 256) and some strings are cached, which is exactly why `is` appears to work on small numbers and then betrays you at 257.

**Bytecode**: source compiles to bytecode, cached in `__pycache__`. `dis.dis(fn)` shows it, which occasionally settles a performance argument outright.

**Descriptors** are the mechanism behind `@property`, methods and `@classmethod`: an object defining `__get__` on a class controls what attribute access returns. Knowing the name makes the docs readable.

The `__dict__` on every instance is why arbitrary attributes work and why `__slots__` saves memory by removing it.

**Practice.**
Use `dis` to compare bytecode for a comprehension versus an append loop. Build a diamond inheritance and print `__mro__`. Demonstrate interning with `is` at 256 and 257, and explain it.

**Misconceptions.**
- "CPython is the language." It is one implementation; PyPy, MicroPython and others differ.
- "`is` compares values." It compares identity; interning makes it look otherwise.
- "`super()` calls the parent class." It calls the next class in the MRO.

**Questions.**
1. [recall] What is the MRO and what problem does it solve?
2. [predict] `a = 257; b = 257; a is b` — reliably True? {Always True | Not guaranteed | Always False} = 1
3. [recall] What are the two halves of CPython's memory management?
4. [read] What does `dis.dis(fn)` show? {Source | Bytecode | Machine code} = 1
5. [recall] What are descriptors, and which familiar features rest on them?
6. [apply] Explain a diamond inheritance resolution using `__mro__`.
7. [recall] Why does `__slots__` save memory, in terms of internals?
8. [apply] Show a case where relying on interning produces a bug.
9. [recall] What does `super()` actually do?

### Module 24 — Production concerns

> track: spine
> level: Advanced
> minutes: 35

**Learn.**
Code that runs on your machine and code that runs in production differ in observability, configuration and failure handling.

**Logging, not print.** `logging` gives levels, timestamps, module names and configurable destinations. Configure once at the entry point; get a module logger with `logging.getLogger(__name__)` so the hierarchy matches your package. Prefer **structured** logs (JSON) in production so they can be queried. Never log secrets, tokens or full request bodies.

**Configuration from the environment**, never hard-coded. Secrets come from the environment or a secret manager and never from the repository — `.env` for local development, gitignored. Validate configuration at startup and fail loudly: a service that boots with a missing setting and dies on the first request is worse than one that refuses to start.

**Security basics.** Never `eval` or `exec` untrusted input. Never build SQL by string concatenation — use parameterised queries. `pickle` executes arbitrary code on load, so never unpickle untrusted data. Use `secrets` for tokens. Pin and audit dependencies (`pip-audit`). Validate all external input at the boundary.

**Failure handling.** Time out every network call — a request with no timeout can hang forever. Retry with exponential backoff and jitter, but only idempotent operations. Add a circuit breaker for a dependency that is down. Make handlers idempotent so a retry cannot double-charge.

**Health and shutdown.** Expose a health endpoint. Handle `SIGTERM` to drain work before exiting, or an orchestrator will kill you mid-request.

**Practice.**
Take a script using `print` and hard-coded settings and make it production-shaped: structured logging, environment configuration validated at startup, timeouts and backoff on every outbound call, and graceful `SIGTERM` shutdown.

**Misconceptions.**
- "`print` is fine, I redirect it." You lose levels, timestamps, structure and routing.
- "Retries make things reliable." Retrying a non-idempotent write duplicates it.
- "`pickle` is a serialisation format." It is arbitrary code execution.

**Questions.**
1. [recall] What does `logging` provide that `print` does not?
2. [recall] Why should configuration be validated at startup rather than on first use?
3. [predict] An HTTP call with no timeout can do what? {Fail fast | Hang indefinitely | Retry automatically} = 1
4. [read] Why is `pickle` unsafe on untrusted data? {It is slow | Loading executes arbitrary code | It loses types} = 1
5. [recall] Which operations are safe to retry, and which are not?
6. [apply] Configure a module logger correctly for a package with several modules.
7. [recall] How do you prevent SQL injection in Python, concretely?
8. [apply] Describe graceful shutdown on `SIGTERM` for a worker mid-job.
9. [recall] Name three things that must never appear in logs.
