/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { store } from './globalState/store';
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
