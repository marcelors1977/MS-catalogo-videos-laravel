import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { BadgeNo, BadgeYes } from '../../components/Badge'
import categoryHttp from '../../util/http/category-http'
import { Category, ListResponse } from '../../util/models'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { MUIDataTableMeta } from 'mui-datatables'
import { Link } from 'react-router-dom'
import { Edit } from '@material-ui/icons'
import { FilterResetButton } from '../../components/Table/FilterResetButton'
import reducer, { Creators, INITIAL_STATE } from '../../store/filter'

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
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <Edit fontSize={'inherit'}/>
                    </IconButton>

                )
            }
        }
    }
]

type Props = {}

const Table = (props: Props) => {

    const snackbar = useSnackbar()
    const subscribed = React.useRef( true )
    const [data, setData] = React.useState<Category[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    const [totalRecords, setTotalRecords] = React.useState<number>(0)
    const [filterState, dispatch] = React.useReducer(reducer, INITIAL_STATE)

    const columns = columnsDefinition.map( column => {
        return column.name === filterState.order.sort
        ? {
            ...column,
            options: {
                ...column.options,
                sortOrder: filterState.order.dir as any
            }
        } : column
    })

    React.useEffect( () => {
        subscribed.current = true;
        
        (async () => {
            setLoading(true)
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>( {
                    queryOptions: {
                        search: cleanSearchText(filterState.search),
                        page: filterState.pagination.page,
                        per_page: filterState.pagination.per_page,
                        sort: filterState.order.sort,
                        dir: filterState.order.dir
                    }
                })
                if (subscribed.current) {
                    setData(data.data)  
                    setTotalRecords(data.meta.total)
                }            
            } catch (error) {
                console.error(error)
                if (categoryHttp.isCancelledRequest(error)) {
                    return
                }
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar informações',
                    {variant: 'error'}
                )
            } finally {
                setLoading(false)
            }
        })()

        return () => {
            subscribed.current = false
        }
    }, [snackbar,
        filterState.search,
        filterState.pagination.page,
        filterState.pagination.per_page,
        filterState.order
    ])

    function cleanSearchText(text) {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de categorias"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={200}
                options= {{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    count: totalRecords,
                    customToolbar:  () => (
                        <FilterResetButton 
                            handleClick={ () => dispatch( Creators.setReset())
                                }
                        />                        
                    ),
                    onSearchChange: (value) => dispatch(Creators.setSearch({search: value as any})),
                    onChangePage: (page) => dispatch(Creators.setPage({page: page + 1})),
                    onChangeRowsPerPage: (perPage) => dispatch(Creators.setPerPage({ per_page: perPage})),
                    onColumnSortChange: (changeColumn: string, direction: string) => dispatch( Creators.setOrder({
                        sort: changeColumn,
                        dir: direction.includes('desc') ? 'desc' : 'asc'
                    }))
                }}
            />
        </MuiThemeProvider>
            
    )
}

export default Table