/**
 * HollerithCode Class
 *
 * Represents IBM Hollerith punch code for a single column
 * 12 rows: [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * Array indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
 */

// Hollerith encoding table (IBM 029 character set)
const HOLLERITH_ENCODING = {
  // Space
  ' ': [],

  // Digits (single punches)
  '0': [0],
  '1': [1],
  '2': [2],
  '3': [3],
  '4': [4],
  '5': [5],
  '6': [6],
  '7': [7],
  '8': [8],
  '9': [9],

  // Letters A-I (12-zone + digit)
  'A': [12, 1],
  'B': [12, 2],
  'C': [12, 3],
  'D': [12, 4],
  'E': [12, 5],
  'F': [12, 6],
  'G': [12, 7],
  'H': [12, 8],
  'I': [12, 9],

  // Letters J-R (11-zone + digit)
  'J': [11, 1],
  'K': [11, 2],
  'L': [11, 3],
  'M': [11, 4],
  'N': [11, 5],
  'O': [11, 6],
  'P': [11, 7],
  'Q': [11, 8],
  'R': [11, 9],

  // Letters S-Z (0-zone + digit)
  'S': [0, 2],
  'T': [0, 3],
  'U': [0, 4],
  'V': [0, 5],
  'W': [0, 6],
  'X': [0, 7],
  'Y': [0, 8],
  'Z': [0, 9],

  // Special characters
  '&': [12],
  '-': [11],
  '/': [0, 1],
  '.': [12, 3, 8],
  ',': [0, 3, 8],
  '(': [12, 5, 8],
  ')': [11, 5, 8],
  '+': [12, 6, 8],
  '*': [11, 4, 8],
  '$': [11, 3, 8],
  '=': [3, 8],
  '<': [12, 4, 8],
  '>': [0, 6, 8],
  '%': [0, 4, 8],
  '@': [4, 8],
  '#': [3, 8],
  '!': [12, 2, 8],
  ':': [2, 8],
  ';': [11, 6, 8],
  '?': [0, 7, 8],
  '"': [7, 8],
  '\'': [5, 8],
  '_': [11, 7, 8],
  '|': [12, 7, 8],
};

// Row number to array index mapping
// Row 12 -> index 0, Row 11 -> index 1, Row 0 -> index 2, Rows 1-9 -> indices 3-11
const ROW_TO_INDEX = {
  12: 0,
  11: 1,
  0: 2,
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 9,
  8: 10,
  9: 11,
};

// Index to row number (inverse mapping)
const INDEX_TO_ROW = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

class HollerithCode {
  /**
   * Create a HollerithCode from row numbers
   * @param {number[]} rows - Array of row numbers (e.g., [12, 1] for 'A')
   */
  constructor(rows = []) {
    this.punches = new Array(12).fill(false);

    // Convert row numbers to boolean array
    for (const row of rows) {
      const index = ROW_TO_INDEX[row];
      if (index !== undefined) {
        this.punches[index] = true;
      }
    }
  }

  /**
   * Create a HollerithCode from a character
   * @param {string} char - Single character
   * @returns {HollerithCode}
   */
  static fromChar(char) {
    if (!char || char.length === 0) {
      return HollerithCode.empty();
    }

    const upperChar = char[0].toUpperCase();
    const rows = HOLLERITH_ENCODING[upperChar];

    if (!rows) {
      // Unsupported character - return empty (space)
      return HollerithCode.empty();
    }

    return new HollerithCode(rows);
  }

  /**
   * Convert this HollerithCode to a character
   * @returns {string}
   */
  toChar() {
    if (this.isEmpty()) {
      return ' ';
    }

    // Get the row numbers that are punched
    const rows = [];
    for (let i = 0; i < 12; i++) {
      if (this.punches[i]) {
        rows.push(INDEX_TO_ROW[i]);
      }
    }

    // Find matching character in encoding table
    for (const [char, encoding] of Object.entries(HOLLERITH_ENCODING)) {
      if (encoding.length === rows.length &&
          encoding.every(row => rows.includes(row))) {
        return char;
      }
    }

    // No match found - return space
    return ' ';
  }

  /**
   * Get punch pattern as boolean array
   * Array indices: [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   * @returns {boolean[]}
   */
  asArray() {
    return [...this.punches];
  }

  /**
   * Check if this code is empty (no punches)
   * @returns {boolean}
   */
  isEmpty() {
    return this.punches.every(p => !p);
  }

  /**
   * Create an empty HollerithCode (space)
   * @returns {HollerithCode}
   */
  static empty() {
    return new HollerithCode([]);
  }
}

export default HollerithCode;
