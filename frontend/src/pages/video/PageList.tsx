import { Box, Fab } from '@material-ui/core'
import { Page } from '../../components/Page'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    return (
        <Page title='Listagem de Videos'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar Video'
                    size='small'
                    href='/videos/create'
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