/**
 * Configuración inicial para tests con Jest
 */
import '@testing-library/jest-dom'

// Mock de fetch global
global.fetch = jest.fn()

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor () {}

  observe () {
    return null
  }

  disconnect () {
    return null
  }

  unobserve () {
    return null
  }
}

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
