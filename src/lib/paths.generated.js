/**
 * GENERATED — do not edit by hand.
 * Source: content/learn/*.md  ·  Rebuild: node scripts/build-learn.mjs
 *
 * 112 modules and 658 questions across 7 language paths.
 *
 * Authored + validated from source: python
 * Legacy, carried forward from the previous bundle (pre-dates the
 * validation in build-learn.mjs; questions here are plain strings):
 *   c, cpp, java, javascript, typescript, sql
 */

export const PATHS = {
  "python": {
    "title": "Python",
    "blurb": "Target modern Python 3.12+. Work in isolated virtual environments, declare projects with `pyproject.toml`, and lean on a formatter, a linter, a type checker and pytest from the first module rather than bolting them on later.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "The toolchain and your first program",
            "track": "spine",
            "stage": "toolchain",
            "level": "Beginner",
            "prereq": [],
            "minutes": 25,
            "learn": "Python is an *interpreted* language: the `python` command reads your source, compiles it to bytecode, and runs that bytecode on a virtual machine. Nothing is compiled ahead of time, which is why a syntax error three functions down still lets the first two run — until the interpreter reaches it.\n\nInstall from python.org or your package manager, then confirm with `python3 --version`. You will meet Python three ways. The **REPL** (`python3` with no arguments) evaluates one expression at a time and prints the result — ideal for questions like \"what does `7 // 2` give me?\". A **script** (`python3 app.py`) runs a file top to bottom. A **module** (`python3 -m http.server`) runs installed code by name.\n\nThe single most important habit is the **virtual environment**. `python3 -m venv .venv` creates an isolated interpreter and package directory; `source .venv/bin/activate` (or `.venv\\Scripts\\activate` on Windows) puts it first on your `PATH`. Without one, `pip install` writes into your system Python and two projects wanting different versions of the same library will fight. Every project gets its own, always, and `.venv/` goes in `.gitignore`.\n\nDeclare dependencies in `pyproject.toml` rather than installing ad hoc, so the project can be rebuilt from a clean machine.",
            "practice": "Create a project directory with a virtual environment and a `pyproject.toml`. Write `greet.py` that prints a greeting, then run it three ways: directly, with `-m`, and by importing it in the REPL. Deactivate the environment and observe what breaks.",
            "misconceptions": [
              "\"Python is not compiled.\" It is — to bytecode, cached in `__pycache__`. It is simply not compiled to machine code ahead of time.",
              "\"I will make a venv when the project gets big.\" Dependency conflicts arrive on the second project, not the tenth.",
              "\"`python` and `python3` are the same.\" On many systems `python` is either absent or Python 2. Be explicit."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What are the three ways to invoke Python covered here, and when is each the right one?"
              },
              {
                "kind": "recall",
                "prompt": "What problem does a virtual environment solve that `pip install --user` does not?"
              },
              {
                "kind": "predict",
                "prompt": "A syntax error sits on the last line of a 100-line script. What happens when you run it?",
                "choices": [
                  "The first 99 lines run, then it fails",
                  "Nothing runs — it fails before executing anything",
                  "The bad line is skipped"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What is `__pycache__` and why should it not be committed?"
              },
              {
                "kind": "apply",
                "prompt": "Write the exact commands to create, activate and deactivate a virtual environment on your operating system."
              },
              {
                "kind": "read",
                "prompt": "What does `python3 -m http.server` do?",
                "choices": [
                  "Runs a file named http.server",
                  "Runs the installed http.server module as a script",
                  "Installs the http.server package"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why does `.venv/` belong in `.gitignore` when `pyproject.toml` does not?"
              },
              {
                "kind": "apply",
                "prompt": "You clone a project with a `pyproject.toml` and no `.venv`. What do you run to get working?"
              },
              {
                "kind": "recall",
                "prompt": "What does it mean that Python is dynamically typed but also strongly typed?"
              }
            ]
          },
          {
            "number": 2,
            "title": "Values, types and the numeric tower",
            "track": "spine",
            "stage": "values",
            "level": "Beginner",
            "prereq": [],
            "minutes": 30,
            "learn": "Every value in Python is an **object** with a type, an identity and a value. `type(x)` reports the first, `id(x)` the second. There are no primitives hiding underneath — `1` is a full `int` object with methods.\n\nThe built-in scalars are `int`, `float`, `bool`, `str`, `bytes`, `complex` and `NoneType`. `int` is arbitrary precision: `2 ** 1000` is exact, with no overflow. `float` is IEEE-754 double precision and therefore *approximate* — `0.1 + 0.2 == 0.3` is `False`, because none of those three are representable in binary. This is not a Python bug; it is what binary floating point is. For money use `decimal.Decimal`, for exact ratios use `fractions.Fraction`.\n\n`bool` is a subclass of `int`: `True == 1` and `True + True == 2`. That is occasionally useful (`sum(flags)` counts them) and occasionally a trap.\n\n`None` is a singleton meaning \"no value\". Test it with `is None`, never `== None`, because `==` can be overridden by a class while `is` compares identity.\n\nConversion is explicit: `int(\"42\")`, `str(42)`, `float(\"3.5\")`. Python will not silently coerce `\"1\" + 1` — it raises `TypeError`, which is the \"strongly typed\" half of \"dynamically, strongly typed\".",
            "practice": "Write a script demonstrating float imprecision, then fix the same calculation with `Decimal`. Show `2 ** 200` printing exactly. Prove `bool` is an `int` subclass with `isinstance`.",
            "misconceptions": [
              "\"Floats are broken.\" They are exact binary fractions; decimal fractions like 0.1 have no finite binary form, just as 1/3 has none in decimal.",
              "\"`is` and `==` are interchangeable.\" `is` compares identity. It appears to work for small integers only because CPython caches them.",
              "\"`int` can overflow.\" It cannot. It grows to fit memory."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What three things does every Python object have?"
              },
              {
                "kind": "predict",
                "prompt": "What does `0.1 + 0.2 == 0.3` evaluate to?",
                "choices": [
                  "True",
                  "False",
                  "TypeError"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why is `Decimal` the right type for money and `float` the wrong one?"
              },
              {
                "kind": "predict",
                "prompt": "What is the value of `True + True`?",
                "choices": [
                  "TypeError",
                  "2",
                  "True"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why must `None` be tested with `is` rather than `==`?"
              },
              {
                "kind": "read",
                "prompt": "What does `\"1\" + 1` raise, and what does that tell you about Python's typing?",
                "choices": [
                  "Nothing, it gives \"11\"",
                  "Nothing, it gives 2",
                  "TypeError, because Python is strongly typed"
                ],
                "answer": 2
              },
              {
                "kind": "apply",
                "prompt": "Compute 10% tax on $19.99 exactly, to the cent, and explain your type choice."
              },
              {
                "kind": "recall",
                "prompt": "What is the difference between dynamic typing and weak typing?"
              },
              {
                "kind": "apply",
                "prompt": "Show why `a is b` can be `True` for `a = 256; b = 256` and `False` for `a = 257; b = 257`."
              }
            ]
          },
          {
            "number": 3,
            "title": "Names, binding and mutability",
            "track": "spine",
            "stage": "bindings",
            "level": "Beginner",
            "prereq": [],
            "minutes": 30,
            "learn": "This is the module that decides whether Python surprises you for years. A variable in Python is not a box holding a value. It is a **name bound to an object**. `x = [1, 2]` creates a list and points the name `x` at it. `y = x` points a second name at *the same list* — it does not copy.\n\nSo `y.append(3)` changes what `x` sees, because there is one list with two names. But `y = y + [3]` builds a *new* list and rebinds `y`, leaving `x` untouched. Mutation versus rebinding is the whole distinction.\n\nTypes split into **mutable** (`list`, `dict`, `set`, most custom classes) and **immutable** (`int`, `float`, `str`, `tuple`, `frozenset`, `bytes`). Immutability means the object cannot change after creation — `s.upper()` returns a new string rather than modifying `s`.\n\nThis produces the most-reported Python \"bug\": the mutable default argument.\n\n```python\ndef add(item, bucket=[]):   # evaluated ONCE, at definition\n    bucket.append(item)\n    return bucket\n```\n\nEvery call without `bucket` shares one list, which grows forever. The fix is `bucket=None`, then `if bucket is None: bucket = []` inside.\n\nCopying: `list(x)` or `x[:]` makes a **shallow** copy — a new outer list holding the same inner objects. `copy.deepcopy(x)` recurses.",
            "practice": "Write a function with a mutable default and call it three times to watch the bug. Fix it with the `None` sentinel. Then build a nested list, shallow-copy it, mutate an inner element, and show both copies changed.",
            "misconceptions": [
              "\"Python passes by value / by reference.\" Neither. It passes the *object reference by value* — you can mutate the object but not rebind the caller's name.",
              "\"`tuple` is deeply immutable.\" The tuple cannot be rebound, but a list *inside* it can still be mutated.",
              "\"`=` copies.\" It never copies. It binds."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Explain the difference between mutating an object and rebinding a name."
              },
              {
                "kind": "predict",
                "prompt": "`x = [1]; y = x; y.append(2); print(x)` prints what?",
                "choices": [
                  "[1]",
                  "[1, 2]",
                  "[2]"
                ],
                "answer": 1
              },
              {
                "kind": "predict",
                "prompt": "`x = [1]; y = x; y = y + [2]; print(x)` prints what?",
                "choices": [
                  "[1]",
                  "[1, 2]",
                  "[2]"
                ],
                "answer": 0
              },
              {
                "kind": "recall",
                "prompt": "Why is a mutable default argument evaluated only once, and what is the correct fix?"
              },
              {
                "kind": "read",
                "prompt": "`t = ([1], 2)` — can you do `t[0].append(3)`?",
                "choices": [
                  "No, tuples are immutable",
                  "Yes, the tuple holds a mutable list",
                  "Only with copy"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What is the difference between a shallow and a deep copy?"
              },
              {
                "kind": "apply",
                "prompt": "Write a function that takes a list and returns a sorted copy without modifying the caller's list."
              },
              {
                "kind": "apply",
                "prompt": "Given `a = {\"k\": [1]}`, produce a copy where mutating the inner list does not affect the original."
              },
              {
                "kind": "recall",
                "prompt": "Why does `s.upper()` not change `s`?"
              }
            ]
          },
          {
            "number": 4,
            "title": "Operators, expressions and truthiness",
            "track": "spine",
            "stage": null,
            "level": "Beginner",
            "prereq": [],
            "minutes": 25,
            "learn": "Arithmetic: `+ - * /` behave as expected, but `/` **always** yields a `float` — `4 / 2` is `2.0`. Use `//` for floor division and `%` for remainder. Both floor toward negative infinity, so `-7 // 2` is `-4`, not `-3`, and `-7 % 2` is `1`. `**` is exponentiation.\n\nComparison operators chain the way mathematics does: `0 <= x < 10` is one expression, evaluated efficiently, not `(0 <= x) < 10`.\n\nBoolean operators `and`, `or`, `not` **short-circuit** and return an *operand*, not a bool. `a or b` returns `a` if `a` is truthy, otherwise `b` — which is why `name = user_name or \"guest\"` works as a default. Careful: it treats `0` and `\"\"` as missing. When you mean \"if not None\", say so.",
            "practice": "Write a function normalising a user record that uses `or` for defaults, then find the input where that gives the wrong answer and fix it with an explicit `is None`.",
            "misconceptions": [
              "\"`and`/`or` return booleans.\" They return one of their operands.",
              "\"`-7 // 2` is `-3`.\" It floors, giving `-4`.",
              "\"`if x:` and `if x is not None:` mean the same.\" They differ for `0`, `\"\"` and `[]`."
            ],
            "questions": [
              {
                "kind": "predict",
                "prompt": "What does `4 / 2` evaluate to?",
                "choices": [
                  "2",
                  "2.0",
                  "TypeError"
                ],
                "answer": 1
              },
              {
                "kind": "predict",
                "prompt": "What does `-7 // 2` evaluate to?",
                "choices": [
                  "-3",
                  "-4",
                  "-3.5"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does `a or b` actually return, and why does that make it useful for defaults?"
              },
              {
                "kind": "recall",
                "prompt": "List the falsy built-in values."
              },
              {
                "kind": "read",
                "prompt": "`0 or \"fallback\"` gives what, and why is that a hazard for a quantity field?",
                "choices": [
                  "0",
                  "\"fallback\"",
                  "True"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Rewrite `if len(items) > 0:` idiomatically."
              },
              {
                "kind": "recall",
                "prompt": "What does the walrus operator do that plain assignment cannot?"
              },
              {
                "kind": "predict",
                "prompt": "Is `1 < 2 < 3` valid Python, and what does it mean?",
                "choices": [
                  "Invalid syntax",
                  "True, chained comparison",
                  "(1<2)<3 which is True<3"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Write a check that treats `0` as a real value but `None` as missing."
              }
            ]
          },
          {
            "number": 5,
            "title": "Control flow",
            "track": "spine",
            "stage": "control-flow",
            "level": "Beginner",
            "prereq": [],
            "minutes": 30,
            "learn": "Python uses **indentation** for blocks — no braces. Four spaces per level, consistently; mixing tabs and spaces raises `TabError`.\n\n`if` / `elif` / `else` needs no parentheses. There is no `switch`; since 3.10 there is `match`, which is structural pattern matching rather than a C-style switch — it destructures shapes, not just compares values.\n\n`for` iterates over any **iterable**, not an index range. `for item in items:` is the idiom; reach for `range(len(items))` only when you genuinely need the index, and prefer `enumerate(items)` when you need both. `zip(a, b)` walks two sequences together and stops at the shorter.\n\n`while` repeats until its condition goes false. `break` exits the nearest loop, `continue` skips to the next iteration.\n\nPython's oddest control-flow feature is `for ... else`. The `else` runs when the loop finished *without* hitting `break` — useful for search: if nothing broke, nothing was found. Read it as \"no-break\", not \"otherwise\".",
            "practice": "Write a linear search using `for ... else` that reports both hit and miss without a flag variable. Then rewrite a nested `range(len(...))` loop using `enumerate` and `zip`.",
            "misconceptions": [
              "\"`for ... else` runs if the loop body did not.\" It runs if the loop was not `break`-ed.",
              "\"`for i in range(len(x))` is normal.\" It is a C habit; iterate the object.",
              "\"Indentation is cosmetic.\" It is syntax."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "When does the `else` on a `for` loop execute?"
              },
              {
                "kind": "predict",
                "prompt": "`for i in range(3): pass` — how many iterations, and what is the last value of `i`?",
                "choices": [
                  "3 iterations, i=3",
                  "3 iterations, i=2",
                  "4 iterations, i=3"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What is the difference between `break` and `continue`?"
              },
              {
                "kind": "read",
                "prompt": "`list(zip([1,2,3], [\"a\",\"b\"]))` gives what?",
                "choices": [
                  "[(1,'a'),(2,'b'),(3,None)]",
                  "[(1,'a'),(2,'b')]",
                  "Error"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Rewrite `for i in range(len(names)): print(i, names[i])` idiomatically."
              },
              {
                "kind": "recall",
                "prompt": "How does `match` differ from a C-style `switch`?"
              },
              {
                "kind": "apply",
                "prompt": "Write a loop that finds the first negative number and reports \"none found\" without using a flag."
              },
              {
                "kind": "recall",
                "prompt": "Why does mixing tabs and spaces raise an error rather than being tolerated?"
              },
              {
                "kind": "apply",
                "prompt": "Iterate two lists in parallel and stop cleanly when the shorter ends."
              }
            ]
          },
          {
            "number": 6,
            "title": "Functions, arguments and scope",
            "track": "spine",
            "stage": "functions",
            "level": "Beginner",
            "prereq": [],
            "minutes": 35,
            "learn": "`def` creates a function object and binds a name to it. Functions are **first class**: pass them, return them, store them in lists.\n\nParameters come in kinds. Positional-or-keyword is the default. `*args` collects extra positionals into a tuple; `**kwargs` collects extra keywords into a dict. A bare `*` in the signature forces everything after it to be keyword-only — `def connect(host, *, timeout=30)` means `timeout` must be named, which stops `connect(\"db\", 5)` from being ambiguous a year later. A `/` forces everything before it to be positional-only.\n\nDefault values are evaluated **once**, at definition time. See Module 3 for why that matters.\n\nScope follows **LEGB**: Local, Enclosing, Global, Built-in. Assigning to a name anywhere in a function makes it local *for the whole function*, which is why reading it before that assignment raises `UnboundLocalError` rather than falling back to the global. `global` and `nonlocal` opt out, and both are usually a smell.\n\nEvery function returns something; without a `return` it returns `None`.\n\nDocstrings are the first statement in the body, available as `__doc__` and to `help()`.",
            "practice": "Write a `retry(fn, attempts=3, *, delay=1.0)` helper that takes a callable, retries it, and forces `delay` to be keyword-only. Add a docstring and full type hints.",
            "misconceptions": [
              "\"`*args` means pointers.\" It means \"collect the rest\".",
              "\"A function without `return` returns nothing.\" It returns `None`.",
              "\"Reading a global inside a function always works.\" Not if you also assign that name in the function."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What do `*args` and `**kwargs` collect, and what types are they?"
              },
              {
                "kind": "recall",
                "prompt": "What does a bare `*` in a parameter list do, and why would you want it?"
              },
              {
                "kind": "predict",
                "prompt": "A function with no `return` statement returns what?",
                "choices": [
                  "None",
                  "0",
                  "Nothing at all"
                ],
                "answer": 0
              },
              {
                "kind": "recall",
                "prompt": "Spell out LEGB and what each level means."
              },
              {
                "kind": "read",
                "prompt": "Assigning to a global name inside a function without declaring `global` causes what on an earlier read?",
                "choices": [
                  "It reads the global",
                  "UnboundLocalError",
                  "SyntaxError"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Write a signature where `host` is positional-only and `timeout` is keyword-only."
              },
              {
                "kind": "recall",
                "prompt": "When are default argument values evaluated?"
              },
              {
                "kind": "apply",
                "prompt": "Write a function taking any number of numbers and returning their mean, handling the empty case."
              },
              {
                "kind": "recall",
                "prompt": "What makes functions \"first-class objects\" in Python?"
              }
            ]
          },
          {
            "number": 7,
            "title": "Strings and text",
            "track": "spine",
            "stage": null,
            "level": "Beginner",
            "prereq": [],
            "minutes": 30,
            "learn": "`str` is an immutable sequence of Unicode code points. Every method that \"changes\" a string returns a new one.",
            "practice": "Write a report formatter aligning names and right-aligned currency in columns using f-string specs. Then benchmark `+=` against `\"\".join` over 100,000 pieces.",
            "misconceptions": [
              "\"Strings are mutable because `s += 'x'` works.\" That rebinds `s` to a new string.",
              "\"`len(s)` is the number of characters.\" It is the number of code points; some user-perceived characters span several.",
              "\"`.lower()` is enough for case-insensitive comparison.\" `.casefold()` handles cases like German `ß`."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Why is `\"\".join(parts)` preferred over `+=` in a loop?"
              },
              {
                "kind": "read",
                "prompt": "What does `f\"",
                "choices": [
                  "3.14159:.2f}\"` produce? {3.14",
                  "3.142",
                  "3.14159"
                ],
                "answer": 0
              },
              {
                "kind": "recall",
                "prompt": "What is the difference between `str` and `bytes`, and when do you convert?"
              },
              {
                "kind": "predict",
                "prompt": "What does `\"hello\"[::-1]` give?",
                "choices": [
                  "\"olleh\"",
                  "\"hello\"",
                  "Error"
                ],
                "answer": 0
              },
              {
                "kind": "recall",
                "prompt": "What does `!r` do in an f-string, and why is it useful in logs?"
              },
              {
                "kind": "apply",
                "prompt": "Format a float as currency, right-aligned in 10 columns with thousands separators."
              },
              {
                "kind": "recall",
                "prompt": "Why does `.casefold()` beat `.lower()` for comparison?"
              },
              {
                "kind": "apply",
                "prompt": "Split a CSV line, strip each field, and rejoin with tabs."
              },
              {
                "kind": "read",
                "prompt": "`\"abc\"[1:]` gives what?",
                "choices": [
                  "\"ab\"",
                  "\"bc\"",
                  "\"abc\""
                ],
                "answer": 1
              }
            ]
          },
          {
            "number": 8,
            "title": "Lists, tuples, dicts and sets",
            "track": "spine",
            "stage": "data-structures",
            "level": "Beginner",
            "prereq": [],
            "minutes": 40,
            "learn": "Four built-ins carry most Python programs, and choosing the right one is most of the performance you will ever need.",
            "practice": "Take a list of 10,000 records and write a function finding items whose id appears in a second list — first with a nested loop, then with a set. Time both. Then group records by category using `defaultdict`.",
            "misconceptions": [
              "\"Dicts are unordered.\" Not since 3.7 — insertion order is guaranteed.",
              "\"Tuples are just immutable lists.\" They are conventionally *records* with meaning per position.",
              "\"`in` is fast.\" It is O(1) on sets and dicts, O(n) on lists."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the complexity of `x in lst` versus `x in some_set`, and why?"
              },
              {
                "kind": "recall",
                "prompt": "What makes an object hashable, and why can't a list be a dict key?"
              },
              {
                "kind": "predict",
                "prompt": "`lst.insert(0, x)` on a 1,000,000-element list is roughly what cost?",
                "choices": [
                  "O(1)",
                  "O(n), everything shifts",
                  "O(log n)"
                ],
                "answer": 1
              },
              {
                "kind": "read",
                "prompt": "What does `d.get(\"missing\", 0)` do?",
                "choices": [
                  "Raises KeyError",
                  "Returns 0",
                  "Inserts 0"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Group a list of `(category, item)` pairs into a dict of lists without writing an `if key not in` check."
              },
              {
                "kind": "recall",
                "prompt": "When is a tuple the better choice than a list?"
              },
              {
                "kind": "apply",
                "prompt": "Rewrite a nested membership loop using a set and state the complexity change."
              },
              {
                "kind": "recall",
                "prompt": "What does `collections.Counter` give you that a plain dict does not?"
              },
              {
                "kind": "predict",
                "prompt": "Are dict keys iterated in insertion order in Python 3.12?",
                "choices": [
                  "Yes, guaranteed",
                  "No, arbitrary",
                  "Only if sorted"
                ],
                "answer": 0
              }
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a command-line expense tracker. Subcommands, `dataclass` models, `Decimal` money, JSON persistence, input validation with useful error messages, full type hints, pytest coverage of the money maths, and an installable local package."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 9,
            "title": "Comprehensions and the iteration protocol",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "A comprehension builds a collection from an iterable in one expression: `[f(x) for x in xs if cond(x)]`. There are list, dict (`{k: v for ...}`), set (`{x for ...}`) and generator (`(x for ...)`) forms. They are faster than an append loop because the interpreter skips the repeated method lookup, and clearer *when they stay short*. A comprehension with three `for` clauses and two conditions is worse than the loop it replaced — that is the honest boundary.\n\nBehind them sits the **iteration protocol**. `for` calls `iter(obj)` to get an iterator, then `next()` until `StopIteration`. Anything implementing `__iter__` works with `for`, unpacking, `in`, `zip`, `sorted` and the rest. This is why the same syntax walks a list, a file, a dict and a database cursor.\n\nThe generator form `(x*2 for x in big)` is **lazy**: it produces values on demand and holds one at a time, so it can run over a 10 GB file. `sum(x*2 for x in big)` never builds a list.",
            "practice": "Rewrite three nested-loop transformations as comprehensions, then deliberately write one so dense you would reject it in review and convert it back. Read a large file's line lengths with a generator and confirm memory stays flat.",
            "misconceptions": [
              "\"Comprehensions are always better.\" Past two clauses, readability loses.",
              "\"A generator expression is a tuple comprehension.\" There is no tuple comprehension; parentheses give a generator.",
              "\"You can reuse a generator.\" It is exhausted after one pass."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Which two methods make an object iterable and drive a `for` loop?"
              },
              {
                "kind": "predict",
                "prompt": "`g = (x for x in range(3)); list(g); list(g)` — what is the second result?",
                "choices": [
                  "[0,1,2]",
                  "[]",
                  "Error"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why can a generator process a file larger than memory?"
              },
              {
                "kind": "read",
                "prompt": "`",
                "choices": [
                  "x: x**2 for x in range(3)}` produces what? {A set",
                  "A dict",
                  "A generator"
                ],
                "answer": 1
              },
              {
                "kind": "apply",
                "prompt": "Convert a nested loop that filters and transforms into a single comprehension."
              },
              {
                "kind": "recall",
                "prompt": "When should a comprehension be rewritten as an explicit loop?"
              },
              {
                "kind": "recall",
                "prompt": "What exception ends iteration, and who raises it?"
              },
              {
                "kind": "apply",
                "prompt": "Sum the squares of a million numbers without allocating a million-element list."
              },
              {
                "kind": "recall",
                "prompt": "Why is there no tuple comprehension?"
              }
            ]
          },
          {
            "number": 10,
            "title": "Modules, packages and imports",
            "track": "spine",
            "stage": "composition",
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "A **module** is a `.py` file; a **package** is a directory of modules, conventionally with `__init__.py`. `import x` binds the module object to `x`; `from x import y` binds `y` directly.\n\nImport runs the module's top-level code **once** per process, then caches it in `sys.modules`. That is why module-level side effects are dangerous: importing something should not open a database connection.\n\n`if __name__ == \"__main__\":` distinguishes \"run directly\" from \"imported\". When run directly `__name__` is `\"__main__\"`; when imported it is the module's name. Put your entry point behind it so importing your script does not execute it.\n\nPrefer **absolute imports** (`from myapp.models import User`) over relative ones. Relative imports (`from .models import User`) work inside a package but break when a file is run directly.",
            "practice": "Restructure a single 400-line script into a package with `models`, `services` and `cli` modules, an entry point behind the `__main__` guard, and absolute imports. Install it editable and run it by module name.",
            "misconceptions": [
              "\"Import runs the file every time.\" It runs once and caches.",
              "\"`__init__.py` is required.\" Not since 3.3 (namespace packages), but it is still the clearer default.",
              "\"Circular imports are fixed by importing inside functions.\" That hides a structural problem."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the difference between a module and a package?"
              },
              {
                "kind": "predict",
                "prompt": "Importing the same module in three files runs its top-level code how many times?",
                "choices": [
                  "Three",
                  "Once",
                  "Once per function"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does `if __name__ == \"__main__\":` accomplish?"
              },
              {
                "kind": "read",
                "prompt": "What is `sys.modules` for?",
                "choices": [
                  "The list of installed packages",
                  "The cache of already-imported modules",
                  "The import search path"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why prefer absolute imports over relative ones?"
              },
              {
                "kind": "apply",
                "prompt": "Given two modules importing each other, describe the structural fix."
              },
              {
                "kind": "recall",
                "prompt": "Why is module-level I/O a problem?"
              },
              {
                "kind": "apply",
                "prompt": "Lay out a package with models, services and a CLI entry point."
              },
              {
                "kind": "recall",
                "prompt": "What does `pip install -e .` do and why is it better than editing `sys.path`?"
              }
            ]
          },
          {
            "number": 11,
            "title": "Errors and exceptions",
            "track": "spine",
            "stage": "errors",
            "level": "Intermediate",
            "prereq": [],
            "minutes": 35,
            "learn": "Exceptions are Python's error channel. Raise with `raise ValueError(\"msg\")`, handle with `try` / `except` / `else` / `finally`.\n\nCatch **narrowly**. `except Exception:` swallows bugs you needed to see; bare `except:` also catches `KeyboardInterrupt` and `SystemExit`, so Ctrl-C stops working. Catch the exception you can actually handle.\n\nThe four clauses each have a job. `try` holds the risky call — as few lines as possible. `except` handles a specific failure. `else` runs only when nothing was raised, keeping the success path out of the `try`. `finally` always runs, even through a `return` or an exception, which is where cleanup lives.",
            "practice": "Write a config loader raising a custom `ConfigError` chained from the underlying `OSError` or `JSONDecodeError`. Prove `finally` runs on the `return` path. Then find code with `except Exception: pass` and narrow it.",
            "misconceptions": [
              "\"Exceptions are for exceptional cases only.\" Python uses them for ordinary control flow, e.g. `StopIteration`.",
              "\"`finally` is skipped if you return in `try`.\" It runs first.",
              "\"`except Exception` catches everything.\" It misses `KeyboardInterrupt` and `SystemExit`, which inherit from `BaseException`."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What does each of `try`, `except`, `else` and `finally` do?"
              },
              {
                "kind": "predict",
                "prompt": "A `return` inside `try` with a `finally` present — does `finally` run?",
                "choices": [
                  "No",
                  "Yes, before returning",
                  "Only on exception"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why is bare `except:` harmful?"
              },
              {
                "kind": "read",
                "prompt": "What does `raise X from err` preserve?",
                "choices": [
                  "Nothing extra",
                  "The original exception as the cause",
                  "The stack depth"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does EAFP mean, and why is it race-free where check-then-act is not?"
              },
              {
                "kind": "apply",
                "prompt": "Write a custom exception hierarchy for a library with a shared base class."
              },
              {
                "kind": "recall",
                "prompt": "Which base class do `KeyboardInterrupt` and `SystemExit` inherit from, and why does it matter?"
              },
              {
                "kind": "apply",
                "prompt": "Rewrite `if os.path.exists(p): open(p)` in EAFP style and explain the race it removes."
              },
              {
                "kind": "recall",
                "prompt": "When should you re-raise rather than handle?"
              }
            ]
          },
          {
            "number": 12,
            "title": "Files, paths and context managers",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "Always use `with` for files: `with open(p, encoding=\"utf-8\") as f:`. The context manager closes the handle on the way out, including when an exception unwinds — a bare `open()` leaks handles until the garbage collector happens to run, and on CPython that is soon but not guaranteed.",
            "practice": "Write a `Path`-based function that walks a directory tree, reads every `.txt` with explicit encoding, and returns total word counts — streaming, never loading a whole file. Add a `@contextmanager` timer that reports elapsed time even when the body raises.",
            "misconceptions": [
              "\"CPython closes files for me.\" Refcounting usually does, promptly-ish. It is not a guarantee, and not true on other implementations.",
              "\"Encoding defaults are fine.\" They are platform-dependent and a classic cross-OS bug.",
              "\"`pathlib` is just sugar.\" It removes a whole class of separator and quoting bugs."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What does `with` guarantee that a bare `open()` does not?"
              },
              {
                "kind": "recall",
                "prompt": "Why should `encoding` always be passed explicitly?"
              },
              {
                "kind": "predict",
                "prompt": "`for line in f:` versus `f.read().split(\"\\n\")` on a 5 GB file — which survives?",
                "choices": [
                  "Both",
                  "Only the iteration",
                  "Only read()"
                ],
                "answer": 1
              },
              {
                "kind": "read",
                "prompt": "What does `Path(\"a\") / \"b\"` produce?",
                "choices": [
                  "The string \"a/b\"",
                  "A Path for a/b, OS-correct",
                  "A division error"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What is the difference between text and binary mode?"
              },
              {
                "kind": "apply",
                "prompt": "Write a context manager that times its block and reports even if the block raises."
              },
              {
                "kind": "recall",
                "prompt": "Which two methods must a class implement to be a context manager?"
              },
              {
                "kind": "apply",
                "prompt": "Recursively find every `.json` under a directory using `pathlib`."
              },
              {
                "kind": "recall",
                "prompt": "Why is `.read()` on an unknown-sized file risky?"
              }
            ]
          },
          {
            "number": 13,
            "title": "Classes, dataclasses and the object model",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 40,
            "learn": "`class` defines a type. `__init__` initialises an instance — it is not a constructor; `__new__` allocates, and you rarely touch it. `self` is the instance, passed explicitly, which is why it appears in every method signature.\n\nAttributes live in two places. **Instance attributes** (`self.x = 1`) are per object. **Class attributes** sit on the class and are shared — which is fine for constants and a bug for mutable defaults, exactly as with default arguments.\n\nMethods come in three kinds. Regular methods take `self`. `@classmethod` takes `cls` and is the idiomatic alternative constructor (`User.from_json(...)`). `@staticmethod` takes neither and is really just a function living in a namespace.\n\nPrefer **composition** to inheritance. Inherit when there is a genuine \"is-a\" relationship *and* you want the base's behaviour; otherwise hold a reference. Deep hierarchies are where Python codebases go to die.\n\n`@dataclass` removes the boilerplate for classes that mostly carry data: it generates `__init__`, `__repr__` and `__eq__`. `frozen=True` makes instances immutable and hashable. `field(default_factory=list)` is the correct way to default a mutable attribute.\n\nProperties turn a method into an attribute: `@property` for the getter, `@x.setter` for validation. They let you add computation later without changing callers.",
            "practice": "Model an `Order` with `@dataclass`, a `Decimal` total computed as a `@property`, a `from_dict` classmethod, and a frozen `Money` value type. Then take a three-level inheritance chain and flatten it with composition.",
            "misconceptions": [
              "\"`__init__` is the constructor.\" It initialises an already-allocated object.",
              "\"Class attributes are per-instance defaults.\" They are shared; mutating one mutates it for all.",
              "\"`self` is magic.\" It is an ordinary first parameter, named by convention."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Difference between an instance attribute and a class attribute?"
              },
              {
                "kind": "predict",
                "prompt": "A mutable class attribute mutated through one instance affects what?",
                "choices": [
                  "Only that instance",
                  "Every instance",
                  "Nothing"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "When is `@classmethod` the right choice over `@staticmethod`?"
              },
              {
                "kind": "read",
                "prompt": "What does `@dataclass` generate for you?",
                "choices": [
                  "Only __init__",
                  "__init__, __repr__ and __eq__",
                  "Nothing, it is a type hint"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why is `field(default_factory=list)` required instead of `= []`?"
              },
              {
                "kind": "apply",
                "prompt": "Add validation to an existing public attribute without breaking callers."
              },
              {
                "kind": "recall",
                "prompt": "Give a concrete test for choosing inheritance over composition."
              },
              {
                "kind": "apply",
                "prompt": "Write an immutable, hashable value type with `@dataclass`."
              },
              {
                "kind": "recall",
                "prompt": "What does `frozen=True` change about a dataclass?"
              }
            ]
          },
          {
            "number": 14,
            "title": "Dunder methods and the data model",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "Python's \"magic\" is a published protocol. Operators and built-ins delegate to **dunder** methods, so your types can participate in the language rather than sitting outside it.\n\n`__repr__` should be unambiguous and, ideally, `eval`-able — it is what you see in a debugger and a traceback. `__str__` is the human-facing form. If you write only one, write `__repr__`; `str()` falls back to it.\n\n`__eq__` defines `==`. Define `__hash__` alongside it whenever instances go in sets or dict keys — defining `__eq__` alone sets `__hash__` to `None` and makes the type unhashable, which is deliberate: two objects that compare equal must hash equal.\n\n`__len__`, `__getitem__`, `__contains__` and `__iter__` make a class behave like a container. `__enter__`/`__exit__` make it a context manager. `__call__` makes an instance callable.\n\n`__slots__` replaces the per-instance `__dict__` with a fixed layout, cutting memory substantially for classes instantiated in the millions — at the cost of dynamic attributes.",
            "practice": "Build a `Vector` supporting `+`, `*`, `==`, `len()`, indexing and iteration, with a correct `__repr__`. Then measure memory of a million instances with and without `__slots__`.",
            "misconceptions": [
              "\"Dunders are private internals.\" They are the public extension protocol.",
              "\"`__str__` is enough.\" Debuggers and logs use `__repr__`.",
              "\"Defining `__eq__` is harmless.\" It silently makes your type unhashable."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the difference in purpose between `__repr__` and `__str__`?"
              },
              {
                "kind": "predict",
                "prompt": "Defining `__eq__` without `__hash__` makes instances what?",
                "choices": [
                  "Still hashable",
                  "Unhashable",
                  "Immutable"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Which dunders make an object work in a `for` loop?"
              },
              {
                "kind": "read",
                "prompt": "What does `__call__` enable?",
                "choices": [
                  "Calling the class",
                  "Calling an instance like a function",
                  "Class construction"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does `__slots__` trade away for its memory saving?"
              },
              {
                "kind": "apply",
                "prompt": "Implement `+` for a value type without mutating either operand."
              },
              {
                "kind": "recall",
                "prompt": "Why must equal objects hash equal?"
              },
              {
                "kind": "apply",
                "prompt": "Make a class usable with `with`."
              },
              {
                "kind": "recall",
                "prompt": "If you write only one of the two string dunders, which and why?"
              }
            ]
          },
          {
            "number": 15,
            "title": "Type hints and static checking",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "Annotations describe intent: `def total(items: list[Item]) -> Decimal:`. Python does **not** enforce them at runtime — they are metadata. Their value comes from `mypy` or `pyright`, which read them and reject mismatches before the code runs, and from editors, which use them for completion and navigation.\n\nModern syntax is built in: `list[int]`, `dict[str, int]`, `int | None`. The old `typing.List` and `Optional[int]` still work but are no longer needed.\n\n`Optional[X]` is exactly `X | None`. Being explicit about nullability is where type checkers pay for themselves — most production `AttributeError`s are a `None` nobody expected.\n\nUseful vocabulary: `Any` (opt out, use sparingly), `Sequence`/`Iterable`/`Mapping` for parameters — accept the widest type you can and return the most specific. `TypedDict` for JSON-shaped dicts, `Protocol` for structural typing (\"anything with a `.read()`\"), `Literal` for fixed value sets, and `TypeVar`/generics for containers.\n\nAdopt gradually: annotate new code and module boundaries first, run `mypy` in CI, and tighten settings over time. `strict = true` on a fresh module is realistic; on a legacy one it is a wall.",
            "practice": "Annotate an existing module fully and run `mypy --strict` until clean. Replace a loosely typed dict parameter with a `TypedDict`, then define a `Protocol` for a dependency and check that two unrelated classes satisfy it.",
            "misconceptions": [
              "\"Type hints slow Python down.\" They are not evaluated at runtime in normal use.",
              "\"Hints guarantee correctness.\" Only a checker does, and only for what it can see.",
              "\"`Any` is a safe default.\" It disables checking wherever it spreads."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Does the interpreter enforce annotations? What enforces them?"
              },
              {
                "kind": "read",
                "prompt": "What is `Optional[int]` equivalent to in modern syntax?",
                "choices": [
                  "int",
                  "None",
                  "list[int]",
                  "Any"
                ],
                "answer": 0
              },
              {
                "kind": "recall",
                "prompt": "Why accept `Iterable` in a parameter but return `list`?"
              },
              {
                "kind": "predict",
                "prompt": "`def f(x: int) -> int: ...` called as `f(\"a\")` at runtime does what?",
                "choices": [
                  "TypeError immediately",
                  "Runs; only a checker objects",
                  "SyntaxError"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What problem does `Protocol` solve that a base class does not?"
              },
              {
                "kind": "apply",
                "prompt": "Type a function returning either a parsed record or `None`, and show the caller narrowing it."
              },
              {
                "kind": "recall",
                "prompt": "When is `TypedDict` the right tool?"
              },
              {
                "kind": "apply",
                "prompt": "Describe a realistic order for adopting types in an untyped codebase."
              },
              {
                "kind": "recall",
                "prompt": "What is the danger of scattering `Any`?"
              }
            ]
          },
          {
            "number": 16,
            "title": "The standard library worth knowing",
            "track": "spine",
            "stage": null,
            "level": "Intermediate",
            "prereq": [],
            "minutes": 30,
            "learn": "Python ships with enough to avoid most dependencies. Knowing what is already there is a genuine skill.\n\n`collections` — `defaultdict`, `Counter`, `deque` (O(1) at both ends, unlike a list), `namedtuple`. `itertools` — `chain`, `groupby` (requires sorted input, a classic trap), `islice`, `product`, `combinations`. `functools` — `lru_cache` for memoisation, `partial`, `wraps` for writing decorators, `reduce`.\n\n`datetime` — and its one rule: store and compute in **UTC**, convert to local only for display. Use timezone-aware objects (`datetime.now(timezone.utc)`); naive datetimes silently compare wrong. `zoneinfo` provides the tz database with no dependency.\n\n`json` for serialisation, with `default=` for types it does not know. `re` for regular expressions — compile them once at module level when used repeatedly. `logging` rather than `print` for anything long-lived. `argparse` for CLIs. `dataclasses`, `enum`, `decimal`, `statistics`, `secrets` (never `random`) for tokens, `hashlib`, `subprocess`, `sqlite3`, `unittest`, `tempfile`.",
            "practice": "Rewrite a script that hand-rolls counting, grouping and memoisation using `Counter`, `groupby` and `lru_cache`. Then find every naive `datetime` in a codebase and make it timezone-aware.",
            "misconceptions": [
              "\"You need `pandas` to count things.\" `Counter` and `defaultdict` cover a great deal.",
              "\"`itertools.groupby` groups a list.\" It groups *consecutive* runs; sort first.",
              "\"`random` is fine for tokens.\" Use `secrets`."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What does `collections.deque` do better than `list`, and where?"
              },
              {
                "kind": "predict",
                "prompt": "`itertools.groupby` on unsorted input gives what?",
                "choices": [
                  "Correct groups",
                  "Fragmented consecutive runs",
                  "An error"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why store datetimes in UTC?"
              },
              {
                "kind": "read",
                "prompt": "What does `functools.lru_cache` do?",
                "choices": [
                  "Limits recursion",
                  "Caches results by arguments",
                  "Frees memory"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why `secrets` rather than `random` for tokens?"
              },
              {
                "kind": "apply",
                "prompt": "Count word frequencies and return the top five in two lines."
              },
              {
                "kind": "recall",
                "prompt": "What is `functools.wraps` for?"
              },
              {
                "kind": "apply",
                "prompt": "Replace a hand-written memo dict with `lru_cache` and note the behaviour difference."
              },
              {
                "kind": "recall",
                "prompt": "Name three standard-library modules that remove a common third-party dependency."
              }
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a tested service — a small web API or an automation job. A layered package, strict `mypy`, a real database with migrations, validated input, safe configuration from the environment, structured logging, a Dockerised local environment, and CI that runs the whole check suite."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 17,
            "title": "Iterators, generators and laziness",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 35,
            "learn": "A **generator function** contains `yield`. Calling it runs no code — it returns a generator object. Each `next()` runs to the next `yield` and suspends, keeping local state on a frame that stays alive between calls. That suspension is the whole idea.\n\nThis buys **laziness**: values are produced on demand, so a pipeline over a 100 GB file holds one record at a time. Chain generators into stages — read, parse, filter, transform — and each stage pulls from the one before. Memory stays flat regardless of input size.\n\n`yield from` delegates to a sub-generator, flattening nested iteration.\n\nGenerators are also **single-pass and stateful**. Once exhausted they stay exhausted; if you need two passes, materialise with `list()` or build it twice. A generator passed to two consumers will surprise the second.\n\n`itertools.tee` duplicates a stream, but buffers whatever the slower consumer has not read — occasionally the right tool, often a memory leak.\n\nBeyond iteration, generators underpin coroutines: `async def` is built on the same suspend-and-resume machinery.",
            "practice": "Build a three-stage generator pipeline over a large log file — parse, filter errors, extract fields — and confirm memory stays flat with `tracemalloc`. Then hit the double-consumption bug deliberately and fix it.",
            "misconceptions": [
              "\"A generator runs when called.\" It runs on first `next()`.",
              "\"Generators are just lazy lists.\" They cannot be indexed, re-iterated or measured with `len()`.",
              "\"`return` in a generator returns a value.\" It ends iteration; the value rides on `StopIteration`."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What happens when you *call* a generator function?"
              },
              {
                "kind": "predict",
                "prompt": "Iterating an exhausted generator a second time yields what?",
                "choices": [
                  "The same values",
                  "Nothing",
                  "An error"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "How does a generator pipeline keep memory flat over a huge file?"
              },
              {
                "kind": "read",
                "prompt": "What does `yield from` do?",
                "choices": [
                  "Returns a list",
                  "Delegates to a sub-generator",
                  "Ends the generator"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Why can't you call `len()` on a generator?"
              },
              {
                "kind": "apply",
                "prompt": "Convert a function that builds and returns a large list into a generator."
              },
              {
                "kind": "recall",
                "prompt": "What does `itertools.tee` cost you?"
              },
              {
                "kind": "apply",
                "prompt": "Write a pipeline reading a file, filtering, and summing — without materialising anything."
              },
              {
                "kind": "recall",
                "prompt": "How do generators relate to `async def`?"
              }
            ]
          },
          {
            "number": 18,
            "title": "Closures and decorators",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 35,
            "learn": "A **closure** is a function that captures names from an enclosing scope and keeps them alive after that scope returns. The captured variable is a live reference, not a snapshot — which is why building closures in a loop and expecting each to capture that iteration's value is a classic bug. Bind it with a default argument (`lambda x=x: ...`) to snapshot it.\n\nA **decorator** is a function taking a function and returning a replacement. `@log` is exactly `f = log(f)`. Because the replacement is a different object, always apply `functools.wraps` — without it the decorated function loses its `__name__`, `__doc__` and signature, and every tool that introspects it breaks.\n\nA decorator with arguments needs one more layer: a factory that takes the arguments and returns the actual decorator. Three levels of nesting, which is why they are worth writing carefully and reading slowly.\n\nDecorators are how `@property`, `@staticmethod`, `@lru_cache`, `@dataclass` and most web frameworks' routing work. Use them for genuine cross-cutting concerns — logging, timing, retry, caching, access control — and not for business logic, which becomes invisible when hidden behind one.",
            "practice": "Write `@retry(times=3, delay=0.5)` with correct `wraps`, preserving the signature. Then write a timing decorator and stack them, confirming the order in which they apply.",
            "misconceptions": [
              "\"Decorators run at call time.\" The decoration happens at definition; the wrapper runs at call.",
              "\"`wraps` is cosmetic.\" Without it, introspection, docs and some frameworks break.",
              "\"Closures capture values.\" They capture variables."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is `@dec` shorthand for?"
              },
              {
                "kind": "predict",
                "prompt": "Closures created in a `for` loop capture what?",
                "choices": [
                  "Each iteration's value",
                  "The final value of the variable",
                  "Nothing"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does `functools.wraps` preserve, and what breaks without it?"
              },
              {
                "kind": "read",
                "prompt": "How many nested functions does a decorator *with arguments* need?",
                "choices": [
                  "One",
                  "Two",
                  "Three"
                ],
                "answer": 2
              },
              {
                "kind": "recall",
                "prompt": "Name three standard decorators and what each does."
              },
              {
                "kind": "apply",
                "prompt": "Write a decorator that retries on exception with a configurable count."
              },
              {
                "kind": "recall",
                "prompt": "When does decoration happen relative to calling?"
              },
              {
                "kind": "apply",
                "prompt": "Fix a loop-created closure so each captures its own value."
              },
              {
                "kind": "recall",
                "prompt": "What belongs in a decorator, and what does not?"
              }
            ]
          },
          {
            "number": 19,
            "title": "Concurrency: threads, processes and asyncio",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 45,
            "learn": "Choosing wrongly here costs more than any other decision in this path, and the choice follows from one question: **is the work I/O-bound or CPU-bound?**\n\nThe **GIL** (Global Interpreter Lock) lets only one thread execute Python bytecode at a time in CPython. So threads do *not* speed up CPU-bound work — they add overhead. But the GIL is released during I/O, so threads are genuinely effective for network calls, disk reads and database queries.\n\n- **I/O-bound, moderate concurrency** → `threading` or `concurrent.futures.ThreadPoolExecutor`.\n- **I/O-bound, very high concurrency** → `asyncio`. One thread, an event loop, thousands of sockets. `async def` defines a coroutine; `await` suspends it and lets the loop run others. The rule that matters: **one blocking call poisons the whole loop**, because there is only one thread. Use async-native libraries throughout, or push blocking work to `run_in_executor`.\n- **CPU-bound** → `multiprocessing` or `ProcessPoolExecutor`. Separate processes, separate interpreters, real parallelism — at the cost of process startup and pickling everything across the boundary.\n\nShared mutable state across threads needs a `Lock`. Better still, share nothing: pass data through `queue.Queue`, which is already thread-safe.\n\nPython 3.13 ships an experimental free-threaded build without the GIL. It is not yet the default, and the guidance above still holds for production.",
            "practice": "Take a script fetching 100 URLs serially and rewrite it three ways: thread pool, asyncio with `gather`, and process pool. Time all four. Explain why the process pool is slowest here and would be fastest for hashing those payloads.",
            "misconceptions": [
              "\"Threads make Python parallel.\" Not for CPU work, because of the GIL.",
              "\"asyncio is faster than threads.\" It scales further for I/O; it is not inherently faster, and it is worse for CPU work.",
              "\"One blocking call in async is fine.\" It stalls every other coroutine on that loop."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the GIL and which workloads does it constrain?"
              },
              {
                "kind": "predict",
                "prompt": "A CPU-bound task across 4 threads in CPython runs how fast versus 1 thread?",
                "choices": [
                  "~4× faster",
                  "About the same or slower",
                  "2× faster"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "When is `asyncio` the right choice over a thread pool?"
              },
              {
                "kind": "read",
                "prompt": "What does one blocking call inside a coroutine do?",
                "choices": [
                  "Blocks only that coroutine",
                  "Stalls the whole event loop",
                  "Raises an error"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does `multiprocessing` cost you that threading does not?"
              },
              {
                "kind": "apply",
                "prompt": "Decide the model for: 500 concurrent HTTP requests; hashing 10,000 files; one slow database query."
              },
              {
                "kind": "recall",
                "prompt": "Why is `queue.Queue` preferable to a shared list with a lock?"
              },
              {
                "kind": "apply",
                "prompt": "Convert a serial I/O loop to `asyncio.gather` and say what could go wrong."
              },
              {
                "kind": "recall",
                "prompt": "What does `await` actually do to the current coroutine?"
              }
            ]
          },
          {
            "number": 20,
            "title": "Testing, linting and the quality toolchain",
            "track": "spine",
            "stage": "tooling",
            "level": "Advanced",
            "prereq": [],
            "minutes": 40,
            "learn": "**pytest** is the standard. Tests are plain functions named `test_*` using bare `assert` — pytest rewrites assertions to show the actual values on failure, so no assertion vocabulary is needed. `@pytest.fixture` provides reusable setup with teardown after `yield`. `@pytest.mark.parametrize` runs one test over many inputs, which is where most of the value is: the same test body against twenty cases.\n\nTest **behaviour, not implementation**. A test asserting internal call order breaks on every refactor while proving nothing about correctness. Assert on outputs and observable effects.\n\nMock at boundaries only — the network, the clock, the filesystem — with `unittest.mock` or `monkeypatch`. Mocking your own code usually means the design needs a seam, not a mock.\n\nCoverage (`pytest --cov`) shows what was *executed*, not what was *verified*. 100% coverage with no assertions proves nothing. Treat it as a map of untested areas, not a target.\n\nAround tests sit the rest: **ruff** (linting and formatting, fast, replaces flake8/isort/black for most projects), **mypy** or **pyright** for types, **pre-commit** to run all of it before a commit lands, and CI to run it again where it cannot be skipped. Add `pytest-cov`, `hypothesis` for property-based testing, and `tox`/`nox` when you must support several Python versions.",
            "practice": "Take an untested module to meaningful coverage with parametrised tests. Add a fixture with teardown, mock exactly one external call, and wire ruff + mypy + pytest into pre-commit and CI.",
            "misconceptions": [
              "\"100% coverage means tested.\" It means executed.",
              "\"Mock everything for isolation.\" Over-mocked tests assert that your mocks work.",
              "\"Formatting is bikeshedding.\" Automating it ends the argument permanently."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "Why does pytest let you use bare `assert`?"
              },
              {
                "kind": "recall",
                "prompt": "What does `@pytest.mark.parametrize` give you over a loop inside one test?"
              },
              {
                "kind": "predict",
                "prompt": "A test asserting internal call order does what during a refactor?",
                "choices": [
                  "Passes",
                  "Breaks without indicating a real defect",
                  "Catches the bug"
                ],
                "answer": 1
              },
              {
                "kind": "read",
                "prompt": "What does coverage actually measure?",
                "choices": [
                  "Lines verified by assertions",
                  "Lines executed during tests",
                  "Branches proven correct"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Where is mocking appropriate, and where is it a design signal?"
              },
              {
                "kind": "apply",
                "prompt": "Write a fixture providing a temporary database and cleaning it up afterwards."
              },
              {
                "kind": "recall",
                "prompt": "What does `ruff` replace, and why does that matter?"
              },
              {
                "kind": "apply",
                "prompt": "Describe a CI pipeline for a typed, tested Python package."
              },
              {
                "kind": "recall",
                "prompt": "What is property-based testing good at that example-based testing is not?"
              }
            ]
          },
          {
            "number": 21,
            "title": "Performance, profiling and memory",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 35,
            "learn": "**Measure first.** Intuition about Python performance is unreliable; the bottleneck is regularly somewhere nobody suspected. `cProfile` gives per-function call counts and cumulative time — start there to find *where*. `timeit` measures a small snippet accurately, handling warm-up and repetition. `tracemalloc` attributes memory to the lines that allocated it. Line-level tools (`line_profiler`, `memory_profiler`) narrow it further.\n\nThen apply the wins in order of size:\n\n1. **Better algorithm or data structure.** Turning an O(n²) membership scan into a set lookup beats every micro-optimisation combined.\n2. **Do less work.** Cache with `lru_cache`, avoid recomputation, filter earlier in the pipeline.\n3. **Move the loop out of Python.** NumPy, or a library whose inner loop is C.\n4. **Micro-optimise.** Local-variable lookup beats attribute lookup; `join` beats `+=`. Only worth it in a hot loop you have measured.\n5. **Leave Python for the hot path.** C extension, Cython, or a Rust module via PyO3.\n\nOn memory: every object carries overhead — a small `int` is 28 bytes, an empty `dict` around 64. `__slots__` cuts per-instance cost. Generators avoid materialising intermediates. Reference cycles are collected by the cyclic GC, but a cycle holding a large buffer stays alive until it runs.",
            "practice": "Profile a deliberately slow script, identify the real bottleneck, and fix it algorithmically. Record before-and-after timings. Then use `tracemalloc` to find a leak caused by an ever-growing module-level cache.",
            "misconceptions": [
              "\"I know where the slow part is.\" Profile; you frequently do not.",
              "\"Micro-optimising helps.\" Not compared to fixing the complexity class.",
              "\"Python has no GC beyond refcounting.\" It also has a cyclic collector."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the correct first step in any optimisation, and why?"
              },
              {
                "kind": "recall",
                "prompt": "What does `cProfile` tell you that `timeit` does not?"
              },
              {
                "kind": "predict",
                "prompt": "Which yields more: replacing a list scan with a set, or rewriting a loop with local variables?",
                "choices": [
                  "The set",
                  "The locals",
                  "Equal"
                ],
                "answer": 0
              },
              {
                "kind": "read",
                "prompt": "What does `tracemalloc` report?",
                "choices": [
                  "CPU time",
                  "Memory allocation by line",
                  "Call counts"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "How does `__slots__` reduce memory?"
              },
              {
                "kind": "apply",
                "prompt": "Describe how you would find and fix an unbounded module-level cache."
              },
              {
                "kind": "recall",
                "prompt": "Why does CPython need a cyclic collector on top of refcounting?"
              },
              {
                "kind": "apply",
                "prompt": "Given a profile where 90% of time is in one function, what do you check first?"
              },
              {
                "kind": "recall",
                "prompt": "Name the optimisation strategies in order of typical payoff."
              }
            ]
          },
          {
            "number": 22,
            "title": "Packaging and distribution",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 30,
            "learn": "`pyproject.toml` is the single modern configuration file — project metadata, dependencies, build backend, and usually the settings for ruff, mypy and pytest too. It replaced `setup.py`, `setup.cfg` and `requirements.txt` for most projects.\n\nDistinguish **applications** from **libraries**. An application pins exact versions for reproducibility (a lock file). A library declares permissive ranges, because pinning in a library forces conflicts on everyone who depends on it.\n\nTwo artefacts: a **wheel** (`.whl`, pre-built, installs fast, preferred) and an **sdist** (`.tar.gz`, source, needs a build step). Publish both. `python -m build` produces them; `twine upload` publishes; test against TestPyPI first.\n\nVersion with **semantic versioning**: major for breaking, minor for additions, patch for fixes. Once published, a version is immutable — publish a new one rather than replacing.\n\nEntry points in `pyproject.toml` create console commands, so `pip install yourtool` yields a `yourtool` executable.\n\nTooling: `pip` plus `venv` is the baseline; `uv` is dramatically faster and increasingly standard; `pipx` installs applications in isolation; `poetry`/`pdm` bundle dependency resolution with packaging.",
            "practice": "Package a project with full `pyproject.toml` metadata, a console entry point, and classifiers. Build both artefacts, install the wheel into a clean venv, and confirm the command works. Publish to TestPyPI.",
            "misconceptions": [
              "\"`requirements.txt` is still the standard.\" It is for pinned application deployments, not for declaring a package.",
              "\"Pin everything, always.\" Pinning in a library breaks downstream resolution.",
              "\"A wheel and an sdist are interchangeable.\" A wheel skips the build; an sdist does not."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What does `pyproject.toml` replace?"
              },
              {
                "kind": "recall",
                "prompt": "Why do libraries use ranges where applications pin?"
              },
              {
                "kind": "read",
                "prompt": "What is the difference between a wheel and an sdist?",
                "choices": [
                  "None",
                  "Wheel is pre-built, sdist needs building",
                  "Wheel is source"
                ],
                "answer": 1
              },
              {
                "kind": "predict",
                "prompt": "Can you re-upload a fixed version 1.2.0 to PyPI?",
                "choices": [
                  "Yes, it overwrites",
                  "No, versions are immutable",
                  "Only within 24h"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What does semantic versioning communicate in each position?"
              },
              {
                "kind": "apply",
                "prompt": "Add a console entry point so installing gives a runnable command."
              },
              {
                "kind": "recall",
                "prompt": "What is TestPyPI for?"
              },
              {
                "kind": "apply",
                "prompt": "Decide the dependency strategy for a library and for a deployed service."
              },
              {
                "kind": "recall",
                "prompt": "What does `pipx` solve that `pip install` does not?"
              }
            ]
          },
          {
            "number": 23,
            "title": "CPython internals worth understanding",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 30,
            "learn": "You do not need to read CPython's source, but a few internals explain behaviour you will otherwise find arbitrary.",
            "practice": "Use `dis` to compare bytecode for a comprehension versus an append loop. Build a diamond inheritance and print `__mro__`. Demonstrate interning with `is` at 256 and 257, and explain it.",
            "misconceptions": [
              "\"CPython is the language.\" It is one implementation; PyPy, MicroPython and others differ.",
              "\"`is` compares values.\" It compares identity; interning makes it look otherwise.",
              "\"`super()` calls the parent class.\" It calls the next class in the MRO."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What is the MRO and what problem does it solve?"
              },
              {
                "kind": "predict",
                "prompt": "`a = 257; b = 257; a is b` — reliably True?",
                "choices": [
                  "Always True",
                  "Not guaranteed",
                  "Always False"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What are the two halves of CPython's memory management?"
              },
              {
                "kind": "read",
                "prompt": "What does `dis.dis(fn)` show?",
                "choices": [
                  "Source",
                  "Bytecode",
                  "Machine code"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "What are descriptors, and which familiar features rest on them?"
              },
              {
                "kind": "apply",
                "prompt": "Explain a diamond inheritance resolution using `__mro__`."
              },
              {
                "kind": "recall",
                "prompt": "Why does `__slots__` save memory, in terms of internals?"
              },
              {
                "kind": "apply",
                "prompt": "Show a case where relying on interning produces a bug."
              },
              {
                "kind": "recall",
                "prompt": "What does `super()` actually do?"
              }
            ]
          },
          {
            "number": 24,
            "title": "Production concerns",
            "track": "spine",
            "stage": null,
            "level": "Advanced",
            "prereq": [],
            "minutes": 35,
            "learn": "Code that runs on your machine and code that runs in production differ in observability, configuration and failure handling.",
            "practice": "Take a script using `print` and hard-coded settings and make it production-shaped: structured logging, environment configuration validated at startup, timeouts and backoff on every outbound call, and graceful `SIGTERM` shutdown.",
            "misconceptions": [
              "\"`print` is fine, I redirect it.\" You lose levels, timestamps, structure and routing.",
              "\"Retries make things reliable.\" Retrying a non-idempotent write duplicates it.",
              "\"`pickle` is a serialisation format.\" It is arbitrary code execution."
            ],
            "questions": [
              {
                "kind": "recall",
                "prompt": "What does `logging` provide that `print` does not?"
              },
              {
                "kind": "recall",
                "prompt": "Why should configuration be validated at startup rather than on first use?"
              },
              {
                "kind": "predict",
                "prompt": "An HTTP call with no timeout can do what?",
                "choices": [
                  "Fail fast",
                  "Hang indefinitely",
                  "Retry automatically"
                ],
                "answer": 1
              },
              {
                "kind": "read",
                "prompt": "Why is `pickle` unsafe on untrusted data?",
                "choices": [
                  "It is slow",
                  "Loading executes arbitrary code",
                  "It loses types"
                ],
                "answer": 1
              },
              {
                "kind": "recall",
                "prompt": "Which operations are safe to retry, and which are not?"
              },
              {
                "kind": "apply",
                "prompt": "Configure a module logger correctly for a package with several modules."
              },
              {
                "kind": "recall",
                "prompt": "How do you prevent SQL injection in Python, concretely?"
              },
              {
                "kind": "apply",
                "prompt": "Describe graceful shutdown on `SIGTERM` for a worker mid-job."
              },
              {
                "kind": "recall",
                "prompt": "Name three things that must never appear in logs."
              }
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Choose a workflow engine, an ingestion pipeline, a production API, a developer tool, or a reusable library. Require architecture notes, typed public contracts, deliberate concurrency with backpressure, durable state, a security pass, profiling evidence, observability, packaging, deployment, and a written failure-recovery playbook."
        }
      }
    ],
    "tracks": []
  },
  "c": {
    "title": "C",
    "blurb": "Target: modern, portable C (primarily C17, with awareness of C23). Use a strict build such as `-std=c17 -Wall -Wextra -Wpedantic`, a debugger, and sanitizers when available.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Toolchain and the shape of a C program",
            "learn": "Learn source files, headers, `main`, statements, expressions, comments, preprocessing, compilation, assembly, linking, executables, exit status, and basic command-line use. Build the same program through a compiler command and a small Makefile.",
            "practice": "create a unit converter with input validation and separate declaration/implementation files.",
            "questions": [
              "What work happens during preprocessing, compilation, assembly, and linking?",
              "Why is a compiler warning often evidence of a real defect rather than noise?",
              "What is the difference between a declaration and a definition?",
              "What does returning a nonzero value from `main` communicate?",
              "Why should headers use include guards?"
            ]
          },
          {
            "number": 2,
            "title": "Values, types, operators, and conversions",
            "learn": "Learn integer and floating types, `char`, `_Bool`, signedness, type ranges, literals, constants, `sizeof`, arithmetic/comparison/logical/bitwise operators, precedence, integer promotion, casts, overflow, and floating-point limitations.",
            "practice": "implement checked integer arithmetic and print meaningful errors on overflow.",
            "questions": [
              "Why can comparing a negative signed integer with an unsigned integer surprise you?",
              "When is signed overflow undefined, and how does unsigned overflow behave?",
              "Why is `0.1 + 0.2 == 0.3` unreliable in binary floating point?",
              "What type and unit does `sizeof` return?",
              "When does an explicit cast clarify intent, and when can it hide a bug?"
            ]
          },
          {
            "number": 3,
            "title": "Control flow and functions",
            "learn": "Learn `if`, `switch`, loops, `break`, `continue`, short-circuiting, function declarations, parameters, return values, recursion, call stacks, and variable scope/storage duration basics.",
            "practice": "build a menu-driven number statistics program using small, testable functions.",
            "questions": [
              "What values may be used as conditions in C?",
              "When is `switch` clearer than a chain of `if` statements?",
              "Are function arguments passed by value or by reference in C?",
              "What creates a recursion base case, and what happens without one?",
              "How do scope, linkage, and storage duration differ?"
            ]
          },
          {
            "number": 4,
            "title": "Arrays, strings, and structured data",
            "learn": "Learn fixed arrays, multidimensional arrays, array bounds, C strings and the null terminator, common `<string.h>` operations, `struct`, `enum`, `union`, `typedef`, designated initializers, and padding.",
            "practice": "implement an in-memory contact book with bounded names, searching, sorting, and serialization to text.",
            "questions": [
              "Why is a C string not the same thing as a character array?",
              "What happens when code reads or writes beyond an array boundary?",
              "When passed to a function, what does an array expression usually become?",
              "Why can `sizeof(struct)` exceed the sum of its members?",
              "When is an `enum` preferable to unrelated numeric constants?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a command-line gradebook. It must load/save records, validate every input, compute summary statistics, sort by multiple fields, separate `.h` and `.c` files, compile warning-free, and include tests for parsing and calculations."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Pointers: the essential model",
            "learn": "Learn addresses, pointer types, `&`, `*`, null pointers, pointer arithmetic, array decay, pointers to structures, double pointers, `const` placement, and function pointers. Draw memory diagrams for every pointer exercise.",
            "practice": "implement `swap`, generic array traversal via callbacks, and functions that safely return results through output parameters.",
            "questions": [
              "What is stored in a pointer, and why does its pointed-to type matter?",
              "Explain `const int *p`, `int *const p`, and `const int *const p`.",
              "Why is subtracting pointers valid only within the same array object?",
              "When is a pointer-to-pointer necessary?",
              "How are a null pointer, an uninitialized pointer, and a dangling pointer different?",
              "Why is `sizeof(array)` different from `sizeof(pointer)` even when the pointer refers to that array?"
            ]
          },
          {
            "number": 6,
            "title": "Dynamic memory and ownership",
            "learn": "Learn stack versus dynamic storage, `malloc`, `calloc`, `realloc`, `free`, alignment, ownership conventions, lifetime, leaks, use-after-free, double-free, flexible array members, and cleanup-on-error patterns.",
            "practice": "implement a growable vector of records with documented ownership and failure-safe resizing.",
            "questions": [
              "Who owns memory returned by an allocation function, and how should an API communicate that?",
              "Why should `realloc` commonly be assigned to a temporary pointer?",
              "What must remain true if allocation fails halfway through an operation?",
              "Why is using a pointer after `free` invalid even if the bytes appear unchanged?",
              "How do leak, address, and undefined-behavior sanitizers help?"
            ]
          },
          {
            "number": 7,
            "title": "Files, streams, and robust parsing",
            "learn": "Learn text/binary modes, `FILE *`, buffering, `fopen`/`fclose`, formatted I/O hazards, line-based input, `errno`, end-of-file versus error, byte order, binary format portability, and defensive parsers.",
            "practice": "build a CSV reader that handles quoted fields, malformed rows, long input, and allocation failures.",
            "questions": [
              "Why is `fgets` plus explicit parsing generally safer than unconstrained formatted input?",
              "How do `feof` and `ferror` differ, and when should they be checked?",
              "Why is dumping a `struct` directly to disk usually a nonportable file format?",
              "When is `errno` meaningful?",
              "What limits should an untrusted-input parser impose?"
            ]
          },
          {
            "number": 8,
            "title": "Modular programs, libraries, and builds",
            "learn": "Learn translation units, internal/external linkage, `static`, `extern`, opaque structs, public API design, static/shared libraries, Make dependencies, conditional compilation, feature detection, and semantic versioning basics.",
            "practice": "turn the vector from Module 6 into a reusable library with an opaque type, examples, tests, and generated API documentation.",
            "questions": [
              "Why should private implementation details stay out of a public header?",
              "What does file-scope `static` change?",
              "What problem does an opaque struct solve?",
              "Why must a Make target list header dependencies?",
              "What ABI changes can break an already compiled client?"
            ]
          },
          {
            "number": 9,
            "title": "Testing and debugging",
            "learn": "Learn assertions, unit/integration/property tests, boundary analysis, fuzzing, debugger breakpoints/watchpoints/backtraces, core dumps, sanitizers, Valgrind-style analysis, static analyzers, and reproducible bug reports.",
            "practice": "seed defects into the vector and parser, find them with different tools, and write regression tests.",
            "questions": [
              "What belongs in an assertion versus recoverable error handling?",
              "How does a watchpoint differ from a breakpoint?",
              "Why can optimization change a debugging experience?",
              "What makes a test a regression test?",
              "Why is fuzzing especially productive for C parsers?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a reusable command-line database: dynamic records, indexed lookup, import/export, an opaque library API, clear ownership rules, fault-injection tests for allocation failures, fuzzed parsing, and sanitizer-clean execution."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "The C abstract machine and undefined behavior",
            "learn": "Study object lifetime, effective type, strict aliasing, alignment, sequence rules, trap/indeterminate values, undefined/unspecified/implementation-defined behavior, compiler optimization assumptions, and portability boundaries.",
            "practice": "analyze ten short programs with suspected undefined behavior, confirm with standards references and sanitizer/compiler experiments, then rewrite them portably.",
            "questions": [
              "How do undefined, unspecified, and implementation-defined behavior differ?",
              "Why may an optimizer remove a check that appears necessary after signed overflow?",
              "What is strict aliasing, and when may character types inspect object representation?",
              "Why does `memcpy` often provide a safe representation-level operation?",
              "What assumptions must code verify before relying on object size, alignment, or byte order?"
            ]
          },
          {
            "number": 11,
            "title": "Advanced pointers, bits, and memory layout",
            "learn": "Study pointer provenance, callbacks and context pointers, intrusive structures, arenas/pools, memory-mapped I/O, bit masks, shifts, endian conversion, packed data hazards, and cache-aware layout.",
            "practice": "implement an arena allocator and a binary protocol encoder/decoder with explicit endian handling.",
            "questions": [
              "What lifetime restrictions apply to pointers returned by an arena?",
              "Why can packed structures cause unaligned access or poor performance?",
              "How do array-of-structs and struct-of-arrays layouts affect cache behavior?",
              "What preconditions make a left or right shift valid?",
              "How can a callback accept caller state without global variables?"
            ]
          },
          {
            "number": 12,
            "title": "Concurrency and atomics",
            "learn": "Learn threads, mutexes, condition variables, data races, deadlock, thread-local storage, C atomics, memory ordering, compare/exchange, false sharing, and why lock-free code requires specialist care.",
            "practice": "implement a bounded producer/consumer queue first with locks, test it under stress, and document what a correct atomic alternative would require.",
            "questions": [
              "What is a data race, and why is it undefined behavior in C?",
              "What conditions are required for deadlock?",
              "Why must a condition-variable wait recheck its predicate in a loop?",
              "What do acquire and release ordering establish?",
              "Why does “lock-free” not automatically mean faster or simpler?"
            ]
          },
          {
            "number": 13,
            "title": "Systems interfaces, performance, and security",
            "learn": "Learn processes, signals, sockets, nonblocking I/O concepts, platform APIs, profiling, benchmarking, cache effects, integer and buffer security, format-string attacks, resource limits, and secure coding standards.",
            "practice": "build a small cross-platform-friendly TCP service or, if platform APIs are unavailable, a robust local protocol processor; profile and harden it against malformed input.",
            "questions": [
              "Which operations are safe in a signal handler, and why is the set limited?",
              "How do partial reads/writes affect stream-socket code?",
              "How do you distinguish CPU, allocation, I/O, and lock bottlenecks?",
              "Why is a benchmark without warm-up, workload definition, and repeated samples misleading?",
              "Which boundaries require length, overflow, and resource-exhaustion checks?"
            ]
          },
          {
            "number": 14,
            "title": "API design and long-term maintenance",
            "learn": "Study error models, result/out parameters, stable ABI design, allocator injection, thread-safety contracts, documentation, compatibility, dependency auditing, code review, and reading well-established C projects.",
            "practice": "publish a small library whose API documents ownership, lifetime, errors, thread safety, complexity, and compatibility guarantees.",
            "questions": [
              "What information must every pointer parameter’s contract state?",
              "When is an error code better than global `errno`?",
              "How can allocator injection improve testability and embedding?",
              "Which source-compatible changes can still break binary compatibility?",
              "What evidence is needed before declaring a library thread-safe?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Choose one: a shell-like process runner, HTTP/1.1 server, embedded key-value store, image decoder, or memory allocator. Require a written specification, portable build, clean API, malformed-input tests, fuzzing, sanitizers, profiler evidence, security review, CI, and a design retrospective. Explain every ownership boundary and every intentional platform dependency."
        }
      }
    ],
    "extras": [
      {
        "name": "C-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      },
      {
        "name": "Special deep dive — C pointers and manual memory",
        "checkpoint": null,
        "notes": [
          {
            "title": "Pointer map you must be able to explain",
            "body": "| Form | Meaning | Common failure | | --- | --- | --- | | `T *p` | Pointer to `T` | Uninitialized, null, dangling, wrong lifetime | | `const T *p` | Pointer to read-only `T` through `p` | Assuming the original object is globally immutable | | `T *const p` | Non-reseatable pointer to mutable `T` | Confusing pointer constness with pointee constness | | `T **p` | Pointer to a pointer to `T` | Unclear ownership or incorrect allocation depth | | `T (*p)[N]` | Pointer to an array of `N` `T` values | Confusing it with an array of pointers | | `R (*fn)(A)` | Pointer to a function taking `A`, returning `R` | Wrong signature or lost callback context | | `void *p` | Untyped object pointer used at generic boundaries | Losing size, alignment, type, or ownership information |"
          },
          {
            "title": "Required pointer drills",
            "body": "1. Draw stack/heap diagrams for an array, pointer into the array, pointer-to-pointer output parameter, linked list, and callback with context. 2. Implement a singly linked list, then delete every node under sanitizers. Document owner and lifetime for each link. 3. Allocate a dynamic matrix twice: contiguous storage and array-of-row-pointers. Compare allocation, indexing, cleanup, and locality. 4. Write `const`-correct read-only and mutating APIs for the same buffer. 5. Reproduce and diagnose a leak, double free, use-after-free, out-of-bounds access, returning a pointer to a local, and invalid `realloc` handling. 6. Review every pointer parameter in one project and document nullability, valid length, ownership transfer, aliasing, mutation, and lifetime. You pass this deep dive only when you can predict behavior before running the code, fix each defect with tools, and explain why the corrected program is defined by the language—not merely why it stopped crashing."
          }
        ]
      }
    ]
  },
  "cpp": {
    "title": "C++",
    "blurb": "Target: modern C++20/23 style. Prefer value semantics, RAII, standard-library types, warnings, sanitizers, formatting, tests, and a CMake-based build. Learn C++ as its own language rather than “C with classes.”",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Build model, types, and expressions",
            "learn": "Learn translation units, headers, namespaces, `main`, fundamental types, initialization forms, `auto`, `const`, references, operators, conversions, compiler warnings, and the compile/link process.",
            "practice": "create a unit converter split across headers and sources, with validation and tests.",
            "questions": [
              "Why is brace initialization useful for detecting narrowing conversions?",
              "When should `auto` improve clarity, and when might it hide important type information?",
              "How is a reference different from a pointer?",
              "What causes an unresolved external symbol at link time?",
              "Why is `const` part of interface design, not just mutation prevention?"
            ]
          },
          {
            "number": 2,
            "title": "Control flow, functions, and errors",
            "learn": "Learn conditions, loops, `switch`, functions, overloads, default arguments, pass-by-value/reference, recursion, scope, exceptions at an introductory level, and assertions.",
            "practice": "implement a command-line calculator with separate parsing/evaluation and explicit invalid-input handling.",
            "questions": [
              "When should a small parameter be passed by value instead of `const&`?",
              "How does overload resolution choose a function?",
              "What should an exception represent?",
              "Why should destructors generally not throw?",
              "What is the difference between a precondition failure and an expected runtime error?"
            ]
          },
          {
            "number": 3,
            "title": "Standard strings, containers, and algorithms",
            "learn": "Learn `std::string`, `std::string_view`, `vector`, `array`, `map`, `unordered_map`, iterators, ranges basics, algorithms, lambdas, and iterator invalidation.",
            "practice": "build a text analyzer using algorithms rather than hand-written indexing loops where appropriate.",
            "questions": [
              "When does `string_view` dangle?",
              "What trade-offs distinguish ordered and unordered maps?",
              "Which operations can invalidate a vector iterator or reference?",
              "Why do standard algorithms often communicate intent better than raw loops?",
              "How does a lambda capture by value differ from capture by reference?"
            ]
          },
          {
            "number": 4,
            "title": "Classes and value semantics",
            "learn": "Learn classes/structs, access control, constructors, destructors, member initialization, invariants, `this`, static members, operator overloading, composition, and rule of zero.",
            "practice": "design `Money` and `Date` value types with validated invariants, comparisons, formatting, and tests.",
            "questions": [
              "What invariant should every public member preserve?",
              "Why are members initialized before the constructor body?",
              "When is operator overloading natural, and when is a named function clearer?",
              "Why is composition usually preferable to inheritance for code reuse?",
              "What is the rule of zero?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a personal finance tracker using value types, standard containers/algorithms, file persistence, error reporting, tests, warning-clean builds, and no owning raw pointers."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Pointers, lifetime, and RAII",
            "learn": "Learn object lifetime, stack/dynamic storage, raw pointers as non-owning observers, references, RAII, destructors, `unique_ptr`, `shared_ptr`, `weak_ptr`, custom deleters, and ownership graphs.",
            "practice": "model a document tree with exclusive ownership and non-owning parent links; prove that no cycle or dangling observer remains.",
            "questions": [
              "Why should an owning raw `new`/`delete` pair rarely appear in application code?",
              "When is `unique_ptr` the correct default ownership type?",
              "What cost and semantic risk comes with `shared_ptr`?",
              "How does `weak_ptr` break an ownership cycle?",
              "What is destroyed during stack unwinding?",
              "How do lifetime, scope, storage duration, and ownership differ?"
            ]
          },
          {
            "number": 6,
            "title": "Copying, moving, and resource types",
            "learn": "Learn copy/move constructors and assignments, rule of five, moved-from states, `std::move`, copy elision, swap, strong/basic/no-throw exception guarantees, and `noexcept`.",
            "practice": "implement a small resource-owning buffer for learning, then compare it with `std::vector` and explain why production code should prefer the latter.",
            "questions": [
              "Does `std::move` move an object by itself?",
              "What must be true of a moved-from object?",
              "Why can a `noexcept` move constructor improve vector reallocation?",
              "What does the strong exception guarantee promise?",
              "When does the rule of five collapse back into the rule of zero?"
            ]
          },
          {
            "number": 7,
            "title": "Inheritance and runtime polymorphism",
            "learn": "Learn interfaces, virtual functions, abstract classes, virtual destructors, overriding, slicing, multiple inheritance awareness, dynamic casts, substitutability, and alternatives such as variants or type erasure.",
            "practice": "implement interchangeable storage backends behind a small interface, then implement the same behavior with `std::variant` and compare trade-offs.",
            "questions": [
              "Why must a polymorphic base usually have a virtual destructor?",
              "What is object slicing?",
              "How can inheritance violate substitutability?",
              "When is a closed `variant` preferable to an open class hierarchy?",
              "What runtime cost does virtual dispatch typically introduce?"
            ]
          },
          {
            "number": 8,
            "title": "Generic programming and templates",
            "learn": "Learn function/class templates, deduction, specialization basics, variadic templates, concepts, constraints, `constexpr`, type traits, forwarding references, perfect forwarding, and readable template diagnostics.",
            "practice": "build constrained generic statistics functions that work across suitable ranges and reject invalid types with clear diagnostics.",
            "questions": [
              "When is a template instantiated?",
              "How do concepts improve an API beyond shortening compiler errors?",
              "What distinguishes a forwarding reference from an rvalue reference?",
              "Why is `std::forward` needed in a wrapper?",
              "What can `constexpr` guarantee, and what does it not guarantee?"
            ]
          },
          {
            "number": 9,
            "title": "Testing, builds, packages, and debugging",
            "learn": "Learn unit/integration/property testing, test doubles, CMake targets and usage requirements, dependency management, debugger workflows, sanitizers, static analysis, formatting, documentation, and CI.",
            "practice": "package a library with public/private targets, install rules, tests, sanitizer presets, and a minimal consumer project.",
            "questions": [
              "Why should CMake configuration be target-based rather than global?",
              "Which bugs do address, undefined-behavior, and thread sanitizers detect?",
              "When is a fake preferable to a mock?",
              "What belongs in a public target’s usage requirements?",
              "Why should a bug fix begin with a failing regression test?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a multiformat file indexer with RAII resources, concurrent-ready boundaries, a pluggable parser interface, templates where they add real reuse, installed library targets, tests, sanitizers, and performance measurements."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "The object model and low-level correctness",
            "learn": "Study value categories, temporary materialization, lifetime extension, alignment, placement construction, strict aliasing, object representation, undefined behavior, pointer provenance awareness, and safe interoperation with C APIs.",
            "practice": "review low-level snippets for lifetime and aliasing defects; replace risky techniques with standard facilities such as `span`, `bit_cast`, and `memcpy`.",
            "questions": [
              "How do lvalues, xvalues, and prvalues affect overload resolution?",
              "Which temporary lifetimes can a reference extend?",
              "Why does allocated storage not automatically contain a live object of any chosen type?",
              "When is `std::bit_cast` appropriate?",
              "What ownership and exception rules must a C callback boundary document?"
            ]
          },
          {
            "number": 11,
            "title": "Advanced library design",
            "learn": "Study API/ABI stability, PImpl, allocator-aware design, `span`, ranges, views, coroutines, type erasure, customization points, modules awareness, error choices (`exception`, `expected`, error code), and semantic versioning.",
            "practice": "publish a library with a stable façade, range-based operations, explicit error model, benchmarks, and compatibility notes.",
            "questions": [
              "How does PImpl reduce build coupling and help ABI stability?",
              "Why can a lazy view outlive data it references?",
              "When is type erasure preferable to templates or virtual inheritance?",
              "How should a library choose between exceptions and result-like values?",
              "What state is stored in a coroutine frame, and who owns it?"
            ]
          },
          {
            "number": 12,
            "title": "Concurrency and asynchronous systems",
            "learn": "Learn `jthread`, mutexes, condition variables, futures, atomics, the memory model, happens-before, cancellation, task queues, deadlock avoidance, false sharing, and lock-free caveats.",
            "practice": "build a bounded thread pool with cancellation and clean shutdown; stress-test it and analyze races with a thread sanitizer.",
            "questions": [
              "What creates a happens-before relationship?",
              "Why must a condition-variable predicate be checked in a loop?",
              "How does `jthread` improve lifecycle management?",
              "What does acquire/release ordering guarantee?",
              "Why is lock-free code not automatically wait-free, safe, or fast?"
            ]
          },
          {
            "number": 13,
            "title": "Performance engineering",
            "learn": "Learn measurement methodology, profilers, benchmarking, allocation behavior, cache locality, branch prediction, vectorization, data-oriented design, small-buffer techniques, compile-time cost, and whole-program optimization.",
            "practice": "optimize a real workload only after profiling; preserve tests and report before/after distributions, environment, trade-offs, and rejected ideas.",
            "questions": [
              "Why is asymptotic complexity insufficient to predict real performance?",
              "How can data layout dominate algorithm runtime?",
              "Which benchmark mistakes produce dead-code or constant-folded results?",
              "When can reducing allocations matter more than instruction count?",
              "How do you prove an optimization preserved behavior?"
            ]
          },
          {
            "number": 14,
            "title": "Production architecture and secure C++",
            "learn": "Study dependency direction, ownership architecture, resilience, logging/observability, serialization, input hardening, integer and bounds safety, supply-chain controls, coding standards, code review, and maintaining large builds.",
            "practice": "threat-model and harden the intermediate project, add structured diagnostics, resource limits, dependency auditing, and failure-injection tests.",
            "questions": [
              "Which component should own each long-lived resource and shutdown sequence?",
              "How do `span` and bounds-aware APIs reduce risk?",
              "What information should production diagnostics include without leaking secrets?",
              "How can dependency and header structure affect build time?",
              "Which failure paths are most likely to be untested in ordinary unit tests?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Choose one: an HTTP server, game/graphics core, concurrent job engine, database component, or language tool. Require a design document, modern ownership model, stable interfaces, CMake packaging, extensive tests, sanitizers, concurrency analysis, benchmarks, profiler-driven optimization, threat model, CI, and a retrospective explaining trade-offs."
        }
      }
    ],
    "extras": [
      {
        "name": "C++-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      },
      {
        "name": "Special deep dive — C++ pointers, ownership, and lifetime",
        "checkpoint": null,
        "notes": [
          {
            "title": "Ownership map you must be able to explain",
            "body": "| Form | Intended meaning | Key question | | --- | --- | --- | | `T` | Owned value | Is value semantics sufficient? | | `T&` / `const T&` | Required non-owning reference | Does the referred object outlive the use? | | `T*` / `const T*` | Optional or range-associated non-owner | Is null meaningful, and who owns the pointee? | | `std::unique_ptr<T>` | Exclusive dynamic ownership | Where is ownership transferred with `std::move`? | | `std::shared_ptr<T>` | Shared lifetime ownership | Is shared ownership truly required, and can cycles form? | | `std::weak_ptr<T>` | Non-owning observation of shared state | How is expiration handled? | | `std::span<T>` | Non-owning contiguous range | Is the source alive and unchanged for the span’s use? | | `std::string_view` | Non-owning character view | Can temporary/string mutation make the view dangle? |"
          },
          {
            "title": "Required ownership drills",
            "body": "1. Draw the ownership graph for a tree, graph, observer list, async callback, and cache. Label strong and non-owning edges. 2. Refactor a `new`/`delete` code sample into values and RAII, then justify each remaining indirection. 3. Create and fix a `shared_ptr` cycle; compare a `weak_ptr` solution with redesigned ownership. 4. Demonstrate dangling references from a returned local, invalidated vector element, temporary `string_view`, and lambda reference capture. 5. Implement a movable-only resource wrapper with correct destruction, move operations, `noexcept`, and a documented moved-from state. 6. Pass a resource through a C API callback using a safe lifetime plan, and explain exception containment at the boundary. You pass this deep dive only when every object in the checkpoint project has a clear owner, all non-owning views have justified lifetimes, destruction order is predictable, and sanitizer tests cover invalidation-prone paths."
          }
        ]
      }
    ]
  },
  "java": {
    "title": "Java",
    "blurb": "Target: current LTS Java, with awareness of newer language features. Use a JDK, IDE/debugger, formatter, Maven or Gradle, JUnit, static analysis, and Git from the beginning.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "JDK, JVM, syntax, and program structure",
            "learn": "Learn source files, packages, `main`, compilation to bytecode, JVM execution, variables, primitive/reference types, literals, operators, conversions, `var`, console I/O, and JShell.",
            "practice": "create a CLI unit converter and inspect its bytecode and process exit behavior.",
            "questions": [
              "How do the JDK, JRE concept, JVM, bytecode, and source compiler relate?",
              "Which Java types are primitive and which are references?",
              "When does numeric promotion occur?",
              "What does `var` infer, and does it make Java dynamically typed?",
              "Why should package names be stable and globally distinctive?"
            ]
          },
          {
            "number": 2,
            "title": "Control flow, methods, and arrays",
            "learn": "Learn conditions, loops, classic/enhanced `switch`, methods, parameters, overloading, recursion, scope, arrays, varargs, command-line arguments, and assertions.",
            "practice": "implement a statistics tool over validated numeric input with small methods and boundary tests.",
            "questions": [
              "Is Java pass-by-value, including when passing object references?",
              "How does overload resolution differ from overriding?",
              "When is a switch expression clearer than a statement?",
              "What exception results from invalid array indexing?",
              "Why should assertions not enforce ordinary user-input validation?"
            ]
          },
          {
            "number": 3,
            "title": "Classes, records, and object design",
            "learn": "Learn classes, fields, constructors, methods, access modifiers, encapsulation, immutability, `this`, static members, enums, records, packages, `equals`, `hashCode`, `toString`, and composition.",
            "practice": "model immutable `Money`, `Product`, and `Order` values with enforced invariants.",
            "questions": [
              "Which invariants should a constructor establish?",
              "Why must equal objects have equal hash codes?",
              "When is a record appropriate, and when is a regular class better?",
              "Why is an immutable object easier to share and reason about?",
              "What does `private` protect, and what does it not protect?"
            ]
          },
          {
            "number": 4,
            "title": "Core library, strings, and collections",
            "learn": "Learn `String` immutability, `StringBuilder`, wrappers/autoboxing, `List`, `Set`, `Map`, queues, iterators, collection factories, sorting, comparators, date/time, regex basics, and BigDecimal for decimal amounts.",
            "practice": "build a contact book with search, grouping, sorting, and reliable date handling.",
            "questions": [
              "Why should strings be compared with `equals` instead of `==`?",
              "What trade-offs distinguish a list, set, and map?",
              "Why is `BigDecimal` usually preferable to `double` for money?",
              "What can structurally modifying a collection during iteration cause?",
              "Why is `java.time` designed around immutable types?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a console-based library manager with a clean domain model, collections, persistence to a simple text format, input validation, meaningful errors, JUnit tests, and a Maven or Gradle build."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Inheritance, interfaces, and polymorphism",
            "learn": "Learn interfaces, abstract/concrete classes, overriding, dynamic dispatch, sealed hierarchies, pattern matching where available, default methods, substitutability, and composition over inheritance.",
            "practice": "model several payment methods behind an interface and a sealed result hierarchy; test every permitted variant.",
            "questions": [
              "What does dynamic dispatch select at runtime?",
              "When should an API expose an interface rather than a base class?",
              "What design benefit does a sealed hierarchy provide?",
              "How can a subclass violate the base type’s contract?",
              "When is composition clearer than inheritance?"
            ]
          },
          {
            "number": 6,
            "title": "Exceptions and resource management",
            "learn": "Learn exception hierarchies, checked versus unchecked exceptions, propagation, wrapping, cause chains, try-with-resources, `AutoCloseable`, multi-catch, suppressed exceptions, validation, and domain error design.",
            "practice": "build an importer that reports row-level problems, closes resources, preserves root causes, and distinguishes recoverable from fatal failures.",
            "questions": [
              "When should an exception be checked or unchecked?",
              "Why is catching `Exception` broadly usually harmful?",
              "How does try-with-resources handle multiple close failures?",
              "When should a low-level exception be translated at an abstraction boundary?",
              "What context should an error message include without leaking sensitive data?"
            ]
          },
          {
            "number": 7,
            "title": "Generics and functional-style Java",
            "learn": "Learn generic types/methods, invariance, bounds, wildcards, PECS, type erasure, lambdas, method references, functional interfaces, streams, collectors, and `Optional`.",
            "practice": "implement typed repository operations and stream-based reporting, then compare the stream version with an imperative one for clarity and cost.",
            "questions": [
              "Why is `List<Integer>` not a subtype of `List<Number>`?",
              "Explain “producer extends, consumer super.”",
              "What information is lost through type erasure?",
              "Why should streams generally avoid stateful side effects?",
              "Where is `Optional` helpful, and where is it often misused?"
            ]
          },
          {
            "number": 8,
            "title": "Files, serialization, networking, and HTTP",
            "learn": "Learn paths and NIO files, buffered streams/readers, charsets, resource handling, JSON through a maintained library, serialization risks, sockets/HTTP client basics, timeouts, retries, and input limits.",
            "practice": "create an HTTP client that fetches paginated JSON, handles timeouts/status codes, validates schema assumptions, and caches results locally.",
            "questions": [
              "Why must text decoding specify or know a charset?",
              "Why is native Java object deserialization unsafe for untrusted data?",
              "Which HTTP failures should be retried, and with what safeguards?",
              "How do connect and request/read timeouts differ?",
              "Why should a parser limit document size and nesting?"
            ]
          },
          {
            "number": 9,
            "title": "Testing, builds, dependency injection, and quality",
            "learn": "Learn JUnit lifecycle and assertions, parameterized/property tests, test doubles, integration tests, Maven/Gradle dependency scopes, logging, configuration, static analysis, formatting, coverage, and CI.",
            "practice": "refactor the checkpoint app into layered components with injected clock/storage dependencies and fast deterministic tests.",
            "questions": [
              "What behavior should be covered by a unit test versus an integration test?",
              "Why is constructor injection useful even without a DI framework?",
              "What does high coverage fail to prove?",
              "Why should logs use structured fields and parameterized messages?",
              "How can dependency version conflicts arise in a JVM build?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a REST service using a mainstream framework such as Spring Boot: layered domain/application/adapters, PostgreSQL persistence, schema migrations, request validation, consistent errors, authentication basics, OpenAPI documentation, unit/integration tests, containerized local setup, and CI."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "JVM internals and memory",
            "learn": "Study class loading/linking/initialization, stack and heap, object identity/layout concepts, garbage collection, allocation, reachability, reference types, JIT compilation, escape analysis, Java Memory Model foundations, and profiling tools.",
            "practice": "diagnose an allocation-heavy workload using JFR or equivalent tooling; change the design only from measurement and verify the result.",
            "questions": [
              "What makes an object eligible for garbage collection?",
              "Why does garbage collection not eliminate resource leaks?",
              "How can a static collection retain an otherwise unused object graph?",
              "What is JIT compilation, and why does it complicate microbenchmarks?",
              "What evidence distinguishes high allocation rate from a true memory leak?"
            ]
          },
          {
            "number": 11,
            "title": "Concurrency and asynchronous programming",
            "learn": "Learn threads and virtual threads, executors, futures, `CompletableFuture`, structured concurrency awareness, synchronization, locks, atomics, concurrent collections, immutability, happens-before, interruption, cancellation, deadlock, and backpressure.",
            "practice": "build a bounded concurrent job service with cancellation, timeouts, graceful shutdown, load tests, and race/deadlock analysis.",
            "questions": [
              "What visibility guarantee does a happens-before relationship provide?",
              "Why does `volatile` not make compound operations atomic?",
              "When are virtual threads beneficial, and when do they not help?",
              "How should interruption be propagated or restored?",
              "Why must concurrency limits exist even with cheap threads?"
            ]
          },
          {
            "number": 12,
            "title": "Database and transactional application design",
            "learn": "Learn JDBC lifecycles, pooling, prepared statements, ORM mapping, lazy/eager loading, N+1 queries, transaction boundaries, isolation, locking, optimistic concurrency, migrations, and outbox/event consistency patterns.",
            "practice": "implement a transactional order workflow with idempotency, concurrent-update protection, query analysis, and integration tests against PostgreSQL.",
            "questions": [
              "Why must a connection always return to its pool?",
              "How do prepared statements improve both safety and efficiency?",
              "What creates the N+1 query problem?",
              "Where should an application transaction begin and end?",
              "Why can publishing an event after committing create inconsistency, and how does an outbox help?"
            ]
          },
          {
            "number": 13,
            "title": "Service architecture, security, and observability",
            "learn": "Study modularity, API versioning, authentication/authorization, OWASP risks, secrets, TLS, rate limits, resilience patterns, distributed tracing, metrics, structured logging, health probes, deployment, and failure-mode design.",
            "practice": "threat-model the REST service, add authorization, audit events, trace correlation, service-level metrics, rate limits, safe configuration, and failure injection.",
            "questions": [
              "Why must authorization be checked server-side at the resource/action boundary?",
              "When can retries amplify an outage?",
              "How do a metric, log, and trace answer different questions?",
              "What makes an endpoint operation idempotent?",
              "Which secrets and personal data must never appear in logs?"
            ]
          },
          {
            "number": 14,
            "title": "Performance, compatibility, and maintainability",
            "learn": "Learn JMH benchmarking, profilers, latency percentiles, throughput/latency trade-offs, caching, batching, class/module compatibility, public API evolution, dependency governance, architecture tests, and incremental refactoring.",
            "practice": "establish a performance budget and optimize one measured bottleneck; publish before/after evidence and compatibility notes.",
            "questions": [
              "Why should Java microbenchmarks use a harness such as JMH?",
              "Why is p99 latency important even if the average is low?",
              "What invalidation and consistency questions must every cache answer?",
              "Which changes can preserve source compatibility but break binary compatibility?",
              "How can module boundaries be enforced continuously?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Build a production-style service or modular desktop/CLI platform. Require an architectural decision record, versioned API, PostgreSQL transactions, concurrency limits, authentication/authorization, migrations, tests at multiple levels, JFR/profile evidence, observability, deployment configuration, threat model, CI, and failure/recovery documentation."
        }
      }
    ],
    "extras": [
      {
        "name": "Java-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      }
    ]
  },
  "javascript": {
    "title": "JavaScript",
    "blurb": "Target: modern ECMAScript in browsers and Node.js. Keep runtime APIs distinct from the language itself. Use ESM, a formatter/linter, test runner, browser DevTools, Node inspector, and package lockfiles.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Runtime, values, variables, and operators",
            "learn": "Learn browser/Node runtimes, console and DevTools, scripts/modules, `let`/`const`, primitive values, objects, `typeof`, operators, coercion, equality, truthiness, template literals, and strict mode/module behavior.",
            "practice": "build a browser or CLI unit converter with input normalization and helpful errors.",
            "questions": [
              "Which features belong to ECMAScript, and which are supplied by a browser or Node.js?",
              "How do `const`, `let`, and legacy `var` differ?",
              "What is the practical difference between `===` and `==`?",
              "Why is `typeof null` surprising?",
              "Which values are falsy, and why can truthiness-based defaults lose valid data?"
            ]
          },
          {
            "number": 2,
            "title": "Control flow and functions",
            "learn": "Learn conditions, loops, switch, function declarations/expressions, arrow functions, parameters/defaults/rest, returns, scope, closures introduction, callbacks, and error throwing.",
            "practice": "create a text analyzer from small pure functions and reusable callbacks.",
            "questions": [
              "How does an arrow function’s `this` differ from a regular function’s?",
              "What is lexical scope?",
              "Why does a function with no explicit return produce `undefined`?",
              "When is `for...of` appropriate, and why is `for...in` different?",
              "What state can a closure retain after an outer call finishes?"
            ]
          },
          {
            "number": 3,
            "title": "Arrays, objects, and data transformation",
            "learn": "Learn object literals, property access, destructuring, spread/rest, optional chaining, nullish coalescing, arrays, map/filter/reduce, sorting, `Map`, `Set`, copying, mutation, JSON, and dates awareness.",
            "practice": "build an in-memory product catalog with filtering, grouping, aggregation, immutable updates, and JSON import/export.",
            "questions": [
              "Why is object/array assignment not a deep copy?",
              "How do `??` and `||` differ when applying defaults?",
              "Why does default `Array.prototype.sort` surprise numeric data?",
              "When is `Map` preferable to a plain object?",
              "What values or graph shapes cannot JSON faithfully represent?"
            ]
          },
          {
            "number": 4,
            "title": "DOM, events, forms, and accessibility",
            "learn": "Learn DOM selection/creation, text versus HTML insertion, attributes/classes, event listeners, propagation, delegation, default actions, form controls/validation, accessibility semantics, keyboard interaction, and rendering performance basics.",
            "practice": "create an accessible task manager with delegated events, persistent filters, keyboard support, and no unsafe HTML insertion.",
            "questions": [
              "How do capture, target, and bubble phases work?",
              "When does event delegation simplify dynamic interfaces?",
              "Why is assigning untrusted text to `innerHTML` dangerous?",
              "What does `preventDefault` do versus `stopPropagation`?",
              "Why should native semantic controls be preferred over clickable generic elements?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a responsive browser application using semantic HTML, modular JavaScript, forms, local persistence, accessible interactions, validation, and tests for pure logic. It must work without console errors and pass keyboard-only use."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Prototypes, classes, modules, and API design",
            "learn": "Learn prototypes and delegation, constructor functions awareness, classes, private fields, inheritance, composition, getters/setters, ESM imports/exports, module graphs, live bindings, and cyclic dependency risks.",
            "practice": "create a small domain library twice—once with factory/composition style and once with classes—then document the trade-offs.",
            "questions": [
              "Where does JavaScript look when an object lacks an own property?",
              "Are JavaScript classes separate from the prototype system?",
              "How is an own property different from an inherited one?",
              "What does an ES module export binding mean by “live”?",
              "How can module cycles expose partially initialized state?"
            ]
          },
          {
            "number": 6,
            "title": "Async JavaScript and the event loop",
            "learn": "Learn call stack, tasks/macrotasks, microtasks, promises, `async`/`await`, rejection handling, sequential versus concurrent work, Promise combinators, timers, cancellation with abort signals, and race conditions.",
            "practice": "build a paginated API client with concurrency limits, cancellation, retries with backoff, loading/error states, and stale-response protection.",
            "questions": [
              "In what order do synchronous code, promise handlers, and timers run?",
              "Why can `await` inside a loop unnecessarily serialize independent work?",
              "How do `Promise.all`, `allSettled`, `race`, and `any` differ?",
              "What happens to a rejection that no code handles?",
              "Why does single-threaded execution not eliminate logical race conditions?"
            ]
          },
          {
            "number": 7,
            "title": "HTTP, storage, and browser platform APIs",
            "learn": "Learn fetch request/response lifecycles, status checking, headers, JSON/form data, CORS, cookies, same-origin policy, web storage, IndexedDB awareness, URL APIs, history, workers, observers, and progressive enhancement.",
            "practice": "implement an offline-tolerant data viewer with URL-driven state, a bounded cache, abortable requests, and explicit empty/error states.",
            "questions": [
              "Why does `fetch` not reject on every HTTP error status?",
              "How does CORS protect a user, and what does it not protect?",
              "What security trade-offs distinguish cookies from web storage for tokens?",
              "When is a Web Worker useful?",
              "What cache invalidation policy will prevent stale data from persisting forever?"
            ]
          },
          {
            "number": 8,
            "title": "Node.js and server-side JavaScript",
            "learn": "Learn Node modules/runtime globals, process lifecycle, environment configuration, filesystem paths, buffers, streams, events, HTTP servers, package scripts, signals, error-first callbacks awareness, and secure server input handling.",
            "practice": "create a streaming file-processing CLI and a small HTTP JSON API with graceful shutdown and size/time limits.",
            "questions": [
              "How do a Buffer and a JavaScript string differ?",
              "What problem does stream backpressure solve?",
              "Why should a server handle termination signals?",
              "Which synchronous Node APIs should be avoided on a request path, and why?",
              "Why must configuration be validated before accepting requests?"
            ]
          },
          {
            "number": 9,
            "title": "Testing, debugging, tooling, and dependencies",
            "learn": "Learn unit/integration/end-to-end tests, DOM testing, fakes/mocks, timers, coverage limits, source maps, DevTools breakpoints/network/performance panels, npm package semantics, lockfiles, lint/format rules, bundlers, tree shaking, and CI.",
            "practice": "add deterministic tests, a production build, bundle analysis, dependency audit, and CI to the checkpoint app.",
            "questions": [
              "Which behavior should be tested through the DOM rather than implementation details?",
              "Why can fake timers mask real event-loop behavior?",
              "What does a package lockfile provide?",
              "Under what conditions can tree shaking remove code safely?",
              "What does 100% code coverage fail to guarantee?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a full-stack JavaScript application with an accessible browser client, Node API, PostgreSQL persistence, migrations, authentication basics, validation at boundaries, abortable requests, tests at several levels, secure configuration, structured logging, and CI."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "The language execution model",
            "learn": "Study execution contexts, lexical environments, hoisting, temporal dead zone, closures, `this` binding rules, property descriptors, symbols, iterables/generators, proxies/reflection, equality algorithms, garbage collection/reachability, and weak collections.",
            "practice": "explain tricky runtime snippets before executing them, then replace clever mechanisms with maintainable code where appropriate.",
            "questions": [
              "What is hoisted for function declarations, `var`, `let`, and `const`?",
              "How is `this` chosen for method, plain, constructor, bound, and arrow calls?",
              "What do writable, enumerable, and configurable descriptors control?",
              "When can a WeakMap avoid unintended object retention?",
              "Which invariants must a Proxy handler preserve?"
            ]
          },
          {
            "number": 11,
            "title": "Architecture and state management",
            "learn": "Learn separation of domain/UI/infrastructure, dependency direction, state machines, immutable state, reactive/event architectures, routing, component boundaries, server versus client state, caching, optimistic updates, plugin systems, and API evolution.",
            "practice": "refactor the full-stack app around explicit state transitions and adapters; document dependency rules and data ownership.",
            "questions": [
              "Which state should be represented in the URL, server, durable browser storage, or memory?",
              "How does a state machine prevent impossible UI combinations?",
              "When can optimistic updates mislead a user?",
              "Why should business rules remain independent of a UI framework?",
              "What creates a stable boundary between application and external APIs?"
            ]
          },
          {
            "number": 12,
            "title": "Performance and memory",
            "learn": "Learn browser rendering pipeline, layout/paint/compositing, event responsiveness, long tasks, code splitting, loading priorities, memoization trade-offs, Node profiling, heap snapshots, leaks from listeners/closures, benchmark design, and Core Web Vitals awareness.",
            "practice": "establish a performance budget, profile a real user journey, fix a measured bottleneck, and publish before/after evidence.",
            "questions": [
              "What causes layout thrashing?",
              "Why can reducing bundle size improve more than download time?",
              "How can an event listener keep a detached DOM tree alive?",
              "When does memoization cost more than recomputation?",
              "What is the difference between lab and field performance data?"
            ]
          },
          {
            "number": 13,
            "title": "Security and reliability",
            "learn": "Study XSS, CSRF, injection, prototype pollution, CSP, trusted data boundaries, authentication/authorization, session management, dependency risks, rate limits, idempotency, timeouts/retries, observability, and graceful degradation.",
            "practice": "threat-model and attack-test the intermediate app; add CSP, output-safe rendering, authorization tests, resource limits, audit logs, and dependency controls.",
            "questions": [
              "How do stored, reflected, and DOM-based XSS differ?",
              "Why is client-side authorization never sufficient?",
              "When does SameSite cookie configuration reduce CSRF risk?",
              "How can merging untrusted objects cause prototype pollution?",
              "Why must retries use idempotency and bounded backoff?"
            ]
          },
          {
            "number": 14,
            "title": "Production platform engineering",
            "learn": "Learn deployment targets, process/container lifecycle, horizontal scaling, queues/jobs, database pools, caching, telemetry, feature flags, source-map privacy, compatibility, progressive delivery, incident response, and framework migration strategy.",
            "practice": "deploy the capstone-like app in a reproducible environment with dashboards, alerts, safe migrations, rollback, synthetic checks, and an operational runbook.",
            "questions": [
              "Why must in-memory session state be reconsidered when scaling horizontally?",
              "What limits should database and outbound HTTP pools enforce?",
              "How can a feature flag become long-term technical debt?",
              "Which release signals should trigger rollback?",
              "What should an operational runbook contain?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Build a collaborative web app, offline-first tool, developer platform, or streaming service. Require accessible UI, explicit state architecture, Node services, PostgreSQL transactions, real-time or worker processing where appropriate, security review, performance budgets, automated tests, observability, deployment/rollback, CI, and a failure-recovery exercise."
        }
      }
    ],
    "extras": [
      {
        "name": "JavaScript-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      }
    ]
  },
  "typescript": {
    "title": "TypeScript",
    "blurb": "Target: current strict TypeScript used with modern JavaScript. TypeScript does not replace JavaScript knowledge; complete at least the JavaScript Beginner section first. Enable `strict` and adopt additional safety flags deliberately.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Compiler model and everyday types",
            "learn": "Learn type erasure, inference, annotations, primitive types, arrays/tuples, object types, function signatures, optional/default parameters, unions, literals, aliases, interfaces, readonly, and `tsconfig` basics.",
            "practice": "convert a small JavaScript calculator or data transformer to strict TypeScript without using `any`.",
            "questions": [
              "Which TypeScript information remains at runtime?",
              "When should inference be preferred over an annotation?",
              "How do an optional property and a property containing `undefined` differ?",
              "What does `readonly` prevent, and what does it not deeply prevent?",
              "Why must runtime input still be validated?"
            ]
          },
          {
            "number": 2,
            "title": "Unions, narrowing, and safe control flow",
            "learn": "Learn `typeof`, equality/truthiness narrowing, property checks, discriminated unions, exhaustiveness, `never`, user-defined predicates, assertion functions, optional chaining, and nullish coalescing.",
            "practice": "model request states and domain outcomes as discriminated unions with exhaustive render/handler functions.",
            "questions": [
              "What evidence allows the compiler to narrow a union?",
              "Why is truthiness narrowing unsafe for some strings or numbers?",
              "How does a discriminant make invalid states harder to represent?",
              "How can `never` enforce exhaustive handling?",
              "Why can a careless user-defined predicate lie to the compiler?"
            ]
          },
          {
            "number": 3,
            "title": "Functions, objects, and reusable contracts",
            "learn": "Learn call/construct signatures, overloads, callbacks, contextual typing, interfaces versus aliases, index signatures, excess-property checks, intersections, `keyof`, `typeof` in type positions, and module exports.",
            "practice": "design a typed event system and configuration API with documented valid/invalid calls.",
            "questions": [
              "When are overload signatures clearer than a union parameter?",
              "How do interface extension and type intersection differ when properties conflict?",
              "What does `keyof` produce?",
              "Why do fresh object literals receive excess-property checks?",
              "How can an index signature weaken known property guarantees?"
            ]
          },
          {
            "number": 4,
            "title": "Classes and typed application boundaries",
            "learn": "Learn parameter properties, access modifiers, abstract classes, implements, private fields versus TypeScript `private`, generics introduction, DOM typings, event types, JSON as `unknown`, and safe API response parsing.",
            "practice": "build a typed browser task application that validates persisted and remote data before use.",
            "questions": [
              "Does `implements` change emitted JavaScript or inherit implementation?",
              "How does JavaScript `#private` differ from TypeScript `private`?",
              "Why should parsed JSON be treated as `unknown`?",
              "When is an abstract class preferable to an interface?",
              "How do DOM nullability types influence element lookup code?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a strict TypeScript browser or Node application with no `any`, discriminated UI/domain states, typed modules, runtime validation for all external data, accessible errors, tests, linting, and a reproducible build."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Generics and constraints",
            "learn": "Learn generic functions/types/classes, inference, constraints, defaults, `keyof` relationships, indexed access, variance intuition, generic callbacks, and avoiding meaningless generics.",
            "practice": "implement a typed repository and reusable collection utilities that preserve precise input/output relationships.",
            "questions": [
              "What relationship does a type parameter express that a union cannot?",
              "Why should a generic parameter appear in more than one meaningful position?",
              "How does `K extends keyof T` protect property access?",
              "What makes function parameter variance important under strict checking?",
              "When does a generic default improve usability?"
            ]
          },
          {
            "number": 6,
            "title": "Type transformations",
            "learn": "Learn mapped types, conditional types, distributivity, inference with `infer`, template literal types, key remapping, recursive types with care, and built-in utilities such as `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`, and `Awaited`.",
            "practice": "derive API DTO, patch, event-name, and permission types from one domain schema while keeping the result readable.",
            "questions": [
              "How does a mapped type iterate over keys?",
              "When does a conditional type distribute over a union?",
              "How can tuple wrapping prevent distributivity?",
              "What can `infer` capture?",
              "When should an explicit named type replace a clever transformation?"
            ]
          },
          {
            "number": 7,
            "title": "Declarations, modules, and third-party code",
            "learn": "Learn ESM/CJS interoperability, module resolution, declaration files, ambient declarations, module augmentation, package `exports`/`types`, project layout, path alias limitations, and consuming untyped libraries safely.",
            "practice": "author a small JavaScript library plus accurate `.d.ts` declarations and type-level usage tests.",
            "questions": [
              "What does `declare` promise to the compiler?",
              "Why can an inaccurate declaration file be more dangerous than no types?",
              "How do runtime module resolution and TypeScript resolution become mismatched?",
              "When is module augmentation appropriate?",
              "Why does a path alias not necessarily rewrite emitted import paths?"
            ]
          },
          {
            "number": 8,
            "title": "Runtime validation and boundary design",
            "learn": "Learn `unknown` versus `any`, schema validation libraries or handwritten guards, parsing versus asserting, branded/opaque types, normalization, error accumulation, API contracts, environment/config validation, and database row mapping.",
            "practice": "create a validation layer for HTTP, configuration, and persistence boundaries that returns typed successes and structured failures.",
            "questions": [
              "Why is `unknown` safer than `any`?",
              "What is the semantic difference between validating, parsing, and asserting?",
              "How can a branded type distinguish two strings with different domain meanings?",
              "Where should untrusted data become trusted domain data?",
              "Why should environment variables not be cast directly to desired types?"
            ]
          },
          {
            "number": 9,
            "title": "Tooling, testing, and monorepo-scale builds",
            "learn": "Learn strict compiler flags, lint rules, source maps, test runners, type tests, transpilers versus `tsc`, bundlers, declaration emission, project references, incremental builds, package boundaries, lockfiles, and CI.",
            "practice": "create a two-package workspace with references, public declarations, runtime/unit/type tests, and independent builds.",
            "questions": [
              "Which strictness flags surface unchecked indexed or optional-property access?",
              "Why might a project use a fast transpiler and still run `tsc --noEmit`?",
              "What should a type-level test verify?",
              "How do project references improve large builds?",
              "Which types should stay internal rather than appear in emitted declarations?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a full-stack TypeScript application with shared contracts used carefully, server-side runtime validation, PostgreSQL persistence, discriminated errors, strict builds, type-level and runtime tests, a workspace structure, generated API docs/schema where suitable, and CI."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "Soundness boundaries and compiler behavior",
            "learn": "Study structural typing, intentional unsoundness, excess checks, bivariance cases, array covariance, control-flow analysis, assertion hazards, declaration trust, `satisfies`, const assertions, exactness limitations, and compiler performance.",
            "practice": "audit a codebase for casts and `any`; classify every escape hatch, remove unnecessary ones, and validate the remaining runtime assumptions.",
            "questions": [
              "Why is TypeScript not a sound type system?",
              "How does `satisfies` differ from an annotation or assertion?",
              "Why can an array covariance scenario permit an unsafe write?",
              "What guarantee does `as` provide at runtime?",
              "How can a very complex type slow editor/compiler feedback?"
            ]
          },
          {
            "number": 11,
            "title": "Advanced API and library type design",
            "learn": "Learn fluent builders, state encoded in types, overload versus conditional API choices, nominal techniques, higher-order generic inference, typed event maps, plugin registries, public type stability, declaration bundling, and version compatibility.",
            "practice": "publish a small library whose API prevents invalid call sequences without incomprehensible diagnostics.",
            "questions": [
              "When is encoding protocol state in types valuable rather than excessive?",
              "How can a fluent API preserve information between calls?",
              "Why are exported conditional types part of a compatibility contract?",
              "What makes an error message usable for a library consumer?",
              "When should runtime simplicity win over maximal compile-time precision?"
            ]
          },
          {
            "number": 12,
            "title": "Framework and asynchronous architecture",
            "learn": "Apply types to component props/state, hooks/composables, route parameters, server/client boundaries, dependency injection, async state machines, queues/events, cancellation, RPC/schema generation, and framework escape hatches.",
            "practice": "implement a feature vertically from database to UI with explicit DTO/domain separation, cancellation, exhaustive states, and no unchecked type assertions.",
            "questions": [
              "Why should database entities not automatically be UI models?",
              "How do generated types drift from runtime services?",
              "Which async states must an interface model beyond loading/success/error?",
              "Why can generic component APIs become difficult to infer?",
              "Where should framework-specific types stop propagating?"
            ]
          },
          {
            "number": 13,
            "title": "Security, reliability, and production operations",
            "learn": "Study the false sense of runtime safety from static types, authorization, injection, prototype pollution, dependency risks, timeouts/retries/idempotency, logs/metrics/traces, feature flags, migrations, and failure recovery.",
            "practice": "threat-model the checkpoint app and add validation/resource limits, authorization tests, resilient outbound calls, observability, safe deploy/migration steps, and an incident runbook.",
            "questions": [
              "Which security bugs cannot static typing prevent?",
              "Why must authorization use trusted server-side identity and current data?",
              "How can typed object merging still enable prototype pollution?",
              "What makes a retry safe?",
              "Which correlation fields connect a typed request across services?"
            ]
          },
          {
            "number": 14,
            "title": "Migration and long-term maintainability",
            "learn": "Learn incremental JavaScript migration, `allowJs`/`checkJs`, strictness rollout, codemods, dependency/type versioning, architectural boundaries, API deprecation, type complexity budgets, build performance, and upgrades.",
            "practice": "plan and execute an incremental migration of a representative JavaScript module tree, measuring escape-hatch count, build/editor latency, and defect discoveries.",
            "questions": [
              "Which modules should be migrated first to create useful typed boundaries?",
              "How can strictness increase without blocking all feature work?",
              "Why must runtime and `@types`/declaration versions align?",
              "When is a codemod safer than manual repetitive editing?",
              "What metrics indicate that type complexity is harming maintainability?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Build a production-grade full-stack system or reusable library. Require strict public contracts, runtime validation, domain/DTO separation, advanced types only where they simplify use, accessible UI if applicable, PostgreSQL, security review, performance and type-check budgets, tests, declarations/documentation, observability, reproducible deployment, and a migration/versioning strategy."
        }
      }
    ],
    "extras": [
      {
        "name": "TypeScript-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      }
    ]
  },
  "sql": {
    "title": "SQL and PostgreSQL",
    "blurb": "Target: current supported PostgreSQL. This path covers standard relational SQL plus PostgreSQL-specific design, performance, concurrency, security, and operations. Use `psql`, a migration tool, version-controlled SQL, realistic seed data, and `EXPLAIN (ANALYZE, BUFFERS)` in a disposable environment.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Relational concepts and PostgreSQL tools",
            "learn": "Learn server/database/schema/table/row/column relationships, relations and keys, data types, SQL statement categories, PostgreSQL installation or containers, `psql`, connection strings, transactions introduction, SQL formatting, and the system catalog overview.",
            "practice": "create a disposable database and explore it using both `psql` meta-commands and catalog queries.",
            "questions": [
              "How do a PostgreSQL cluster/server, database, schema, and table differ?",
              "What makes a candidate key different from a primary key?",
              "Why is table row order not guaranteed without `ORDER BY`?",
              "Which work is performed by the client and which by the database server?",
              "Why should schema changes be version controlled?"
            ]
          },
          {
            "number": 2,
            "title": "Data types, tables, and constraints",
            "learn": "Learn integer/numeric/floating types, text, boolean, dates/times/time zones, UUID, generated identities, arrays/JSON awareness, `CREATE`/`ALTER`/`DROP`, defaults, `NOT NULL`, `CHECK`, `UNIQUE`, primary/foreign keys, and naming conventions.",
            "practice": "model customers, products, orders, and order lines with precise types and constraints that reject invalid states.",
            "questions": [
              "Why is `numeric` usually preferable to floating point for money?",
              "How do `timestamp` and `timestamptz` behave differently?",
              "What does a foreign key guarantee, and what business rules does it not guarantee?",
              "Why should required fields have `NOT NULL` even if application validation exists?",
              "When is a generated identity preferable to application-generated UUIDs, and vice versa?"
            ]
          },
          {
            "number": 3,
            "title": "Reading data with SELECT",
            "learn": "Learn select lists, aliases, `DISTINCT`, expressions, filtering, comparison, three-valued logic, `NULL`, `IN`, `BETWEEN`, pattern matching, ordering, limiting/offsetting, scalar functions, casts, and `CASE`.",
            "practice": "write a report suite for the sales schema, including missing-data cases and deterministic ordering.",
            "questions": [
              "Why does `column = NULL` not match null values?",
              "How do `WHERE`, `ORDER BY`, and `LIMIT` conceptually affect a query?",
              "Why must paginated results have deterministic ordering?",
              "When does `DISTINCT` hide a join/modeling mistake?",
              "What does `CASE` add to a projection or ordering rule?"
            ]
          },
          {
            "number": 4,
            "title": "Changing data safely",
            "learn": "Learn `INSERT`, multirow inserts, `UPDATE`, `DELETE`, `RETURNING`, upserts with `ON CONFLICT`, transactions, explicit column lists, safe predicates, foreign-key actions, and basic migration/data-fix discipline.",
            "practice": "implement an idempotent product import and a transactional order creation script using `RETURNING`.",
            "questions": [
              "Why should an insert usually specify its target columns?",
              "What danger comes from an update or delete without a correct predicate?",
              "How does `RETURNING` remove a client round trip or race?",
              "What conflict target makes an upsert meaningful?",
              "When should a foreign key restrict, cascade, set null, or require explicit application handling?"
            ]
          },
          {
            "number": 5,
            "title": "Joins and set operations",
            "learn": "Learn inner/outer/cross/self joins, join predicates, one-to-many and many-to-many relations, semi/anti joins through `EXISTS`, `UNION`/`UNION ALL`, `INTERSECT`, `EXCEPT`, and duplicate multiplication.",
            "practice": "write customer/order/product reports, including customers with no orders and products never purchased.",
            "questions": [
              "How does a join predicate differ from a filter predicate in an outer join?",
              "Why can joining two one-to-many relations inflate aggregates?",
              "When is `EXISTS` clearer than joining and deduplicating?",
              "How do `UNION` and `UNION ALL` differ?",
              "What row preservation does a left join promise?"
            ]
          },
          {
            "number": 6,
            "title": "Aggregation and grouping",
            "learn": "Learn aggregate functions, `GROUP BY`, `HAVING`, filtered aggregates, null behavior, conditional aggregation, grouping sets/rollup/cube awareness, and common reporting patterns.",
            "practice": "produce daily/monthly sales, customer cohorts, inventory summaries, and zero-activity groups accurately.",
            "questions": [
              "Why do most aggregates ignore null, while `count(*)` counts rows?",
              "How do `WHERE` and `HAVING` differ?",
              "Why must every selected nonaggregate expression be compatible with grouping?",
              "How can a filtered aggregate replace multiple scans or subqueries?",
              "How do you retain groups that have no matching fact rows?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Design and implement a normalized bookstore or learning-platform database. Provide an ER diagram, DDL with constraints, realistic seed data, at least 25 meaningful queries across joins/aggregates/subqueries, safe change scripts, and a README explaining every modeling choice."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 7,
            "title": "Subqueries, CTEs, and views",
            "learn": "Learn scalar/table/correlated subqueries, `EXISTS`, common table expressions, recursive CTEs, views, materialized views, lateral joins, query composition, and PostgreSQL CTE planning behavior awareness.",
            "practice": "implement category-tree traversal, latest-per-group queries, reusable reporting views, and refreshable summaries.",
            "questions": [
              "When is a correlated subquery evaluated conceptually, and how may the planner transform it?",
              "What base and recursive terms must a recursive CTE contain?",
              "How does a view differ from a materialized view?",
              "When is `LATERAL` necessary?",
              "Why should a CTE improve clarity rather than merely split a query arbitrarily?"
            ]
          },
          {
            "number": 8,
            "title": "Window functions and advanced querying",
            "learn": "Learn `OVER`, partitioning, window ordering/frames, ranking, running totals, moving averages, lag/lead, first/last value frame traps, top-N per group, gap/session analysis, and combining aggregates with windows.",
            "practice": "create retention, ranking, running-balance, streak, and comparison reports without losing row detail.",
            "questions": [
              "How does a window function differ from `GROUP BY`?",
              "What do partition, order, and frame each control?",
              "Why can `last_value` return an unexpected result under the default frame?",
              "How do you return the top three rows per category?",
              "Why can a window function not normally appear directly in `WHERE`?"
            ]
          },
          {
            "number": 9,
            "title": "Data modeling and normalization",
            "learn": "Learn functional dependencies, first/second/third normal forms, BCNF awareness, junction tables, cardinality/optionality, natural versus surrogate keys, temporal modeling, soft deletion trade-offs, immutable facts, denormalization, multi-tenancy, and schema evolution.",
            "practice": "take a spreadsheet-like design through normalization, identify dependencies/anomalies, then justify any deliberate denormalization.",
            "questions": [
              "What insert, update, and delete anomalies does normalization prevent?",
              "What functional dependency violates third normal form in your design?",
              "When is a composite key the clearest key?",
              "Why can a universal `deleted_at` strategy complicate uniqueness and foreign keys?",
              "What measured workload could justify denormalization?"
            ]
          },
          {
            "number": 10,
            "title": "Indexes and query plans",
            "learn": "Learn heap storage concepts, B-tree and other PostgreSQL index types, multicolumn order, selectivity, partial/expression/covering indexes, unique indexes, statistics, `EXPLAIN`, actual versus estimated rows, scans/joins/sorts, sargability, and index maintenance cost.",
            "practice": "generate a realistic large dataset, identify three slow queries, read their plans, make evidence-based changes, and record before/after plans and timings.",
            "questions": [
              "Why does an index not guarantee that PostgreSQL will use it?",
              "How does column order affect a multicolumn B-tree index?",
              "What does a large estimated-versus-actual row mismatch suggest?",
              "When is a sequential scan the fastest correct choice?",
              "How do indexes increase write, storage, and maintenance cost?"
            ]
          },
          {
            "number": 11,
            "title": "Transactions, MVCC, and locking",
            "learn": "Learn ACID, autocommit, transaction boundaries, PostgreSQL MVCC, snapshots, isolation levels, anomalies, row/table/advisory locks, deadlocks, savepoints, optimistic concurrency, idle transactions, and retry policy.",
            "practice": "simulate concurrent seat booking or balance transfer sessions, reproduce anomalies/contention, then implement a correct strategy and retry behavior.",
            "questions": [
              "How does MVCC let readers and writers coexist?",
              "Which anomalies can occur at PostgreSQL’s read committed level?",
              "When should `SELECT ... FOR UPDATE` be used?",
              "How does PostgreSQL detect and resolve a deadlock?",
              "Why must serialization failures retry the entire transaction?"
            ]
          },
          {
            "number": 12,
            "title": "Functions, triggers, and PostgreSQL features",
            "learn": "Learn SQL/PLpgSQL functions, procedures, trigger timing/levels, generated columns, domains, enums trade-offs, arrays, ranges, JSONB, full-text search, extensions, partitioning awareness, and when logic belongs in the database.",
            "practice": "enforce one cross-row audit requirement with a trigger, implement JSONB search with a suitable index, and document simpler alternatives.",
            "questions": [
              "Which invariants belong in constraints rather than triggers?",
              "When is JSONB appropriate, and when does it hide relational structure?",
              "What are row-level and statement-level trigger trade-offs?",
              "Why can changing a PostgreSQL enum be operationally awkward?",
              "When does partitioning help management or pruning, and when is it unnecessary complexity?"
            ]
          },
          {
            "number": 13,
            "title": "Application integration and migrations",
            "learn": "Learn parameterized queries, SQL injection prevention, connection pools, prepared statements, batch operations, ORM strengths/traps, N+1 queries, transaction ownership, migration ordering, expand/contract changes, backward-compatible deployments, and test databases.",
            "practice": "connect one required programming language to PostgreSQL, implement a transactional repository, migrations, idempotency, integration tests, and query monitoring.",
            "questions": [
              "Why does escaping strings manually not replace parameters?",
              "How can an oversized connection pool reduce throughput?",
              "What creates an ORM N+1 problem?",
              "Why should an application-level operation usually own its transaction boundary?",
              "How does expand/contract allow mixed application versions during deployment?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build the database layer for a real service: normalized schema, migrations, constraints, transactional workflows, idempotency, carefully selected indexes, 40+ application/reporting queries, integration tests, role-based permissions, seed generation, and plan analysis under realistic volume."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 14,
            "title": "Planner, statistics, and performance engineering",
            "learn": "Study planner cost concepts, cardinality estimation, extended statistics, join algorithms, parallel plans, work memory, sort/hash spills, prepared-plan behavior, `pg_stat_statements`, slow-query investigation, load testing, vacuum/analyze effects, and workload-level tuning.",
            "practice": "capture a representative workload, rank total database cost, tune the top contributors, and prove workload improvement without regressing writes or tail latency.",
            "questions": [
              "How do nested-loop, hash, and merge joins suit different inputs?",
              "What evidence reveals a disk-spilling sort or hash?",
              "When can correlated column statistics improve estimates?",
              "Why should configuration tuning follow query/schema/workload analysis?",
              "How can improving one query harm total workload throughput?"
            ]
          },
          {
            "number": 15,
            "title": "Storage, vacuum, bloat, and maintenance",
            "learn": "Learn tuple versions, pages, WAL basics, checkpoints, autovacuum, freezing/wraparound, visibility maps, HOT updates, table/index bloat, fillfactor, analyze, reindex/rewrites, maintenance locks, and disk-capacity planning.",
            "practice": "observe dead tuples in a write-heavy test, inspect autovacuum/statistics behavior, and propose safe maintenance thresholds and alerting.",
            "questions": [
              "Why does an update commonly create a new tuple version?",
              "What work does vacuum perform, and what does ordinary vacuum not do?",
              "Why can a long transaction prevent cleanup?",
              "What makes a HOT update possible?",
              "Which maintenance operations can block or temporarily require substantial disk space?"
            ]
          },
          {
            "number": 16,
            "title": "Security and governance",
            "learn": "Learn roles/login/group membership, object/schema/database privileges, default privileges, ownership, least privilege, row-level security, `search_path` risks, function security, TLS, secrets, encryption limits, auditing, masking, retention, and personal-data management.",
            "practice": "create owner, migrator, application, reporting, and support roles; prove forbidden actions fail; add tenant isolation tests and an audit design.",
            "questions": [
              "Why should the application not connect as the database owner?",
              "How can an unsafe `search_path` enable object substitution?",
              "What does row-level security protect, and which roles may bypass it?",
              "What data remains exposed even with disk encryption?",
              "How do retention and deletion requirements affect backups and replicas?"
            ]
          },
          {
            "number": 17,
            "title": "Backup, recovery, replication, and availability",
            "learn": "Learn logical versus physical backup, WAL archiving, point-in-time recovery, recovery objectives (RPO/RTO), backup verification, streaming/logical replication, replication slots, lag, failover, split-brain awareness, connection routing, and upgrade strategies.",
            "practice": "in a disposable environment, restore a backup to a chosen point, validate application data, measure recovery time, and write a runbook.",
            "questions": [
              "Why is an untested backup not sufficient evidence of recoverability?",
              "How do RPO and RTO guide architecture and procedures?",
              "What can cause a replication slot to consume excessive disk?",
              "Which writes may be lost during asynchronous failover?",
              "How do logical and physical replication differ in purpose and limitations?"
            ]
          },
          {
            "number": 18,
            "title": "Production observability and capacity",
            "learn": "Learn connection/session/activity views, locks and blocking chains, database/table/index statistics, logs, query fingerprints, latency percentiles, cache ratios with context, replication/autovacuum/WAL/disk monitoring, capacity forecasts, incidents, and change control.",
            "practice": "create a small dashboard and incident playbooks for blocking, connection exhaustion, disk pressure, slow queries, replica lag, and failed migrations.",
            "questions": [
              "How do you identify the blocker at the head of a lock chain?",
              "Why is a cache-hit ratio not a complete performance metric?",
              "Which leading indicators warn of future disk or connection exhaustion?",
              "What evidence should accompany a production index proposal?",
              "What makes a database migration safely reversible or forward-fixable?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Design and operate the database for a multi-tenant commerce, learning, booking, or ledger-style system. Require an ER model and invariants, versioned migrations, realistic scale data, transactional/concurrency tests, indexing with plan evidence, least-privilege roles and row isolation, workload tests, monitoring/alerts, backup plus point-in-time restore drill, failover/upgrade plan, capacity forecast, and an operations runbook."
        }
      }
    ],
    "extras": [
      {
        "name": "PostgreSQL-specific mastery checklist",
        "checkpoint": null,
        "notes": []
      },
      {
        "name": "Essential query portfolio",
        "checkpoint": null,
        "notes": []
      }
    ]
  }
};
