import * as React from 'react'
import { 
    Checkbox, 
    FormControlLabel, 
    Grid, 
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Theme,
    Card,
    CardContent,
    makeStyles
} from '@material-ui/core'
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from '../../../util/vendor/yup'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { CastMember, Category, Gender, Video, VideoFileFildesMap } from '../../../util/models'
import SubmitActions from '../../../components/SubmitActions'
import { DefaultForm } from '../../../components/DefaultForm'
import videoHttp from '../../../util/http/video-http'
import { RatingField } from './RatingField'
import UploadField from './UploadField'
import GenderField from './GenderField'
import CategoryField from './CategoryField'
import CastMemberField from './CastMemberField'
import { omit, zipObject } from 'lodash'
import { InputFileComponent } from '../../../components/InputFile'
import { AsyncAutocompleteComponent } from '../../../components/AsyncAutocomplete'
import useSnackbarFormError from '../../../hooks/useSnackbarFormError'
import LoadingContext from '../../../components/loading/LoadingContext'
import SnackbarUpload from '../../../components/SnackbarUpload'
import { FileInfo } from '../../../store/upload/types'
import { useDispatch } from 'react-redux'
import { Creators } from '../../../store/upload'

const useStyles = makeStyles( (theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        background: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5"
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    }
}))

const validationSchema = yup.object().shape( {
    title: yup.string()
            .label('Título')
            .required()
            .max(255),
    description: yup.string()
            .label('Sinopse')
            .required(),
    year_launched: yup.number()
            .label('Ano de lançamento')
            .required()
            .min(1),
    duration: yup.number()
            .label('Duração')
            .required()
            .min(1),
    cast_members: yup.array()
            .label('membro(s) de elenco(s)')
            .min(1),
    genders: yup.array()
            .label('gênero(s)')
            .min(1)
            .test({
                message: 'Existem Gêneros sem categoria associada',
                test(value) {
                    return value!.every (
                        v => v.categories.filter(
                            cat => this.parent.categories.map(c => c.id).includes(cat.id)
                        ).length !==0
                    )
                }
            }),
    categories: yup.array()
            .label('categoria(s)')
            .min(1),
    rating: yup.string()
            .label('Classificação')
            .required()
})

const fileFields = Object.keys(VideoFileFildesMap)

