# Design Document
## IBM 1130 Deck Editor

### Document Information
- **Version**: 1.0
- **Author**: Michael A Wright
- **Date**: 2025-10-30
- **Status**: Design Phase

---

## Table of Contents
1. [UI/UX Design](#uiux-design)
2. [Component Design](#component-design)
3. [Data Flow Design](#data-flow-design)
4. [API Design](#api-design)
5. [Visual Design](#visual-design)
6. [Interaction Design](#interaction-design)

---

## UI/UX Design

### Design Principles

1. **Authenticity**: Visual fidelity to historical IBM punch cards
2. **Clarity**: Clear, unambiguous interface requiring no manual
3. **Efficiency**: Minimize clicks/keystrokes for common tasks
4. **Feedback**: Immediate visual confirmation of all actions
5. **Forgiving**: Easy undo, clear warnings before destructive actions

### Layout Philosophy

**Desktop-First Design**: Optimized for desktop workflows, tablet-friendly, mobile deferred to Phase 2.

**Single-Screen Focus**: All essential controls visible without scrolling (on 1920x1080 or 1280x720).

**Progressive Disclosure**: Advanced features hidden until needed.

---

## Component Design

### 1. App Component (Root)

**Responsibility**: Application shell, context providers, routing

```jsx
// App.js
import React from 'react';
import { DeckProvider } from './contexts/DeckContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import DeckManager from './components/DeckManager';
import CardNavigator from './components/CardNavigator';
import CardDisplay from './components/CardDisplay';
import Footer from './components/Footer';

function App() {
  return (
    <SettingsProvider>
      <DeckProvider>
        <div className="app">
          <Header />
          <main>
            <DeckManager />
            <CardNavigator />
            <CardDisplay />
          </main>
          <Footer />
        </div>
      </DeckProvider>
    </SettingsProvider>
  );
}

export default App;
```

**State**: None (delegates to context providers)

**Props**: None

---

### 2. Header Component

**Responsibility**: App title, menu, settings

```jsx
// components/Header.js
import React from 'react';

function Header() {
  return (
    <header className="header">
      <h1>IBM 1130 Deck Editor</h1>
      <nav>
        <button>Help</button>
        <button>Settings</button>
      </nav>
    </header>
  );
}

export default Header;
```

**Visual Design**:
- Background: #2c3e50 (dark blue-gray)
- Text: #ecf0f1 (off-white)
- Height: 60px
- Font: "IBM Plex Mono" or monospace

---

### 3. DeckManager Component

**Responsibility**: Deck-level operations (New, Load, Save, Metadata)

```jsx
// components/DeckManager.js
import React, { useContext } from 'react';
import { DeckContext } from '../contexts/DeckContext';

function DeckManager() {
  const { deck, modified, actions } = useContext(DeckContext);

  const handleNew = () => {
    if (modified && !confirm('Unsaved changes will be lost. Continue?')) {
      return;
    }
    actions.newDeck();
  };

  const handleLoad = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await actions.loadDeck(file);
  };

  const handleSave = () => {
    actions.saveDeck();
  };

  return (
    <div className="deck-manager">
      <div className="deck-info">
        <span className="deck-name">{deck.name || 'Untitled'}</span>
        <span className="card-count">{deck.cards.length} cards</span>
        {modified && <span className="modified-indicator">*</span>}
      </div>
      <div className="deck-controls">
        <button onClick={handleNew}>New Deck</button>
        <label className="file-button">
          Load
          <input type="file" accept=".deck,.bin" onChange={handleLoad} hidden />
        </label>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => actions.addCard()}>Add Card</button>
        <button onClick={() => actions.removeCard()}>Delete Card</button>
      </div>
    </div>
  );
}

export default DeckManager;
```

**State**: None (uses DeckContext)

**Props**: None

**Visual Design**:
- Two rows: info + controls
- Background: #ecf0f1 (light gray)
- Border bottom: 2px solid #bdc3c7
- Padding: 12px
- Button spacing: 8px gap

---

### 4. CardNavigator Component

**Responsibility**: Card selection and navigation

```jsx
// components/CardNavigator.js
import React, { useContext } from 'react';
import { DeckContext } from '../contexts/DeckContext';

function CardNavigator() {
  const { deck, currentCardIndex, actions } = useContext(DeckContext);

  const totalCards = deck.cards.length;
  const isFirst = currentCardIndex === 0;
  const isLast = currentCardIndex === totalCards - 1;

  return (
    <div className="card-navigator">
      <div className="card-position">
        Card {currentCardIndex + 1} of {totalCards}
      </div>
      <div className="nav-controls">
        <button
          onClick={() => actions.setCurrentCard(0)}
          disabled={isFirst}
          title="First card"
        >
          |◀
        </button>
        <button
          onClick={() => actions.setCurrentCard(currentCardIndex - 1)}
          disabled={isFirst}
          title="Previous card"
        >
          ◀
        </button>
        <select
          value={currentCardIndex}
          onChange={(e) => actions.setCurrentCard(Number(e.target.value))}
        >
          {deck.cards.map((_, i) => (
            <option key={i} value={i}>Card {i + 1}</option>
          ))}
        </select>
        <button
          onClick={() => actions.setCurrentCard(currentCardIndex + 1)}
          disabled={isLast}
          title="Next card"
        >
          ▶
        </button>
        <button
          onClick={() => actions.setCurrentCard(totalCards - 1)}
          disabled={isLast}
          title="Last card"
        >
          ▶|
        </button>
      </div>
    </div>
  );
}

export default CardNavigator;
```

**State**: None (uses DeckContext)

**Props**: None

**Visual Design**:
- Centered layout
- Background: white
- Padding: 16px
- Button size: 40px × 32px
- Select width: 120px

---

### 5. CardDisplay Component

**Responsibility**: Orchestrates CardViewer + CardEditor

```jsx
// components/CardDisplay.js
import React, { useContext } from 'react';
import { DeckContext } from '../contexts/DeckContext';
import CardViewer from './CardViewer';
import CardEditor from './CardEditor';

function CardDisplay() {
  const { deck, currentCardIndex } = useContext(DeckContext);
  const currentCard = deck.cards[currentCardIndex];

  if (!currentCard) {
    return <div className="card-display empty">No cards in deck</div>;
  }

  return (
    <div className="card-display">
      <CardViewer card={currentCard} />
      <CardEditor card={currentCard} cardIndex={currentCardIndex} />
    </div>
  );
}

export default CardDisplay;
```

---

### 6. CardViewer Component

**Responsibility**: SVG rendering of punch card

```jsx
// components/CardViewer.js
import React from 'react';

function CardViewer({ card }) {
  const CARD_WIDTH = 1000;
  const CARD_HEIGHT = 300;
  const COLUMN_WIDTH = CARD_WIDTH / 80;
  const ROW_HEIGHT = CARD_HEIGHT / 14; // 12 rows + margins

  const renderPunchHole = (col, row) => {
    const x = col * COLUMN_WIDTH + COLUMN_WIDTH / 2;
    const y = (row + 1) * ROW_HEIGHT;
    return (
      <circle
        key={`${col}-${row}`}
        cx={x}
        cy={y}
        r={4}
        fill="#000"
      />
    );
  };

  const renderColumn = (column, colIndex) => {
    const punches = column.punches.asArray(); // [12, 11, 0-9] as booleans
    return (
      <g key={colIndex}>
        {punches.map((isPunched, rowIndex) =>
          isPunched ? renderPunchHole(colIndex, rowIndex) : null
        )}
        {column.printedChar && (
          <text
            x={colIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y={10}
            fontSize="10"
            textAnchor="middle"
          >
            {column.printedChar}
          </text>
        )}
      </g>
    );
  };

  return (
    <svg
      className="card-viewer"
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      style={{
        backgroundColor: '#F5E6D3', // cream card color
        border: '1px solid #8B4513'
      }}
    >
      {card.columns.map((column, i) => renderColumn(column, i))}
    </svg>
  );
}

export default CardViewer;
```

**Props**:
- `card`: PunchCard object

**Visual Design**:
- Card color: #F5E6D3 (cream)
- Border: #8B4513 (saddle brown)
- Hole color: #000 (black)
- Hole radius: 4px
- Printed text: 10px monospace, top-aligned

---

### 7. CardEditor Component

**Responsibility**: Text input for punching cards

```jsx
// components/CardEditor.js
import React, { useState, useEffect, useContext } from 'react';
import { DeckContext } from '../contexts/DeckContext';

function CardEditor({ card, cardIndex }) {
  const { actions } = useContext(DeckContext);
  const [text, setText] = useState(card.toText());

  useEffect(() => {
    setText(card.toText());
  }, [cardIndex, card]);

  const handleChange = (e) => {
    const newText = e.target.value.toUpperCase().slice(0, 80);
    setText(newText);
    actions.updateCardText(cardIndex, newText);
  };

  const handleClear = () => {
    setText('');
    actions.updateCardText(cardIndex, '');
  };

  return (
    <div className="card-editor">
      <label htmlFor="card-text">Card Text (max 80 chars):</label>
      <input
        id="card-text"
        type="text"
        value={text}
        onChange={handleChange}
        maxLength={80}
        className="text-input"
        placeholder="Type to punch card..."
      />
      <div className="editor-controls">
        <span className="char-count">{text.length} / 80</span>
        <button onClick={handleClear}>Clear Card</button>
      </div>
    </div>
  );
}

export default CardEditor;
```

**Props**:
- `card`: PunchCard object
- `cardIndex`: number

**State**:
- `text`: string (controlled input)

**Visual Design**:
- Input: Full width, monospace font, 16px
- Background: white
- Border: 1px solid #95a5a6
- Focus: 2px solid #3498db
- Padding: 8px

---

### 8. Footer Component

**Responsibility**: Status messages, attribution

```jsx
// components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="status">Ready</div>
      <div className="attribution">
        Built with React | Inspired by IBM 029 Keypunch
      </div>
    </footer>
  );
}

export default Footer;
```

**Visual Design**:
- Background: #34495e (dark gray)
- Text: #ecf0f1 (off-white)
- Height: 40px
- Font size: 12px

---

## Data Flow Design

### State Management

**DeckContext**:
```javascript
{
  deck: Deck,                    // Current deck instance
  currentCardIndex: number,      // Selected card (0-based)
  modified: boolean,             // Unsaved changes flag
  actions: {
    newDeck(),
    loadDeck(file),
    saveDeck(),
    addCard(),
    removeCard(index),
    setCurrentCard(index),
    updateCardText(index, text)
  }
}
```

**SettingsContext**:
```javascript
{
  theme: 'light' | 'dark',
  showColumnNumbers: boolean,
  showPrintedChars: boolean,
  autoSave: boolean,
  actions: {
    setTheme(theme),
    toggleColumnNumbers(),
    togglePrintedChars(),
    toggleAutoSave()
  }
}
```

### Data Flow Diagram

```
User Action
    │
    ├─→ DeckManager ──→ DeckContext.actions.loadDeck()
    │                       │
    │                       ├─→ BinaryIO.loadFromFile()
    │                       │       │
    │                       │       └─→ Deck.loadFromBinary()
    │                       │               │
    │                       │               └─→ PunchCard.fromBinary()
    │                       │
    │                       └─→ setState({ deck, modified: false })
    │
    ├─→ CardEditor ──→ DeckContext.actions.updateCardText()
    │                       │
    │                       └─→ setState({
    │                               deck: deck.updateCard(index, text),
    │                               modified: true
    │                           })
    │
    └─→ CardNavigator ──→ DeckContext.actions.setCurrentCard()
                            │
                            └─→ setState({ currentCardIndex })
```

---

## API Design

### Core Classes

#### PunchCard Class

```javascript
/**
 * Represents a single 80-column IBM punch card
 */
class PunchCard {
  constructor(type = 'text') {
    this.columns = Array(80).fill(null).map(() => new Column());
    this.type = type; // 'text' or 'binary'
  }

  /**
   * Create card from text string
   * @param {string} text - Up to 80 characters
   * @returns {PunchCard}
   */
  static fromText(text) {
    const card = new PunchCard('text');
    for (let i = 0; i < Math.min(text.length, 80); i++) {
      card.columns[i] = Column.fromChar(text[i]);
    }
    return card;
  }

  /**
   * Create card from binary data (108 bytes)
   * @param {Uint8Array} data - 108-byte binary array
   * @returns {PunchCard}
   */
  static fromBinary(data) {
    if (data.length !== 108) {
      throw new Error('Binary data must be exactly 108 bytes');
    }
    const card = new PunchCard('binary');
    // Unpack 864 bits into 72 columns × 12 rows
    let bitIndex = 0;
    for (let col = 0; col < 72; col++) {
      const punchArray = new Array(12).fill(false);
      for (let row = 0; row < 12; row++) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitInByte = bitIndex % 8;
        punchArray[row] = (data[byteIndex] & (1 << bitInByte)) !== 0;
        bitIndex++;
      }
      card.columns[col] = Column.fromHollerith(new HollerithCode(punchArray));
    }
    return card;
  }

  /**
   * Convert card to binary format (108 bytes)
   * @returns {Uint8Array}
   */
  toBinary() {
    const data = new Uint8Array(108);
    const bitBuffer = [];

    // Pack 72 columns × 12 rows = 864 bits
    for (let col = 0; col < 72; col++) {
      const punchArray = this.columns[col].punches.asArray();
      bitBuffer.push(...punchArray);
    }

    // Convert bits to bytes
    for (let byteIndex = 0; byteIndex < 108; byteIndex++) {
      let byteValue = 0;
      for (let bitInByte = 0; bitInByte < 8; bitInByte++) {
        const bitIndex = byteIndex * 8 + bitInByte;
        if (bitIndex < bitBuffer.length && bitBuffer[bitIndex]) {
          byteValue |= (1 << bitInByte);
        }
      }
      data[byteIndex] = byteValue;
    }

    return data;
  }

  /**
   * Convert card to text string
   * @returns {string}
   */
  toText() {
    return this.columns.map(col => col.toChar() || ' ').join('');
  }

  /**
   * Get column at index
   * @param {number} index - Column index (0-79)
   * @returns {Column}
   */
  getColumn(index) {
    if (index < 0 || index >= 80) {
      throw new Error('Column index out of range');
    }
    return this.columns[index];
  }

  /**
   * Set column from text character
   * @param {number} index - Column index (0-79)
   * @param {string} char - Single character
   */
  setColumn(index, char) {
    if (index < 0 || index >= 80) {
      throw new Error('Column index out of range');
    }
    this.columns[index] = Column.fromChar(char);
  }

  /**
   * Clear all columns
   */
  clear() {
    this.columns = Array(80).fill(null).map(() => new Column());
  }
}
```

#### Column Class

```javascript
/**
 * Represents a single column on a punch card
 */
class Column {
  constructor() {
    this.punches = new HollerithCode();
    this.printedChar = null;
  }

  /**
   * Create column from character
   * @param {string} char - Single character
   * @returns {Column}
   */
  static fromChar(char) {
    const col = new Column();
    const upperChar = char.toUpperCase();
    col.punches = HollerithCode.fromChar(upperChar);
    col.printedChar = upperChar;
    return col;
  }

  /**
   * Create column from Hollerith code
   * @param {HollerithCode} code
   * @returns {Column}
   */
  static fromHollerith(code) {
    const col = new Column();
    col.punches = code;
    col.printedChar = null;
    return col;
  }

  /**
   * Convert to character
   * @returns {string|null}
   */
  toChar() {
    return this.punches.toChar();
  }

  /**
   * Check if column is blank
   * @returns {boolean}
   */
  isBlank() {
    return this.punches.isEmpty();
  }
}
```

#### HollerithCode Class

```javascript
/**
 * Represents Hollerith punch pattern (12 rows)
 */
class HollerithCode {
  constructor(rows = []) {
    this.rows = rows; // Array of 12 booleans or row numbers
  }

  /**
   * Create from character
   * @param {string} char - Single character
   * @returns {HollerithCode}
   */
  static fromChar(char) {
    const code = new HollerithCode();
    const upper = char.toUpperCase();

    // Encoding map (simplified - full map in implementation)
    const encodings = {
      ' ': [],
      '0': [0], '1': [1], '2': [2], '3': [3], '4': [4],
      '5': [5], '6': [6], '7': [7], '8': [8], '9': [9],
      'A': [12, 1], 'B': [12, 2], 'C': [12, 3], 'D': [12, 4],
      'E': [12, 5], 'F': [12, 6], 'G': [12, 7], 'H': [12, 8],
      'I': [12, 9], 'J': [11, 1], 'K': [11, 2], 'L': [11, 3],
      'M': [11, 4], 'N': [11, 5], 'O': [11, 6], 'P': [11, 7],
      'Q': [11, 8], 'R': [11, 9], 'S': [0, 2], 'T': [0, 3],
      'U': [0, 4], 'V': [0, 5], 'W': [0, 6], 'X': [0, 7],
      'Y': [0, 8], 'Z': [0, 9],
      // ... special characters
    };

    const rowList = encodings[upper] || [];
    code.rows = new Array(12).fill(false);
    rowList.forEach(row => code.rows[row] = true);

    return code;
  }

  /**
   * Convert to character
   * @returns {string|null}
   */
  toChar() {
    // Reverse lookup of encoding
    // ... implementation
    return null; // placeholder
  }

  /**
   * Get as array of 12 booleans
   * @returns {boolean[]}
   */
  asArray() {
    return this.rows;
  }

  /**
   * Check if empty (no punches)
   * @returns {boolean}
   */
  isEmpty() {
    return this.rows.every(r => !r);
  }

  /**
   * Create empty code
   * @returns {HollerithCode}
   */
  static empty() {
    return new HollerithCode(new Array(12).fill(false));
  }
}
```

#### Deck Class

```javascript
/**
 * Represents a deck of punch cards
 */
class Deck {
  constructor(name = 'Untitled Deck') {
    this.name = name;
    this.cards = [new PunchCard()]; // Always start with 1 blank card
    this.metadata = {
      created: new Date(),
      modified: new Date()
    };
  }

  /**
   * Load deck from binary file
   * @param {ArrayBuffer} arrayBuffer - File contents
   * @returns {Deck}
   */
  static fromBinary(arrayBuffer, filename = 'Loaded Deck') {
    const data = new Uint8Array(arrayBuffer);
    const cardCount = Math.floor(data.length / 108);

    if (data.length % 108 !== 0) {
      throw new Error('Invalid deck file: size must be multiple of 108 bytes');
    }

    const deck = new Deck(filename);
    deck.cards = [];

    for (let i = 0; i < cardCount; i++) {
      const cardData = data.slice(i * 108, (i + 1) * 108);
      deck.cards.push(PunchCard.fromBinary(cardData));
    }

    return deck;
  }

  /**
   * Convert deck to binary format
   * @returns {Uint8Array}
   */
  toBinary() {
    const totalSize = this.cards.length * 108;
    const data = new Uint8Array(totalSize);

    for (let i = 0; i < this.cards.length; i++) {
      const cardData = this.cards[i].toBinary();
      data.set(cardData, i * 108);
    }

    return data;
  }

  /**
   * Add a card at the end
   * @param {PunchCard} card - Card to add (optional)
   */
  addCard(card = null) {
    this.cards.push(card || new PunchCard());
    this.metadata.modified = new Date();
  }

  /**
   * Remove card at index
   * @param {number} index - Card index
   */
  removeCard(index) {
    if (this.cards.length <= 1) {
      throw new Error('Cannot delete last card');
    }
    this.cards.splice(index, 1);
    this.metadata.modified = new Date();
  }

  /**
   * Get card at index
   * @param {number} index
   * @returns {PunchCard}
   */
  getCard(index) {
    return this.cards[index];
  }

  /**
   * Update card text at index
   * @param {number} index
   * @param {string} text
   */
  updateCard(index, text) {
    this.cards[index] = PunchCard.fromText(text);
    this.metadata.modified = new Date();
  }
}
```

---

## Visual Design

### Color Palette

```css
:root {
  /* Primary Colors */
  --card-cream: #F5E6D3;
  --card-border: #8B4513;
  --punch-black: #000000;

  /* UI Colors */
  --header-bg: #2c3e50;
  --header-text: #ecf0f1;
  --body-bg: #ffffff;
  --panel-bg: #ecf0f1;
  --border-gray: #bdc3c7;
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;

  /* Interactive */
  --button-primary: #3498db;
  --button-hover: #2980b9;
  --button-disabled: #95a5a6;
  --input-focus: #3498db;

  /* Status */
  --success-green: #27ae60;
  --error-red: #e74c3c;
  --warning-yellow: #f39c12;
}
```

### Typography

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: "IBM Plex Mono", "Courier New", Courier, monospace;

  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
}

.text-input, .card-viewer text {
  font-family: var(--font-mono);
}
```

### Spacing

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
}
```

---

## Interaction Design

### User Flows

#### Flow 1: Create New Deck
```
1. User clicks "New Deck"
2. If modified, show confirmation dialog
3. Clear current deck
4. Create new deck with 1 blank card
5. Set currentCardIndex = 0
6. Update UI
```

#### Flow 2: Load Deck from File
```
1. User clicks "Load"
2. File picker opens
3. User selects .deck file
4. Validate file size and format
5. Parse binary data into cards
6. Update deck state
7. Set currentCardIndex = 0
8. Show success message
```

#### Flow 3: Edit Card
```
1. User types in text input
2. Text converted to uppercase
3. Text limited to 80 chars
4. PunchCard.fromText() called
5. Card state updated
6. SVG re-renders with new punches
7. Modified flag set to true
8. Auto-save to localStorage (30s delay)
```

#### Flow 4: Navigate Cards
```
1. User clicks Next button
2. Validate not at end
3. currentCardIndex++
4. CardViewer re-renders with new card
5. CardEditor updates text input
```

#### Flow 5: Save Deck
```
1. User clicks "Save"
2. Deck.toBinary() generates Uint8Array
3. Create Blob from binary data
4. Trigger browser download
5. Default filename: deck-YYYYMMDD-HHMMSS.deck
6. Set modified = false
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New deck |
| `Ctrl/Cmd + O` | Open deck |
| `Ctrl/Cmd + S` | Save deck |
| `Ctrl/Cmd + Shift + S` | Save as |
| `Ctrl/Cmd + D` | Delete current card |
| `Ctrl/Cmd + Enter` | Add new card |
| `←` | Previous card |
| `→` | Next card |
| `Home` | First card |
| `End` | Last card |
| `Ctrl/Cmd + K` | Clear current card |
| `Esc` | Cancel/close dialogs |

### Error Handling

**File Load Errors**:
```javascript
try {
  const deck = Deck.fromBinary(arrayBuffer, file.name);
  actions.setDeck(deck);
} catch (error) {
  showError('Failed to load deck: ' + error.message);
}
```

**Validation Errors**:
- File too large: "File size exceeds 1MB limit"
- Invalid format: "Invalid deck file format. Expected 108 bytes per card."
- Empty file: "File is empty"

**User-Friendly Messages**:
- Use toast notifications (auto-dismiss)
- Red border for error inputs
- Clear, actionable error text

---

## Responsive Design

### Breakpoints

```css
/* Desktop (default) */
@media (min-width: 1024px) {
  .app { max-width: 1200px; }
}

/* Tablet */
@media (max-width: 1023px) and (min-width: 768px) {
  .card-viewer { width: 100%; }
  .deck-controls button { font-size: 12px; }
}

/* Mobile (Phase 2) */
@media (max-width: 767px) {
  .app { display: none; }
  .mobile-message { display: block; }
}
```

---

## Accessibility (a11y)

### ARIA Labels

```jsx
<button aria-label="Navigate to first card" onClick={handleFirst}>
  |◀
</button>

<input
  aria-label="Card text input, maximum 80 characters"
  aria-describedby="char-count"
  type="text"
  value={text}
/>

<span id="char-count" aria-live="polite">
  {text.length} of 80 characters
</span>
```

### Keyboard Navigation

- All interactive elements tabbable
- Focus visible (outline)
- Skip to main content link
- Logical tab order

### Screen Reader Support

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`)
- Alt text for SVG elements
- Live regions for status updates
- ARIA roles where needed

---

## References

- [React Design Patterns](https://reactpatterns.com/)
- [Material Design Guidelines](https://material.io/design)
- [IBM Design Language](https://www.ibm.com/design/language/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Status**: Complete
**Last Updated**: 2025-10-30
