import { 
    Checkbox,
    FormControlLabel,
    MenuItem, 
    TextField
} from '@material-ui/core'
import { useForm } from "react-hook-form"
import * as React from 'react'
import genderHttp from '../../util/http/gender-http'
import categoryHttp from '../../util/http/category-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useParams } from 'react-router'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { Category, Gender } from '../../util/models'
import SubmitActions from '../../components/SubmitActions'
import { DefaultForm } from '../../components/DefaultForm'
import LoadingContext from '../../components/loading/LoadingContext'

const validationSchema = yup.object().shape( {
    name:          yup.string()
                    .label('Nome')
                    .required()
                    .max(255),
    categories_id: yup.array()
                    .label('Categorias')
                    .min(1)
})

export const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState:{errors},
        reset,
        watch,
        trigger
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            categories_id: [] as string[],
            name: "",
            is_active: true
        }
    })

    const {enqueueSnackbar} = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const [categories, setCategories] = React.useState<Category[]>([])
    const [gender, setGender] = React.useState<Gender | null>( null) 
    const loading = React.useContext(LoadingContext)

    React.useEffect( () => {
        (async () => {
           const promises = [categoryHttp.list({queryOptions: {all: ' '}})]
           if (id) {
               promises.push(genderHttp.get(id))
           } 
           try {
               const [categoriesResponse, genderResponse] = await Promise.all(promises)
               setCategories(categoriesResponse.data.data)
               if (id) {
                   setGender(genderResponse.data.data)
                   reset( {
                       ...genderResponse.data.data,
                       categories_id: genderResponse.data.data.categories.map(category => category.id)
                   })
               }
           } catch (error) {
               console.error(error)
               enqueueSnackbar(
                   'Não foi possível carregar as informações de gênero',
                   {variant: 'error'}
               )
           } 
        })()
    }, [id,reset, enqueueSnackbar])
    
    async function onSubmit(formData, event) {
        try {
            const http = !gender
                ? genderHttp.create(formData)
                : genderHttp.update(gender.id, formData)
            const {data} = await http  
            enqueueSnackbar(
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
        } catch (error) {
            console.error(error)
            enqueueSnackbar(
                "Erro ao salvar Gênero",
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
                error={errors.name !== undefined }
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <TextField
                select
                {...register("categories_id")}
                value={watch('categories_id') } 
                label="Categorias"
                margin='normal'
                variant='outlined'
                disabled={loading}
                error={ errors.categories_id !== undefined }
                helperText={ errors.categories_id !== undefined  && errors.categories_id['message']}
                fullWidth
                onChange={ (e) => {
                    setValue('categories_id', Array.from( e.target.value ) )
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