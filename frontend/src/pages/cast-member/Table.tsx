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
import LoadingContext from '../../components/loading/LoadingContext'
import useDeleteCollection from '../../hooks/useDeleteCollections'
import { Delete } from '@mui/icons-material'
import DeleteDialog from '../../components/DeleteDialog'

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

    const {enqueueSnackbar} = useSnackbar()
    const subscribed = React.useRef( true )
    const [data, setData] = React.useState<CastMember[]>([])
    const loading = React.useContext(LoadingContext)
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection()
    const extraFilter = React.useMemo( () => ({
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
    }), [])

    const { 
        columns,
        filterManager,
        cleanSearchText,
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
        extraFilter
    })

    const cleanFunSearch = cleanSearchText(debounceFilterState.search)
    const indexColumntype = columns.findIndex( c => c.name === 'type')
    const columnType = columns[indexColumntype]
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never
    (columnType.options as any).filterList = typeFilterValue ?  [typeFilterValue] : []

    const getData = React.useCallback(
        async ({ search, page, per_page, sort, dir, type }) => {
        try {
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryOptions: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(type && {
                        type: invert(CastMemberTypeMap)[type]
                    })
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
            enqueueSnackbar(
                'Não foi possível carregar as informações',
                {variant: 'error'}
            )
        } 
    }, [setTotalRecords, enqueueSnackbar])

    React.useEffect ( () => {
        subscribed.current = true;
        getData({
            search: cleanFunSearch,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir,
            ...(debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.type && {
                    type: debounceFilterState.extraFilter.type
            })
        })
        return () => {
            subscribed.current = true;
        }
    }, [
        cleanFunSearch,
        getData,
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
        debounceFilterState.extraFilter
    ])

    function deleteRows( confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false)
            return
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',')
            castMemberHttp
            .deleteCollection({ids})
            .then( response => {
                enqueueSnackbar(
                    'Registros excluídos com sucesso',
                    {variant: 'success'}
                )
                if(openDeleteDialog) {
                    setOpenDeleteDialog(false)
                }
                if(
                    rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page -2
                    filterManager.changePage(page)
                } else {
                    getData({
                        search: cleanFunSearch,
                        page: debounceFilterState.pagination.page,
                        per_page: debounceFilterState.pagination.per_page,
                        sort: debounceFilterState.order.sort,
                        dir: debounceFilterState.order.dir
                    })
                }
            })
            .catch( (error) => {
                console.log(error)
                enqueueSnackbar(
                    'Não foi possível excluir os registros',
                    {variant: 'error'}
                )
            })
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable 
                title="Listagem de membros do elenco"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options= {{
                    serverSide: true,
                    searchText: cleanSearchText(filterState.search) as any,
                    searchOpen: filterManager.isCloseSearchOpen(filterState.search),
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
                        filterManager.changeColumnSort(changeColumn, direction),
                    onRowsDelete: (rowsDeleted) => {
                        setRowsToDelete(rowsDeleted as any)
                        return false
                    }
                }}
            />
        </MuiThemeProvider>

    )
}

export default Table