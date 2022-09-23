import { Category, Gender } from "./models";


export function getGendersFromCategory(genders: Gender[], category: Category) {
    return genders.filter(
        gender => gender.categories.filter(cat => cat.id === category.id).length !== 0
    )
}