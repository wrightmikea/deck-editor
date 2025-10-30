/**
 * Column Class
 *
 * Represents a single column on a punch card
 * Contains punch pattern and optional printed character
 */

import HollerithCode from './HollerithCode';

class Column {
  /**
   * Create a blank column
   */
  constructor() {
    this.punches = HollerithCode.empty();
    this.printedChar = null;
  }

  /**
   * Create a column from a character (text mode)
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
   * Create a column from Hollerith code (binary mode)
   * @param {HollerithCode} code - Hollerith punch pattern
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
   * @returns {string}
   */
  toChar() {
    return this.punches.toChar();
  }

  /**
   * Check if column is blank (no punches)
   * @returns {boolean}
   */
  isBlank() {
    return this.punches.isEmpty();
  }
}

export default Column;
