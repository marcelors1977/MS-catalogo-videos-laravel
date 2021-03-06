import { Box, Fab } from '@material-ui/core'
import { Page } from '../../components/Page'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    return (
        <Page title='Listagem de categorias'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar categoria'
                    size='small'
                    href='/categories/create'
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