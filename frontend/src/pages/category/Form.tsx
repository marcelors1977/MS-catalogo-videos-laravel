import * as React from 'react'
import { 
    Box, 
    Button, 
    Checkbox, 
    FormControlLabel, 
    makeStyles, 
    TextField, 
    Theme 
} from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import categoryHttp from '../../util/http/category-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles( (theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

const validationSchema = yup.object().shape( {
    name: yup.string()
            .label('Nome')
            .required()
            .max(255)
})

export const Form = () => {

    const classes = useStyles()

    const {
        register, 
        handleSubmit, 
        getValues,
        setValue,
        formState: { errors },
        reset,
        watch
    } = useForm({
         defaultValues: {
            is_active: true,
            name: "",
            description: ""
        },
        resolver: yupResolver(validationSchema),
    })

    const snackBar = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const [category, setCategory] = React.useState<{id: string} | null>( null) 
    const [loading, setLoading] = React.useState<boolean>( false) 

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
    }

    React.useEffect( () => {
        register("is_active")
    }, [register])

    React.useEffect( () => {
        if(!id) {
            return
        }
        setLoading(true)
        categoryHttp
            .get(id)
            .then(({data}) => {
                setCategory(data.data)
                reset(data.data)
            })
            .finally( () => setLoading(false))
    }, [id,reset])

    function onSubmit(formData, event) {
        setLoading(true)
        const http = !category
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData)
        
        http
            .then( ({data}) => {
                snackBar.enqueueSnackbar(
                    "Categoria salva com sucesso", 
                    {variant: 'success'}
                )
                setTimeout( () => {
                    event 
                    ? (
                            id 
                                ? navigate(`/categories/${data.data.id}/edit`, { replace: true })
                                : navigate(`/categories/${data.data.id}/edit`)
                        )
                    : navigate('/categories')
                })
            })
            .catch( (error) => {
                console.log(error)
                snackBar.enqueueSnackbar(
                    "Erro ao salvar categoria",
                    { variant: "error"}
                )
            })
            .finally( () => setLoading(false))
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label="Nome"
                fullWidth
                variant='outlined'
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <TextField
                {...register("description")}
                label="Descrição"
                multiline
                maxRows={4}
                fullWidth
                variant='outlined'
                margin='normal'
                disabled={loading}
                InputLabelProps={{shrink: true}}
            />
            <FormControlLabel
                disabled={loading}
                control={
                    <Checkbox
                        name='is_active'
                        onChange={
                            () => {
                                setValue( 'is_active', !getValues()['is_active'])
                            }
                        }
                        checked={watch('is_active') }
                    />
                }
                label={'Ativo?'}
                labelPlacement={'end'}
            />
            <Box dir='rtl'>
                <Button 
                color='primary'
                {...buttonProps} 
                onClick={() => onSubmit(getValues(), null)} 
                >
                    Salvar
                </Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>

        </form>
    )
}