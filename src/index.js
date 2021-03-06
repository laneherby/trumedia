import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: "#303030"
    },
    primary: {
      main: "#297C90"
    },
    secondary: {
      main: "#48b1cb"
    }
  }
});

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);