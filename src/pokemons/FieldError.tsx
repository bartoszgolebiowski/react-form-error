type Props = {
  id: string;
  message: string;
};

const FieldError = (props: Props) => {
  const { id, message } = props;
  return (
    <div id={id} style={{ color: "red", marginTop: "0.5rem" }} role="alert">
      {message}
    </div>
  );
};

export default FieldError;
