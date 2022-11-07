import { 
    Card, 
    List, 
    Theme,
    makeStyles, 
    Typography, 
    CardContent,
    Grid,
    Divider,
    Accordion,
    AccordionDetails,
    AccordionSummary
} from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import UploadItem from "./uploadItem"
import { Page } from "../../components/Page"
import { Upload, UploadModule } from "../../store/upload/types"
import { useSelector } from "react-redux"
import React from "react"
import { VideoFileFildesMap } from "../../util/models"

const useStyles = makeStyles( (theme: Theme) => ({
    panelSummary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
    },
    expandedIcon: {
        color: theme.palette.primary.contrastText
    },
}))


const Uploads = ((props) => {
    const classes = useStyles()

    const uploads = useSelector<UploadModule, Upload[]>(
        (state) => state.upload.uploads
    )

    return (
        <Page title="Uploads">
            {uploads.map((upload, key) => (
                <Card elevation={5} key={key}>
                    <CardContent>
                        <UploadItem uploadOrFile={upload}>
                            {upload.video.title}
                        </UploadItem>
                        <Accordion style={{margin: 0}}>
                            <AccordionSummary 
                                className={classes.panelSummary}
                                expandIcon={<ExpandMoreIcon className={classes.expandedIcon}/>}
                            >
                                <Typography>Ver detalhes!</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{padding: '0px'}}>
                                <Grid item xs={12}>
                                    <List dense={true} style={{padding: '0px'}}>
                                        {
                                            upload.files.map((file,key) => (
                                                <React.Fragment key={key}>
                                                    <Divider/>
                                                    <UploadItem uploadOrFile={file}>
                                                        {`${VideoFileFildesMap[file.fileField]} - ${file.fileName}`}
                                                    </UploadItem>
                                                </React.Fragment>
                                            ))
                                        }

                                    </List>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </Page>

    )
})

export default Uploads