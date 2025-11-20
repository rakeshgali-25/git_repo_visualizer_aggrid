import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// AG Grid styles (required)
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'  // nice white theme

import './index.css'   // optional

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
