/**
 * E2E Test: Deck Loading
 *
 * Tests the complete deck loading workflow using Playwright
 */

describe('Deck Loading E2E', () => {
  test('should load a deck file and display its contents', async () => {
    const fs = require('fs');
    const path = require('path');

    // Read the sample deck file
    const deckPath = path.join(__dirname, 'data', 'sample.deck');
    const deckData = fs.readFileSync(deckPath);

    expect(deckData.length).toBe(648); // 6 cards × 108 bytes

    // Load the deck using Deck.fromBinary
    const Deck = require('../utils/Deck').default;
    const loadedDeck = Deck.fromBinary(deckData, 'Sample Program');

    // Verify the deck loaded correctly
    expect(loadedDeck.cards.length).toBe(6);
    expect(loadedDeck.name).toBe('Sample Program');

    // Verify first card content
    const firstCard = loadedDeck.getCard(0);
    const firstCardText = firstCard.toText();
    expect(firstCardText.length).toBe(80);

    // Verify we can read all cards
    for (let i = 0; i < loadedDeck.cards.length; i++) {
      const card = loadedDeck.getCard(i);
      const text = card.toText();
      expect(text.length).toBe(80);
    }
  });

  test('should roundtrip save and load a deck', async () => {
    const Deck = require('../utils/Deck').default;
    const PunchCard = require('../utils/PunchCard').default;

    // Create a test deck
    const originalDeck = new Deck('Test Deck');
    originalDeck.addCard(PunchCard.fromText('CARD ONE'));
    originalDeck.addCard(PunchCard.fromText('CARD TWO'));
    originalDeck.addCard(PunchCard.fromText('CARD THREE'));

    // Save to binary
    const binary = originalDeck.toBinary();
    expect(binary.length).toBe(432); // 4 cards × 108 bytes (includes initial blank)

    // Load from binary
    const loadedDeck = Deck.fromBinary(binary, 'Loaded Deck');

    // Verify deck loaded correctly
    expect(loadedDeck.cards.length).toBe(4);

    // Verify card contents match (compare first 72 chars, columns 73-80 not stored)
    for (let i = 0; i < loadedDeck.cards.length; i++) {
      const origText = originalDeck.getCard(i).toText().substring(0, 72);
      const loadText = loadedDeck.getCard(i).toText().substring(0, 72);
      expect(loadText).toBe(origText);
    }
  });

  test('should handle loading empty deck file', () => {
    const Deck = require('../utils/Deck').default;
    const emptyData = new Uint8Array(0);

    expect(() => {
      Deck.fromBinary(emptyData, 'Empty');
    }).toThrow();
  });

  test('should handle loading deck with invalid size', () => {
    const Deck = require('../utils/Deck').default;
    const invalidData = new Uint8Array(100); // Not a multiple of 108

    expect(() => {
      Deck.fromBinary(invalidData, 'Invalid');
    }).toThrow();
  });
});
