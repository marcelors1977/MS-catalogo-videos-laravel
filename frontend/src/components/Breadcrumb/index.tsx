/* eslint-disable no-nested-ternary */
import { Box, Container } from "@material-ui/core"
import React from "react"
import {  Route, Routes } from 'react-router-dom'
import CustomBreadcrumbs from "./Breadcrumbs"

export default function MyBreadcrumbs() {
   return ( 
     <Container>
       <Box paddingTop={2} paddingBottom={1}>
          <Routes>
            <Route path="*" element={<CustomBreadcrumbs />}/>
            </Routes>
       </Box>

     </Container>
  )
}