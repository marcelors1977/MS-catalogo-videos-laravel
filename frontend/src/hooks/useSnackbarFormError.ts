import { useSnackbar } from "notistack"
import { useEffect } from "react"


const useSnackbarFormError = (submitCount, errors ) => {
    const snackbar = useSnackbar()
    useEffect( () => {
        const hasError = Object.keys(errors).length !== 0
        if ( submitCount > 0 && hasError) {
            snackbar.enqueueSnackbar(
                'Formulário com erros. Verifique os campos marcados em vermelho.',
                {variant: 'error'} 
            )   
        }
    }, [submitCount, errors, snackbar])
}

export default useSnackbarFormError