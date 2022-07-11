import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from '@material-ui/core'
import { useForm } from "react-hook-form"
import * as React from 'react'
import castMemberHttp from '../../util/http/cast-member-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router'
import { useSnackbar } from 'notistack'
import { CastMember } from '../../util/models'
import SubmitActions from '../../components/SubmitActions'
import { DefaultForm } from '../../components/DefaultForm'

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255)
    ,
    type: yup.number()
        .label('Tipo')
        .required()
})

export const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
        reset,
        trigger
    } = useForm({
        resolver: yupResolver(validationSchema),
    })

    const snackBar = useSnackbar()
    const navigate = useNavigate()
    const { id } = useParams()
    const [castMember, setCastMember] = React.useState<CastMember | null>(null)
    const [errType, setErrType] = React.useState<boolean>(true)
    const [loading, setLoading] = React.useState<boolean>( false) 

    React.useEffect(() => {
        register("type")
    }, [register])

    React.useEffect(() => {
        if (!id) {
            return
        }
        (async () => {
            setLoading(true)
            try {
                const {data} = await castMemberHttp.get(id)
                setCastMember(data.data)
                reset(data.data)
            } catch (error) {
                console.error(error)
                snackBar.enqueueSnackbar(
                    "Não foi possível carregar informações de elenco",
                    { variant: "error"}
                ) 
            } finally {
                setLoading(false)
            }
        })()
    }, [id, snackBar, reset])

    async function onSubmit(formData, event) {
        setLoading(true)
        try {
            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember.id, formData)
            const {data} = await http   
            snackBar.enqueueSnackbar(
                "Membro do elenco salvo com sucesso", 
                {variant: 'success'}
            )
            setTimeout(() => {
                event
                    ? (
                        id
                            ? navigate(`/cast-members/${data.data.id}/edit`, { replace: true })
                            : navigate(`/cast-members/${data.data.id}/edit`)
                    )
                    : navigate(`/cast-members`)
            })    
        } catch (error) {
            console.error(error)
            snackBar.enqueueSnackbar(
                "Erro ao salvar Membro do elenco",
                { variant: "error"}
            )
        } finally {
            setLoading(false)
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
            <FormControl 
                // className={classes.formControl} 
                error={errors.type !== undefined && errType}
                disabled={loading}
            >
                <FormLabel >Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value))
                        setErrType(false)
                    }}
                    value={watch('type') + ""}
                >
                    <FormControlLabel value="2" control={<Radio color={"primary"}/>} label="Ator" />
                    <FormControlLabel value="1" control={<Radio color={"primary"}/>} label="Diretor" />
                </RadioGroup>
                <FormHelperText >
                    {errors.type !== undefined && errType && errors.type.message}
                </FormHelperText>
            </FormControl>
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