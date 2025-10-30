/**
 * PunchCard Class
 *
 * Represents a complete 80-column IBM punch card
 * Supports IBM 1130 binary format (108 bytes per card)
 */

import Column from './Column';
import HollerithCode from './HollerithCode';

class PunchCard {
  /**
   * Create a new punch card
   * @param {string} type - 'text' or 'binary'
   */
  constructor(type = 'text') {
    this.columns = Array(80).fill(null).map(() => new Column());
    this.type = type;
  }

  /**
   * Create card from text string
   * @param {string} text - Up to 80 characters
   * @returns {PunchCard}
   */
  static fromText(text) {
    console.log('[DEBUG] PunchCard.fromText called with:', JSON.stringify(text));
    const card = new PunchCard('text');
    const chars = text.slice(0, 80);
    console.log('[DEBUG] Processing', chars.length, 'characters');

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      card.columns[i] = Column.fromChar(char);
      const isEmpty = card.columns[i].punches.isEmpty();
      console.log(`[DEBUG] Column ${i}: char='${char}' (code ${char.charCodeAt(0)}) isEmpty=${isEmpty}`);
    }

    return card;
  }

  /**
   * Create card from IBM 1130 binary format (108 bytes)
   * Format: 72 columns × 12 rows = 864 bits = 108 bytes
   * Columns 73-80 are not stored (left blank)
   *
   * @param {Uint8Array} data - 108-byte binary data
   * @returns {PunchCard}
   */
  static fromBinary(data) {
    if (data.length !== 108) {
      throw new Error('Binary data must be exactly 108 bytes');
    }

    const card = new PunchCard('binary');

    // Unpack 108 bytes into 864 bits (72 columns × 12 rows)
    let bitIndex = 0;
    for (let col = 0; col < 72; col++) {
      const rows = [];

      // Read 12 bits for this column
      for (let row = 0; row < 12; row++) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitInByte = bitIndex % 8;

        if ((data[byteIndex] & (1 << bitInByte)) !== 0) {
          // Convert bit position to row number
          // Row order: 12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
          const rowNumbers = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
          rows.push(rowNumbers[row]);
        }

        bitIndex++;
      }

      card.columns[col] = Column.fromHollerith(new HollerithCode(rows));
    }

    // Columns 73-80 remain blank
    return card;
  }

  /**
   * Convert card to IBM 1130 binary format (108 bytes)
   * Saves only columns 1-72 (72 columns × 12 rows = 864 bits = 108 bytes)
   * Columns 73-80 are not saved
   *
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

    // Convert bits to bytes (8 bits per byte)
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
    return this.columns.map(col => col.toChar()).join('');
  }

  /**
   * Get column at index
   * @param {number} index - Column index (0-79)
   * @returns {Column}
   */
  getColumn(index) {
    if (index < 0 || index >= 80) {
      throw new Error('Column index out of range (0-79)');
    }
    return this.columns[index];
  }

  /**
   * Set column from character
   * @param {number} index - Column index (0-79)
   * @param {string} char - Character to punch
   */
  setColumn(index, char) {
    if (index < 0 || index >= 80) {
      throw new Error('Column index out of range (0-79)');
    }
    this.columns[index] = Column.fromChar(char);
  }

  /**
   * Clear column (make blank)
   * @param {number} index - Column index (0-79)
   */
  clearColumn(index) {
    if (index < 0 || index >= 80) {
      throw new Error('Column index out of range (0-79)');
    }
    this.columns[index] = new Column();
  }

  /**
   * Clear entire card
   */
  clear() {
    this.columns = Array(80).fill(null).map(() => new Column());
  }
}

export default PunchCard;
