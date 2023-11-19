import { Form } from "formik";
import React from "react";

type Props = {
  isPending: boolean;
};

const FormWrapper = (props: React.PropsWithChildren<Props>) => {
  const { isPending, children } = props;
  return (
    <Form>
      <fieldset style={{ display: "contents" }} disabled={isPending}>
        {children}
      </fieldset>
    </Form>
  );
};

export default FormWrapper;
