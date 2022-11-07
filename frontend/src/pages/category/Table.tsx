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
import  { Creators } from '../../store/filter'
import UseFilter from '../../hooks/useFilter'
import LoadingContext from '../../components/loading/LoadingContext'

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "43%",
        options: {
            filter: false
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            filter: false,
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
            filter: false,
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
            filter: false,
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

const debounceTime = 200
const debounceSearchTime = 200
const rowsPerPage = 15
const rowsPerPageOptions = [15, 25, 50]

const Table = (props: Props) => {

    const snackbar = useSnackbar()
    const subscribed = React.useRef( true )
    const [data, setData] = React.useState<Category[]>([])
    const { 
        columns,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = UseFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions
    })
    const cleanFunSearch = filterManager.cleanSearchText(debounceFilterState.search)
    const loading = React.useContext(LoadingContext)

    React.useEffect ( () => {
        subscribed.current = true;
        filterManager.pushHistory()
        getData()
        return () => {
            subscribed.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        cleanFunSearch,
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
    ])

    async function getData() {
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>( {
                    queryOptions: {
                        search: filterManager.cleanSearchText(filterState.search),
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
            } 
        }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de categorias"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options= {{
                    serverSide: true,
                    searchText: filterManager.cleanSearchText(filterState.search) as any,
                    searchOpen: filterManager.isCloseSearchOpen(filterState.search),
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar:  () => (
                        <FilterResetButton 
                            handleClick={ () => dispatch( Creators.setReset())}
                        />                        
                    ),
                    onSearchChange: (searchText) => filterManager.changeSearch(searchText),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changeColumn: string, direction: string) => 
                        filterManager.changeColumnSort(changeColumn, direction)
                }}
            />
        </MuiThemeProvider>
            
    )
}

export default Table