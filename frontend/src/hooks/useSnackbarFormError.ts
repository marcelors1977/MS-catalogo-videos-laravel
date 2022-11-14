import { useSnackbar } from "notistack"
import { useEffect } from "react"


const useSnackbarFormError = (submitCount, errors ) => {
    const {enqueueSnackbar} = useSnackbar()
    useEffect( () => {
        const hasError = Object.keys(errors).length !== 0
        if ( submitCount > 0 && hasError) {
            enqueueSnackbar(
                'Formulário com erros. Verifique os campos marcados em vermelho.',
                {variant: 'error'} 
            )   
        }
    }, [submitCount, errors, enqueueSnackbar])
}

export default useSnackbarFormError