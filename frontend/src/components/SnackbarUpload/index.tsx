import { 
    Card, 
    CardActions, 
    Collapse, 
    IconButton, 
    List, 
    Theme,
    makeStyles, 
    Typography 
} from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useSnackbar } from "notistack"
import { forwardRef, useState } from "react"
import classname from 'classnames'
import UploadItem from "./uploadItem"
import { Upload, UploadModule } from '../../store/upload/types'
import { useSelector } from 'react-redux'
import { countInProgress } from "../../store/upload/getters"

const useStyles = makeStyles( (theme: Theme) => ({
    card: {
        width: 450,
    },
    cardActionRoot: {
        padding: '8px 8px 16px',
        backgroundColor: theme.palette.primary.main
    },
    title: {
        fontWeight: 'bold',
        color: theme.palette.primary.contrastText
    },
    icons: {
        marginLeft: 'auto !important',
        color: theme.palette.primary.contrastText
    },
    expand: {
        transform: 'rotate(0deg)'
    },
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    list: {
        paddingTop: 0,
        paddingBottom: 0
    }
}))

interface SnackbarUploadProps {
    id: string | number
}

const SnackbarUpload = forwardRef<any, SnackbarUploadProps>((props, ref ) => {
    const {id} = props
    const {closeSnackbar} = useSnackbar()
    const classes = useStyles()
    const [expanded, setExpanded] = useState(true)

    const uploads = useSelector<UploadModule, Upload[]>(
        (state) => state.upload.uploads
    )

    const totalInProgress = countInProgress(uploads)

    return (
        <Card ref={ref} className={classes.card}>
            <CardActions classes={{root: classes.cardActionRoot}}>
                <Typography variant="subtitle2" className={classes.title}>
                    Fazendo upload de {totalInProgress} video(s)
                </Typography>
                <div className={classes.icons}>
                    <IconButton 
                        color={"inherit"}
                        onClick={ () => setExpanded(!expanded)}
                        className={classname(classes.expand, {[classes.expandOpen]: !expanded})}
                    >
                        <ExpandMoreIcon/>
                    </IconButton>
                    <IconButton 
                        color={"inherit"}
                        onClick={ () => closeSnackbar(id)}
                    >
                        <CloseIcon/>
                    </IconButton>
                </div>
            </CardActions>
            <Collapse in={expanded}>
                <List className={classes.list}>
                    {
                        uploads.map((upload, key) => (
                            <UploadItem key={key} upload={upload}/>
                        ))
                    }
                </List>
            </Collapse>
        </Card>
    )
})

export default SnackbarUpload