import z from 'zod'

export const TYPES_QUERY_KEY = 'types'
export const RARITIES_QUERY_KEY = 'rarities'

const getTypesSchema = z.array(z.object({
    id: z.number(),
    value: z.string().min(1),
}))

const getRaritiesSchema = z.array(z.object({
    id: z.number(),
    value: z.string().min(1),
}))

export const getTypes = async () => {
    const response = await fetch('http://localhost:8080/types');
    const data = await response.json();
    return getTypesSchema.parse(data)
}

export const getRarities = async () => {
    const response = await fetch('http://localhost:8080/rarities');
    const data = await response.json();
    return getRaritiesSchema.parse(data)
}