export const Form = () => {

        const {
        register, 
        handleSubmit, 
        getValues,
        setValue,
        formState: { submitCount, errors },
        reset,
        watch,
        trigger,
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            'opened': false,
            'genders': [] as Gender[],
            'categories': [] as Category[],
            'cast_members': [] as CastMember[],
            'title': '',
            'description': '',
            'year_launched': 0,
            'duration': 0,
            'rating': '',
            'thumb_file': '',
            'banner_file': '',
            'trailer_file': '',
            'video_file': ''
        }
    })

    useSnackbarFormError(submitCount, errors)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const subscribed = React.useRef( true )
    const [video, setVideo] = React.useState<Video | null>( null) 
    const theme = useTheme()
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'))
    const castMemberRef = React.useRef() as React.MutableRefObject<AsyncAutocompleteComponent>
    const genderRef = React.useRef() as React.MutableRefObject<AsyncAutocompleteComponent>
    const categoryRef = React.useRef() as React.MutableRefObject<AsyncAutocompleteComponent>
    const uploadsRef = React.useRef(
        zipObject(fileFields, fileFields.map( () => React.createRef()))
    ) as React.MutableRefObject<{ [key: string] : React.MutableRefObject<InputFileComponent>}>
    const loading = React.useContext(LoadingContext)

    const dispatch = useDispatch()

    const resetForm = React.useCallback((data) => {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field] && uploadsRef.current[field].current.clear()
        )

        castMemberRef.current && castMemberRef.current.clear()
        genderRef.current && genderRef.current.clear()
        categoryRef.current && categoryRef.current.clear()
        reset(data)
    }, [castMemberRef, genderRef, categoryRef, reset, uploadsRef ])

    React.useEffect( () => {
        register('thumb_file')
        register('banner_file')
        register('trailer_file')
        register('video_file')
    }, [register])

    React.useEffect( () => {
        if(!id) {
            return
        }
        subscribed.current = true;
        (async () => {
            try {
                const {data} = await videoHttp.get(id)
                if ( subscribed.current) {
                    setVideo(data.data)
                    resetForm(data.data)  
                }
            } catch (error) {
                console.error(error)
                enqueueSnackbar(
                    'Não foi possível carregar as informações de videos',
                    {variant: 'error'}
                )
            }
        })()

        return () => {
            subscribed.current = false
        }
    }, [id, resetForm, enqueueSnackbar])

    async function onSubmit(formData, event) {
        const sendData = omit(
            formData, 
            ['cast_members', 
            'genders', 
            'categories',
            ...fileFields
            ]
        )

        sendData['cast_members_id'] = formData['cast_members'].map( cast_member => cast_member.id)
        sendData['categories_id'] = formData['categories'].map( category => category.id)
        sendData['genders_id'] = formData['genders'].map( gender => gender.id)

        try {
            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(video.id, sendData)
            const {data} = await http
            enqueueSnackbar(
                "Vídeo salva com sucesso", 
                {variant: 'success'}
            )
            
            uploadFiles(data.data)
            id && resetForm(video)
  
            setTimeout( () => {
                event 
                ? (
                        id 
                            ? navigate(`/videos/${data.data.id}/edit`, { replace: true })
                            : navigate(`/videos/${data.data.id}/edit`)
                    )
                : navigate('/videos')
            })

            
        } catch (error) {
            console.error(error)
            enqueueSnackbar(
                "Erro ao salvar vídeo",
                { variant: "error"}
            )
        } 
    } 

    function uploadFiles(video){
        const files: FileInfo[] = fileFields
                        .filter(fileField => getValues()[fileField] instanceof File ? getValues()[fileField] : null)
                        .map(fileField => ({fileField, file: getValues()[fileField]}))

        if (!files.length) {
            return
        }

        dispatch(Creators.addUpload({video, files}))

        enqueueSnackbar( '', {
            key: 'snackbar-upload',
            persist: true,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            content: (key, message) => {
                const id = key as any
                return <SnackbarUpload id={id}/>
            }
        })
    }

    return (
        <DefaultForm 
            GridItemProps={{xs:12}} 
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        {...register("title")}
                        label="Título"
                        fullWidth
                        variant='outlined'
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        {...register("description")}
                        label="Sinopse"
                        multiline
                        maxRows={4}
                        fullWidth
                        variant='outlined'
                        margin='normal'
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                {...register("year_launched")}
                                label="Ano de lançamento"
                                type="number"
                                fullWidth
                                variant='outlined'
                                margin='normal'
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                                {...register("duration")}
                                label="Duração"
                                type="number"
                                fullWidth
                                variant='outlined'
                                margin='normal'
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <CastMemberField
                                {...register('cast_members')}
                                cast_members={watch('cast_members') }
                                setCastMembers={(value) => setValue('cast_members', value, {shouldValidate: true})}
                                errors={errors.cast_members}
                                disabled={loading}

                            />
                        </Grid>
                    </Grid>
                    <br/>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenderField
                                {...register('genders')}
                                genders={watch('genders') }
                                setGenders={(value) => setValue('genders', value, {shouldValidate: true})}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, {shouldValidate: true})} 
                                errors={errors.genders}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                {...register('categories')}
                               categories={watch('categories')}
                               setCategories={(value) => setValue('categories', value, {shouldValidate: true})} 
                               genders={watch('genders')}
                               errors={errors.categories} 
                               disabled={loading}                        
                            />
                        </Grid>
                </Grid>
                </Grid> 
                <Grid item xs={12} md={6}>
                    <RatingField 
                        {...register("rating")}        
                        value={watch('rating')} 
                        setValue={(value) => setValue('rating', value)}
                        disabled={loading}
                        errors={errors.rating}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <br/>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField
                                {...register('thumb_file')}
                                ref={uploadsRef.current['thumb_file']}
                                accept='image/*'
                                label='Thumb'
                                setValue={(value) => setValue('thumb_file' as any, value)}
                            />
                            <UploadField
                                {...register('banner_file')}
                                ref={uploadsRef.current['banner_file']}
                                accept='image/*'
                                label='Banner'
                                setValue={(value) => setValue('banner_file' as any, value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField
                                {...register('trailer_file')}
                                ref={uploadsRef.current['trailer_file']}
                                accept='video/mp4'
                                label='Trailer'
                                setValue={(value) => setValue('trailer_file' as any, value)}
                            />
                            <UploadField
                                {...register('video_file')}
                                ref={uploadsRef.current['video_file']}
                                accept='video/mp4'
                                label='Principal'
                                setValue={(value) => {
                                    setValue('video_file' as any, value)
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...register('opened')}
                                        name='opened'
                                        color='primary'
                                        onChange={
                                            () => {
                                                setValue( 'opened', !getValues()['opened'])
                                            }
                                        }
                                        checked={watch('opened') || false }
                                        disabled={loading}
                                    />
                                }
                                label={
                                    <Typography color='primary' variant='subtitle2'>
                                        Quero que este contéudo aparece na seção lançamentos
                                    </Typography>
                                }
                                labelPlacement={'end'}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
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