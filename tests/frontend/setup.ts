import "@testing-library/jest-dom";
import { vi } from "vitest";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

const windowObject = dom.window as unknown as Window & typeof globalThis;

Object.assign(globalThis, {
  window: windowObject,
  document: windowObject.document,
  HTMLElement: windowObject.HTMLElement,
  MutationObserver: windowObject.MutationObserver,
  self: windowObject,
});

Object.defineProperty(globalThis, "navigator", {
  value: windowObject.navigator,
  configurable: true,
});

Object.assign(global, {
  window: windowObject,
  document: windowObject.document,
});

Object.defineProperty(global, "navigator", {
  value: windowObject.navigator,
  configurable: true,
});

const matchMediaMock = (query: string): MediaQueryList => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const list: MediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_event, listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_event, listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: (event: MediaQueryListEvent) => {
      listeners.forEach((listener) => listener(event));
      return true;
    },
  };

  return list;
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(matchMediaMock),
});

