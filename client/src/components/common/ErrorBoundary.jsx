import React from 'react';

class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null, errorInfo: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true };
 }

 componentDidCatch(error, errorInfo) {
 this.setState({
 error: error,
 errorInfo: errorInfo
 });
 console.error("ErrorBoundary caught an error", error, errorInfo);
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-surface-dim">
 <div className="bg-surface p-8 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-lg w-full">
 <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
 <p className="text-on-surface-variant mb-6">
 An unexpected error occurred. We've been notified and are looking into it.
 </p>
 <button 
 onClick={() => window.location.reload()}
 className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-semibold py-3 px-4 rounded-xl transition-colors"
 >
 Refresh Page
 </button>
 {process.env.NODE_ENV === 'development' && (
 <details className="mt-6 text-left p-4 bg-surface-variant rounded-lg overflow-x-auto">
 <summary className="text-sm font-semibold text-on-surface-variant cursor-pointer">Error Details</summary>
 <pre className="mt-2 text-xs text-red-600 dark:text-red-400">
 {this.state.error && this.state.error.toString()}
 <br />
 {this.state.errorInfo && this.state.errorInfo.componentStack}
 </pre>
 </details>
)}
 </div>
 </div>
);
 }
 return this.props.children;
 }
}

export default ErrorBoundary;
