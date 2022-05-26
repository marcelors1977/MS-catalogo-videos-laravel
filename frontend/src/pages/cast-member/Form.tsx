import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    makeStyles,
    Radio,
    RadioGroup,
    TextField,
    Theme
} from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import * as React from 'react'
import castMemberHttp from '../../util/http/cast-member-http'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../util/vendor/yup'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme: Theme) => {
    return {
        formControl: {
            margin: theme.spacing(4),
        },
        submit: {
            margin: theme.spacing(1)
        }
    }
})

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255)
    ,
    type: yup.string()
        .label('Tipo')
        .required()
})

export const Form = () => {

    const classes = useStyles()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(validationSchema),
    })

    const snackBar = useSnackbar()
    const navigate = useNavigate()
    const { id } = useParams()
    const [castMember, setCastMember] = React.useState<{ id: string } | null>(null)
    const [errType, setErrType] = React.useState<boolean>(true)
    const [loading, setLoading] = React.useState<boolean>( false) 

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: 'contained',
        disabled: loading
    }

    React.useEffect(() => {
        register("type")
    }, [register])

    React.useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        castMemberHttp
            .get(id)
            .then(({ data }) => {
                setCastMember(data.data)
                reset(data.data)
            })
        .finally( () => setLoading(false))
    }, [id, reset])

    function onSubmit(formData, event) {
        setLoading(true)
        const http = !castMember
            ? castMemberHttp.create(formData)
            : castMemberHttp.update(castMember.id, formData)

        http
            .then(({ data }) => {
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
            })
            .catch( (error) => {
                console.log(error)
                snackBar.enqueueSnackbar(
                    "Erro ao salvar Membro do elenco",
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
            <FormControl 
                className={classes.formControl} 
                error={errors.type !== undefined && errType}
                disabled={loading}
            >
                <FormLabel >Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value))
                        setErrType(false)
                    }}>
                    <FormControlLabel value="2" control={<Radio checked={watch('type') === 2}/>} label="Ator" />
                    <FormControlLabel value="1" control={<Radio checked={watch('type') === 1}/>} label="Diretor" />
                </RadioGroup>
                <FormHelperText >
                    {errors.type !== undefined && errType && errors.type.message}
                </FormHelperText>
            </FormControl>
            <Box dir='rtl'>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)} >Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    )
}