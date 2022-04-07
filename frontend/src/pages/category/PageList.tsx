import { Box, Fab } from '@material-ui/core'
import { Page } from '../../components/Page'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    return (
        <Page title='Listagem de categorias'>
            <Box dir={'rtl'}>
                <Fab
                    title='Adicionar categoria'
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