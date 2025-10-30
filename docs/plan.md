# Implementation Plan
## IBM 1130 Deck Editor

### Document Information
- **Version**: 1.0
- **Author**: Michael A Wright
- **Date**: 2025-10-30
- **Status**: Planning

---

## Overview

This document outlines the step-by-step implementation plan for the Deck Editor using Test-Driven Development (TDD) methodology. Each task follows the Red-Green-Refactor cycle with unit tests, integration tests, and E2E verification via Playwright/MCP.

---

## Development Phases

### Phase 0: Project Setup (Week 1, Days 1-2)

#### Task 0.1: Initialize Project Structure
**Estimated Time**: 2 hours

**Steps**:
1. Initialize npm project
   ```bash
   cd wrightmikea/deck-editor
   npm init -y
   ```

2. Install dependencies
   ```bash
   npm install react react-dom
   npm install --save-dev webpack webpack-cli webpack-dev-server
   npm install --save-dev babel-loader @babel/core @babel/preset-react @babel/preset-env
   npm install --save-dev html-webpack-plugin
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   npm install --save-dev eslint eslint-plugin-react
   ```

3. Create directory structure
   ```
   src/
   ├── components/
   ├── contexts/
   ├── utils/
   ├── tests/
   ├── App.js
   └── index.js
   public/
   ├── index.html
   └── favicon.ico
   ```

4. Configure webpack, babel, jest

**Deliverables**:
- [ ] package.json with all dependencies
- [ ] webpack.config.js
- [ ] babel.config.js
- [ ] jest.config.js
- [ ] .eslintrc.js
- [ ] Directory structure created

---

#### Task 0.2: Setup Testing Infrastructure
**Estimated Time**: 3 hours

**Steps**:
1. Configure Jest for React testing
2. Setup React Testing Library
3. Configure Playwright via MCP
4. Create test utilities and helpers
5. Write sample test to verify setup

**Test**:
```javascript
// src/tests/setup.test.js
describe('Test Infrastructure', () => {
  it('should run basic test', () => {
    expect(true).toBe(true);
  });
});
```

**Run**:
```bash
npm test
```

**Acceptance Criteria**:
- [ ] Jest runs successfully
- [ ] React Testing Library configured
- [ ] Playwright MCP connection verified
- [ ] Sample test passes (GREEN)

---

### Phase 1: Core Data Models (Week 1, Days 3-5)

#### Task 1.1: Implement HollerithCode Class (TDD)
**Estimated Time**: 4 hours

**Red Phase - Write Failing Tests**:
```javascript
// src/tests/HollerithCode.test.js
import HollerithCode from '../utils/HollerithCode';

describe('HollerithCode', () => {
  test('should create empty code', () => {
    const code = HollerithCode.empty();
    expect(code.isEmpty()).toBe(true);
  });

  test('should create from character A', () => {
    const code = HollerithCode.fromChar('A');
    const array = code.asArray();
    expect(array[12]).toBe(true); // Row 12
    expect(array[1]).toBe(true);  // Row 1
    expect(code.isEmpty()).toBe(false);
  });

  test('should convert to character', () => {
    const code = HollerithCode.fromChar('A');
    expect(code.toChar()).toBe('A');
  });

  test('should handle digits 0-9', () => {
    for (let i = 0; i <= 9; i++) {
      const code = HollerithCode.fromChar(String(i));
      expect(code.toChar()).toBe(String(i));
    }
  });

  test('should handle letters A-Z', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of letters) {
      const code = HollerithCode.fromChar(letter);
      expect(code.toChar()).toBe(letter);
    }
  });

  test('should handle space', () => {
    const code = HollerithCode.fromChar(' ');
    expect(code.isEmpty()).toBe(true);
  });

  test('should handle special characters', () => {
    const specials = ['.', ',', '/', '-', '+', '*'];
    for (const char of specials) {
      const code = HollerithCode.fromChar(char);
      expect(code.toChar()).toBe(char);
    }
  });
});
```

**Green Phase - Implement Class**:
```javascript
// src/utils/HollerithCode.js
class HollerithCode {
  constructor(rows = new Array(12).fill(false)) {
    this.rows = rows;
  }

  static fromChar(char) {
    // Implementation here
  }

  toChar() {
    // Reverse lookup implementation
  }

  asArray() {
    return this.rows;
  }

  isEmpty() {
    return this.rows.every(r => !r);
  }

  static empty() {
    return new HollerithCode();
  }
}

export default HollerithCode;
```

