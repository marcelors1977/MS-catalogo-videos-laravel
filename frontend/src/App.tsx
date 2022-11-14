import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import MyBreadcrumbs from './components/Breadcrumb'
import AppRouter from './routes/AppRouter'
import theme from './theme'
import { SnackbarProvider } from './components/SnackbarProvider'
import Spinner from './components/Spinner'
import { LoadingProvider } from './components/loading/LoadingProvider'

const App: React.FC = () => {
  return (
    <React.Fragment>
      <LoadingProvider>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <CssBaseline/>
            <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
              <Spinner/>
              <Navbar/>
              <Box paddingTop={'70px'}>
                <MyBreadcrumbs />
                <AppRouter/>
              </Box>      
            </BrowserRouter>
          </SnackbarProvider>
        </MuiThemeProvider>
      </LoadingProvider>
    </React.Fragment>
  )
}

export default App
