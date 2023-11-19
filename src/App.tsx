import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PetForm from "./pokemons/PokemonForm";
import { PetFormValues } from "./pokemons/schema";

const ONE_MINUTE = 60 * 1000;

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchOnMount: true,
      staleTime: ONE_MINUTE,
    },
  },
});

function App() {
  const onSubmit = (values: PetFormValues) => {
    console.log(values);
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
     
    });
  };

  return (
    <QueryClientProvider client={client}>
      <PetForm onSubmit={onSubmit} />
    </QueryClientProvider>
  );
}

export default App;
