// @flow 
import * as React from 'react'
import { Page } from '../../components/Page'
import { Box, Fab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    return (
        <Page title='Listagem de gêneros'>
            <Box dir={'rtl'}>
                <Fab
                    title='Adicionar gênero'
                    size='small'
                >
                    <AddIcon />
                </Fab>
            </Box>
            <Box>
                <Table/>
            </Box>
        </Page>
    )
}

export default List