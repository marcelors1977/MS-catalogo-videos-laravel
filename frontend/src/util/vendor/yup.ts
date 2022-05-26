import {setLocale} from 'yup'

setLocale({
    mixed: {
        required: '$'.concat('{path} é requirido')
    },
    string: {
        max: '$'.concat('{path} precisa ter no máximo $').concat('{max} caracteres')
    },
    number: {
        min: '$'.concat('{path} precisa ser no mínimo $').concat('{max}')
    },
    array: {
        min : '$'.concat('{path} deve ser umas lista de ao menos uma categoria selecionada')
    }
})

export * from 'yup'