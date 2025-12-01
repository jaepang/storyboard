import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// React Testing Library 자동 cleanup
afterEach(() => {
  cleanup();
});
