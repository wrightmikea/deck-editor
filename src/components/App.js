import React, { useState } from 'react';
import Deck from '../utils/Deck';
import PunchCard from '../utils/PunchCard';

function App() {
  const [deck, setDeck] = useState(new Deck());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const showStatus = (message, isError = false) => {
    setStatusMessage({ message, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleNewDeck = () => {
    if (window.confirm('Create new deck? Current deck will be lost.')) {
      setDeck(new Deck());
      setCurrentCardIndex(0);
      showStatus('New deck created');
    }
  };

  const handleLoadDeck = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadedDeck = Deck.fromBinary(arrayBuffer, file.name.replace(/\.deck$/, ''));
      setDeck(loadedDeck);
      setCurrentCardIndex(0);
      showStatus(`Loaded: ${file.name}`);
    } catch (error) {
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
    setCurrentCardIndex(newDeck.cards.length - 1);
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
    }
  };

  const currentCard = deck.getCard(currentCardIndex);
  const cardText = currentCard.toText();

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
            <label className="file-button">
              <button as="span">Load</button>
              <input type="file" accept=".deck,.bin" onChange={handleLoadDeck} />
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
              value={cardText}
              onChange={(e) => handleUpdateCard(e.target.value.toUpperCase().slice(0, 80))}
              maxLength={80}
              placeholder="Type to punch card..."
            />
            <div className="editor-controls">
              <span className="char-count">{cardText.trim().length} / 80</span>
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

// Simple CardViewer component
function CardViewer({ card }) {
  const CARD_WIDTH = 1000;
  const CARD_HEIGHT = 300;
  const COLUMN_WIDTH = CARD_WIDTH / 80;
  const ROW_HEIGHT = CARD_HEIGHT / 14;

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
    const punches = column.punches.asArray();
    const printedChar = column.printedChar || column.toChar();

    return (
      <g key={colIndex}>
        {/* Print character at top */}
        {printedChar && printedChar !== ' ' && (
          <text
            x={colIndex * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y={12}
            fontSize="10"
            textAnchor="middle"
            fill="#000"
          >
            {printedChar}
          </text>
        )}

        {/* Punch holes */}
        {punches.map((isPunched, rowIndex) =>
          isPunched ? renderPunchHole(colIndex, rowIndex) : null
        )}
      </g>
    );
  };

  return (
    <svg
      className="card-viewer"
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {card.columns.map((column, i) => renderColumn(column, i))}
    </svg>
  );
}

export default App;
