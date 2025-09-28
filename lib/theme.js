// lib/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue similar to previous Tailwind bg-blue-600
    },
    secondary: {
      main: '#dc2626', // Red for delete buttons
    },
    background: {
      default: '#f3f4f6', // Light gray like Tailwind bg-gray-100
    },
  },
});

export default theme;