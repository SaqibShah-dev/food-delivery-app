import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main
          role="alert"
          className="flex min-h-screen items-center justify-center bg-slate-100 p-6"
        >
          <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              An unexpected error interrupted the application. Please try reloading
              or return to the home page.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Reload page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Return home
              </button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
