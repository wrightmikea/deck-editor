// Jest setup file
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock File and Blob APIs if needed
global.File = class File {
  constructor(parts, name, options) {
    this.parts = parts;
    this.name = name;
    this.options = options;
  }
};

global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
};
