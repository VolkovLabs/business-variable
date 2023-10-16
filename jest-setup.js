// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Mock ResizeObserver
 */
global.ResizeObserver = ResizeObserver;
