/**
 * Deck Class
 *
 * Represents a deck of punch cards
 */

import PunchCard from './PunchCard';

class Deck {
  /**
   * Create a new deck
   * @param {string} name - Deck name
   */
  constructor(name = 'Untitled Deck') {
    this.name = name;
    this.cards = [new PunchCard()]; // Always start with 1 blank card
    this.metadata = {
      created: new Date(),
      modified: new Date(),
    };
  }

  /**
   * Add a card to the deck
   * @param {PunchCard} card - Card to add (optional, creates blank if not provided)
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
    if (index < 0 || index >= this.cards.length) {
      throw new Error('Card index out of range');
    }
    this.cards.splice(index, 1);
    this.metadata.modified = new Date();
  }

  /**
   * Get card at index
   * @param {number} index - Card index
   * @returns {PunchCard}
   */
  getCard(index) {
    if (index < 0 || index >= this.cards.length) {
      throw new Error('Card index out of range');
    }
    return this.cards[index];
  }

  /**
   * Update card text at index
   * @param {number} index - Card index
   * @param {string} text - New text
   */
  updateCard(index, text) {
    if (index < 0 || index >= this.cards.length) {
      throw new Error('Card index out of range');
    }
    this.cards[index] = PunchCard.fromText(text);
    this.metadata.modified = new Date();
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
   * Create deck from binary format
   * @param {Uint8Array|ArrayBuffer} data - Binary data
   * @param {string} name - Deck name
   * @returns {Deck}
   */
  static fromBinary(data, name = 'Loaded Deck') {
    const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

    if (bytes.length === 0) {
      throw new Error('Binary data is empty');
    }

    if (bytes.length % 108 !== 0) {
      throw new Error('Invalid deck file: size must be multiple of 108 bytes');
    }

    const cardCount = bytes.length / 108;
    const deck = new Deck(name);
    deck.cards = [];

    for (let i = 0; i < cardCount; i++) {
      const cardData = bytes.slice(i * 108, (i + 1) * 108);
      deck.cards.push(PunchCard.fromBinary(cardData));
    }

    return deck;
  }
}

export default Deck;
