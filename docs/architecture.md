# Deck Editor Architecture

## Overview

The Deck Editor is a browser-based single-page application (SPA) for creating, editing, and managing IBM 1130 punch card decks. Built with React, HTML5, CSS3, and vanilla JavaScript (no TypeScript, Rust, or Python), it provides an intuitive interface for working with 80-column punch cards in the IBM 108-byte binary format.

## Technology Stack

### Core Technologies
- **React** - Component-based UI framework (via CDN or npm)
- **HTML5** - Semantic markup and File API for local file operations
- **CSS3** - Modern styling with flexbox/grid layouts
- **JavaScript (ES6+)** - No TypeScript, pure JavaScript with JSX

### Testing Framework
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **Playwright (via MCP)** - End-to-end UI testing and debugging

### Build Tools
- **Webpack** or **Vite** - Module bundler and dev server
- **Babel** - JSX and modern JavaScript transpilation

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Application (SPA)                  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  UI Components                                     │  │
│  │  ├─ DeckManager       (deck list, CRUD)           │  │
│  │  ├─ CardSelector      (card navigation)           │  │
│  │  ├─ CardViewer        (SVG card display)          │  │
│  │  ├─ CardEditor        (punch/edit interface)      │  │
│  │  └─ FileOperations    (load/save controls)        │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  State Management (React Context/Hooks)           │  │
│  │  ├─ DeckContext       (current deck state)        │  │
│  │  ├─ CardContext       (selected card)             │  │
│  │  └─ SettingsContext   (user preferences)          │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  Business Logic                                    │  │
│  │  ├─ PunchCard.js      (card data model)           │  │
│  │  ├─ Hollerith.js      (encoding logic)            │  │
│  │  ├─ Deck.js           (deck operations)           │  │
│  │  └─ BinaryIO.js       (108-byte format I/O)       │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  Persistence Layer                                 │  │
│  │  ├─ LocalFile.js      (HTML5 File API)            │  │
│  │  └─ RestClient.js     (future: REST API client)   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ (Future Phase)
                           ▼
        ┌────────────────────────────────────┐
        │      Backend REST API              │
        │  ├─ GET    /api/decks              │
        │  ├─ GET    /api/decks/:id          │
        │  ├─ POST   /api/decks              │
        │  ├─ PUT    /api/decks/:id          │
        │  ├─ DELETE /api/decks/:id          │
        │  └─ PATCH  /api/decks/:id/rename   │
        └────────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────┐
                │  File Storage    │
                │  (deck files)    │
                └──────────────────┘
```

## Component Architecture

### Component Hierarchy

```
App
├─ Header
├─ DeckManager
│  ├─ DeckList
│  ├─ DeckControls (New/Load/Save/Delete)
│  └─ DeckMetadata (name, card count, size)
├─ CardNavigator
│  ├─ CardSelector (dropdown or slider)
│  ├─ NavigationButtons (Prev/Next/First/Last)
│  └─ CardCounter (current/total)
├─ CardDisplay
│  ├─ CardViewer (SVG rendering - reuses punch-card logic)
│  └─ CardEditor (text input or punch interface)
└─ Footer
```

## Data Models

### PunchCard Class
```javascript
class PunchCard {
  constructor(type = 'text') {
    this.columns = new Array(80).fill(null).map(() => new Column());
    this.type = type; // 'text' or 'binary'
  }

  // Methods:
  // - fromText(str)
  // - fromBinary(uint8Array)
  // - toBinary() -> Uint8Array (108 bytes)
  // - toText() -> string
  // - getColumn(index) -> Column
  // - setColumn(index, column)
  // - clear()
}

class Column {
  constructor() {
    this.punches = new HollerithCode(); // 12-row punch pattern
    this.printedChar = null;
  }

  // Methods:
  // - fromChar(c)
  // - toChar() -> char
  // - isBlank() -> boolean
}

class HollerithCode {
  constructor(rows = []) {
    this.rows = rows; // Array of punched row numbers [0-9, 11, 12]
  }

  // Methods:
  // - static fromChar(c) -> HollerithCode
  // - toChar() -> char
  // - asArray() -> [12 booleans]
  // - isEmpty() -> boolean
}
```

### Deck Class
```javascript
class Deck {
  constructor(name = 'Untitled Deck') {
    this.name = name;
    this.cards = []; // Array of PunchCard objects
    this.metadata = {
      created: new Date(),
      modified: new Date(),
      cardCount: 0
    };
  }

  // Methods:
  // - addCard(card)
  // - insertCard(index, card)
  // - removeCard(index)
  // - getCard(index) -> PunchCard
  // - loadFromFile(arrayBuffer)
  // - saveToFile() -> Blob
  // - clear()
}
```

## File Format Specification

### Deck File Format (.deck)

A deck file is a binary file containing:

```
Header (32 bytes):
  - Magic number: "DECK" (4 bytes)
  - Version: 0x01 (1 byte)
  - Card count: uint16 LE (2 bytes)
  - Reserved: (25 bytes)

Card Records (108 bytes each):
  - Binary card data in IBM 1130 format
  - 72 columns × 12 rows = 864 bits = 108 bytes
  - Columns 73-80 are blank (not stored)

Total file size = 32 + (108 × card_count) bytes
```

**Note:** For MVP, we may simplify to just concatenated 108-byte records without header.

## State Management

### React Context Structure

```javascript
// DeckContext
{
  deck: Deck,
  currentCardIndex: number,
  modified: boolean,
  actions: {
    loadDeck(file),
    saveDeck(),
    newDeck(),
    addCard(),
    removeCard(index),
    setCurrentCard(index)
  }
}