**Refactor Phase**:
- Extract encoding table to separate constant
- Add JSDoc comments
- Optimize lookup performance

**Acceptance Criteria**:
- [ ] All tests pass (GREEN)
- [ ] 100% code coverage
- [ ] Full Hollerith encoding table implemented
- [ ] Documentation complete

---

#### Task 1.2: Implement Column Class (TDD)
**Estimated Time**: 2 hours

**Red Phase - Write Tests**:
```javascript
// src/tests/Column.test.js
import Column from '../utils/Column';

describe('Column', () => {
  test('should create blank column', () => {
    const col = new Column();
    expect(col.isBlank()).toBe(true);
    expect(col.printedChar).toBeNull();
  });

  test('should create from character', () => {
    const col = Column.fromChar('A');
    expect(col.isBlank()).toBe(false);
    expect(col.printedChar).toBe('A');
    expect(col.toChar()).toBe('A');
  });

  test('should create from lowercase character', () => {
    const col = Column.fromChar('a');
    expect(col.printedChar).toBe('A');
  });

  test('should create from Hollerith code', () => {
    const code = HollerithCode.fromChar('B');
    const col = Column.fromHollerith(code);
    expect(col.printedChar).toBeNull();
    expect(col.toChar()).toBe('B');
  });
});
```

**Green Phase**: Implement Column class

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Coverage > 95%
- [ ] Documented

---

#### Task 1.3: Implement PunchCard Class (TDD)
**Estimated Time**: 6 hours

**Red Phase - Write Tests**:
```javascript
// src/tests/PunchCard.test.js
import PunchCard from '../utils/PunchCard';

describe('PunchCard', () => {
  test('should create blank card', () => {
    const card = new PunchCard();
    expect(card.columns).toHaveLength(80);
    expect(card.type).toBe('text');
  });

  test('should create from text', () => {
    const card = PunchCard.fromText('HELLO');
    expect(card.getColumn(0).toChar()).toBe('H');
    expect(card.getColumn(4).toChar()).toBe('O');
  });

  test('should handle text longer than 80 chars', () => {
    const longText = 'A'.repeat(100);
    const card = PunchCard.fromText(longText);
    expect(card.toText().trim()).toHaveLength(80);
  });

  test('should convert to text', () => {
    const card = PunchCard.fromText('HELLO WORLD');
    expect(card.toText()).toMatch(/^HELLO WORLD/);
  });

  test('should clear card', () => {
    const card = PunchCard.fromText('TEST');
    card.clear();
    expect(card.toText().trim()).toBe('');
  });

  test('should convert to binary (108 bytes)', () => {
    const card = PunchCard.fromText('A');
    const binary = card.toBinary();
    expect(binary).toBeInstanceOf(Uint8Array);
    expect(binary.length).toBe(108);
  });

  test('should roundtrip binary conversion', () => {
    const original = PunchCard.fromText('HELLO WORLD 1234567890');
    const binary = original.toBinary();
    const restored = PunchCard.fromBinary(binary);

    // Compare first 72 columns (columns 73-80 not saved)
    for (let i = 0; i < 72; i++) {
      expect(restored.getColumn(i).punches).toEqual(
        original.getColumn(i).punches
      );
    }
  });
});
```

**Green Phase**: Implement PunchCard class with binary I/O

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Binary format matches IBM 1130 spec
- [ ] Roundtrip conversion verified
- [ ] Coverage > 90%

---

#### Task 1.4: Implement Deck Class (TDD)
**Estimated Time**: 4 hours

**Red Phase - Write Tests**:
```javascript
// src/tests/Deck.test.js
import Deck from '../utils/Deck';
import PunchCard from '../utils/PunchCard';

describe('Deck', () => {
  test('should create empty deck with one card', () => {
    const deck = new Deck();
    expect(deck.cards).toHaveLength(1);
    expect(deck.name).toBe('Untitled Deck');
  });

  test('should add card', () => {
    const deck = new Deck();
    deck.addCard();
    expect(deck.cards).toHaveLength(2);
  });

  test('should not allow removing last card', () => {
    const deck = new Deck();
    expect(() => deck.removeCard(0)).toThrow();
  });

  test('should remove card', () => {
    const deck = new Deck();
    deck.addCard();
    deck.removeCard(1);
    expect(deck.cards).toHaveLength(1);
  });

  test('should update card text', () => {
    const deck = new Deck();
    deck.updateCard(0, 'HELLO');
    expect(deck.getCard(0).toText()).toMatch(/^HELLO/);
  });

  test('should convert to binary', () => {
    const deck = new Deck();
    deck.addCard(PunchCard.fromText('CARD 1'));
    deck.addCard(PunchCard.fromText('CARD 2'));

    const binary = deck.toBinary();
    expect(binary.length).toBe(3 * 108); // 3 cards
  });

  test('should load from binary', () => {
    const original = new Deck('Test Deck');
    original.addCard(PunchCard.fromText('CARD 1'));
    original.addCard(PunchCard.fromText('CARD 2'));

    const binary = original.toBinary();
    const loaded = Deck.fromBinary(binary.buffer, 'Test Deck');

    expect(loaded.cards).toHaveLength(original.cards.length);
  });
});
```

