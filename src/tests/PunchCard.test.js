/**
 * PunchCard Tests (TDD - Red Phase)
 *
 * Tests for 80-column punch card with IBM 1130 binary I/O
 */

import PunchCard from '../utils/PunchCard';

describe('PunchCard', () => {
  describe('Construction', () => {
    test('should create blank card with 80 columns', () => {
      const card = new PunchCard();
      expect(card.columns).toHaveLength(80);
      expect(card.type).toBe('text');
    });

    test('should create from text', () => {
      const card = PunchCard.fromText('HELLO');
      expect(card.getColumn(0).toChar()).toBe('H');
      expect(card.getColumn(4).toChar()).toBe('O');
    });

    test('should handle text longer than 80 chars', () => {
      const longText = 'A'.repeat(100);
      const card = PunchCard.fromText(longText);
      expect(card.toText().trim().length).toBeLessThanOrEqual(80);
    });
  });

  describe('Text Conversion', () => {
    test('should convert to text string', () => {
      const card = PunchCard.fromText('HELLO WORLD');
      const text = card.toText();
      expect(text).toMatch(/^HELLO WORLD/);
    });

    test('should handle empty card', () => {
      const card = new PunchCard();
      expect(card.toText().trim()).toBe('');
    });
  });

  describe('Column Operations', () => {
    test('should get column at index', () => {
      const card = PunchCard.fromText('TEST');
      const col = card.getColumn(0);
      expect(col.toChar()).toBe('T');
    });

    test('should set column from character', () => {
      const card = new PunchCard();
      card.setColumn(0, 'A');
      expect(card.getColumn(0).toChar()).toBe('A');
    });

    test('should clear column', () => {
      const card = PunchCard.fromText('TEST');
      card.clearColumn(0);
      expect(card.getColumn(0).isBlank()).toBe(true);
    });

    test('should clear entire card', () => {
      const card = PunchCard.fromText('TEST');
      card.clear();
      expect(card.toText().trim()).toBe('');
    });
  });

  describe('Binary I/O - IBM 1130 Format', () => {
    test('should convert to binary (108 bytes)', () => {
      const card = PunchCard.fromText('HELLO');
      const binary = card.toBinary();
      expect(binary).toBeInstanceOf(Uint8Array);
      expect(binary.length).toBe(108);
    });

    test('should create from binary data', () => {
      const data = new Uint8Array(108);
      const card = PunchCard.fromBinary(data);
      expect(card.type).toBe('binary');
      expect(card.columns).toHaveLength(80);
    });

    test('should roundtrip binary conversion', () => {
      const original = PunchCard.fromText('HELLO WORLD 1234567890');
      const binary = original.toBinary();
      const restored = PunchCard.fromBinary(binary);

      // Compare first 72 columns (columns 73-80 not saved in binary format)
      for (let i = 0; i < 72; i++) {
        const origChar = original.getColumn(i).toChar();
        const restChar = restored.getColumn(i).toChar();
        expect(restChar).toBe(origChar);
      }
    });

    test('should handle columns 73-80 as blank in binary format', () => {
      const card = PunchCard.fromText('A'.repeat(80));
      const binary = card.toBinary();
      const restored = PunchCard.fromBinary(binary);

      // Columns 73-80 should be blank
      for (let i = 72; i < 80; i++) {
        expect(restored.getColumn(i).isBlank()).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const card = PunchCard.fromText('');
      expect(card.columns).toHaveLength(80);
      expect(card.toText().trim()).toBe('');
    });

    test('should throw error for invalid column index', () => {
      const card = new PunchCard();
      expect(() => card.getColumn(80)).toThrow();
      expect(() => card.getColumn(-1)).toThrow();
    });
  });
});
