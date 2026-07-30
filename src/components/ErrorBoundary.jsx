import { Component } from 'react'
import log from '../lib/logger'

/**
 * Global error boundary that catches React rendering errors
 * and displays a recovery UI with error details.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    log.error('Component Error:', error.message, errorInfo.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 app-container">
          <div
            className="p-8 text-center max-w-sm rounded-xl"
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-secondary)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--danger)', color: 'white' }}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="text-xs cursor-pointer mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Error details
                </summary>
                <pre className="text-[10px] rounded-lg p-3 overflow-auto max-h-40" style={{ background: 'var(--surface-primary)', color: 'var(--danger)' }}>
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="surface-btn surface-btn-secondary"
              >
                Try again
              </button>
              <button
                onClick={this.handleReload}
                className="surface-btn surface-btn-primary"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
