import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import castMemberHttp from '../../util/http/cast-member-http'
import { CastMember, ListResponse } from '../../util/models'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { MUIDataTableMeta } from 'mui-datatables'

const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
}

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "43%"
    },
    {
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            customBodyRender(value) {
              return CastMemberTypeMap[value ]
            } 
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "13%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: "10%",
        options: {
            sort: false,
            customBodyRender: (value, tableMeta: MUIDataTableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
                    >
                        <Edit fontSize={'inherit'}/>
                    </IconButton>

                )
            }
        }
    }
]

interface searchState {
    search: string | null
}

type Props = {}

const Table = (props: Props) => {

    const snackbar = useSnackbar()
    const subscribed = React.useRef( true )
    const [data, setData] = React.useState<CastMember[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    const [searchState, setSearchState] = React.useState<searchState>({search: ''})

    React.useEffect( () => {
        subscribed.current = true;
        
        (async () => {
            setLoading(true)
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                    queryOptions: {
                        search: searchState.search
                    }
                })
                if (subscribed.current) {
                    setData(data.data)    
                }                 
            } catch (error) {
                console.error(error)
                if (castMemberHttp.isCancelledRequest(error)) {
                    return
                }
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error'}
                )
            } finally {
                setLoading(false)
            }
        })()

        return () => {
            subscribed.current = false
        }
    }, [snackbar, searchState])

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de membros do elenco"
                columns={columnsDefinition}
                data={data}
                loading={loading}
                options= {{
                    searchText: searchState.search!,
                    onSearchChange: (searchText) => setSearchState({search: searchText})
                }}
            />
        </MuiThemeProvider>

    )
}

export default Table