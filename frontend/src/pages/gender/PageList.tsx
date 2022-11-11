import { Page } from '../../components/Page'
import { Box, Fab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import Table from './Table'

const List = () => {
    const URL = process.env.REACT_APP_BASENAME 
    ? process.env.REACT_APP_BASENAME + '/genders/create'
    : '/genders/create'
    return (
        <Page title='Listagem de gêneros'>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title='Adicionar gênero'
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
}

export default List