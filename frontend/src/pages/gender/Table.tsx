import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { BadgeNo, BadgeYes } from '../../components/Badge'
import { Gender, ListResponse } from '../../util/models'
import genderHttp from '../../util/http/gender-http'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { MUIDataTableMeta } from 'mui-datatables'

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
        width: "20%"
    },
    {
        name: "categories",
        label: "Categorias",
        width: "23%",
        options: {
            customBodyRender(value) {
            return  value.map( (value: any) => value.name ).join(', ') 
            } 
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/> 
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
                        to={`/genders/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = React.useState<Gender[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    const [searchState, setSearchState] = React.useState<searchState>({search: ''})

    React.useEffect( () => {
        subscribed.current = true;

        (async () => {
            setLoading(true)
            try {
                const {data} = await genderHttp.list<ListResponse<Gender>>({
                    queryOptions: {
                        search: searchState.search
                    }
                })
                if (subscribed.current) {
                    setData(data.data)    
                }               
            } catch (error) {
                console.error(error)
                if (genderHttp.isCancelledRequest(error)) {
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
    }, [snackbar, searchState])

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de gêneros"
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