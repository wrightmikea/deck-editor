/**
 * Deck Tests (TDD - Red Phase)
 *
 * Tests for deck of punch cards
 */

import Deck from '../utils/Deck';
import PunchCard from '../utils/PunchCard';

describe('Deck', () => {
  describe('Construction', () => {
    test('should create empty deck with one blank card', () => {
      const deck = new Deck();
      expect(deck.cards).toHaveLength(1);
      expect(deck.name).toBe('Untitled Deck');
    });

    test('should create deck with custom name', () => {
      const deck = new Deck('My Deck');
      expect(deck.name).toBe('My Deck');
    });
  });

  describe('Card Management', () => {
    test('should add blank card', () => {
      const deck = new Deck();
      deck.addCard();
      expect(deck.cards).toHaveLength(2);
    });

    test('should add specific card', () => {
      const deck = new Deck();
      const card = PunchCard.fromText('HELLO');
      deck.addCard(card);
      expect(deck.cards).toHaveLength(2);
      expect(deck.getCard(1).toText()).toMatch(/^HELLO/);
    });

    test('should not allow removing last card', () => {
      const deck = new Deck();
      expect(() => deck.removeCard(0)).toThrow('Cannot delete last card');
    });

    test('should remove card', () => {
      const deck = new Deck();
      deck.addCard();
      deck.removeCard(1);
      expect(deck.cards).toHaveLength(1);
    });

    test('should get card at index', () => {
      const deck = new Deck();
      const card = deck.getCard(0);
      expect(card).toBeInstanceOf(PunchCard);
    });

    test('should update card text', () => {
      const deck = new Deck();
      deck.updateCard(0, 'HELLO');
      expect(deck.getCard(0).toText()).toMatch(/^HELLO/);
    });
  });

  describe('Binary I/O', () => {
    test('should convert deck to binary', () => {
      const deck = new Deck();
      deck.addCard(PunchCard.fromText('CARD 1'));
      deck.addCard(PunchCard.fromText('CARD 2'));

      const binary = deck.toBinary();
      expect(binary).toBeInstanceOf(Uint8Array);
      expect(binary.length).toBe(3 * 108); // 3 cards × 108 bytes
    });

    test('should create deck from binary', () => {
      const original = new Deck('Test');
      original.addCard(PunchCard.fromText('CARD 1'));
      original.addCard(PunchCard.fromText('CARD 2'));

      const binary = original.toBinary();
      const loaded = Deck.fromBinary(binary, 'Loaded Deck');

      expect(loaded.cards).toHaveLength(3);
      expect(loaded.name).toBe('Loaded Deck');
    });

    test('should roundtrip deck through binary', () => {
      const original = new Deck('Test');
      original.addCard(PunchCard.fromText('HELLO'));
      original.addCard(PunchCard.fromText('WORLD'));

      const binary = original.toBinary();
      const loaded = Deck.fromBinary(binary, 'Test');

      expect(loaded.cards).toHaveLength(original.cards.length);

      for (let i = 0; i < loaded.cards.length; i++) {
        const origText = original.getCard(i).toText().substring(0, 72);
        const loadText = loaded.getCard(i).toText().substring(0, 72);
        expect(loadText).toBe(origText);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty binary data', () => {
      const empty = new Uint8Array(0);
      expect(() => Deck.fromBinary(empty)).toThrow();
    });

    test('should handle invalid binary size', () => {
      const invalid = new Uint8Array(100);
      expect(() => Deck.fromBinary(invalid)).toThrow();
    });

    test('should throw error for invalid card index', () => {
      const deck = new Deck();
      expect(() => deck.getCard(5)).toThrow();
    });
  });
});
