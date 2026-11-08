import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent(): never {
  throw new Error('Test crash');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child crashes', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Test crash')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reload page' })
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
