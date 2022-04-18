import { 
    Box, 
    Button, 
    Checkbox, 
    FormControl, 
    Input, 
    InputLabel, 
    makeStyles, 
    MenuItem, 
    Select, 
    TextField, 
    Theme, 
    ListItemText
} from '@material-ui/core'
import { ButtonProps } from '@material-ui/core/Button'
import { useForm } from "react-hook-form"
import * as React from 'react'
import genderHttp from '../../util/http/gender-http'
import categoryHttp from '../../util/http/category-http'

interface Category {
    id: string;
    name: string;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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

export const Form = () => {

    const classes = useStyles()

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: 'outlined'
    }

    const [categories, setData] = React.useState<Category[]>([])
    React.useEffect( () => {
        categoryHttp
        .list<{ data: Category[]}>()
        .then(({data}) => setData(data.data))
    }, [])

    const [categoryName, setcategoryName] = React.useState<string[]>([]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      setcategoryName(event.target.value as string[]);
    };

    const {register, handleSubmit, getValues} = useForm()

    function onSubmit(formData) {
        console.log(formData)
        genderHttp
            .create(formData)
            .then( (response) => console.log(response))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label="Nome"
                fullWidth
                variant='outlined'
            />
            <FormControl className={classes.formControl}>
                <InputLabel id="mutiple-checkbox-label"> Categorias </InputLabel>
                <Select
                    {...register("categories_id")}
                    labelId="mutiple-checkbox-label"
                    id="mutiple-checkbox"
                    multiple
                    value={categoryName}
                    onChange={handleChange}
                    input={<Input />}
                    renderValue={
                        (selected) => categories.filter( name => (selected as string[]).includes(name.id))
                                           .map( record => record.name)
                                           .join(", ")
                    }
                    MenuProps={MenuProps}
                >
                {categories.map((name) => (
                    <MenuItem key={name.id} value={name.id}>
                    <Checkbox checked={categoryName.indexOf(name.id) > -1} />
                    <ListItemText primary={name.name} />
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <Checkbox
                {...register("is_active")}
                defaultChecked
            />
            Ativo?
            <Box dir='rtl'>
                <Button {...buttonProps} onClick={() => onSubmit(getValues())} >Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    )
}