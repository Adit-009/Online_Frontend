import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if the error is related to chunk loading (deployment change)
    const isChunkError = /Loading chunk|ChunkLoadError|loading chunk/i.test(error.message || '');
    return { hasError: true, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a chunk error, it likely means a new deployment happened 
    // and the old JS chunks are gone. Refreshing will load the new app version.
    if (this.state.isChunkError) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a chunk error, show a quick reloading message instead of a crash
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8 bg-card border border-border rounded-3xl shadow-2xl">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-foreground mb-2">Updating to latest version...</h2>
              <p className="text-muted-foreground text-sm">Please wait a moment while we refresh the app.</p>
            </div>
          </div>
        );
      }

      // Standard error fallback
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#EF4444] mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. You may try refreshing the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
