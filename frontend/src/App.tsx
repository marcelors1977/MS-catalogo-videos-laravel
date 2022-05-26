import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
// import './App.css';
import { Navbar } from './components/Navbar'
import MyBreadcrumbs from './components/Breadcrumb'
import AppRouter from './routes/AppRouter'
import theme from './theme'
// import { SnackbarProvider } from 'notistack'
import { SnackbarProvider } from './components/SnackbarProvider'

const App: React.FC = () => {
  return (
    <React.Fragment>
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline/>
          <BrowserRouter>
            <Navbar/>
            <Box paddingTop={'70px'}>
              <MyBreadcrumbs />
              <AppRouter/>
            </Box>      
          </BrowserRouter>
        </SnackbarProvider>
      </MuiThemeProvider>
    </React.Fragment>
  )
}

export default App
