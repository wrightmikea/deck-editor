# Product Requirements Document (PRD)
## IBM 1130 Deck Editor

### Document Information
- **Product Name**: Deck Editor
- **Version**: 1.0 (MVP)
- **Author**: Michael A Wright
- **Date**: 2025-10-30
- **Status**: Planning

---

## Executive Summary

The Deck Editor is a browser-based application for creating, editing, and managing IBM 1130 punch card decks. It extends the single-card punch-card editor to support multi-card decks with file I/O and future REST API integration for cloud storage and collaboration.

### Vision
Enable hobbyists, educators, and computer historians to create and manage authentic IBM 1130 punch card decks using modern web technologies while preserving the historical accuracy of the original punch card format.

### Success Metrics
- Users can create a 10-card deck in < 5 minutes
- Load/save operations complete in < 2 seconds
- Zero data loss during file operations
- 90%+ test coverage
- Works on Chrome, Firefox, Safari without issues

---

## Product Overview

### Target Audience

1. **Computer History Enthusiasts**
   - Want authentic punch card experience
   - Need to create test data for simulators
   - Appreciate historical accuracy

2. **Educators**
   - Teaching computer history
   - Demonstrating vintage computing
   - Creating classroom materials

3. **Hobbyist Programmers**
   - Running IBM 1130 simulators
   - Creating object decks for testing
   - Archiving historical programs

4. **Researchers/Archivists**
   - Digitizing physical punch card decks
   - Preserving historical software
   - Documentation and analysis

### User Personas

**Persona 1: "Dave the Hobbyist"**
- Age: 45-65
- Background: Retired software engineer
- Goal: Run programs on IBM 1130 simulator
- Pain Point: No easy way to create multi-card decks
- Tech Savvy: High

**Persona 2: "Professor Sarah"**
- Age: 35-50
- Background: Computer science educator
- Goal: Demonstrate punch card technology to students
- Pain Point: Need quick way to create example decks
- Tech Savvy: Medium

**Persona 3: "Alex the Archivist"**
- Age: 30-45
- Background: Museum/library professional
- Goal: Digitize and preserve historical card decks
- Pain Point: Need reliable format for long-term storage
- Tech Savvy: Medium

---

## Product Requirements

### MVP (Phase 1) - Core Functionality

#### FR-1: Deck Management
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can create a new empty deck with one blank card
- As a user, I can add blank cards to a deck one at a time
- As a user, I can delete cards from a deck
- As a user, I can see the total card count
- As a user, I can navigate between cards (next, previous, first, last, jump to card N)