**Green Phase**: Implement Deck class

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Coverage > 90%
- [ ] Metadata tracked correctly

---

### Phase 2: React Components (Week 2)

#### Task 2.1: Implement DeckContext (TDD)
**Estimated Time**: 3 hours

**Red Phase**:
```javascript
// src/tests/DeckContext.test.js
import { render, renderHook, act } from '@testing-library/react';
import { DeckProvider, useDeck } from '../contexts/DeckContext';

describe('DeckContext', () => {
  test('should provide initial deck state', () => {
    const { result } = renderHook(() => useDeck(), {
      wrapper: DeckProvider,
    });

    expect(result.current.deck).toBeDefined();
    expect(result.current.deck.cards).toHaveLength(1);
    expect(result.current.currentCardIndex).toBe(0);
    expect(result.current.modified).toBe(false);
  });

  test('should add card', () => {
    const { result } = renderHook(() => useDeck(), {
      wrapper: DeckProvider,
    });

    act(() => {
      result.current.actions.addCard();
    });

    expect(result.current.deck.cards).toHaveLength(2);
    expect(result.current.modified).toBe(true);
  });

  test('should update card text', () => {
    const { result } = renderHook(() => useDeck(), {
      wrapper: DeckProvider,
    });

    act(() => {
      result.current.actions.updateCardText(0, 'HELLO');
    });

    expect(result.current.deck.getCard(0).toText()).toMatch(/^HELLO/);
    expect(result.current.modified).toBe(true);
  });

  test('should navigate cards', () => {
    const { result } = renderHook(() => useDeck(), {
      wrapper: DeckProvider,
    });

    act(() => {
      result.current.actions.addCard();
      result.current.actions.setCurrentCard(1);
    });

    expect(result.current.currentCardIndex).toBe(1);
  });
});
```

**Green Phase**: Implement DeckContext

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Context provides correct state and actions
- [ ] Modified flag tracked correctly

---

#### Task 2.2: Implement CardViewer Component (TDD)
**Estimated Time**: 5 hours

**Red Phase**:
```javascript
// src/tests/CardViewer.test.js
import { render, screen } from '@testing-library/react';
import CardViewer from '../components/CardViewer';
import PunchCard from '../utils/PunchCard';

describe('CardViewer', () => {
  test('should render SVG', () => {
    const card = PunchCard.fromText('A');
    render(<CardViewer card={card} />);

    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  test('should display printed characters', () => {
    const card = PunchCard.fromText('HELLO');
    render(<CardViewer card={card} />);

    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  test('should render punch holes', () => {
    const card = PunchCard.fromText('A');
    const { container } = render(<CardViewer card={card} />);

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });
});
```

**Green Phase**: Implement CardViewer with SVG rendering

**Playwright E2E Verification**:
```javascript
// Verify visually with Playwright
await page.goto('http://localhost:8080');
await page.screenshot({ path: 'card-viewer.png' });
```

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] SVG renders correctly
- [ ] Punch holes visible
- [ ] Printed chars displayed
- [ ] Playwright screenshot verified

---

#### Task 2.3: Implement CardEditor Component (TDD)
**Estimated Time**: 4 hours

