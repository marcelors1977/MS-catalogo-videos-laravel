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
import { ReactKeycloakProvider } from '@react-keycloak/web'
import { keycloak, keycloakConfig } from './util/auth'

const App: React.FC = () => {

  if (window.location.pathname !== process.env.REACT_APP_BASENAME) {
    window.location.assign(process.env.REACT_APP_BASENAME || '/')  
  } 

  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakConfig}>
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
    </ReactKeycloakProvider>
  )
}

export default App
