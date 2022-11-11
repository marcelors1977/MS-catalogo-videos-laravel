import { Box, Fab } from '@material-ui/core'
import { Page } from '../../components/Page'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    const URL = process.env.REACT_APP_BASENAME 
        ? process.env.REACT_APP_BASENAME + '/categories/create'
        : '/categories/create'
    console.log('env -> ', URL)
    return (
        <Page title='Listagem de categorias'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar categoria'
                    size='small'
                    href= {URL}
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