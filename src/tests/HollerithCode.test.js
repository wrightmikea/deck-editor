/**
 * HollerithCode Tests (TDD - Red Phase)
 *
 * Tests for Hollerith punch code encoding/decoding
 * IBM 029 character set with 12 rows: [12, 11, 0-9]
 */

import HollerithCode from '../utils/HollerithCode';

describe('HollerithCode', () => {
  describe('Construction', () => {
    test('should create empty code', () => {
      const code = HollerithCode.empty();
      expect(code.isEmpty()).toBe(true);
      expect(code.asArray()).toHaveLength(12);
    });

    test('should create code with specific rows', () => {
      const code = new HollerithCode([12, 1]);
      expect(code.isEmpty()).toBe(false);
      const array = code.asArray();
      expect(array[0]).toBe(true);  // Row 12 (index 0)
      expect(array[1]).toBe(false); // Row 11 (index 1)
      expect(array[2]).toBe(false); // Row 0 (index 2)
      expect(array[3]).toBe(true);  // Row 1 (index 3)
    });
  });

  describe('Character Encoding - Letters', () => {
    test('should encode character A (rows 12, 1)', () => {
      const code = HollerithCode.fromChar('A');
      const array = code.asArray();
      expect(array[0]).toBe(true);  // Row 12
      expect(array[3]).toBe(true);  // Row 1
      expect(code.isEmpty()).toBe(false);
    });

    test('should encode character B (rows 12, 2)', () => {
      const code = HollerithCode.fromChar('B');
      const array = code.asArray();
      expect(array[0]).toBe(true);  // Row 12
      expect(array[4]).toBe(true);  // Row 2
    });

    test('should encode character Z (rows 0, 9)', () => {
      const code = HollerithCode.fromChar('Z');
      const array = code.asArray();
      expect(array[2]).toBe(true);  // Row 0
      expect(array[11]).toBe(true); // Row 9
    });

    test('should handle lowercase letters', () => {
      const codeA = HollerithCode.fromChar('a');
      const codeUpperA = HollerithCode.fromChar('A');
      expect(codeA.asArray()).toEqual(codeUpperA.asArray());
    });

    test('should encode all letters A-I (12-zone)', () => {
      const letters = 'ABCDEFGHI';
      for (let i = 0; i < letters.length; i++) {
        const code = HollerithCode.fromChar(letters[i]);
        const array = code.asArray();
        expect(array[0]).toBe(true);  // Row 12
        expect(array[3 + i]).toBe(true);  // Rows 1-9
      }
    });

    test('should encode all letters J-R (11-zone)', () => {
      const letters = 'JKLMNOPQR';
      for (let i = 0; i < letters.length; i++) {
        const code = HollerithCode.fromChar(letters[i]);
        const array = code.asArray();
        expect(array[1]).toBe(true);  // Row 11
        expect(array[3 + i]).toBe(true);  // Rows 1-9
      }
    });

    test('should encode all letters S-Z (0-zone)', () => {
      const letters = 'STUVWXYZ';
      for (let i = 0; i < letters.length; i++) {
        const code = HollerithCode.fromChar(letters[i]);
        const array = code.asArray();
        expect(array[2]).toBe(true);  // Row 0
        expect(array[4 + i]).toBe(true);  // Rows 2-9
      }
    });
  });

  describe('Character Encoding - Digits', () => {
    test('should encode digit 0 (row 0 only)', () => {
      const code = HollerithCode.fromChar('0');
      const array = code.asArray();
      expect(array[2]).toBe(true);  // Row 0
      expect(array.filter(x => x).length).toBe(1);  // Only one punch
    });

    test('should encode digits 1-9', () => {
      for (let digit = 1; digit <= 9; digit++) {
        const code = HollerithCode.fromChar(String(digit));
        const array = code.asArray();
        expect(array[2 + digit]).toBe(true);  // Row 1-9
        expect(array.filter(x => x).length).toBe(1);  // Only one punch
      }
    });
  });

  describe('Character Encoding - Special Characters', () => {
    test('should encode space (no punches)', () => {
      const code = HollerithCode.fromChar(' ');
      expect(code.isEmpty()).toBe(true);
    });

    test('should encode period (rows 12, 3, 8)', () => {
      const code = HollerithCode.fromChar('.');
      const array = code.asArray();
      expect(array[0]).toBe(true);   // Row 12
      expect(array[5]).toBe(true);   // Row 3
      expect(array[10]).toBe(true);  // Row 8
    });

    test('should encode minus/hyphen (row 11 only)', () => {
      const code = HollerithCode.fromChar('-');
      const array = code.asArray();
      expect(array[1]).toBe(true);  // Row 11
      expect(array.filter(x => x).length).toBe(1);
    });

    test('should encode slash (rows 0, 1)', () => {
      const code = HollerithCode.fromChar('/');
      const array = code.asArray();
      expect(array[2]).toBe(true);  // Row 0
      expect(array[3]).toBe(true);  // Row 1
    });
  });

  describe('Character Decoding', () => {
    test('should decode rows 12, 1 to character A', () => {
      const code = new HollerithCode([12, 1]);
      expect(code.toChar()).toBe('A');
    });

    test('should decode rows 12, 5 to character E', () => {
      const code = new HollerithCode([12, 5]);
      expect(code.toChar()).toBe('E');
    });

    test('should decode row 5 to digit 5', () => {
      const code = new HollerithCode([5]);
      expect(code.toChar()).toBe('5');
    });

    test('should decode empty to space', () => {
      const code = HollerithCode.empty();
      expect(code.toChar()).toBe(' ');
    });

    test('should roundtrip all letters A-Z', () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const letter of letters) {
        const encoded = HollerithCode.fromChar(letter);
        const decoded = encoded.toChar();
        expect(decoded).toBe(letter);
      }
    });

    test('should roundtrip all digits 0-9', () => {
      for (let digit = 0; digit <= 9; digit++) {
        const char = String(digit);
        const encoded = HollerithCode.fromChar(char);
        const decoded = encoded.toChar();
        expect(decoded).toBe(char);
      }
    });
  });

  describe('Array Representation', () => {
    test('should return 12-element boolean array', () => {
      const code = HollerithCode.fromChar('A');
      const array = code.asArray();
      expect(array).toHaveLength(12);
      expect(array.every(x => typeof x === 'boolean')).toBe(true);
    });

    test('should represent rows in order: 12, 11, 0-9', () => {
      const code = new HollerithCode([12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const array = code.asArray();
      expect(array.every(x => x === true)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle unsupported characters gracefully', () => {
      const code = HollerithCode.fromChar('~');
      // Should return empty or substitute character
      expect(code.isEmpty() || code.toChar() === ' ').toBe(true);
    });

    test('should handle empty string', () => {
      const code = HollerithCode.fromChar('');
      expect(code.isEmpty()).toBe(true);
    });

    test('should handle multi-character string (use first char)', () => {
      const code = HollerithCode.fromChar('ABC');
      const codeA = HollerithCode.fromChar('A');
      expect(code.asArray()).toEqual(codeA.asArray());
    });
  });
});
