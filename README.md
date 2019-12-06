# Making your own programming language

An naive tutorial from null to programming language to dip your toe in
compilers, language analysis and parsing.

We will learn the basic steps of compilers, investigate different languages, and
finally implement our own.

---

## But Why?

Learning about compilers might seem like something for only the specially
interested, but it's technology which gets more and more relevant even for the
average "consumer".

Prettier, eslint, codemods and Babel are just some examples of tools we use that
are based on steps from compilers.

Also we can make our own tools by using compiler knowledge. For instance
creating own DSLs or just parsing and analyzing source code.

---

## Compilers and interpreters

There are different ways of implementing languages. We have compilers and
interpreters and everything in between. Interpreters are typically continuously
parsed and executed in one go (\*variations apply), but compilers usually
creates internal structures and translate to machine code or other lower level
languages before executing.

We'll look into compilers here, as we are interested in learning how to analyze
source code. But we will output in a high level language, not machine code.

---

## Steps of the compiler

1. Parsing
2. Transformation
3. Generation

...but there is more

---

### Parsing

Parsing usually consist of more steps. Notably:

1. Lexical Analysis or Tokenizing
2. Creating (Abstract) Syntax Tree (AST).

---

#### Tokenizing

Converting source code to list of tokens without saying anything about validity.

Source Code

```js
log("Hello, World!");
```

Tokens:

```js
[
  { type: "identifier", value: "log" },
  { type: "paren", value: "(" },
  { type: "string", value: "Hello, World!" },
  { type: "paren", value: ")" },
  { type: "semicolon", value: ";" }
];
```

---

#### Example tokenizing

```js
let src = 'log("Hello, World!")';

let tokens = [];
let pos = 0;

while (pos < src.length) {
  let c = src[pos];

  if (c === "(" || c === ")") {
    tokens.push({
      type: "paren",
      value: c
    });
  }

  if (c.test(/\d/)) {
    let num = takeWhile(c + source);
    tokens.push({
      type: "number",
      value: parseInt(num)
    });
    pos += num.length;
  }

  // ... etc
}
```

---

#### Creating AST

The actual act of parsing. Iterating through tokens and generating a complete
tree of the program.

AST's in contrast to clean syntax trees has metadata such as comments, position,
etc.

Source code

```js
log("Hello, World!");
```

AST using the Babylon parser

```json
{
  "type": "Program",
  "start": 0,
  "end": 21,
  "loc": {
    "start": {
      "line": 1,
      "column": 0
    },
    "end": {
      "line": 1,
      "column": 21
    }
  },
  "sourceType": "module",
  "interpreter": null,
  "body": [
    {
      "type": "ExpressionStatement",
      "start": 0,
      "end": 21,
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 21
        }
      },
      "expression": {
        "type": "CallExpression",
        "start": 0,
        "end": 20,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 20
          }
        },
        "callee": {
          "type": "Identifier",
          "start": 0,
          "end": 3,
          "loc": {
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 1,
              "column": 3
            },
            "identifierName": "log"
          },
          "name": "log"
        },
        "arguments": [
          {
            "type": "StringLiteral",
            "start": 4,
            "end": 19,
            "loc": {
              "start": {
                "line": 1,
                "column": 4
              },
              "end": {
                "line": 1,
                "column": 19
              }
            },
            "extra": {
              "rawValue": "Hello, World!",
              "raw": "'Hello, World!'"
            },
            "value": "Hello, World!"
          }
        ]
      }
    }
  ]
}
```

https://astexplorer.net/ is a great tool for inspecting ASTs of different
languages. This is very handy when trying to understand what is going on.

And when trying to traverse.

---

### Example Create AST

```js
let base = {
  type: "Program",
  start: 0,
  end: src.length,
  body: []
};

let pos = 0;
function walk() {
  let token = tokens[pos];
  let current;
  pos++;

  if (token.type === "Identifier") {
    let next = current[pos];

    if (next.type === "paren" && next.value === "(") {
      base.body.push({
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression"
        },
        callee: {
          type: "Identifier",
          value: token.value
        },
        arguments: walk() // recursive
      });
    }

    throw new Error(`Unexpected token at ${pos}`);
  }

  throw new Error("Invalid syntax");
}
```

---

### Transformation

Can be done in different ways. Most common is AST -> AST, but we will do AST ->
Code.

The act of converting from one type to another readable for generating a new
output.

---

#### Traversing

In either case we have to read the AST. When talking about trees and structures
we often say "traverse". We also use something called visitor pattern or walking
the tree.

If you have ever used more old school XML parsers you may have heard of visitor
patterns. Essentially, we can have different methods called when visiting
different nodes, depth first, in a tree. It can look something like this:

```js
traverse(ast, {
  CallExpression(path) {
    console.log(path.node.callee);
  }
});
```

If we wanted to log all function calls. If we wanted to create a new AST we
would visit all nodes we wanted and build a new structure in the type of the AST
that we target.

---

### Code generation

If we do AST -> AST, we can usually use a code printer/serializer of the target
language. For instance JavaScript when transpiling, or WASM, or some other LLVM
backend.

But if we go directly to code, we must create our own AST printer. This, by the
way, is how Prettier is implemented. It is what is called a AST pretty printer.

---

### Printing code

Again using visitor pattern or walking, we traverse each node and print the
equivalent in the target language.

Example from our complete JS AST above:

```js
let code = "";
traverse(ast, {
  CallExpression(path) {
    code += `${path.node.callee.name}(
  ${path.node.arguments.map(i => `"${i.value}"`).join(", \n")}
);`;
  }
});
```

Which would output executable code

```js
log("Hello, World!");
```

---

### Summarized

1. Tokenizing
2. Parsing (to AST)
3. Transformation
4. Code generation
5. Execute!

---

### Exercises!

Let's make our own simple language.

A dice throwing language for usage in RPGs such as Dungeons & Dragons.

Example source code with example output:

- `2d6` -> 3
- `2d6` -> 6
- `2d6` -> 12 (max)
- `2d6 + 3` -> 15 (max)
- `2d6 + 3` -> 5 (min)
- `1d6 + 1d20` -> 23
- `1d6 - 1` -> 0

Converted implementation:

- `1d6 + 2` -> `Math.floor(Math.random() * 6) + 1 + 2`
- `2d8 + 5` ->
  `Math.floor(Math.random() * 8) + 1 + Math.floor(Math.random() * 8) + 1 + 2`

---

### 1. Tokenize

Start with creating a token list such as

```
1d6 + 2
```

```js
[
  { type: "dice", value: "2d6" },
  { type: "operator", value: "+" },
  { type: "number", value: "3" }
];
```

---

### 2. Parse

Example output:

```js
{
  type: "program",
  body: {
    type: "operatorExpression",
    operator: "+",
    lhs: {
      type: "diceExpression",
      lhs: { type: "number", value: "2" },
      rhs: { type: "number", value: "6" }
    },
    rhs: { type: "number", value: "3" }
  }
}
```

---

### 3. Generate

Walk the tree recursively and output JavaScript code

---

### Learn more

_Resources which this walkthrough is based on_

1. Great resource for simple implementation of a Lisp-type language:
   https://github.com/jamiebuilds/the-super-tiny-compiler
2. Source of the language we implemented. Arne Martin Aurliens presentation from
   Web Rebels 2017: https://github.com/arnemart/webreb2k17
