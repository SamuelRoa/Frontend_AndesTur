import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.lastChildren = null
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (error?.message?.includes('removeChild') || error?.name === 'NotFoundError') {
      this.lastChildren = this.props.children
      setTimeout(() => this.setState({ hasError: false }), 0)
      return
    }
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError && this.lastChildren) {
      return this.lastChildren
    }
    if (this.state.hasError) {
      return this.props.fallback || null
    }
    this.lastChildren = this.props.children
    return this.props.children
  }
}
