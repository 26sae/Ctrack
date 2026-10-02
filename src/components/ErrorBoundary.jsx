import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--gray100)',
          padding: '1rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>
              ⚠️
            </div>
            <h2 style={{
              margin: '0 0 0.5rem',
              color: 'var(--g800)',
              fontSize: '1.5rem',
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              margin: '0 0 1rem',
              color: 'var(--g600)',
              fontSize: '0.9rem',
            }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: '#fee2e2',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                color: '#dc2626',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Error Details:</p>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 600 }}>Component Stack:</p>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <button
              onClick={this.resetError}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--g600)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginRight: '0.5rem',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1.5px solid var(--gray300)',
                background: 'white',
                color: 'var(--g600)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
