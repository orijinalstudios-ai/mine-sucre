import React from 'react';
import Icon from './Icon';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('✦ [Sanctuary Safeguard] Caught unhandled React error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleSafeRecovery = () => {
    try {
      // Clear any problematic temporary caches while preserving core profile
      sessionStorage.clear();
      // Remove potentially corrupt memories string if corrupted
      const memoriesRaw = localStorage.getItem('mm_memories');
      if (memoriesRaw) {
        try {
          JSON.parse(memoriesRaw);
        } catch (e) {
          localStorage.removeItem('mm_memories');
        }
      }
    } catch (e) {
      // Ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-surface text-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest border border-secondary/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 parchment-texture">
            {/* Monogram Seal */}
            <div className="w-16 h-16 rounded-full border-2 border-secondary/50 mx-auto flex items-center justify-center bg-secondary-container/20 text-secondary shadow-sm">
              <span className="font-cinzel text-xl font-bold tracking-widest">✦</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-6 bg-secondary/40"></span>
                <span className="font-montserrat text-[10px] tracking-widest uppercase text-secondary font-bold">
                  SANCTUARY SAFEGUARD
                </span>
                <span className="h-[1px] w-6 bg-secondary/40"></span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">
                Our Memories are Safe
              </h2>
              <p className="font-editorial italic text-sm text-on-surface-variant/90 leading-relaxed px-2">
                A brief pause in the constellation occurred, but our archives and vows remain perfectly intact.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 rounded-full bg-primary text-secondary-fixed font-montserrat text-xs tracking-widest uppercase font-bold border border-secondary/50 shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="refresh" size={16} />
                <span>Restore Sanctuary View</span>
              </button>

              <button
                type="button"
                onClick={this.handleSafeRecovery}
                className="w-full py-2.5 rounded-full bg-secondary-container/20 hover:bg-secondary-container/40 text-on-surface-variant font-montserrat text-[10px] tracking-wider uppercase font-semibold border border-secondary/30 transition-all"
              >
                Clear Transient Cache &amp; Reopen
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