// SettingsContext
{
  theme: 'light' | 'dark',
  showColumnNumbers: boolean,
  showPrintedChars: boolean,
  autoSave: boolean
}
```

## API Design (Future Phase)

### REST Endpoints

```
GET    /api/decks
  Response: [{id, name, cardCount, created, modified}]

GET    /api/decks/:id
  Response: {id, name, cards: [binary data], metadata}

POST   /api/decks
  Body: {name, cards: [binary data]}
  Response: {id, name, ...}

PUT    /api/decks/:id
  Body: {name, cards: [binary data]}
  Response: {id, name, ...}

DELETE /api/decks/:id
  Response: {success: true}

PATCH  /api/decks/:id/rename
  Body: {name}
  Response: {id, name}

GET    /api/decks/:id/download
  Response: Binary file (deck format)

POST   /api/decks/upload
  Body: multipart/form-data (deck file)
  Response: {id, name, ...}
```

## Security Considerations

### Client-Side Security
- **File Validation**: Verify file size, format, and magic numbers
- **Input Sanitization**: Validate all text input for card punching
- **XSS Prevention**: React's built-in XSS protection via JSX
- **CORS**: Configure CORS headers for API access (future)

### Future Backend Security
- **Authentication**: JWT or session-based auth
- **Authorization**: User-based deck ownership
- **Rate Limiting**: Prevent abuse of API endpoints
- **File Size Limits**: Max deck size enforcement
- **Input Validation**: Server-side validation of all inputs

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load card SVG rendering only for visible card
2. **Virtualization**: For large decks (>100 cards), use virtual scrolling
3. **Memoization**: Cache expensive Hollerith encoding calculations
4. **Web Workers**: Offload binary file parsing to background threads
5. **Progressive Loading**: Load deck metadata first, cards on-demand

### Scalability Limits
- **Browser Memory**: Practical limit ~1000 cards in memory
- **File Size**: Max recommended deck file size: ~100KB (≈1000 cards)
- **Render Performance**: SVG rendering optimized for single card view

## Deployment Architecture

### Static Hosting (MVP)
```
GitHub Pages / Netlify / Vercel
  └─ Single-page application
     ├─ index.html
     ├─ bundle.js (webpack/vite output)
     ├─ styles.css
     └─ assets/ (images, fonts)
```

### Future: Full-Stack Deployment
```
Frontend (Static CDN)
  └─ SPA assets

Backend (Node.js/Express)
  ├─ API server
  └─ File storage (local or S3-compatible)

Database (optional)
  └─ Metadata storage (PostgreSQL/MongoDB)
```

## Testing Architecture

### Test Strategy
1. **Unit Tests** (Jest)
   - PunchCard class methods
   - Hollerith encoding/decoding
   - Deck operations
   - Binary I/O functions

2. **Integration Tests** (React Testing Library)
   - Component interactions
   - Context state management
   - File upload/download flows

3. **E2E Tests** (Playwright via MCP)
   - Complete user workflows
   - Cross-browser compatibility
   - Visual regression testing

### Test Coverage Goals
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All critical user paths
- **E2E Tests**: Happy path + error scenarios

## Browser Compatibility

### Minimum Requirements
- **Chrome/Edge**: 88+ (ES6, File API, Blob support)
- **Firefox**: 89+
- **Safari**: 15+

### Progressive Enhancement
- Graceful degradation for older browsers
- Feature detection for File API
- Fallback UI for unsupported features

## Accessibility (a11y)

### Standards Compliance
- WCAG 2.1 Level AA compliance
- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly

### Specific Features
- High contrast mode support
- Keyboard shortcuts for navigation
- Focus management
- Alt text for SVG card displays

## Extensibility

### Plugin Architecture (Future)
The architecture supports future plugins for:
- Custom card formats (96-column cards)
- Import/export formats (CSV, JSON)
- Card templates
- Batch operations
- Integration with simulators

### Theming
- CSS custom properties for colors
- Separate theme files
- Dark mode support
- Custom card styling

## Migration Path from Punch-Card App

### Code Reuse Strategy
1. **Hollerith Encoding**: Port Rust logic to JavaScript
2. **SVG Rendering**: Adapt Yew components to React
3. **Binary I/O**: Translate Rust byte operations to JavaScript
4. **Visual Design**: Reuse CSS styles and SVG patterns

### Differences from Punch-Card App
- **Multi-card**: Deck vs single card
- **File Format**: 108-byte records vs 80-byte EBCDIC
- **Navigation**: Card selector UI
- **State**: Deck-level state management
- **Persistence**: File-based vs memory-only

## Future Enhancements

### Phase 2 Features
- Backend REST API integration
- User authentication
- Cloud storage
- Deck sharing/collaboration
- Card templates library

### Phase 3 Features
- Real-time collaboration
- Version control for decks
- Deck comparison/diff
- Import from scanned card images
- Integration with IBM 1130 simulator

## References

### Technical Resources
- [IBM 1130 Binary Format](https://dialectrix.com/G4G/ZebraStripeCard.html)
- [Hollerith Encoding](https://homepage.divms.uiowa.edu/~jones/cards/codes.html)
- [Punch-Card Repository](https://github.com/wrightmikea/punch-card)
- [File API Specification](https://w3c.github.io/FileAPI/)
- [React Documentation](https://react.dev/)

### Related Projects
- [wrightmikea/punch-card](https://github.com/wrightmikea/punch-card) - Single card editor (Yew/Rust)
- [wrightmikea/S1130-rs](https://github.com/wrightmikea/S1130-rs) - IBM 1130 simulator

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Status**: Initial Architecture
