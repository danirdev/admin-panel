import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-[#FFFDF5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full border-2 border-black">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black mb-2 upppercase">¡Ups! Algo salió mal</h1>
            <p className="text-gray-600 font-medium mb-8">
              Ha ocurrido un error inesperado en la aplicación. No te preocupes, ya ha sido registrado.
            </p>

            <div className="bg-gray-100 border-2 border-black rounded p-3 mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-red-600">
                {this.state.error?.toString()}
            </div>

            <button 
              onClick={this.handleReload}
              className="w-full py-4 bg-black text-white font-black text-lg uppercase tracking-wider hover:bg-yellow-400 hover:text-black transition-all border-2 border-transparent hover:border-black flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
