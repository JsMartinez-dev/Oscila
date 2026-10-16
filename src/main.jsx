import React from 'react'
import ReactDOM from 'react-dom/client'
import 'katex/dist/katex.min.css'
import '@fontsource-variable/lexend'
import './estilos/tokens.css'
// La base va antes de App para que los estilos de cada página puedan especializar .btn, .tarjeta, etc.
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