**Red Phase**:
```javascript
// src/tests/CardEditor.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckProvider } from '../contexts/DeckContext';
import CardEditor from '../components/CardEditor';
import PunchCard from '../utils/PunchCard';

describe('CardEditor', () => {
  test('should render text input', () => {
    const card = PunchCard.fromText('TEST');
    render(
      <DeckProvider>
        <CardEditor card={card} cardIndex={0} />
      </DeckProvider>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.value).toMatch(/^TEST/);
  });

  test('should update on text change', () => {
    const card = new PunchCard();
    render(
      <DeckProvider>
        <CardEditor card={card} cardIndex={0} />
      </DeckProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'HELLO' } });

    expect(input.value).toBe('HELLO');
  });

  test('should limit to 80 characters', () => {
    const card = new PunchCard();
    render(
      <DeckProvider>
        <CardEditor card={card} cardIndex={0} />
      </DeckProvider>
    );

    const input = screen.getByRole('textbox');
    const longText = 'A'.repeat(100);
    fireEvent.change(input, { target: { value: longText } });

    expect(input.value).toHaveLength(80);
  });

  test('should convert to uppercase', () => {
    const card = new PunchCard();
    render(
      <DeckProvider>
        <CardEditor card={card} cardIndex={0} />
      </DeckProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(input.value).toBe('HELLO');
  });

  test('should clear card', () => {
    const card = PunchCard.fromText('TEST');
    render(
      <DeckProvider>
        <CardEditor card={card} cardIndex={0} />
      </DeckProvider>
    );

    const clearButton = screen.getByText('Clear Card');
    fireEvent.click(clearButton);

    const input = screen.getByRole('textbox');
    expect(input.value).toBe('');
  });
});
```

**Green Phase**: Implement CardEditor

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] Input handling correct
- [ ] Character limit enforced
- [ ] Uppercase conversion works

---

#### Task 2.4: Implement CardNavigator Component (TDD)
**Estimated Time**: 3 hours

**Red Phase**:
```javascript
// src/tests/CardNavigator.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckProvider } from '../contexts/DeckContext';
import CardNavigator from '../components/CardNavigator';

describe('CardNavigator', () => {
  test('should display current card position', () => {
    render(
      <DeckProvider>
        <CardNavigator />
      </DeckProvider>
    );

    expect(screen.getByText(/Card 1 of 1/)).toBeInTheDocument();
  });

  test('should disable prev buttons at start', () => {
    render(
      <DeckProvider>
        <CardNavigator />
      </DeckProvider>
    );

    const firstButton = screen.getByTitle('First card');
    const prevButton = screen.getByTitle('Previous card');

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  test('should navigate to next card', () => {
    // Test with 2-card deck
    // ... implementation
  });
});
```

**Green Phase**: Implement CardNavigator

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] Navigation works correctly
- [ ] Boundary conditions handled

---

#### Task 2.5: Implement DeckManager Component (TDD)
**Estimated Time**: 4 hours

**Red Phase**:
```javascript
// src/tests/DeckManager.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckProvider } from '../contexts/DeckContext';
import DeckManager from '../components/DeckManager';

describe('DeckManager', () => {
  test('should display deck name', () => {
    render(
      <DeckProvider>
        <DeckManager />
      </DeckProvider>
    );

    expect(screen.getByText(/Untitled/)).toBeInTheDocument();
  });

  test('should show card count', () => {
    render(
      <DeckProvider>
        <DeckManager />
      </DeckProvider>
    );

    expect(screen.getByText(/1 cards/)).toBeInTheDocument();
  });

  test('should add card', () => {
    render(
      <DeckProvider>
        <DeckManager />
      </DeckProvider>
    );

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    expect(screen.getByText(/2 cards/)).toBeInTheDocument();
  });
});
```

**Green Phase**: Implement DeckManager

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] All controls functional
- [ ] File operations work (tested separately)

---

### Phase 3: File I/O (Week 3)

#### Task 3.1: Implement File Loading (TDD)
**Estimated Time**: 4 hours

**Red Phase**:
```javascript
// src/tests/FileIO.test.js
import { loadDeckFromFile } from '../utils/FileIO';
import Deck from '../utils/Deck';
import PunchCard from '../utils/PunchCard';

describe('File Loading', () => {
  test('should load valid deck file', async () => {
    const deck = new Deck('Test');
    deck.addCard(PunchCard.fromText('CARD 1'));

    const binary = deck.toBinary();
    const blob = new Blob([binary]);
    const file = new File([blob], 'test.deck');

    const loaded = await loadDeckFromFile(file);
    expect(loaded.cards).toHaveLength(2);
  });

  test('should reject invalid file size', async () => {
    const blob = new Blob([new Uint8Array(100)]); // Not multiple of 108
    const file = new File([blob], 'invalid.deck');

    await expect(loadDeckFromFile(file)).rejects.toThrow(/Invalid deck file/);
  });

  test('should reject files over 1MB', async () => {
    const largeData = new Uint8Array(2 * 1024 * 1024); // 2MB
    const blob = new Blob([largeData]);
    const file = new File([blob], 'large.deck');

    await expect(loadDeckFromFile(file)).rejects.toThrow(/exceeds/);
  });
});
```

