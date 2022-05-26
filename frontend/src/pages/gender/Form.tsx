import { 
    Box, 
    Button, 
    Checkbox,
    FormControlLabel,
    makeStyles, 
    MenuItem, 
    TextField, 
    Theme
} from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import * as React from 'react'
import genderHttp from '../../util/http/gender-http'
import categoryHttp from '../../util/http/category-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useParams } from 'react-router'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles( (theme: Theme) => {
    return {
        formControl: {
            margin: theme.spacing(1),
            minWidth: 300
        },
        submit: {
            margin: theme.spacing(1),
        }
    }
})

const validationSchema = yup.object().shape( {
    name:           yup.string()
                    .label('Nome')
                    .required()
                    .max(255),
    categories_id: yup.array()
                    .label('Categorias') 
                    .nullable()
                    .required()
                    .min(1)
})

export const Form = () => {

    const classes = useStyles()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState:{errors},
        reset,
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            is_active: true,
            categories_id: ""
        },
        resolver: yupResolver(validationSchema),
    })

    const snackBar = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const [categories, setCategories] = React.useState<any[]>([])
    const [gender, setGender] = React.useState<{id: string} | null>( null) 
    const [loading, setLoading] = React.useState<boolean>( false) 
    const [isCategories, setIsCategories] = React.useState<boolean>(false)

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
    }
    
    React.useEffect( () => {
        categoryHttp
        .list()
        .then(({data}) => setCategories(data.data))
    }, [])

    React.useEffect( () => {
        if(!id) {
            return
        }
        setLoading(true)
        genderHttp
            .get(id)
            .then(({data}) => {
                setGender(data.data)
                reset(data.data)
            })
            .finally( () => setLoading(false))
    }, [id,reset])

    function onSubmit(formData, event) {
        setLoading(true)
        const http = !gender
        ? genderHttp.create(formData)
        : genderHttp.update(gender.id, formData)     
        
        http
        .then( ({data}) => {
            snackBar.enqueueSnackbar(
                "Gênero salva com sucesso", 
                {variant: 'success'}
            )
            setTimeout( () => {
                event 
                ? (
                        id 
                            ? navigate(`/genders/${data.data.id}/edit`, { replace: true })
                            : navigate(`/genders/${data.data.id}/edit`)
                    )
                : navigate('/genders')
            })
        })
        .catch( (error) => {
            console.log(error)
            snackBar.enqueueSnackbar(
                "Erro ao salvar Gênero",
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
                error={errors.name !== undefined }
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <TextField
                select
                {...register("categories_id")}
                value={watch('categories_id') || [] } 
                label="Categorias"
                margin='normal'
                variant='outlined'
                disabled={loading}
                error={ errors.categories_id !== undefined && !isCategories}
                helperText={ errors.categories_id !== undefined && !isCategories && errors.categories_id.message}
                fullWidth
                 onChange={ (e) => {
                    setValue('categories_id', e.target.value)
                    setIsCategories(e.target.value.length !== 0 ? true : false)
                }}
                SelectProps={{
                    multiple: true
                }}
            >
                <MenuItem value={""} disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}
                            </MenuItem>
                        )
                    )
                }  
            </TextField>
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