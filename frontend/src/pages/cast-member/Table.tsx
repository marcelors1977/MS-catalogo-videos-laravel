import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import castMemberHttp from '../../util/http/cast-member-http'
import { CastMember, ListResponse, CastMemberTypeMap } from '../../util/models'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { MUIDataTableMeta } from 'mui-datatables'
import UseFilter from '../../hooks/useFilter'
import * as yup from '../../util/vendor/yup'
import  { Creators } from '../../store/filter'
import { FilterResetButton } from '../../components/Table/FilterResetButton'
import { invert } from 'lodash'

const castMemberNames = Object.values(CastMemberTypeMap)

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
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            filterOptions: {
                names: castMemberNames
            },
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
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = React.useState<CastMember[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
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
        rowsPerPageOptions: rowsPerPageOptions,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape( {
                    type: yup.string()
                        .nullable()
                        .transform( value => {
                            return !value || !castMemberNames.includes(value)? undefined : value
                        })
                        .default(null)
                })
            },
            formatSearchParams:  ( debouncedState ) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.type &&
                        {type: debouncedState.extraFilter.type}
                    )
                }: undefined
            },
            getStateFromUrl: (queryParams) => {
                return {
                    type: queryParams.get('type')
                }
            }
        }
    })

    const cleanFunSearch = filterManager.cleanSearchText(debounceFilterState.search)
    const cleanFunExtraFiltr = JSON.stringify(debounceFilterState.extraFilter)

    const indexColumntype = columns.findIndex( c => c.name === 'type')
    const columnType = columns[indexColumntype]
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never
    (columnType.options as any).filterList = typeFilterValue ?  [typeFilterValue] : []

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
        cleanFunExtraFiltr
    ])

    async function getData() {
        setLoading(true)
        try {
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryOptions: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                    ...(
                        debounceFilterState.extraFilter &&
                        debounceFilterState.extraFilter.type &&
                        {type: invert(CastMemberTypeMap)[debounceFilterState.extraFilter.type]}
                    )
                }
            })
            if (subscribed.current) {
                setData(data.data)
                setTotalRecords(data.meta.total)    
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
    }


    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable 
                title="Listagem de membros do elenco"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options= {{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: ( column, filterList, type ) => {
                        const columnIndex = columns.findIndex( c => c.name === column )
                        if (type === 'reset' ){
                            filterManager.resetFilter()
                        } else {
                            filterManager.changeExtraFilter({
                                [column as any] : filterList[columnIndex].length  ? filterList[columnIndex][0] : null
                            })
                        }
                    },
                    customToolbar:  () => (
                        <FilterResetButton 
                            handleClick={ () => dispatch( Creators.setReset())
                                }
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