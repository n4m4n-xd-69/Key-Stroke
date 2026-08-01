/**
 * GENERATED — do not edit by hand.
 * Source: n4m4n/*.md  ·  Regenerate: node scratchpad/parse-paths.mjs
 *
 * 102 modules and 512 questions across 7 language paths.
 */

export const PATHS = {
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
  "python": {
    "title": "Python",
    "blurb": "Target: modern Python 3. Use isolated virtual environments, `pyproject.toml`, a formatter/linter, type checker, pytest, debugger, and Git. Prefer the standard library before adding dependencies.",
    "levels": [
      {
        "name": "Beginner",
        "modules": [
          {
            "number": 1,
            "title": "Runtime, syntax, and core values",
            "learn": "Learn the interpreter/REPL, scripts and modules, indentation, names, dynamic typing, `None`, booleans, numbers, strings, bytes awareness, operators, input/output, and basic tracebacks.",
            "practice": "build a validated unit converter and run it both as a script and imported module.",
            "questions": [
              "What is the difference between a name, an object, and a type in Python?",
              "What values are considered false in a condition?",
              "Why does `1 / 2` differ from `1 // 2`?",
              "How are `str` and `bytes` different?",
              "What information can you read from a traceback?"
            ]
          },
          {
            "number": 2,
            "title": "Control flow and functions",
            "learn": "Learn conditions, loops, `range`, pattern matching awareness, functions, return values, positional/keyword arguments, defaults, scope, docstrings, recursion, and comprehensions.",
            "practice": "create a text statistics utility from small pure functions with doctest or pytest examples.",
            "questions": [
              "Why are mutable default arguments dangerous?",
              "How do local, enclosing, global, and built-in scopes resolve names?",
              "When is a comprehension clearer than an explicit loop?",
              "What is the difference between printing and returning a value?",
              "How do positional-only and keyword-only parameters improve an API?"
            ]
          },
          {
            "number": 3,
            "title": "Collections, iteration, and data modeling",
            "learn": "Learn lists, tuples, dictionaries, sets, slicing, unpacking, membership, mutability, copying, sorting keys, iterables/iterators, `enumerate`, `zip`, dataclasses, and enums.",
            "practice": "build an in-memory inventory with immutable IDs, deduplication, grouping, filtering, and sorting.",
            "questions": [
              "How do a list and tuple differ semantically, not merely syntactically?",
              "Which values can be dictionary keys, and why?",
              "What is the difference between a shallow and deep copy?",
              "When is a generator preferable to a list?",
              "What equality and representation features can a dataclass generate?"
            ]
          },
          {
            "number": 4,
            "title": "Modules, files, exceptions, and environments",
            "learn": "Learn imports, packages, `__name__`, paths, text encodings, context managers, JSON/CSV, exception classes, `try`/`except`/`else`/`finally`, raising, virtual environments, and dependency installation.",
            "practice": "import a messy CSV into validated dataclass records, report row errors, and export JSON.",
            "questions": [
              "Why should file text encoding be explicit?",
              "What does a context manager guarantee?",
              "When should a function catch an exception versus let it propagate?",
              "Why should imports usually live at module level?",
              "What isolation does a virtual environment provide, and what does it not provide?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Beginner checkpoint",
          "brief": "Build a command-line expense tracker with subcommands, dataclass models, decimal money values, file persistence, validation, useful errors, type hints, tests, and an installable local package."
        }
      },
      {
        "name": "Intermediate",
        "modules": [
          {
            "number": 5,
            "title": "Object-oriented Python and the data model",
            "learn": "Learn class/instance attributes, methods, properties, inheritance, composition, abstract interfaces, protocols awareness, dunder methods, equality/hash, ordering, iteration, representation, and attribute lookup.",
            "practice": "design collection-like domain objects that behave naturally with `len`, iteration, membership, equality, and helpful representations.",
            "questions": [
              "When is a class attribute shared, and why can a mutable one cause bugs?",
              "What is the difference between `__repr__` and `__str__`?",
              "When should a property replace direct public attribute access?",
              "Why can defining equality affect hashability?",
              "When is composition better than inheritance in Python?"
            ]
          },
          {
            "number": 6,
            "title": "Iterators, generators, decorators, and context managers",
            "learn": "Learn iterator protocol, generator functions/expressions, `yield from`, lazy pipelines, closures, first-class functions, decorators with `functools.wraps`, callable objects, context-manager protocol, and `contextlib`.",
            "practice": "build a lazy log-processing pipeline with composable generators, timing/retry decorators, and managed input resources.",
            "questions": [
              "What state does a suspended generator retain?",
              "Why can a one-shot iterator appear empty the second time?",
              "How does a decorator preserve the wrapped function’s metadata?",
              "What should `__exit__` return to suppress an exception?",
              "When does laziness reduce memory but complicate debugging or resource lifetime?"
            ]
          },
          {
            "number": 7,
            "title": "Type hints and API contracts",
            "learn": "Learn annotations, unions, optionals, generics, type variables, protocols, typed dictionaries, literals, overloads, narrowing, variance awareness, gradual typing, and static checker configuration.",
            "practice": "fully type the checkpoint project in strict-enough mode and redesign ambiguous APIs revealed by checker errors.",
            "questions": [
              "Do type hints enforce behavior at runtime by default?",
              "When is a protocol preferable to an abstract base class?",
              "Why is `list[Dog]` not safely usable as `list[Animal]`?",
              "What is narrowing, and which control flow produces it?",
              "When does `Any` intentionally differ from `object`?"
            ]
          },
          {
            "number": 8,
            "title": "Testing, debugging, logging, and quality",
            "learn": "Learn pytest fixtures/parametrization, unit/integration/property tests, mocks/fakes, coverage limitations, debugger use, structured logging, linting, formatting, profiling basics, and CI.",
            "practice": "test file, time, network, and failure behavior deterministically; reproduce and fix a seeded production-style bug.",
            "questions": [
              "What makes a fixture’s scope important?",
              "Why should code mock at the boundary it controls rather than deep internals?",
              "What kinds of defects can property-based tests expose?",
              "Why is high line coverage not proof of useful tests?",
              "What context belongs in a log record, and what sensitive data must be excluded?"
            ]
          },
          {
            "number": 9,
            "title": "HTTP, databases, packaging, and CLI/API delivery",
            "learn": "Learn HTTP clients, timeouts/retries, API frameworks, SQL drivers/ORM basics, transactions, migrations, configuration, environment variables, `argparse`/modern CLI options, `pyproject.toml`, wheels, dependency locking, and documentation.",
            "practice": "expose the expense tracker as a small API backed by PostgreSQL and package a migration/admin CLI.",
            "questions": [
              "Why must every network call have a timeout?",
              "Which database operations belong in one transaction?",
              "How does parameterized SQL prevent injection?",
              "What is the difference between a source distribution and a wheel?",
              "Why should configuration be validated at startup?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Intermediate checkpoint",
          "brief": "Build a tested web API or automation service with a layered package, strict type checks, PostgreSQL migrations, validation, authentication basics, safe configuration, structured logs, Docker-based local environment, package metadata, and CI."
        }
      },
      {
        "name": "Advanced",
        "modules": [
          {
            "number": 10,
            "title": "Python’s object/runtime model",
            "learn": "Study identity versus equality, mutability/aliasing, descriptors, method binding, MRO and cooperative inheritance, metaclasses awareness, slots, import machinery, bytecode inspection, reference counting and cyclic GC, weak references, and interpreter differences.",
            "practice": "explain and implement a validated descriptor, inspect its bytecode/lookup behavior, then show the simpler production alternative.",
            "questions": [
              "How do identity and equality differ?",
              "Why does accessing a function through an instance create a bound method?",
              "How does the descriptor protocol power methods and properties?",
              "What problem does C3 MRO solve?",
              "Why can an object remain alive after every obvious local name disappears?"
            ]
          },
          {
            "number": 11,
            "title": "Concurrency, parallelism, and async",
            "learn": "Learn threads, processes, the GIL as an implementation concern, futures/executors, IPC/pickling costs, `asyncio`, coroutines, tasks, cancellation, task groups, queues, backpressure, synchronization, and graceful shutdown.",
            "practice": "implement an I/O service in synchronous, threaded, and async forms; load-test and compare complexity, throughput, latency, and shutdown behavior.",
            "questions": [
              "When do threads help despite the GIL in CPython?",
              "When are processes worth their serialization and startup costs?",
              "What happens if blocking I/O runs inside the event-loop thread?",
              "Why must cancellation be treated as part of normal control flow?",
              "How does a bounded queue create backpressure?"
            ]
          },
          {
            "number": 12,
            "title": "Performance and native boundaries",
            "learn": "Learn profiling before optimization, algorithm/data-structure choices, allocation and copying, caching, vectorized/native libraries, serialization cost, multiprocessing shared state, C extension/FFI awareness, benchmarking, and memory profiling.",
            "practice": "profile a real workload, optimize its measured bottleneck, and publish reproducible before/after evidence without sacrificing tests.",
            "questions": [
              "Why can a micro-optimization lose to a better data structure?",
              "How can vectorized work be faster than a Python loop?",
              "What inputs and warm-up conditions must a benchmark disclose?",
              "Why can memoization create a memory leak or stale-data bug?",
              "Which ownership and error rules matter at a native-code boundary?"
            ]
          },
          {
            "number": 13,
            "title": "Architecture, security, and production operations",
            "learn": "Study dependency direction, domain/application/adapters, plugin architectures, input validation, deserialization risks, command/SQL/template injection, secrets, authentication/authorization, rate limits, metrics/traces/logs, deployment, health checks, and incident diagnosis.",
            "practice": "threat-model and instrument the intermediate service; add resource limits, authorization tests, trace correlation, metrics, and recovery documentation.",
            "questions": [
              "Why is `pickle` unsafe for untrusted input?",
              "At which layer should authorization decisions be enforced?",
              "When can retries worsen an outage or duplicate work?",
              "How do metrics, logs, and traces complement one another?",
              "Which runtime limits protect a service from oversized or expensive input?"
            ]
          },
          {
            "number": 14,
            "title": "Library design and maintainability",
            "learn": "Learn stable public APIs, deprecation, semantic versioning, dependency compatibility, reproducible builds, documentation, plugin entry points, serialization/version migration, code ownership, architecture tests, and source-code reading.",
            "practice": "publish a typed library with supported-version policy, changelog, deprecation path, examples, property tests, documentation, and release automation.",
            "questions": [
              "What makes an API public even if its name starts with an underscore?",
              "How can a deprecation be introduced without abruptly breaking users?",
              "Why should serialized data have an explicit schema/version?",
              "What does a lock file guarantee, and what can it not guarantee?",
              "Which maintenance signals should determine whether to accept a dependency?"
            ]
          }
        ],
        "checkpoint": {
          "title": "Advanced capstone",
          "brief": "Choose a workflow engine, data-ingestion platform, production API, developer tool, or reusable library. Require architectural records, typed public contracts, concurrency/backpressure, durable PostgreSQL state where relevant, security review, tests, profiling, observability, packaging, deployment, CI, and a failure-recovery playbook."
        }
      }
    ],
    "extras": [
      {
        "name": "Python-specific mastery checklist",
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
