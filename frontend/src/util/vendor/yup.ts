import {setLocale} from 'yup'

setLocale({
    mixed: {
        required: '$'.concat('{path} é requirido'),
        notType: '$'.concat('{path} é inválido')
    },
    string: {
        max: '$'.concat('{path} precisa ter no máximo $').concat('{max} caracteres')
    },
    number: {
        min: '$'.concat('{path} precisa ser no mínimo $').concat('{min}')
    },
    array: {
        min: 'Ao menos $'.concat('{min} $').concat('{path} deve(m) ser selecionado(s)')
    }
})

export * from 'yup'