**Acceptance Criteria**:
- [ ] New deck starts with exactly 1 blank card
- [ ] Add card button creates a new blank card at the end
- [ ] Delete card removes current card (unless it's the only card)
- [ ] Card counter shows "Card N of M" format
- [ ] Navigation buttons are disabled when at boundaries
- [ ] Deck supports minimum 1 card, maximum 1000 cards

#### FR-2: Card Viewing
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can view one card at a time in full detail
- As a user, I can see the Hollerith punch patterns
- As a user, I can see printed characters at the top of the card
- As a user, I can see column numbers
- As a user, I can see which columns are punched

**Acceptance Criteria**:
- [ ] Card displayed as SVG (reusing punch-card visual design)
- [ ] Punch holes clearly visible
- [ ] Printed characters shown at top of card
- [ ] Column numbers displayed (0-79 or 1-80)
- [ ] Current column highlighted during editing
- [ ] Responsive design fits browser window

#### FR-3: Card Editing
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can type text to punch cards (text mode)
- As a user, I can see characters appear as I type
- As a user, I can use backspace to delete punches
- As a user, I can clear a card completely
- As a user, I can see changes reflected immediately in the card view

**Acceptance Criteria**:
- [ ] Text input field accepts up to 80 characters
- [ ] Characters automatically converted to uppercase
- [ ] Text updates card display in real-time
- [ ] Hollerith encoding matches IBM 029 keypunch
- [ ] Clear button resets all 80 columns to blank
- [ ] Unsupported characters are ignored or replaced with space

#### FR-4: Load Deck from File
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can load a deck from a binary file on my computer
- As a user, I see the deck name from the filename
- As a user, I can see all cards in the loaded deck
- As a user, I am notified if the file format is invalid

**Acceptance Criteria**:
- [ ] File picker supports .deck, .bin, or no extension
- [ ] Parser handles 108-byte per card format
- [ ] File size validated (max 1MB = ~9500 cards)
- [ ] Invalid files show clear error message
- [ ] Loading preserves all card data exactly
- [ ] Deck name defaults to filename without extension

#### FR-5: Save Deck to File
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can save my deck to a binary file
- As a user, I can choose the filename
- As a user, I see confirmation that save succeeded
- As a user, saved files can be re-loaded without data loss

**Acceptance Criteria**:
- [ ] Save button triggers browser download
- [ ] Default filename: "deck-YYYYMMDD-HHMMSS.deck"
- [ ] File format: 108 bytes per card (IBM 1130 format)
- [ ] Columns 73-80 saved as blank (authentic format)
- [ ] File can be loaded back with identical data
- [ ] Large decks (>100 cards) save without performance issues

#### FR-6: File Format Compatibility
**Priority**: P0 (Must Have)

**User Stories**:
- As a user, I can load files created by IBM 1130 assemblers
- As a user, my files work with IBM 1130 simulators
- As a user, I can interchange files with other tools

**Acceptance Criteria**:
- [ ] IBM 1130 binary format: 108 bytes per card
- [ ] 72 columns × 12 rows = 864 bits per card
- [ ] Columns 1-72 contain data
- [ ] Columns 73-80 are blank (sequence number area)
- [ ] Bit ordering matches IBM 1130 specification
- [ ] Row ordering: [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

### Non-Functional Requirements

#### NFR-1: Performance
**Priority**: P0

- Page load time: < 2 seconds
- Deck load time: < 2 seconds for 100 cards, < 5 seconds for 1000 cards
- Card navigation: < 100ms response time
- Text input: Real-time display update (< 50ms latency)
- File save: < 3 seconds for 100 cards

#### NFR-2: Usability
**Priority**: P0

- Intuitive UI requiring no manual/tutorial
- Keyboard shortcuts for common operations
- Clear visual feedback for all actions
- Responsive design (desktop and tablet)
- Accessible (WCAG 2.1 Level AA)

#### NFR-3: Reliability
**Priority**: P0

- Zero data corruption during file I/O
- Graceful error handling with user-friendly messages
- Auto-save to browser localStorage every 30 seconds
- Warn user of unsaved changes before leaving page

#### NFR-4: Compatibility
**Priority**: P0

- Chrome 88+
- Firefox 89+
- Safari 15+
- Edge 88+
- No mobile browser support required (MVP)

#### NFR-5: Testability
**Priority**: P0

- 90%+ unit test coverage
- Integration tests for all critical paths
- E2E tests for complete workflows
- Red/Green TDD approach documented

---

## Phase 2 Features (Future)

### FR-7: REST API Integration
**Priority**: P1 (Should Have)

**User Stories**:
- As a user, I can list my saved decks from the server
- As a user, I can load a deck from the server
- As a user, I can save a deck to the server
- As a user, I can rename a deck on the server
- As a user, I can delete a deck from the server

**API Endpoints**:
- `GET /api/decks` - List all decks
- `GET /api/decks/:id` - Get deck by ID
- `POST /api/decks` - Create new deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck
- `PATCH /api/decks/:id/rename` - Rename deck

### FR-8: Advanced Card Editing
**Priority**: P2 (Nice to Have)

- Binary mode editing (direct punch pattern manipulation)
- Column-by-column editing
- Copy/paste cards
- Duplicate card
- Insert card at position

### FR-9: Deck Operations
**Priority**: P2 (Nice to Have)

- Merge decks
- Split deck
- Reverse card order
- Sort cards (by content)
- Search/filter cards

### FR-10: Templates and Examples
**Priority**: P2 (Nice to Have)

- Pre-defined card templates (assembler source, object deck, data)
- Example decks (Hello World, simple programs)
- Template library

### FR-11: Export/Import
**Priority**: P2 (Nice to Have)

- Export deck as text file (80 chars per line)
- Export as JSON
- Import from text file
- Import from CSV

---

## Technical Requirements

### Technology Stack
- **Framework**: React 18+
- **Language**: JavaScript ES6+ (no TypeScript)
- **Styling**: CSS3 (flexbox/grid)
- **Build Tool**: Webpack or Vite
- **Testing**: Jest + React Testing Library + Playwright (MCP)

### Development Process
- **Methodology**: Test-Driven Development (Red/Green/Refactor)
- **Version Control**: Git with feature branches
- **Documentation**: Inline comments + docs/ folder
- **Code Style**: ESLint + Prettier

### File Structure
```
deck-editor/
├── docs/              (this PRD, architecture, design, etc.)
├── public/            (static assets)
├── src/
│   ├── components/    (React components)
│   ├── utils/         (business logic, encoding, I/O)
│   ├── tests/         (Jest unit/integration tests)
│   ├── App.js
│   └── index.js
├── package.json
├── webpack.config.js  (or vite.config.js)
└── README.md
```

### Supported Character Set

The IBM 1130 Deck Editor supports the IBM 029 Hollerith character set, which includes 48 printable characters. Characters not in this set will be ignored when typing.

#### Alphabetic Characters (26)
- **Uppercase Letters**: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
- **Note**: Lowercase letters are automatically converted to uppercase

#### Numeric Characters (10)
- **Digits**: 0 1 2 3 4 5 6 7 8 9

#### Special Characters (12)
- **Common**: (space) . , - / ( ) + * = $ &
- **Note**: Space bar creates a blank column (no punches)

#### Additional Special Characters (11)
- **Extended**: < > % @ # ! : ; ? " ' _ |

#### Unsupported Characters
The following common keyboard characters are **NOT** supported by IBM 029 punch cards:
- **Backslash**: \ (not part of IBM 029 character set)
- **Brackets**: [ ] { }
- **Caret**: ^
- **Tilde**: ~
- **Backtick**: `
- **Tab**: (use spaces instead)
- **Newline**: (single-line cards only)

#### Character Input Behavior
1. **Uppercase Conversion**: All lowercase letters automatically convert to uppercase
2. **Ignored Characters**: Unsupported characters are silently ignored (not added to card)
3. **Maximum Length**: Input automatically truncated at 80 characters
4. **Space Handling**: Spaces create blank columns and count toward the 80-character limit

#### Testing Coverage
All supported characters have corresponding test cases in:
- `src/tests/HollerithCode.test.js` - Individual character encoding tests
- `src/tests/PunchCard.test.js` - Full card text encoding tests

---

## User Experience (UX) Requirements

### UI Layout

```
┌────────────────────────────────────────────────────────┐
│  Deck Editor - IBM 1130                        [?][−][×]│
├────────────────────────────────────────────────────────┤
│  File: my_program.deck    Cards: 25    Modified: *     │
│  [New Deck] [Load] [Save] [Add Card] [Delete Card]     │
├────────────────────────────────────────────────────────┤
│  Card: 12 of 25                                         │
│  [|◀] [◀] [12 ▼] [▶] [▶|]                             │
├────────────────────────────────────────────────────────┤
│                                                         │
│           ┌───────────────────────────────┐            │
│           │   [Punch Card SVG Display]     │            │
│           │                                │            │
│           │   (80-column card with         │            │
│           │    Hollerith punch patterns)   │            │
│           │                                │            │
│           └───────────────────────────────┘            │
│                                                         │
│  Text Input:                                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ HELLO WORLD_                                      │  │
│  └──────────────────────────────────────────────────┘  │
│  [Clear Card]                                           │
├────────────────────────────────────────────────────────┤
│  Status: Ready | Autosave: On                          │
└────────────────────────────────────────────────────────┘
```

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - New deck
- `Ctrl/Cmd + O` - Open deck
- `Ctrl/Cmd + S` - Save deck
- `Ctrl/Cmd + Shift + S` - Save as
- `Ctrl/Cmd + D` - Delete current card
- `Ctrl/Cmd + Enter` - Add new card
- `←` / `→` - Previous/Next card
- `Home` / `End` - First/Last card
- `Ctrl/Cmd + K` - Clear current card

---

## Testing Requirements

### Test-Driven Development (TDD) Approach

**Red Phase**: Write failing test
- Define expected behavior
- Write test that validates behavior
- Run test → RED (fails)

**Green Phase**: Make test pass
- Implement minimal code to pass test
- Run test → GREEN (passes)
- No refactoring yet

**Refactor Phase**: Improve code
- Clean up implementation
- Maintain test passing
- Improve readability, performance

### Test Coverage Goals

**Unit Tests** (Jest):
- PunchCard class: 95%+ coverage
- Hollerith encoding: 100% coverage
- Deck operations: 95%+ coverage
- File I/O: 90%+ coverage

**Integration Tests** (React Testing Library):
- Component interactions: All critical paths
- State management: All context operations
- File upload/download: Happy + error paths

**E2E Tests** (Playwright):
- Create new deck workflow
- Load deck workflow
- Edit cards workflow
- Save deck workflow
- Navigation workflow
- Error handling scenarios

### Testing Strategy

1. **Write test first** (Red)
2. **Implement feature** (Green)
3. **Verify with MCP/Playwright** (UI validation)
4. **Refactor** (maintain Green)
5. **Document** (update status.md)

---

## Success Criteria

### MVP Launch Criteria
- [ ] All P0 requirements implemented and tested
- [ ] 90%+ test coverage achieved
- [ ] Zero critical bugs
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Deployed to GitHub Pages
- [ ] Positive feedback from 3+ beta testers

### User Acceptance Testing (UAT)
- [ ] Can create 10-card deck in < 5 minutes
- [ ] Can load/save without errors
- [ ] Can navigate cards intuitively
- [ ] Can edit cards with real-time feedback
- [ ] UI is clear and self-explanatory

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser File API compatibility issues | High | Low | Feature detection + graceful degradation |
| Binary file corruption | High | Medium | Extensive I/O testing + validation |
| Performance issues with large decks | Medium | Medium | Lazy loading + virtualization |
| React state management complexity | Medium | Low | Simple Context API + clear separation |
| User confusion with 108-byte format | Low | Medium | Clear documentation + help tooltips |

---

## Dependencies

### External Dependencies
- React (via npm or CDN)
- Webpack/Vite (build tool)
- Jest (testing framework)
- Playwright (E2E testing via MCP)

### Internal Dependencies
- Hollerith encoding logic (port from punch-card Rust code)
- SVG card rendering (adapt from punch-card Yew components)

---

## Timeline (Estimated)

### Week 1: Setup & Core Data Models
- [ ] Project setup (Webpack/Vite, React, Jest)
- [ ] PunchCard class (TDD)
- [ ] Hollerith encoding (TDD)
- [ ] Deck class (TDD)
- [ ] Binary I/O (TDD)

### Week 2: UI Components
- [ ] CardViewer component (SVG rendering)
- [ ] CardEditor component (text input)
- [ ] CardNavigator component
- [ ] DeckManager component
- [ ] App layout and styling

### Week 3: File Operations & Testing
- [ ] File load/save implementation
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Bug fixes and refinement

### Week 4: Polish & Deploy
- [ ] Documentation completion
- [ ] Performance optimization
- [ ] UAT and feedback incorporation
- [ ] Deployment to GitHub Pages

---

## Open Questions

1. **Q**: Should we support 80-byte EBCDIC format for backwards compatibility?
   **A**: TBD - Document both formats, prioritize 108-byte for MVP

2. **Q**: Should we include undo/redo functionality in MVP?
   **A**: Nice to have, defer to Phase 2

3. **Q**: What should happen when deleting the last card in a deck?
   **A**: Prevent deletion, always keep minimum 1 card

4. **Q**: Should we auto-save to localStorage or only on explicit save?
   **A**: Both - localStorage auto-save + explicit file save

5. **Q**: Should card navigation wrap around (last → first)?
   **A**: No, stop at boundaries (better UX for beginners)

---

## Glossary

- **Deck**: A collection of punch cards (1-1000 cards)
- **Card**: A single 80-column IBM punch card
- **Column**: One of 80 vertical positions on a card
- **Hollerith Code**: The punch pattern encoding (rows 0-9, 11, 12)
- **Binary Format**: IBM 1130 108-byte per card format
- **EBCDIC**: Extended Binary Coded Decimal Interchange Code
- **MVP**: Minimum Viable Product
- **TDD**: Test-Driven Development
- **E2E**: End-to-End (testing)

---

## Appendix

### Related Documents
- [architecture.md](./architecture.md) - System architecture
- [design.md](./design.md) - UI/UX design specifications
- [plan.md](./plan.md) - Implementation plan and milestones
- [process.md](./process.md) - TDD process and workflow
- [status.md](./status.md) - Current implementation status

### References
- [IBM 1130 Binary Format](https://dialectrix.com/G4G/ZebraStripeCard.html)
- [Hollerith Encoding](https://homepage.divms.uiowa.edu/~jones/cards/codes.html)
- [Punch-Card Repository](https://github.com/wrightmikea/punch-card)

---

**Document Status**: Draft
**Last Review**: 2025-10-30
**Next Review**: TBD
