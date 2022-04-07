import { Box } from '@material-ui/core'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
// import './App.css';
import { Navbar } from './components/Navbar'
import MyBreadcrumbs from './components/Breadcrumb'
import AppRouter from './routes/AppRouter'

const App: React.FC = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Navbar/>
        <Box paddingTop={'70px'}>
          <MyBreadcrumbs />
          <AppRouter/>
        </Box>      
      </BrowserRouter>
    </React.Fragment>
  )
}

export default App
