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
          <div className="glass-card p-10 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)' }}>
              ⚠️
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-2">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-[var(--text-secondary)] cursor-pointer mb-2">
                  Error details
                </summary>
                <pre className="text-[10px] text-red-400 bg-black/20 rounded-xl p-3 overflow-auto max-h-40">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="glass-btn text-sm"
                style={{ color: 'var(--accent)' }}
              >
                Try again
              </button>
              <button
                onClick={this.handleReload}
                className="glass-btn-primary text-sm"
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
