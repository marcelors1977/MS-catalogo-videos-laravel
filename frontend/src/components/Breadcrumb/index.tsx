/* eslint-disable no-nested-ternary */
import { Box, Container } from "@material-ui/core"
import React from "react"
import {  Route, Routes } from 'react-router-dom'
import CustomBreadcrumbs from "./Breadcrumbs"
import {useHasRealmRole} from "../../hooks/useHasRole"

export default function MyBreadcrumbs() {
  const hasCatalogAdmin = useHasRealmRole('catalog-admin')

   return ( 
    hasCatalogAdmin
    ? 
      <Container>
        <Box paddingTop={2} paddingBottom={1}>
            <Routes>
              <Route path="*" element={<CustomBreadcrumbs />}/>
              </Routes>
        </Box>

      </Container> 
    : null
  )
}