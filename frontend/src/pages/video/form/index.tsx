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
    makeStyles,
    FormHelperText
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
import { has, omit } from 'lodash'
import { serialize } from 'object-to-formdata'

const useStyles = makeStyles( (theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        background: "#f5f5f5",
        margin: theme.spacing(2, 0)
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
                test(genders) {
                    return  genders?.filter(
                                gender => gender.categories.filter(
                                    cat => this.parent.categories?.map(c => c.id).includes(cat.id)
                                ).length !== 0
                            ).length !== 0
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
        formState: { errors },
        reset,
        watch,
        trigger
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

    const classes = useStyles()
    const snackBar = useSnackbar() 
    const navigate = useNavigate()
    const {id} = useParams()
    const subscribed = React.useRef( true )
    const [video, setVideo] = React.useState<Video | null>( null) 
    const [loading, setLoading] = React.useState<boolean>( false)
    const theme = useTheme()
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'))

    React.useEffect( () => {
        // [
        //     "opened",
        //     "genders",
        //     "categories",
        //      ...fileFields
        // ].forEach( element => register(element))
        // register('opened')
        // register('genders')
        // register('cast_members')
        // register('categories')
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
            setLoading(true)
            try {
                const {data} = await videoHttp.get(id)
                if ( subscribed.current) {
                    setVideo(data.data)
                    reset(data.data)  
                }
            } catch (error) {
                console.error(error)
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar as informações de videos',
                    {variant: 'error'}
                )
            } finally {
                setLoading(false)
            }
        })()

        return () => {
            subscribed.current = false
        }
    }, [id, reset, snackBar])

    async function onSubmit(formData, event) {
        setLoading(true)
        try {

            formData['cast_members_id'] = formData['cast_members'].map( cast_member => cast_member.id)
            formData['categories_id'] = formData['categories'].map( category => category.id)
            formData['genders_id'] = formData['genders'].map( gender => gender.id)
            if (id) {
                formData['_method'] = 'PUT'
            }

            formData = omit(
                formData,
                [   'cast_members', 
                'categories', 
                'genders',
                ...fileFields.filter( f => 
                    has(formData,f) 
                    ? formData[f] === null || formData[f]?.length === 0 
                    : false
                )
            ]
            )

            const newFormaData = serialize(formData, {booleansAsIntegers: true})

            const http = !video
                ? videoHttp.create(newFormaData)
                : videoHttp.update(video.id, newFormaData, true)
            const {data} = await http
            snackBar.enqueueSnackbar(
                "Vídeo salva com sucesso", 
                {variant: 'success'}
            )
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
            snackBar.enqueueSnackbar(
                "Erro ao salvar vídeo",
                { variant: "error"}
            )
        } finally {
            setLoading(false)
        } 
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
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha os gêneros de vídeos
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada gênero
                            </FormHelperText>
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
                                accept='image/*'
                                label='Thumb'
                                setValue={(value) => setValue('thumb_file' as any, value)}
                            />
                            <UploadField
                                {...register('banner_file')}
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
                                accept='video/mp4'
                                label='Trailer'
                                setValue={(value) => setValue('trailer_file' as any, value)}
                            />
                            <UploadField
                                {...register('video_file')}
                                accept='video/mp4'
                                label='Principal'
                                setValue={(value) => {
                                    setValue('video_file' as any, value)
                                }}
                            />
                        </CardContent>
                    </Card>
                    <br/>
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