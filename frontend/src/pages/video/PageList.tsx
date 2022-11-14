import { Box, Fab } from '@material-ui/core'
import { Page } from '../../components/Page'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'
import { forwardRef } from 'react'

const List = forwardRef<any,any>((props, ref) => {
    const URL = process.env.REACT_APP_BASENAME 
    ? process.env.REACT_APP_BASENAME + '/videos/create'
    : '/videos/create'
    return (
        <Page title='Listagem de Videos'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar Video'
                    size='small'
                    href={URL}
                >
                    <AddIcon />
                </Fab>
            </Box>
            <Box>
                <Table/>
            </Box>
        </Page>
    )
})

export default List