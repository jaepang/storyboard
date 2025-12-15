import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library 자동 cleanup
afterEach(() => {
  cleanup();
});
