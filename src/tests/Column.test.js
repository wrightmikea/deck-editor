/**
 * Column Tests (TDD - Red Phase)
 *
 * Tests for a single column on a punch card
 */

import Column from '../utils/Column';
import HollerithCode from '../utils/HollerithCode';

describe('Column', () => {
  describe('Construction', () => {
    test('should create blank column', () => {
      const col = new Column();
      expect(col.isBlank()).toBe(true);
      expect(col.printedChar).toBeNull();
    });

    test('should create from character', () => {
      const col = Column.fromChar('A');
      expect(col.isBlank()).toBe(false);
      expect(col.printedChar).toBe('A');
      expect(col.toChar()).toBe('A');
    });

    test('should create from lowercase character', () => {
      const col = Column.fromChar('a');
      expect(col.printedChar).toBe('A');
      expect(col.toChar()).toBe('A');
    });

    test('should create from Hollerith code', () => {
      const code = HollerithCode.fromChar('B');
      const col = Column.fromHollerith(code);
      expect(col.printedChar).toBeNull();
      expect(col.toChar()).toBe('B');
    });
  });

  describe('Character Conversion', () => {
    test('should convert to character', () => {
      const col = Column.fromChar('X');
      expect(col.toChar()).toBe('X');
    });

    test('should return space for blank column', () => {
      const col = new Column();
      expect(col.toChar()).toBe(' ');
    });
  });

  describe('Blank Detection', () => {
    test('should detect blank column', () => {
      const col = new Column();
      expect(col.isBlank()).toBe(true);
    });

    test('should detect non-blank column', () => {
      const col = Column.fromChar('Z');
      expect(col.isBlank()).toBe(false);
    });
  });

  describe('Printed Character', () => {
    test('should store printed character for text mode', () => {
      const col = Column.fromChar('M');
      expect(col.printedChar).toBe('M');
    });

    test('should not have printed character for binary mode', () => {
      const code = HollerithCode.fromChar('N');
      const col = Column.fromHollerith(code);
      expect(col.printedChar).toBeNull();
    });
  });
});
