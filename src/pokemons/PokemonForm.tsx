import * as React from "react";
import { Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { PetFormValues, pokemonSchema } from "./schema";
import PokemonBody from "./PokemonBody";
import {
  initializeFormValues,
  isInvalidInitialValues,
  useSubmit,
} from "./form";
import SubmitError from "./SubmitError";
import PokemonButtons from "./PokemonButtons";
import FormWrapper from "./FormWrapper";

type Props = {
  initialValues?: PetFormValues;
  onSubmit: (values: PetFormValues) => Promise<void>;
};

const PokemonForm = (props: Props) => {
  const { initialValues, onSubmit } = props;
  const initialValuesRef = React.useRef(initializeFormValues(initialValues));
  const submit = useSubmit(onSubmit);

  if (isInvalidInitialValues(initialValuesRef.current, initialValues)) {
    return <SubmitError error="Invalid initial values" />;
  }

  return (
    <Formik
      key={submit.key}
      initialValues={initialValuesRef.current}
      validationSchema={toFormikValidationSchema(pokemonSchema)}
      onSubmit={submit.onSubmit}
    >
      <FormWrapper isPending={submit.isPending}>
        <PokemonBody>
          <PokemonButtons>
            {submit.isPending ? "Submitting..." : "Submit"}
          </PokemonButtons>
        </PokemonBody>
        {submit.error ? <SubmitError error={submit.error} /> : null}
      </FormWrapper>
    </Formik>
  );
};

export default PokemonForm;
