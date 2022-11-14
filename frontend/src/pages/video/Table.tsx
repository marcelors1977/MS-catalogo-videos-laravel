import * as React from 'react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { Video, ListResponse } from '../../util/models'
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table'
import { useSnackbar } from 'notistack'
import { IconButton, MuiThemeProvider } from '@material-ui/core'
import { MUIDataTableMeta } from 'mui-datatables'
import { Link } from 'react-router-dom'
import { Edit } from '@material-ui/icons'
import { FilterResetButton } from '../../components/Table/FilterResetButton'
import  { Creators } from '../../store/filter'
import UseFilter from '../../hooks/useFilter'
import videoHttp from '../../util/http/video-http'
import DeleteDialog from '../../components/DeleteDialog'
import useDeleteCollection from '../../hooks/useDeleteCollections'
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
        name: "title",
        label: "Título",
        width: "15%",
        options: {
            filter: false
        }
    },
    {
        name: "genders",
        label: "Gêneros",
        width: "23%",
        options: {
            sort: false,
            filter: false,
            customBodyRender(value) {
            return  value.map( (value: any) => value.name ).join(', ') 
            } 
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "23%",
        options: {
            sort: false,
            filter: false,
            customBodyRender(value) {
            return  value.map( (value: any) => value.name ).join(', ') 
            } 
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "5%",
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
        width: "4%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta: MUIDataTableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = React.useState<Video[]>([])
    const loading = React.useContext(LoadingContext)
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection()
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
        rowsPerPageOptions: rowsPerPageOptions
    })
    const cleanFunSearch = cleanSearchText(debounceFilterState.search)

    const getData = React.useCallback(
        async ({ search, page, per_page, sort, dir }) => {
            try { 
                const {data} = await videoHttp.list<ListResponse<Video>>( {
                    queryOptions: {
                        search,
                        page,
                        per_page,
                        sort,
                        dir
                    }
                })
                if (subscribed.current) {
                    setData(data.data)  
                    setTotalRecords(data.meta.total)
                    if(openDeleteDialog) {
                        setOpenDeleteDialog(false)
                    }
                }            
            } catch (error) {
                console.error(error)
                if (videoHttp.isCancelledRequest(error)) {
                    return
                }
                enqueueSnackbar(
                    'Não foi possível carregar informações',
                    {variant: 'error'}
                )
            } 
        },[setTotalRecords, enqueueSnackbar, openDeleteDialog, setOpenDeleteDialog])

        React.useEffect ( () => {
            subscribed.current = true
            getData({
                search: cleanFunSearch,
                page: debounceFilterState.pagination.page,
                per_page: debounceFilterState.pagination.per_page,
                sort: debounceFilterState.order.sort,
                dir: debounceFilterState.order.dir
            })
            return () => {
                subscribed.current = true;
            }
        }, [
            getData,
            cleanFunSearch,
            debounceFilterState.pagination.page,
            debounceFilterState.pagination.per_page,
            debounceFilterState.order,
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
        videoHttp
            .deleteCollection({ids})
            .then( response => {
                enqueueSnackbar(
                    'Registros excluídos com sucesso',
                    {variant: 'success'}
                )
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
                title="Listagem de videos"
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options= {{
                    serverSide: true,
                    searchText: cleanSearchText(filterState.search) as any,
                    searchOpen: filterManager.isCloseSearchOpen(filterState.search) ,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
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