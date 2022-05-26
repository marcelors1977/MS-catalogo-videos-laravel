// @flow 
import * as React from 'react'
import { Page } from '../../components/Page'
import { Box, Fab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'


const List = () => {
    return (
        <Page title='Listagem de membros do elenco'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar membro do elenco'
                    size='small'
                    href='/cast-members/create'
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