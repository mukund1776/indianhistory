const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

// --- Mock Browser & DOM Environment ---
class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] ?? null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList.classes.has(c)) this.classList.classes.delete(c);
          else this.classList.classes.add(c);
        } else if (force) {
          this.classList.classes.add(c);
        } else {
          this.classList.classes.delete(c);
        }
      }
    };
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.attributes = {};
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, val) { this.attributes[name] = String(val); }
  removeAttribute(name) { delete this.attributes[name]; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const mockDoc = {
  location: { href: 'http://localhost:4201/?lang=en', search: '?lang=en', assign: () => {} },
  documentElement: new MockElement('html'),
  body: new MockElement('body'),
  title: '',
  querySelector: () => new MockElement(),
  querySelectorAll: () => [],
  createTreeWalker: () => ({ nextNode: () => null }),
};

global.window = {
  location: mockDoc.location,
  history: { state: {}, replaceState: () => {} },
  document: mockDoc,
  sessionStorage: new MockStorage(),
  localStorage: new MockStorage(),
};
global.document = mockDoc;
global.sessionStorage = global.window.sessionStorage;
global.localStorage = global.window.localStorage;
global.HTMLElement = MockElement;
global.MutationObserver = class { observe() {} disconnect() {} };
global.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };

// --- Test Framework DSL ---
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];
let currentSuite = '';
let currentBeforeEach = [];
let currentAfterEach = [];
const testCases = [];

function describe(suiteName, fn) {
  const previousSuite = currentSuite;
  const previousBeforeEach = [...currentBeforeEach];
  const previousAfterEach = [...currentAfterEach];

  currentSuite = previousSuite ? `${previousSuite} > ${suiteName}` : suiteName;
  try {
    fn();
  } catch (err) {
    failedTests++;
    failureDetails.push({ testName: `Suite initialization: ${currentSuite}`, error: err });
  } finally {
    currentSuite = previousSuite;
    currentBeforeEach = previousBeforeEach;
    currentAfterEach = previousAfterEach;
  }
}

function beforeEach(fn) {
  currentBeforeEach.push(fn);
}

function afterEach(fn) {
  currentAfterEach.push(fn);
}

function it(testName, fn) {
  totalTests++;
  testCases.push({
    testName: `${currentSuite} > ${testName}`,
    fn,
    before: [...currentBeforeEach],
    after: [...currentAfterEach],
  });
}

function expect(actual) {
  const matchers = (isNot = false) => ({
    toBe(expected) {
      const pass = Object.is(actual, expected);
      if (isNot ? pass : !pass) {
        throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected) {
      let equal = true;
      try {
        assert.deepStrictEqual(actual, expected);
      } catch (err) {
        equal = false;
      }
      if (isNot ? equal : !equal) {
        throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to equal' : 'to equal'} ${JSON.stringify(expected)}`);
      }
    },
    toBeTruthy() {
      const pass = Boolean(actual);
      if (isNot ? pass : !pass) throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} truthy`);
    },
    toBeFalsy() {
      const pass = !Boolean(actual);
      if (isNot ? pass : !pass) throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} falsy`);
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be' : 'to be'} null`);
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) throw new Error(`Expected value ${isNot ? 'to be undefined' : 'to be defined'}`);
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to be undefined' : 'to be undefined'}`);
    },
    toContain(expected) {
      let pass = false;
      if (typeof actual === 'string' || Array.isArray(actual)) {
        pass = actual.includes(expected);
      } else if (actual instanceof Set || actual instanceof Map) {
        pass = actual.has(expected);
      }
      if (isNot ? pass : !pass) throw new Error(`Expected ${JSON.stringify(actual)} ${isNot ? 'not to contain' : 'to contain'} ${JSON.stringify(expected)}`);
    },
    toBeGreaterThan(expected) {
      const pass = actual > expected;
      if (isNot ? pass : !pass) throw new Error(`Expected ${actual} ${isNot ? 'not to be >' : 'to be >'} ${expected}`);
    },
    toBeLessThan(expected) {
      const pass = actual < expected;
      if (isNot ? pass : !pass) throw new Error(`Expected ${actual} ${isNot ? 'not to be <' : 'to be <'} ${expected}`);
    },
    toBeGreaterThanOrEqual(expected) {
      const pass = actual >= expected;
      if (isNot ? pass : !pass) throw new Error(`Expected ${actual} ${isNot ? 'not to be >=' : 'to be >='} ${expected}`);
    },
    toBeLessThanOrEqual(expected) {
      const pass = actual <= expected;
      if (isNot ? pass : !pass) throw new Error(`Expected ${actual} ${isNot ? 'not to be <=' : 'to be <='} ${expected}`);
    },
    toThrow(expectedMessage) {
      let threw = false;
      let error = null;
      try { actual(); } catch (e) { threw = true; error = e; }
      if (isNot ? threw : !threw) throw new Error(`Expected function ${isNot ? 'not to throw' : 'to throw'}`);
      if (expectedMessage && error && !String(error.message || error).includes(expectedMessage)) {
        throw new Error(`Expected error to include "${expectedMessage}", got "${error.message}"`);
      }
    }
  });

  const res = matchers(false);
  res.not = matchers(true);
  return res;
}

global.describe = describe;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// --- TypeScript require hook ---
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: false,
    },
    fileName: filename,
  });
  return module._compile(compiled.outputText, filename);
};

// --- Test Discovery & Execution ---
function findSpecFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        files.push(...findSpecFiles(fullPath));
      }
    } else if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function run() {
  await import('zone.js');
  await import('@angular/compiler');

  const startTime = Date.now();
  const rootDir = path.join(__dirname, '..');
  const specFiles = [
    ...findSpecFiles(path.join(rootDir, 'src')),
    ...findSpecFiles(path.join(rootDir, 'scripts')),
  ];

  console.log(`\nFound ${specFiles.length} spec file(s). Loading tests...\n`);

  for (const file of specFiles) {
    const relPath = path.relative(rootDir, file);
    try {
      require(file);
      console.log(`  Loaded ${relPath}`);
    } catch (err) {
      failedTests++;
      failureDetails.push({ testName: `Execution failure in ${relPath}`, error: err });
      console.log(`  Failed to load ${relPath}`);
    }
  }

  for (const testCase of testCases) {
    let error;
    try {
      for (const hook of testCase.before) await hook();
      await testCase.fn();
    } catch (err) {
      error = err;
    } finally {
      for (const hook of testCase.after) {
        try {
          await hook();
        } catch (err) {
          error ??= err;
        }
      }
    }
    if (error) {
      failedTests++;
      failureDetails.push({ testName: testCase.testName, error });
    } else {
      passedTests++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n---------------------------------------------------`);
  console.log(`Test Summary: ${passedTests} passed, ${failedTests} failed, ${totalTests} total (${duration}s)`);
  console.log(`---------------------------------------------------\n`);

  if (failureDetails.length > 0) {
    console.error('Failures:');
    for (const fail of failureDetails) {
      console.error(`\n• ${fail.testName}`);
      console.error(`  ${fail.error.stack || fail.error}`);
    }
    process.exit(1);
  } else {
    console.log('All unit tests passed successfully!\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