**Green Phase**: Implement file loading

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] Validation works
- [ ] Error handling correct

---

#### Task 3.2: Implement File Saving (TDD)
**Estimated Time**: 3 hours

**Red Phase**:
```javascript
// src/tests/FileIO.test.js (continued)
describe('File Saving', () => {
  test('should generate binary blob', () => {
    const deck = new Deck('Test');
    deck.addCard(PunchCard.fromText('HELLO'));

    const blob = saveDeckToBlob(deck);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(2 * 108); // 2 cards
  });

  test('should generate default filename', () => {
    const filename = generateFilename();
    expect(filename).toMatch(/^deck-\d{8}-\d{6}\.deck$/);
  });
});
```

**Green Phase**: Implement file saving

**Acceptance Criteria**:
- [ ] Tests pass
- [ ] Blob generation correct
- [ ] Download triggers (manual test)

---

### Phase 4: Integration & E2E Testing (Week 3-4)

#### Task 4.1: E2E Test - Create New Deck
**Estimated Time**: 2 hours

**Playwright Test**:
```javascript
// e2e/create-deck.spec.js
test('should create new deck', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Click New Deck
  await page.click('button:has-text("New Deck")');

  // Verify 1 blank card
  await expect(page.locator('.card-position')).toHaveText('Card 1 of 1');

  // Add a card
  await page.click('button:has-text("Add Card")');
  await expect(page.locator('.card-position')).toHaveText('Card 2 of 2');
});
```

**Acceptance Criteria**:
- [ ] E2E test passes
- [ ] UI verified with screenshot

---

#### Task 4.2: E2E Test - Load and Edit Deck
**Estimated Time**: 3 hours

**Playwright Test**:
```javascript
test('should load deck and edit cards', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Upload test deck file
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('./test-data/sample.deck');

  // Wait for load
  await page.waitForSelector('.deck-name:has-text("sample")');

  // Edit first card
  await page.fill('.text-input', 'HELLO WORLD');

  // Verify punch card updates
  await expect(page.locator('.card-viewer text:has-text("H")')).toBeVisible();

  // Navigate to next card
  await page.click('button[title="Next card"]');
  await expect(page.locator('.card-position')).toHaveText('Card 2 of');
});
```

**Acceptance Criteria**:
- [ ] E2E test passes
- [ ] Load, edit, navigate all work

---

#### Task 4.3: E2E Test - Save Deck
**Estimated Time**: 2 hours

**Playwright Test**:
```javascript
test('should save deck', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Create deck with content
  await page.fill('.text-input', 'TEST CARD');
  await page.click('button:has-text("Add Card")');

  // Save deck
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Save")')
  ]);

  // Verify download
  expect(download.suggestedFilename()).toMatch(/^deck-.*\.deck$/);

  const path = await download.path();
  const fs = require('fs');
  const data = fs.readFileSync(path);
  expect(data.length).toBe(2 * 108); // 2 cards
});
```

**Acceptance Criteria**:
- [ ] E2E test passes
- [ ] File download works
- [ ] File content verified

---

### Phase 5: Polish & Deploy (Week 4)

#### Task 5.1: Performance Optimization
**Estimated Time**: 4 hours

**Tasks**:
- [ ] Memoize CardViewer SVG rendering
- [ ] Optimize Hollerith encoding lookups
- [ ] Add loading indicators for file operations
- [ ] Profile and optimize hot paths

**Acceptance Criteria**:
- [ ] Page load < 2s
- [ ] Card navigation < 100ms
- [ ] File load (100 cards) < 2s

---

#### Task 5.2: Accessibility Audit
**Estimated Time**: 3 hours

**Tasks**:
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Fix contrast issues
- [ ] Add focus indicators

**Acceptance Criteria**:
- [ ] WCAG 2.1 Level AA compliance
- [ ] All interactive elements keyboard-accessible
- [ ] Screen reader friendly

---

#### Task 5.3: Documentation
**Estimated Time**: 4 hours

