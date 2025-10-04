import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App.jsx';

const theme = createTheme();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
