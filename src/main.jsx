import { StrictMode, useState, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { creerQueryClient } from './services/queryClient'

function afficherErreur(erreur) {
  const root = document.getElementById('root')
  if (!root || root.dataset.debugErreur) return
  root.dataset.debugErreur = '1'
  const pre = document.createElement('pre')
  pre.style.cssText = 'white-space:pre-wrap;padding:16;margin:0;color:#b91c1c;background:#fff;font:12px/1.5 monospace;min-height:100vh'
  pre.textContent = erreur?.stack || erreur?.message || String(erreur)
  document.body.style.margin = '0'
  root.innerHTML = ''
  root.appendChild(pre)
}

window.addEventListener('error', (e) => afficherErreur(e.error || e.message))
window.addEventListener('unhandledrejection', (e) => afficherErreur(e.reason))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error(error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ whiteSpace: 'pre-wrap', padding: 16, margin: 0, color: '#b91c1c', background: '#fff', font: '12px/1.5 monospace', minHeight: '100vh' }}>
          {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
        </pre>
      )
    }
    return this.props.children
  }
}

function Root() {
  const [queryClient] = useState(creerQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
)
