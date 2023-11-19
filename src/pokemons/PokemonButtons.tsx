type Props = {
  isValid?: boolean;
};

const PokemonButtons = (props: React.PropsWithChildren<Props>) => {
  const { children, isValid = false } = props;

  return (
    <>
      <button type="reset">Reset</button>
      <button type="submit" disabled={!isValid}>
        {children}
      </button>
    </>
  );
};

export default PokemonButtons;
