import z from "zod";

export type PetFormValues = z.infer<typeof pokemonSchema>;

export const ERROR_MESSAGES = {
    name: {
        required: 'Name is required',
        outOfRange: 'Name must be between 1 and 100 characters',
    },
    type: {
        required: 'Need to check at least one type',
    },
    rarity: {
        required: 'Rarity is required',
    },
    health: {
        outOfRange: 'Health value must be between 1 and 100',
    },
    attack: {
        outOfRange: 'Attack value must be between 1 and 100',
    },
    defense: {
        outOfRange: 'Defense value must be between 1 and 100',
    },
}

export const pokemonSchema = z.object({
    name: z.string({
        required_error: ERROR_MESSAGES.name.required,
    })
        .min(1, { message: ERROR_MESSAGES.name.outOfRange })
        .max(100, { message: ERROR_MESSAGES.name.outOfRange }),
    type: z.array(z.number().min(1)).min(1, { message: ERROR_MESSAGES.type.required }),
    rarity: z.number().min(1, { message: ERROR_MESSAGES.rarity.required }),
    stats: z.object({
        health: z.number()
            .min(1, { message: ERROR_MESSAGES.health.outOfRange })
            .max(100, { message: ERROR_MESSAGES.health.outOfRange }),
        attack: z.number()
            .min(1, { message: ERROR_MESSAGES.attack.outOfRange })
            .max(100, { message: ERROR_MESSAGES.attack.outOfRange }),
        defense: z.number()
            .min(1, { message: ERROR_MESSAGES.defense.outOfRange })
            .max(100, { message: ERROR_MESSAGES.defense.outOfRange }),
    }),
})
