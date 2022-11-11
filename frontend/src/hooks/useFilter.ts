import { MUIDataTableColumn } from "mui-datatables"
import React, { Dispatch, Reducer, useCallback, useEffect, useMemo, useReducer, useState } from "react"
import reducer, { Creators } from '../store/filter'
import { Actions as FilterActions, State as FilterState } from "../store/filter/types"
import { useDebounce } from 'use-debounce'
import { useNavigate, useLocation } from "react-router-dom"
import { isEqual} from "lodash"
import * as yup from '../util/vendor/yup'
import { ObjectSchema } from "../util/vendor/yup"

interface FilterManagerOptions {
    schema: ObjectSchema<any>
    columns: MUIDataTableColumn[]
    rowsPerPage: number 
    dispatch: Dispatch<FilterActions>
    state: FilterState
}

interface ExtraFilter {
    getStateFromUrl: ( queryParams: URLSearchParams ) => any,
    formatSearchParams: ( debouncedState: FilterState) => any,
    createValidationSchema: () => any
}

interface UserFilterOptions {
    columns: MUIDataTableColumn[]
    rowsPerPage: number 
    rowsPerPageOptions: number[]
    debounceTime: number
    extraFilter?: ExtraFilter
}

export default function UseFilter(options: UserFilterOptions) {
    const navigate = useNavigate()
    const location = useLocation()
    const {search: locationSearch, state: locationState} = location
    const {rowsPerPage, rowsPerPageOptions, extraFilter, columns} = options
    const schema = useMemo(() => {
        return yup.object().shape( {
            search: yup.string()
                .transform( value => !value ? undefined : value )
                .default( '' ),
            pagination: yup.object().shape( {
                page: yup.number()
                    .transform( value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .oneOf(rowsPerPageOptions)
                    .transform( value => isNaN(value) ? undefined : value)
                    .default(rowsPerPage)
            }),
            order: yup.object().shape( {
                sort: yup.string()
                    .nullable()
                    .transform( value => {
                        const columnsName = columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name)
                        return columnsName.includes(value) ? value: undefined
                    })
                    .default( null ),
                dir: yup.string()
                    .nullable()
                    .transform( value => !value || !['asc','desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default( null )
            }),
            ...(
                extraFilter && {
                    extraFilter: extraFilter.createValidationSchema()
                }
            )
        })
    }, [rowsPerPageOptions, rowsPerPage, columns, extraFilter])

    const stateFromUrl = useMemo<FilterState>( () => {
        const queryParams = new URLSearchParams(locationSearch.substring(1))
        return schema.cast( {
         search: queryParams.get('search'),
         pagination: {
             page: queryParams.get('page'),
             per_page: queryParams.get('per_page')
         },
         order: {
             sort: queryParams.get('sort'),
             dir: queryParams.get('dir'),
         },
         ...(
             extraFilter && {
                 extraFilter: extraFilter.getStateFromUrl(queryParams)
             }
         )
        })
     },[locationSearch, schema, extraFilter])

     const cleanSearchText = useCallback( (text) => {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }, [])

    const formatSearchParams = useCallback((state, extraFilter) => {
        const search = cleanSearchText(state.search)
        return {
            ...(search && search !== '' && {search: search}),
            ...(state.pagination.page !== 1 && {page: state.pagination.page}),
            ...(state.pagination.per_page !== 15 && {per_page: state.pagination.per_page}),
            ...(
                state.order.sort && {
                    sort: state.order.sort,
                    dir: state.order.dir
                }
            ),
            ...(
                extraFilter && extraFilter.formatSearchParams(state)
            )

        }
    },[cleanSearchText])

    const INITIAL_STATE = stateFromUrl
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE)
    const filterManager = new FilterManager({...options, dispatch, schema, state: filterState})
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const [debounceFilterState] = useDebounce(filterState, options.debounceTime)

    useEffect( () => {
        const historyUrl = '?' + new URLSearchParams(formatSearchParams(stateFromUrl, extraFilter) )
        navigate(
            historyUrl, 
            {
                replace: true,
                state: stateFromUrl,
            })
    }, [formatSearchParams, stateFromUrl, extraFilter, navigate])

    useEffect( () => {
        const historyUrl = '?' + new URLSearchParams(formatSearchParams(debounceFilterState, extraFilter) )       
        const oldState = locationState
        const nextState = debounceFilterState

        if(isEqual(oldState, nextState)){
            return
        }

        navigate(
            historyUrl, 
            {
                state: { 
                    ...debounceFilterState,
                    search: cleanSearchText(debounceFilterState.search)
                }
            }
        )

    }, [formatSearchParams, extraFilter, navigate, cleanSearchText, locationState, debounceFilterState])

    filterManager.state = filterState
    filterManager.applyOrderInColumns()

    return {
        columns: filterManager.columns,
        cleanSearchText,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema
    state: FilterState
    dispatch: React.Dispatch<FilterActions>
    columns: MUIDataTableColumn[]
    rowsPerPage: number 

    constructor(options: FilterManagerOptions) {
        const { schema, columns, rowsPerPage, dispatch, state} = options
        this.schema = schema
        this.columns = columns
        this.rowsPerPage = rowsPerPage
        this.dispatch = dispatch
        this.state = state
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({search: value as any}))
    } 
    
    changePage(page) {
        this.dispatch(Creators.setPage({page: page + 1}))
    }

    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({ per_page: perPage}))
    }

    changeColumnSort(changeColumn: string, direction: string) {
        this.dispatch( Creators.setOrder({
            sort: changeColumn,
            dir: direction.includes('desc') ? 'desc' : 'asc'
        }))
    }

    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data))
    }

    resetFilter() {
        this.dispatch(Creators.resetExtraFilter())
    }

    applyOrderInColumns() {

        this.columns = this.columns.map( column => {
            return column.name === this.state.order.sort
            ? {
                ...column,
                options: {
                    ...column.options,
                    sortOrder: this.state.order.dir as any
                }
            } : column
        })
    }

    isCloseSearchOpen(text) {
        if (text && text.value !== undefined ){
            let newText = text.value
            if (newText) {
                return true
            } else {
                return false
            }    
        }
    }
}