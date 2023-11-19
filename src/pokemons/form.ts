import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";

import { TYPES_QUERY_KEY, getTypes, RARITIES_QUERY_KEY, getRarities } from "./api";
import { PetFormValues, pokemonSchema } from "./schema";

export const initializeFormValues = (initialValues?: PetFormValues) => {
    const parsedInitialValues = pokemonSchema.safeParse(initialValues);
    if (parsedInitialValues.success) {
        return parsedInitialValues.data;
    }

    return emptyPokemonFormValues;
};

export const isInvalidInitialValues = (initialValues: PetFormValues, input?: PetFormValues) => {
    if (!input) {
        return false;
    }

    return initialValues === emptyPokemonFormValues
}

const emptyPokemonFormValues: PetFormValues = {
    name: "",
    type: [],
    rarity: 0,
    stats: {
        health: 0,
        attack: 0,
        defense: 0,
    },
}

const formHelper = (form: ReturnType<typeof useFormikContext<PetFormValues>>) => {
    const handleChangeCheckbox = (name: 'type') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const valueAsNumber = parseInt(event.target.value, 10)
        if (Number.isNaN(valueAsNumber)) return
        const value = event.target.checked
            ? [...form.values[name], valueAsNumber]
            : form.values[name].filter((item) => item !== valueAsNumber)

        form.setFieldValue(name, value)
    }

    const handleChangeRadio = (name: 'rarity') => (event: React.ChangeEvent<HTMLInputElement>) => {
        const valueAsNumber = parseInt(event.target.value, 10)
        if (Number.isNaN(valueAsNumber)) return
        form.setFieldValue(name, valueAsNumber)
    }

    const fieldHelperInput = (name: keyof PetFormValues) => ({
        name: name as string,
        id: name as string,
        value: form.values[name] as string,
        onChange: form.handleChange(name),
        onBlur: form.handleBlur(name),
        type: 'input',
        "aria-invalid": isTouchedAndError(name) ? true : undefined,
        "aria-describedby": isTouchedAndError(name) ? fieldErrorId(name) : undefined
    })

    const fieldHelperChecbkox = (name: "type") => ({
        name: name as string,
        id: name as string,
        onChange: handleChangeCheckbox(name),
        onBlur: form.handleBlur(name),
        type: 'checkbox',
        value: form.values.type,
        "aria-invalid": isTouchedAndError(name) ? true : undefined,
        "aria-describedby": isTouchedAndError(name) ? fieldErrorId(name) : undefined
    })

    const fieldHelperRadio = (name: "rarity") => ({
        name: name as string,
        id: name as string,
        onChange: handleChangeRadio(name),
        onBlur: form.handleBlur(name),
        type: 'radio',
        value: form.values.rarity,
        "aria-invalid": isTouchedAndError(name) ? true : undefined,
        "aria-describedby": isTouchedAndError(name) ? fieldErrorId(name) : undefined
    })

    const fieldHelperNested = (name: keyof PetFormValues['stats']) => ({
        name,
        id: name,
        value: form.values['stats'][name],
        onChange: form.handleChange(`stats.${name}`),
        onBlur: form.handleBlur(`stats.${name}`),
        type: "range",
        min: "1",
        max: "100",
        "aria-invalid": isTouchedAndErrorNested(name) ? true : undefined,
        "aria-describedby": isTouchedAndErrorNested(name) ? fieldErrorIdNested(name) : undefined
    })

    const isTouchedAndError = (name: keyof PetFormValues) => form.touched[name] && form.errors[name] as string
    const isTouchedAndErrorNested = (name: keyof PetFormValues['stats']) => form.touched.stats?.[name] && form.errors.stats?.[name] as string

    const fieldErrorId = (name: keyof PetFormValues) => `${name}-error`
    const fieldErrorIdNested = (name: keyof PetFormValues['stats']) => `${name}-error`

    const fieldErrors = (name: keyof PetFormValues) => ({
        id: fieldErrorId(name),
        message: `${form.errors[name]}`,
    })
    const fieldErrorsNested = (name: keyof PetFormValues['stats']) => ({
        id: fieldErrorIdNested(name),
        message: `${form.errors.stats?.[name]}`,
    })

    return {
        fieldErrors,
        fieldErrorsNested,
        fieldHelperInput,
        fieldHelperChecbkox,
        fieldHelperRadio,
        fieldHelperNested,
        isTouchedAndError,
        isTouchedAndErrorNested,
    }
}

export const useForm = () => {
    const form = useFormikContext<PetFormValues>()
    const options = useOptions();
    const helpers = formHelper(form)

    const fields = {
        name: helpers.fieldHelperInput('name'),
        type: helpers.fieldHelperChecbkox('type'),
        rarity: helpers.fieldHelperRadio('rarity'),
        health: helpers.fieldHelperNested('health'),
        attack: helpers.fieldHelperNested('attack'),
        defense: helpers.fieldHelperNested('defense'),
    } as const

    const labels = {
        name: 'Name',
        type: 'Type',
        rarity: 'Rarity',
        health: 'Health',
        attack: 'Attack',
        defense: 'Defense',
        stats: 'Stats',
    }

    const errors = {
        name: helpers.isTouchedAndError('name') ? helpers.fieldErrors('name') : undefined,
        type: helpers.isTouchedAndError('type') ? helpers.fieldErrors('type') : undefined,
        rarity: helpers.isTouchedAndError('rarity') ? helpers.fieldErrors('rarity') : undefined,
        health: helpers.isTouchedAndErrorNested('health') ? helpers.fieldErrorsNested('health') : undefined,
        attack: helpers.isTouchedAndErrorNested('attack') ? helpers.fieldErrorsNested('attack') : undefined,
        defense: helpers.isTouchedAndErrorNested('defense') ? helpers.fieldErrorsNested('defense') : undefined,
    }

    const isValid = Object.values(errors).every((error) => !error)

    return {
        options,
        fields,
        labels,
        errors,
        isValid,
    } as const
};

export const useOptions = () => {
    const types = useQuery({ queryKey: [TYPES_QUERY_KEY], queryFn: getTypes })
    const rarities = useQuery({ queryKey: [RARITIES_QUERY_KEY], queryFn: getRarities })

    return {
        type: {
            isLoading: types.isLoading,
            isError: types.isError,
            options: types.data ?? [],
            retry: () => types.refetch(),
        },
        rarity: {
            isLoading: rarities.isLoading,
            isError: rarities.isError,
            options: rarities.data ?? [],
            retry: () => rarities.refetch(),
        }
    }
}

const generateRandomString = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const useSubmit = (onSubmit: (values: PetFormValues) => Promise<void>) => {
    const [key, setKey] = React.useState("")
    const resetForm = () => setKey(generateRandomString())

    const mutation = useMutation({
        mutationFn: (values: PetFormValues) => onSubmit(pokemonSchema.parse(values)),
        onSuccess: () => resetForm(),
    })

    return {
        key,
        isPending: mutation.isPending,
        error: mutation.error ? mutation.error.message : null,
        onSubmit: mutation.mutate,
    }
}