**Tasks**:
- [ ] Write README.md with usage instructions
- [ ] Add inline JSDoc comments
- [ ] Create user guide (docs/user-guide.md)
- [ ] Update status.md with final state

**Acceptance Criteria**:
- [ ] README complete with screenshots
- [ ] All classes/functions documented
- [ ] User guide covers all features

---

#### Task 5.4: Deployment
**Estimated Time**: 2 hours

**Tasks**:
- [ ] Build production bundle
- [ ] Test production build locally
- [ ] Deploy to GitHub Pages
- [ ] Configure custom domain (optional)
- [ ] Verify deployment

**Commands**:
```bash
npm run build
cd dist && python3 -m http.server 8080
# Test locally, then deploy
npm run deploy
```

**Acceptance Criteria**:
- [ ] Production build works
- [ ] Deployed to GitHub Pages
- [ ] Live demo accessible

---

## Testing Strategy Summary

### Test Coverage Goals

| Component | Unit Tests | Integration Tests | E2E Tests | Coverage Goal |
|-----------|------------|-------------------|-----------|---------------|
| HollerithCode | ✓ | - | - | 100% |
| Column | ✓ | - | - | 95% |
| PunchCard | ✓ | - | - | 90% |
| Deck | ✓ | - | - | 90% |
| FileIO | ✓ | - | - | 90% |
| DeckContext | ✓ | ✓ | - | 85% |
| CardViewer | ✓ | ✓ | ✓ | 80% |
| CardEditor | ✓ | ✓ | ✓ | 85% |
| CardNavigator | ✓ | ✓ | ✓ | 85% |
| DeckManager | ✓ | ✓ | ✓ | 85% |

**Overall Target**: 90%+ coverage

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Binary format errors | Extensive unit tests, roundtrip tests, reference file validation |
| Performance issues | Early profiling, incremental optimization, lazy loading |
| Browser compatibility | Feature detection, polyfills, testing on target browsers |
| Complex state management | TDD approach, small focused contexts, clear data flow |
| Playwright MCP issues | Fallback to manual testing, screenshot comparison |

---

## Milestones

### Milestone 1: Core Models Complete (End of Week 1)
- [ ] All data model classes implemented
- [ ] Unit tests passing (90%+ coverage)
- [ ] Binary I/O verified

### Milestone 2: UI Functional (End of Week 2)
- [ ] All React components implemented
- [ ] Integration tests passing
- [ ] App runs in dev mode

### Milestone 3: File I/O Working (Mid Week 3)
- [ ] Load/save functionality complete
- [ ] E2E tests passing
- [ ] Error handling complete

### Milestone 4: MVP Complete (End of Week 4)
- [ ] All features implemented
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Deployed to production

---

## Daily Workflow

### TDD Cycle

**Morning**:
1. Review plan and select next task
2. Write failing tests (RED)
3. Run tests, verify they fail

**Midday**:
4. Implement minimal code to pass (GREEN)
5. Run tests, verify they pass
6. Commit: "feat: implement [feature] (green)"

**Afternoon**:
7. Refactor for quality
8. Ensure tests still pass
9. Run E2E verification if needed
10. Update status.md
11. Commit: "refactor: improve [feature]"

**Evening**:
- Review progress
- Update docs if needed
- Plan next day's tasks

---

## Commands Reference

```bash
# Development
npm start              # Start dev server
npm test               # Run Jest tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Build
npm run build          # Production build
npm run build:analyze  # Bundle analysis

# Linting
npm run lint           # ESLint
npm run lint:fix       # Auto-fix

# Deployment
npm run deploy         # Deploy to GitHub Pages

# E2E (via MCP/Playwright)
# Use MCP tools via Claude Code interface
```

---

## Success Criteria

**MVP Launch Checklist**:
- [ ] All P0 requirements implemented
- [ ] 90%+ test coverage achieved
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Zero critical bugs
- [ ] Performance benchmarks met
- [ ] WCAG 2.1 Level AA compliant
- [ ] Documentation complete
- [ ] README with screenshots
- [ ] Deployed to GitHub Pages
- [ ] User guide published

---

## Next Steps (Post-MVP)

### Phase 2 Features
- REST API integration
- Advanced editing (binary mode)
- Deck operations (merge, split, sort)
- Templates and examples
- Export/import (text, JSON, CSV)

### Phase 3 Features
- User authentication
- Cloud storage
- Real-time collaboration
- Version control
- Deck comparison/diff

---

**Document Status**: Complete
**Last Updated**: 2025-10-30
