# Filbert

JavaScript-based Python parser.  Outputs an abstract syntax tree as specified by the
[Mozilla Parser API][mozapi].

[mozapi]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API

This parser is a work in progress, adapted from the JavaScript parser [Acorn][acorn].

[acorn]: https://github.com/marijnh/acorn

Check out the [demo page](https://rawgit.com/differentmatt/filbert/master/test/interactive.html) to see what Filbert can do.

## Want to contribute?

Thank you, we really appreciate you taking the time to help!

Filbert is under active development at <https://github.com/differentmatt/filbert>.
Please [submit pull requests](https://help.github.com/articles/using-pull-requests)
or file [GitHub issues](https://github.com/differentmatt/filbert/issues) to
that repository. You can also [email Matt](mailto:mattlott@gmail.com).

## Installation

```sh
npm install filbert
```

## Components

When run in a CommonJS (node.js) or AMD environment, exported values
appear in the interfaces exposed by the individual files, as usual.
When loaded in the browser without any kind of module management, a
single global object `filbert` will be defined, and all the exported
properties will be added to that.

### filbert.js

This file contains the actual parser (and is what you get when you
`require("filbert")` in node.js).

**parse**`(input, options)` is used to parse a Python program.
The `input` parameter is a string, `options` can be undefined or an
object setting some of the options listed below. The return value will
be an abstract syntax tree object as specified by the
[Mozilla Parser API][mozapi].

When  encountering   a  syntax   error,  the   parser  will   raise  a
`SyntaxError` object with a meaningful  message. The error object will
have a `pos` property that indicates the character offset at which the
error occurred,  and a `loc`  object that contains a  `{line, column}`
object referring to that same position.

[mozapi]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

- **locations**: When `true`, each node has a `loc` object attached
  with `start` and `end` subobjects, each of which contains the
  one-based line and zero-based column numbers in `{line, column}`
  form. Default is `false`.

- **ranges**: To add a [semi-standardized][range] "range" property holding a
  `[start, end]` array with the same numbers, set the `ranges` option
  to `true`.

[range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678

**pythonRuntime** holds an object required to execute JavaScript code that
has been generated from the output AST.  (e.g. the builtin len() function
is not native to JavaScript).  This object must be available if the AST output from
parse will be used to generate and execute JavaScript code.

**runtimeParamName** name of the python runtime object that will be referenced
in the output AST. (e.g. if set to '\__pythonRuntime', AST nodes will have
references to a '\__pythonRuntime' object).

**tokenize**`(input, options)` exports a primitive interface to
Filbert's tokenizer. The function takes an input string and options
similar to `parse`, and returns a function that can be called repeatedly
to read a single token, and returns a `{start, end, type, value}` object
(with added `startLoc` and `endLoc` properties when the `locations` option
is enabled). This object will be reused (updated) for each token, so you
can't count on it staying stable.

**tokTypes** holds an object mapping names to the token type objects
that end up in the `type` properties of tokens.

### filbert_loose.js ###

This file implements an error-tolerant parser. It exposes a single
function.

**parse_dammit**`(input, options)` takes the same arguments and
returns the same syntax tree as the `parse` function in `filbert.js`,
but never raises an error, and will do its best to parse syntactically
invalid code in as meaningful a way as it can. It'll insert identifier
nodes with name `"✖"` as placeholders in places where it can't make
sense of the input. Depends on `filbert.js`, because it uses the same
tokenizer.

## Language Support

Python3 is the target language.  Much of it is working, and the remaining pieces are outlined below.

### Supported

Keywords:
>False None True and break class continue def elif else for if in is not or pass return while

Built-ins:
>abs() all() any() ascii() bool() chr() dict() enumerate() filter() float() hex() int() len() list() map() max() min() oct() ord() pow() print() range() repr() reversed() round() sorted() str() sum() tuple()

### Coming Soon!

Keywords:
>as assert del except finally from import global lambda nonlocal raise try with yield

Built-ins:
>bin() bytearray() bytes() callable() classmethod() compile() complex() delattr() dir() divmod() eval() exec() format() frozenset() getattr() globals() hasattr() hash() help() id() input() isinstance() issubclass() iter() locals() memoryview() next() object() open() property() set() setattr() slice() staticmethod() super() type() vars() zip() \__import__()

## Testing

```sh
grunt test
```

## Get in touch

Please use the [GitHub issues](https://github.com/differentmatt/filbert/issues), or [email Matt](mailto:mattlott@gmail.com)
