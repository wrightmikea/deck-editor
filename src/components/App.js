import React, { useState } from 'react';
import Deck from '../utils/Deck';
import PunchCard from '../utils/PunchCard';

function App() {
  const [deck, setDeck] = useState(new Deck());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const showStatus = (message, isError = false) => {
    setStatusMessage({ message, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleNewDeck = () => {
    if (window.confirm('Create new deck? Current deck will be lost.')) {
      setDeck(new Deck());
      setCurrentCardIndex(0);
      setInputText('');
      showStatus('New deck created');
    }
  };

  const handleLoadDeck = async (event) => {
    console.log('handleLoadDeck triggered', event);
    const file = event.target.files[0];
    console.log('Selected file:', file);

    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      console.log('Reading file:', file.name, 'size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);

      const loadedDeck = Deck.fromBinary(arrayBuffer, file.name.replace(/\.deck$/, ''));
      console.log('Deck loaded:', loadedDeck.cards.length, 'cards');

      setDeck(loadedDeck);
      setCurrentCardIndex(0);
      setInputText(loadedDeck.getCard(0).toText().trimEnd());
      showStatus(`Loaded: ${file.name}`);
    } catch (error) {
      console.error('Error loading deck:', error);
      showStatus(`Error loading deck: ${error.message}`, true);
    }

    event.target.value = '';
  };

  const handleSaveDeck = () => {
    try {
      const binary = deck.toBinary();
      const blob = new Blob([binary], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
      const filename = `deck-${timestamp[0]}-${timestamp[1].substring(0, 6)}.deck`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatus(`Saved: ${filename}`);
    } catch (error) {
      showStatus(`Error saving deck: ${error.message}`, true);
    }
  };

  const handleAddCard = () => {
    const newDeck = new Deck(deck.name);
    newDeck.cards = [...deck.cards];
    newDeck.addCard();
    setDeck(newDeck);
    const newIndex = newDeck.cards.length - 1;
    setCurrentCardIndex(newIndex);
    setInputText(''); // Clear input for new card
    showStatus('Card added');
  };

  const handleDeleteCard = () => {
    if (deck.cards.length <= 1) {
      showStatus('Cannot delete last card', true);
      return;
    }

    try {
      const newDeck = new Deck(deck.name);
      newDeck.cards = [...deck.cards];
      newDeck.removeCard(currentCardIndex);
      setDeck(newDeck);
      setCurrentCardIndex(Math.min(currentCardIndex, newDeck.cards.length - 1));
      showStatus('Card deleted');
    } catch (error) {
      showStatus(`Error: ${error.message}`, true);
    }
  };

  const handleUpdateCard = (text) => {
    setInputText(text);

    const newDeck = new Deck(deck.name);
    newDeck.cards = [...deck.cards];
    newDeck.updateCard(currentCardIndex, text);

    setDeck(newDeck);
  };

  const handleClearCard = () => {
    handleUpdateCard('');
    showStatus('Card cleared');
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < deck.cards.length) {
      setCurrentCardIndex(newIndex);
      setInputText(deck.getCard(newIndex).toText().trimEnd());
    }
  };

  const currentCard = deck.getCard(currentCardIndex);

  return (
    <div className="app">
      <header className="header">
        <h1>IBM 1130 Deck Editor</h1>
      </header>

      <main>
        {/* Deck Manager */}
        <div className="deck-manager">
          <div className="deck-info">
            <span className="deck-name">{deck.name}</span>
            <span className="card-count">{deck.cards.length} cards</span>
          </div>
          <div className="deck-controls">
            <button onClick={handleNewDeck}>New Deck</button>
            <label htmlFor="deck-file-input" className="file-button">
              Load
              <input
                id="deck-file-input"
                type="file"
                accept=".deck,.bin"
                onChange={handleLoadDeck}
                onClick={(e) => console.log('File input clicked')}
              />
            </label>
            <button onClick={handleSaveDeck}>Save</button>
            <button onClick={handleAddCard}>Add Card</button>
            <button onClick={handleDeleteCard} disabled={deck.cards.length <= 1}>
              Delete Card
            </button>
          </div>
        </div>

        {/* Card Navigator */}
        <div className="card-navigator">
          <div className="card-position">
            Card {currentCardIndex + 1} of {deck.cards.length}
          </div>
          <div className="nav-controls">
            <button
              onClick={() => handleNavigate(0)}
              disabled={currentCardIndex === 0}
              title="First card"
            >
              |&lt;
            </button>
            <button
              onClick={() => handleNavigate(currentCardIndex - 1)}
              disabled={currentCardIndex === 0}
              title="Previous card"
            >
              &lt;
            </button>
            <select
              value={currentCardIndex}
              onChange={(e) => handleNavigate(Number(e.target.value))}
            >
              {deck.cards.map((_, i) => (
                <option key={i} value={i}>
                  Card {i + 1}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleNavigate(currentCardIndex + 1)}
              disabled={currentCardIndex === deck.cards.length - 1}
              title="Next card"
            >
              &gt;
            </button>
            <button
              onClick={() => handleNavigate(deck.cards.length - 1)}
              disabled={currentCardIndex === deck.cards.length - 1}
              title="Last card"
            >
              &gt;|
            </button>
          </div>
        </div>

        {/* Card Display */}
        <div className="card-display">
          {/* Card Viewer (SVG) */}
          <CardViewer card={currentCard} />

          {/* Card Editor */}
          <div className="card-editor">
            <label htmlFor="card-text">Card Text (max 80 chars):</label>
            <input
              id="card-text"
              type="text"
              className="text-input"
              value={inputText}
              onChange={(e) => handleUpdateCard(e.target.value.toUpperCase().slice(0, 80))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Enter advances to next card, or adds new card if at end
                  if (currentCardIndex === deck.cards.length - 1) {
                    handleAddCard();
                  } else {
                    handleNavigate(currentCardIndex + 1);
                  }
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  if (e.shiftKey) {
                    // Shift+Tab goes to previous card
                    handleNavigate(currentCardIndex - 1);
                  } else {
                    // Tab goes to next card, or adds new card if at end
                    if (currentCardIndex === deck.cards.length - 1) {
                      handleAddCard();
                    } else {
                      handleNavigate(currentCardIndex + 1);
                    }
                  }
                }
              }}
              maxLength={80}
              placeholder="Type to punch card..."
            />
            <div className="editor-controls">
              <span className="char-count">{inputText.length} / 80</span>
              <button onClick={handleClearCard}>Clear Card</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          IBM 1130 Deck Editor | Built with React |{' '}
          <a href="https://github.com/wrightmikea/deck-editor" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>

      {/* Status Message */}
      {statusMessage && (
        <div className={`status-message ${statusMessage.isError ? 'error' : ''}`}>
          {statusMessage.message}
        </div>
      )}
    </div>
  );
}

// Authentic IBM punch card viewer matching reference implementation
function CardViewer({ card }) {
  // SVG dimensions - proper IBM card aspect ratio (7⅜" × 3¼")
  const CARD_WIDTH = 800;
  const CARD_HEIGHT = CARD_WIDTH / 2.269; // IBM card aspect ratio

  // Margins
  const LEFT_MARGIN = CARD_WIDTH * 0.025;
  const RIGHT_MARGIN = CARD_WIDTH * 0.025;
  const TOP_MARGIN = CARD_HEIGHT * 0.045;
  const BOTTOM_MARGIN = CARD_HEIGHT * 0.045;

  // Punch area dimensions
  const PUNCH_WIDTH_AREA = CARD_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  const PUNCH_HEIGHT_AREA = CARD_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

  const COL_WIDTH = PUNCH_WIDTH_AREA / 80;
  const ROW_HEIGHT = PUNCH_HEIGHT_AREA / 12;
  const TEXT_Y = TOP_MARGIN - 5;
  const GRID_START_Y = TOP_MARGIN;

  const PUNCH_WIDTH = COL_WIDTH * 0.6;
  const PUNCH_HEIGHT = ROW_HEIGHT * 0.7; // Rectangular (taller than wide)
  const GUIDE_WIDTH = COL_WIDTH * 0.5;
  const GUIDE_HEIGHT = ROW_HEIGHT * 0.6;

  // Row indices: [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  // Digit 0 is at row index 2, digit 1 at index 3, etc.

  return (
    <svg
      className="card-viewer"
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Card background with corner cut */}
      <polygon
        points={`${LEFT_MARGIN},0 ${CARD_WIDTH},0 ${CARD_WIDTH},${CARD_HEIGHT} 0,${CARD_HEIGHT} 0,${TOP_MARGIN}`}
        fill="#f4e8d0"
        stroke="#999"
        strokeWidth="2"
      />

      {/* Column numbers (top row, between rows 0 and 1) */}
      {Array.from({ length: 80 }, (_, col) => {
        const x = LEFT_MARGIN + col * COL_WIDTH + COL_WIDTH / 2;
        const y = GRID_START_Y + 3 * ROW_HEIGHT;
        return (
          <text
            key={`top-${col}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="6"
            fill="#555"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {col + 1}
          </text>
        );
      })}

      {/* Column numbers (bottom row, after row 9) */}
      {Array.from({ length: 80 }, (_, col) => {
        const x = LEFT_MARGIN + col * COL_WIDTH + COL_WIDTH / 2;
        const y = GRID_START_Y + 12 * ROW_HEIGHT;
        return (
          <text
            key={`bottom-${col}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="6"
            fill="#555"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {col + 1}
          </text>
        );
      })}

      {/* Printed characters */}
      {card.columns.map((column, colIndex) => {
        const char = column.printedChar || column.toChar();
        if (char && char !== ' ') {
          const x = LEFT_MARGIN + colIndex * COL_WIDTH + COL_WIDTH / 2;
          return (
            <text
              key={`char-${colIndex}`}
              x={x}
              y={TEXT_Y}
              textAnchor="middle"
              fontSize="12"
              fontFamily="'Courier New', monospace"
              fill="#000"
            >
              {char}
            </text>
          );
        }
        return null;
      })}

      {/* Guide holes (faint outlines showing all punch positions) */}
      {Array.from({ length: 80 }, (_, col) =>
        Array.from({ length: 12 }, (_, row) => {
          const x = LEFT_MARGIN + col * COL_WIDTH + COL_WIDTH / 2;
          const y = GRID_START_Y + row * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <ellipse
              key={`guide-${col}-${row}`}
              cx={x}
              cy={y}
              rx={GUIDE_WIDTH / 2}
              ry={GUIDE_HEIGHT / 2}
              fill="none"
              stroke="#ccc"
              strokeWidth="0.5"
            />
          );
        })
      )}

      {/* Pre-printed digits 0-9 in each column */}
      {Array.from({ length: 80 }, (_, col) =>
        Array.from({ length: 10 }, (_, digit) => {
          const x = LEFT_MARGIN + col * COL_WIDTH + COL_WIDTH / 2;
          const rowIndex = digit + 2; // Digit 0 at index 2, digit 1 at 3, etc.
          const y = GRID_START_Y + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + 3;
          return (
            <text
              key={`digit-${col}-${digit}`}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="10"
              fill="#bbb"
              fontFamily="'Courier New', monospace"
              fontWeight="bold"
            >
              {digit}
            </text>
          );
        })
      )}

      {/* Actual punches (rectangular, solid black) */}
      {card.columns.map((column, colIndex) => {
        const punches = column.punches.asArray();
        return punches.map((isPunched, rowIndex) => {
          if (isPunched) {
            const x = LEFT_MARGIN + colIndex * COL_WIDTH + COL_WIDTH / 2;
            const y = GRID_START_Y + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
            return (
              <rect
                key={`punch-${colIndex}-${rowIndex}`}
                x={x - PUNCH_WIDTH / 2}
                y={y - PUNCH_HEIGHT / 2}
                width={PUNCH_WIDTH}
                height={PUNCH_HEIGHT}
                fill="#000"
                rx="1"
              />
            );
          }
          return null;
        });
      })}
    </svg>
  );
}

export default App;
