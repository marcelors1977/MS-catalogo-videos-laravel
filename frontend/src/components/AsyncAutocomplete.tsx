import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core'
import { Autocomplete } from '@mui/material'
import { useSnackbar } from 'notistack'
import * as React from 'react'
import { useDebounce } from 'use-debounce'

interface AsyncAutocompleteProps {
    fetchOptions: (searchText) => Promise<any>
    debounceTime?: number
    TextFieldProps?: TextFieldProps
    AutocompleteProps?: any
}

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const {AutocompleteProps, debounceTime = 300} = props
    const {freeSolo, onInputChange} = AutocompleteProps
    const [open, setOpen] = React.useState(false)
    const [searchText, setSearchText] = React.useState("")
    const [debounceSearchText] = useDebounce(searchText, debounceTime)
    const [loading, setLoading] = React.useState(false)
    const [options, setOptions] = React.useState([])
    const snackBar = useSnackbar() 

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    }

    const autocompleteProps = {
        loadingText: 'Carregando',
        noOptionsText: 'Nenhum item encontrado',
        ...(props.AutocompleteProps && {...props.AutocompleteProps}),
        open,
        options,
        loading: loading,
        onOpen() {
            setOpen(true)
        },
        onClose() {
            setOpen(false)
        },
        onInputChange(event, value) {
            setSearchText(value)
            onInputChange && onInputChange()
        },
        renderInput: params => (
            <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={"inherit"} size={20}/>}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />
        )
    }

    React.useEffect( () =>{
        if (!open && !freeSolo) {
            setOptions([])
        }
    }, [open, freeSolo])

    React.useEffect( () => {
        if (!open || ( debounceSearchText === "" && freeSolo ) ){
            return
        }

        let isSubscribed = true;
        (async () => {
            setLoading(true)
            try {
                const data = await props.fetchOptions(debounceSearchText)
                if (isSubscribed) {
                    setOptions(data) 
                }                   
            } 
            finally {
                setLoading(false)
            }
        })()
        return () => { isSubscribed = false }
    }, [props, freeSolo, debounceSearchText, open, snackBar ])

    return (
        <Autocomplete {...autocompleteProps}/>
    )
}

export default AsyncAutocomplete