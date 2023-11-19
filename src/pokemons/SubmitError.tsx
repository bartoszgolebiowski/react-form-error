type Props = {
  error: string;
};

const SubmitError = (props: Props) => {
  const { error } = props;
  return (
    <div style={{ color: "red" }} role="alert">
      {error}
    </div>
  );
};

export default SubmitError;
