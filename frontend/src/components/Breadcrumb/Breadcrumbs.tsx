import React from "react"
import Link, { LinkProps } from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import routes from '../../routes'
import RouteParser from 'route-parser'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    linkRouter : {
      color: "#4db5ab",
      "&:focus, &:active": {
        color: "#4db5ab"
      },
      "&:hover": {
        color: "#055a52"
      }
    }
  })
)

const breadcrumbNameMap: { [key: string]: string } = {}
routes.forEach (route => breadcrumbNameMap[route.path as string] = route.label)

interface LinkRouterProps extends LinkProps {
  to: string
  replace?: boolean
}

const LinkRouter = (props: LinkRouterProps) => <Link {...props} component={RouterLink as any} />

export default function CustomBreadcrumbs() {
    const location = useLocation()
    const classes = useStyles()
    
    const pathnames = location.pathname.split('/').filter((x) => x)
    pathnames.unshift('/')
    return (
      <MuiBreadcrumbs aria-label="breadcrumb">
        {
          pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `${pathnames.slice(0, index + 1).join('/').replace('//','/')}`
            const route = Object.keys(breadcrumbNameMap).find(path => new RouteParser(path).match(to))

            if (route === undefined){
              return false
            }

            return last ? (
                <Typography color="textPrimary" key={to}>
                  {breadcrumbNameMap[route]}
                </Typography>
            ) : (
                <LinkRouter color="inherit" to={to} key={to} className={classes.linkRouter}>
                  {breadcrumbNameMap[route]}
                </LinkRouter>
            )
          })
        }
      </MuiBreadcrumbs>
    )
}