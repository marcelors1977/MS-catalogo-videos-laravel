import * as React from 'react'
import { 
    Checkbox, 
    FormControlLabel, 
    TextField,
} from '@material-ui/core'
import { useForm } from "react-hook-form"
import categoryHttp from '../../util/http/category-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Category } from '../../util/models'
import SubmitActions from '../../components/SubmitActions'
import { DefaultForm } from '../../components/DefaultForm'
import LoadingContext from '../../components/loading/LoadingContext'

const validationSchema = yup.object().shape( {
    name: yup.string()
            .label('Nome')
            .required()
            .max(255)
})

export const Form = () => {

        const {
        register, 
        handleSubmit, 
        getValues,
        setValue,
        formState: { errors },
        reset,
        watch,
        trigger
    } = useForm({
         defaultValues: {
            is_active: true,
            name: "",
            description: ""
        },
        resolver: yupResolver(validationSchema),
    })

    const {enqueueSnackbar} = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const [category, setCategory] = React.useState<Category | null>( null) 
    const loading = React.useContext(LoadingContext) 

    React.useEffect( () => {
        register("is_active")
    }, [register])

    React.useEffect( () => {
        if(!id) {
            return
        }

        (async () => {
            try {
                const {data} = await categoryHttp.get(id)
                setCategory(data.data)
                reset(data.data)                    
            } catch (error) {
                console.error(error)
                enqueueSnackbar(
                    'Não foi possível carregar as informações de categorias',
                    {variant: 'error'}
                )
            } 
        })()
    }, [id, reset, enqueueSnackbar])

    async function onSubmit(formData, event) {
        try {
            const http = !category
                ? categoryHttp.create(formData)
                : categoryHttp.update(category.id, formData)
            const {data} = await http
            enqueueSnackbar(
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
            
        } catch (error) {
            console.error(error)
            enqueueSnackbar(
                "Erro ao salvar categoria",
                { variant: "error"}
            )
        } 
    }
    
    return (
        <DefaultForm GridItemProps={{xs:12, md:6}} onSubmit={handleSubmit(onSubmit)}>
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
            <SubmitActions
                disableButtons={loading} 
                handleSave={() => 
                    trigger().then(
                        isValid => {
                            isValid && onSubmit(getValues(), null)
                    })
                }
            />            
        </DefaultForm>
    )
}