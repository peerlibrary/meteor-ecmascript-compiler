// These are tests of Babel's generated output.  Write tests here when a runtime
// test won't do.  Some tests also serve to catch when Babel changes its output,
// such as when it changes its runtime helpers!

function transform(input) {
  return Babel.compile(input).code;
};

function contains(haystack, needle) {
  return haystack.indexOf(needle) >= 0;
};

Tinytest.add("ecmascript-compiler - transpilation - const", (test) => {
  // make sure `const` is turned into `var` (rather than passing
  // through, such as when you have es6.blockScoping on but
  // es6.constants off)
  const output = transform('const x = 5;');
  test.isFalse(contains(output, 'const'));
  test.isTrue(contains(output, 'var'));
});

Tinytest.add("ecmascript-compiler - transpilation - class methods", (test) => {
  const output = transform(
`class Foo {
  static staticMethod() {
    return 'classy';
  }

  prototypeMethod() {
    return 'prototypical';
  }

  [computedMethod]() {
    return 'computed';
  }
}`);

  // test that we are in "loose" mode and methods of classes are still
  // assigned in a simple matter that does rely on Object.defineProperty.
  test.isTrue(contains(output, 'Foo.staticMethod = function staticMethod('));
  test.isTrue(contains(output,
                       'Foo.prototype.prototypeMethod = function prototypeMethod('));
  test.isTrue(contains(output, 'Foo.prototype[computedMethod] = function ('));
  test.isFalse(contains(output, 'createClass'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - classCallCheck", (test) => {
  const output = transform(`
class Foo {
  constructor(x) {
    this.x = x;
  }
}`);

  // test that the classCallCheck helper is still in use
  test.isTrue(contains(output, 'helpers/classCallCheck'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - inherits", (test) => {
  const output = transform(`
class Foo {}
class Bar extends Foo {}
`);

  test.isTrue(contains(output, 'helpers/inherits'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - bind", (test) => {
  const output = transform(`
  var foo = new Foo(...oneTwo, 3);
`);

  test.isTrue(output.match(/\.bind\b/));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - extends", (test) => {
  const output = transform(`
  var full = {a:1, ...middle, d:4};
`);

  test.isTrue(contains(output, 'helpers/extends'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - objectWithoutProperties", (test) => {
  const output = transform(`
var {a, ...rest} = obj;
`);

  test.isTrue(contains(output, 'helpers/objectWithoutProperties'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - objectDestructuringEmpty", (test) => {
  const output = transform(`
var {} = null;
`);

  test.isTrue(contains(output, 'helpers/objectDestructuringEmpty'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - taggedTemplateLiteralLoose", (test) => {
  const output = transform(`
var x = asdf\`A\${foo}C\`
`);

  test.isTrue(contains(output, 'helpers/taggedTemplateLiteralLoose'));
});

Tinytest.add("ecmascript-compiler - transpilation - helpers - createClass", (test) => {
  const output = transform(`
class Foo {
  get blah() { return 123; }
}
`);

  test.isTrue(contains(output, 'helpers/createClass'));
});

Tinytest.add("ecmascript-compiler - transpilation - flow", (test) => {
  const output = transform(
    'var foo = function (one: any, two: number, three?): string {};');
  test.isTrue(contains(output, '(one, two, three)'));
});