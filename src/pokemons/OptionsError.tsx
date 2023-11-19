
type Props = {
  retry: () => void;
};

const OptionsError = (props: Props) => {
  const { retry } = props;
  return (
    <p style={{ color: "red" }}>
      <strong>Cannot load options</strong>
      <button type="button" onClick={retry}>
        Retry
      </button>
    </p>
  );
};

export default OptionsError;
