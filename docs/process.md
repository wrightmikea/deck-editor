# Development Process
## Test-Driven Development (TDD) with Red/Green/Refactor

### Document Information
- **Version**: 1.0
- **Author**: Michael A Wright
- **Date**: 2025-10-30
- **Status**: Process Guide

---

## Table of Contents
1. [TDD Philosophy](#tdd-philosophy)
2. [Red/Green/Refactor Cycle](#redgreenrefactor-cycle)
3. [Testing Pyramid](#testing-pyramid)
4. [Workflow](#workflow)
5. [Best Practices](#best-practices)
6. [Tools and Setup](#tools-and-setup)

---

## TDD Philosophy

### Core Principles

**Test First, Code Second**: Write the test that defines desired behavior before writing implementation code.

**Small Steps**: Make the smallest possible change to go from red to green.

**Refactor Fearlessly**: With comprehensive tests, you can refactor confidently knowing tests will catch regressions.

**Documentation Through Tests**: Tests serve as living documentation of how code should behave.

### Benefits

1. **Better Design**: TDD forces you to think about API design before implementation
2. **Fewer Bugs**: Catch issues early when they're cheapest to fix
3. **Confidence**: Comprehensive test suite allows safe refactoring
4. **Documentation**: Tests document expected behavior
5. **Regression Prevention**: New features won't break existing functionality

---

## Red/Green/Refactor Cycle

### The Three Phases

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│   RED → GREEN → REFACTOR → (repeat)                 │
│    ↑                           │                    │
│    └───────────────────────────┘                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### Phase 1: RED (Write Failing Test)

**Goal**: Write a test that fails because the functionality doesn't exist yet.

**Steps**:
1. Identify the next small piece of functionality to implement
2. Write a test that validates this functionality
3. Run the test
4. Verify the test fails (RED)

**Example**:
```javascript
// src/tests/HollerithCode.test.js
import HollerithCode from '../utils/HollerithCode';

describe('HollerithCode', () => {
  test('should create from character A', () => {
    const code = HollerithCode.fromChar('A');
    const array = code.asArray();

    // Expect row 12 and row 1 to be punched
    expect(array[12]).toBe(true);
    expect(array[1]).toBe(true);

    // Expect all other rows to be blank
    for (let i = 0; i < 12; i++) {
      if (i !== 1) {
        expect(array[i]).toBe(false);
      }
    }
  });
});
```

**Run Test**:
```bash
npm test -- HollerithCode.test.js
```

**Expected Output**:
```
FAIL  src/tests/HollerithCode.test.js
  HollerithCode
    ✕ should create from character A (5 ms)

  ● HollerithCode › should create from character A

    TypeError: HollerithCode.fromChar is not a function
```

**✓ Test is RED**: Good! This confirms we need to implement the functionality.

---

### Phase 2: GREEN (Make Test Pass)

**Goal**: Write the minimal amount of code to make the test pass.

**Important**: Don't worry about code quality yet. Just make it work.

**Steps**:
1. Write the simplest code that makes the test pass
2. Run the test
3. Verify the test passes (GREEN)
4. Don't add extra features or handle cases not tested yet

**Example**:
```javascript
// src/utils/HollerithCode.js
class HollerithCode {
  constructor(rows = new Array(12).fill(false)) {
    this.rows = rows;
  }

  static fromChar(char) {
    const rows = new Array(12).fill(false);

    // Hard-coded for 'A' - simplest implementation
    if (char === 'A') {
      rows[12] = true;  // Row 12 (zone punch)
      rows[1] = true;   // Row 1 (digit punch)
    }

    return new HollerithCode(rows);
  }

  asArray() {
    return this.rows;
  }
}

export default HollerithCode;
```

**Run Test**:
```bash
npm test -- HollerithCode.test.js
```

**Expected Output**:
```
PASS  src/tests/HollerithCode.test.js
  HollerithCode
    ✓ should create from character A (3 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

**✓ Test is GREEN**: Perfect! Now we can refactor.

---

### Phase 3: REFACTOR (Improve Code Quality)

**Goal**: Improve code quality without changing behavior. Tests must stay green.

**Steps**:
1. Look for code smells (duplication, poor names, magic numbers)
2. Refactor to improve design
3. Run tests after each small refactoring
4. Ensure tests stay green throughout

**Example**:
```javascript
// src/utils/HollerithCode.js (refactored)
class HollerithCode {
  constructor(rows = new Array(12).fill(false)) {
    this.rows = rows;
  }

  static fromChar(char) {
    const upperChar = char.toUpperCase();
    const encoding = HOLLERITH_ENCODING_TABLE[upperChar];

    if (!encoding) {
      return HollerithCode.empty();
    }

    const rows = new Array(12).fill(false);
    encoding.forEach(rowNumber => {
      rows[rowNumber] = true;
    });

    return new HollerithCode(rows);
  }

  asArray() {
    return this.rows;
  }

  static empty() {
    return new HollerithCode();
  }
}

// Extract encoding table to constant
const HOLLERITH_ENCODING_TABLE = {
  'A': [12, 1],
  'B': [12, 2],
  'C': [12, 3],
  // ... more characters
};

export default HollerithCode;
```

**Run Tests**:
```bash
npm test -- HollerithCode.test.js
```

**Expected Output**:
```
PASS  src/tests/HollerithCode.test.js
  HollerithCode
    ✓ should create from character A (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

**✓ Tests still GREEN**: Refactoring successful!

---

### Repeat the Cycle

Now add the next test for another character:

```javascript
test('should create from character B', () => {
  const code = HollerithCode.fromChar('B');
  const array = code.asArray();

  expect(array[12]).toBe(true);  // Row 12
  expect(array[2]).toBe(true);   // Row 2 (not row 1)
});
```

This test will pass immediately because we refactored to use a table. Add more tests to fill out the encoding table:

```javascript
test('should handle all letters A-Z', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const letter of letters) {
    const code = HollerithCode.fromChar(letter);
    expect(code.asArray().some(r => r)).toBe(true); // At least one punch
  }
});

test('should handle digits 0-9', () => {
  for (let i = 0; i <= 9; i++) {
    const code = HollerithCode.fromChar(String(i));
    expect(code.asArray()[i]).toBe(true); // Single punch in row i
  }
});
```

---

## Testing Pyramid

### Test Types by Level

```
         ╱╲
        ╱  ╲         E2E Tests (Few)
       ╱────╲        - Complete user workflows
      ╱      ╲       - Browser automation (Playwright)
     ╱────────╲      - Slow, expensive, fragile
    ╱          ╲
   ╱────────────╲    Integration Tests (Some)
  ╱              ╲   - Component interactions
 ╱────────────────╲  - React Testing Library
╱──────────────────╲ - Context, state management
────────────────────
                     Unit Tests (Many)
                     - Pure functions
                     - Classes, utilities
                     - Fast, focused, reliable
```

### Test Distribution

**Unit Tests**: 70%
- Pure functions
- Class methods
- Data transformations
- Encoding/decoding

**Integration Tests**: 20%
- React component interactions
- Context providers
- State management
- Form handling

**E2E Tests**: 10%
- Critical user paths
- File upload/download
- Multi-step workflows
- Cross-browser validation

---

## Workflow

### Daily TDD Workflow

#### Morning (Planning & Red Phase)

**1. Review Status** (10 min)
```bash
cat docs/status.md
git status
```

**2. Select Next Task** (5 min)
- Check `docs/plan.md` for next task
- Update `docs/status.md` to mark task as "In Progress"

**3. Write Failing Test** (30-60 min)
```bash
# Create or open test file
code src/tests/ComponentName.test.js

# Write test for next small feature
# Run test to verify it fails
npm test -- ComponentName.test.js

# Expected: RED (test fails)
```

**4. Commit Red Test** (5 min)
```bash
git add src/tests/ComponentName.test.js
git commit -m "test: add test for [feature] (red)"
```

---

#### Midday (Green Phase)

**5. Implement Minimal Code** (60-90 min)
```bash
# Create or open implementation file
code src/utils/ComponentName.js

# Write simplest code to make test pass
# Don't worry about quality yet
```

**6. Run Tests Until Green** (repeat as needed)
```bash
npm test -- ComponentName.test.js

# Fix errors until:
# Expected: GREEN (all tests pass)
```

**7. Commit Green Code** (5 min)
```bash
git add src/utils/ComponentName.js
git commit -m "feat: implement [feature] (green)"
```

---

#### Afternoon (Refactor & Document)

**8. Refactor** (30-60 min)
- Improve code quality
- Extract constants
- Improve naming
- Add comments
- Remove duplication

**9. Verify Tests Stay Green** (continuous)
```bash
# Run tests after each refactoring step
npm test -- ComponentName.test.js

# Must stay GREEN throughout
```

**10. Commit Refactored Code** (5 min)
```bash
git add src/utils/ComponentName.js
git commit -m "refactor: improve [feature] implementation"
```

**11. Add Documentation** (15 min)
```javascript
/**
 * Converts a character to its Hollerith punch code representation.
 *
 * @param {string} char - Single character (A-Z, 0-9, or special)
 * @returns {HollerithCode} Punch pattern for the character
 * @throws {Error} If character is unsupported
 *
 * @example
 * const code = HollerithCode.fromChar('A');
 * // Returns HollerithCode with rows [12, 1] punched
 */
static fromChar(char) {
  // ...
}
```

**12. Update Status** (5 min)
```bash
# Mark feature complete in status.md
code docs/status.md
git add docs/status.md
git commit -m "docs: mark [feature] complete"
```

---

#### Evening (E2E Verification)

**13. E2E Verification (if UI component)** (15-30 min)

Use Playwright via MCP to visually verify:

```javascript
// Using MCP Playwright tools
// Navigate to app
await playwright_navigate({ url: 'http://localhost:8080' });

// Interact with component
await playwright_fill({ selector: '.text-input', value: 'HELLO' });

// Take screenshot
await playwright_screenshot({
  name: 'card-editor-hello',
  fullPage: false
});

// Verify expected elements
await playwright_click({ selector: 'button:has-text("Save")' });
```

**14. Push to Remote** (5 min)
```bash
git push origin main
```

---

### Weekly Cycle

**Monday**:
- Review plan.md
- Estimate week's tasks
- Update status.md with goals

**Tuesday-Thursday**:
- Execute TDD cycles
- Commit frequently

**Friday**:
- Run full test suite
- Check coverage report
- Update documentation
- Demo progress (optional)

---

## Best Practices

### Writing Good Tests

#### 1. Test Behavior, Not Implementation

**❌ Bad** (tests implementation details):
```javascript
test('should call toLowerCase', () => {
  const spy = jest.spyOn(String.prototype, 'toLowerCase');
  HollerithCode.fromChar('a');
  expect(spy).toHaveBeenCalled();
});
```

**✓ Good** (tests behavior):
```javascript
test('should handle lowercase characters', () => {
  const code = HollerithCode.fromChar('a');
  expect(code.toChar()).toBe('A');
});
```

---

#### 2. One Concept Per Test

**❌ Bad** (tests multiple concepts):
```javascript
test('should handle various inputs', () => {
  expect(HollerithCode.fromChar('A').toChar()).toBe('A');
  expect(HollerithCode.fromChar('5').toChar()).toBe('5');
  expect(HollerithCode.fromChar(' ').isEmpty()).toBe(true);
  // Too many unrelated assertions
});
```

**✓ Good** (focused tests):
```javascript
test('should handle letter A', () => {
  const code = HollerithCode.fromChar('A');
  expect(code.toChar()).toBe('A');
});

test('should handle digit 5', () => {
  const code = HollerithCode.fromChar('5');
  expect(code.toChar()).toBe('5');
});

test('should handle space as empty', () => {
  const code = HollerithCode.fromChar(' ');
  expect(code.isEmpty()).toBe(true);
});
```

---

#### 3. Descriptive Test Names

**❌ Bad**:
```javascript
test('works', () => { /* ... */ });
test('test1', () => { /* ... */ });
```

**✓ Good**:
```javascript
test('should convert character A to Hollerith code [12, 1]', () => { /* ... */ });
test('should throw error for unsupported character', () => { /* ... */ });
test('should handle empty string by returning empty code', () => { /* ... */ });
```

---

#### 4. Arrange-Act-Assert Pattern

```javascript
test('should add card to deck', () => {
  // Arrange: Set up test data
  const deck = new Deck('Test');
  const initialCount = deck.cards.length;

  // Act: Perform the action
  deck.addCard();

  // Assert: Verify the result
  expect(deck.cards.length).toBe(initialCount + 1);
});
```

---

#### 5. Test Edge Cases

```javascript
describe('PunchCard.fromText', () => {
  test('should handle empty string', () => {
    const card = PunchCard.fromText('');
    expect(card.toText().trim()).toBe('');
  });

  test('should handle exactly 80 characters', () => {
    const text = 'A'.repeat(80);
    const card = PunchCard.fromText(text);
    expect(card.toText().length).toBe(80);
  });

  test('should truncate text longer than 80 characters', () => {
    const text = 'A'.repeat(100);
    const card = PunchCard.fromText(text);
    expect(card.toText().trim().length).toBe(80);
  });

  test('should handle special characters', () => {
    const card = PunchCard.fromText('.,/-+*');
    expect(card.getColumn(0).toChar()).toBe('.');
  });
});
```

---

### Refactoring Guidelines

#### When to Refactor

- After making tests pass (GREEN phase)
- When you notice code smells (duplication, long methods, poor names)
- When adding a new feature reveals poor design
- **Never** while tests are red

#### Refactoring Techniques

**1. Extract Method**
```javascript
// Before
static fromChar(char) {
  const rows = new Array(12).fill(false);
  if (char === 'A') { rows[12] = true; rows[1] = true; }
  if (char === 'B') { rows[12] = true; rows[2] = true; }
  // ... many more
  return new HollerithCode(rows);
}

// After
static fromChar(char) {
  const encoding = this.getEncoding(char);
  return this.createFromEncoding(encoding);
}

static getEncoding(char) {
  return HOLLERITH_ENCODING_TABLE[char.toUpperCase()];
}

static createFromEncoding(encoding) {
  const rows = new Array(12).fill(false);
  encoding.forEach(row => rows[row] = true);
  return new HollerithCode(rows);
}
```

**2. Extract Constant**
```javascript
// Before
if (data.length !== 108) {
  throw new Error('Invalid size');
}

// After
const IBM_1130_CARD_BYTES = 108;

if (data.length !== IBM_1130_CARD_BYTES) {
  throw new Error(`Invalid size: expected ${IBM_1130_CARD_BYTES} bytes`);
}
```

**3. Rename for Clarity**
```javascript
// Before
function proc(d) {
  return d.map(x => x * 2);
}

// After
function doubleValues(data) {
  return data.map(value => value * 2);
}
```

---

### Continuous Integration

**Pre-Commit Checks**:
```bash
# Run all tests
npm test

# Check coverage
npm run test:coverage

# Lint code
npm run lint

# If all pass, commit
git commit -m "..."
```

**Pre-Push Checks**:
```bash
# Full test suite
npm test

# Build production
npm run build

# If all pass, push
git push
```

---

## Tools and Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/tests/**'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

### Test Utilities

```javascript
// src/tests/testUtils.js
import { render } from '@testing-library/react';
import { DeckProvider } from '../contexts/DeckContext';

export function renderWithContext(ui, options) {
  return render(ui, { wrapper: DeckProvider, ...options });
}

export function createMockDeck(cardCount = 1) {
  const deck = new Deck('Mock Deck');
  for (let i = 1; i < cardCount; i++) {
    deck.addCard();
  }
  return deck;
}

export function createMockCard(text = '') {
  return PunchCard.fromText(text);
}
```

### Playwright/MCP Integration

**Using MCP tools in workflow**:
```javascript
// After implementing UI component, verify visually

// 1. Start dev server
npm start

// 2. Use MCP Playwright tools via Claude Code
await playwright_navigate({ url: 'http://localhost:8080' });

// 3. Interact and screenshot
await playwright_fill({ selector: '#card-text', value: 'TEST' });
await playwright_screenshot({ name: 'test-input' });

// 4. Verify expected state
await playwright_get_visible_text(); // Check content

// 5. Test file operations
await playwright_click({ selector: 'button:has-text("Save")' });
// Verify download started
```

---

## Debugging Failed Tests

### When a Test Fails

**1. Read the Error Message**
```
FAIL  src/tests/PunchCard.test.js
  ● PunchCard › should convert to binary

    expect(received).toBe(expected)

    Expected: 108
    Received: 107

      45 |   test('should convert to binary', () => {
      46 |     const card = PunchCard.fromText('A');
    > 47 |     expect(card.toBinary().length).toBe(108);
         |                                      ^
```

**2. Isolate the Problem**
```javascript
test('should convert to binary', () => {
  const card = PunchCard.fromText('A');
  const binary = card.toBinary();

  console.log('Binary length:', binary.length);
  console.log('Binary data:', binary);

  expect(binary.length).toBe(108);
});
```

**3. Fix the Bug**
```javascript
// Found: toBinary() was creating 107 bytes
// Fix: Corrected byte packing logic
```

**4. Verify Fix**
```bash
npm test -- PunchCard.test.js
# GREEN!
```

**5. Remove Debug Code**
```javascript
test('should convert to binary', () => {
  const card = PunchCard.fromText('A');
  expect(card.toBinary().length).toBe(108);
});
```

---

## Coverage Reports

### Generate Coverage Report

```bash
npm run test:coverage
```

### Interpret Results

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   92.34 |    88.12 |   95.45 |   93.21 |
 HollerithCode.js   |     100 |      100 |     100 |     100 |
 Column.js          |      95 |       90 |     100 |      95 |
 PunchCard.js       |      88 |       85 |      90 |      89 |
 Deck.js            |      91 |       87 |      95 |      92 |
--------------------|---------|----------|---------|---------|
```

**Goals**:
- Overall: 90%+
- Critical modules (HollerithCode, PunchCard): 95%+
- UI components: 80%+

---

## Common Pitfalls

### Pitfall 1: Writing Tests After Code

**❌ Don't**:
```javascript
// 1. Write implementation first
function add(a, b) { return a + b; }

// 2. Then write test
test('should add numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

**✓ Do**:
```javascript
// 1. Write test first
test('should add numbers', () => {
  expect(add(2, 3)).toBe(5);
});

// 2. Then write implementation
function add(a, b) { return a + b; }
```

---

### Pitfall 2: Testing Too Much at Once

**❌ Don't**:
```javascript
test('should handle all operations', () => {
  const deck = new Deck();
  deck.addCard();
  deck.updateCard(0, 'HELLO');
  deck.addCard();
  deck.removeCard(0);
  expect(deck.cards.length).toBe(2);
  expect(deck.cards[0].toText()).toMatch(/^HELLO/);
});
```

**✓ Do**:
```javascript
test('should add card', () => {
  const deck = new Deck();
  deck.addCard();
  expect(deck.cards.length).toBe(2);
});

test('should update card text', () => {
  const deck = new Deck();
  deck.updateCard(0, 'HELLO');
  expect(deck.cards[0].toText()).toMatch(/^HELLO/);
});
```

---

### Pitfall 3: Not Running Tests Frequently

**❌ Don't**: Write code for hours, then run tests

**✓ Do**: Run tests after every small change (watch mode helps)

```bash
npm run test:watch
```

---

### Pitfall 4: Skipping Refactor Phase

**❌ Don't**: Leave code messy after making tests pass

**✓ Do**: Always refactor after reaching GREEN

The refactor phase is where good design emerges!

---

## Summary

### The TDD Mantra

```
1. RED:      Write a failing test
2. GREEN:    Make it pass (simplest way)
3. REFACTOR: Make it beautiful
4. REPEAT:   Next feature
```

### Key Takeaways

- Write tests first
- Take small steps
- Run tests frequently
- Refactor continuously
- Keep tests fast
- Maintain high coverage
- Use MCP/Playwright for E2E verification

---

**Document Status**: Complete
**Last Updated**: 2025-10-30
