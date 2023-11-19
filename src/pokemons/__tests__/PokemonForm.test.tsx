import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PokemonForm from "../PokemonForm";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ERROR_MESSAGES } from "../schema";
import { server } from "../../mocks/node";
import { HttpResponse, http } from "msw";

const customRender = (
  ui: Parameters<typeof render>[0],
  options?: Parameters<typeof render>[1]
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  );
};

describe("PokemonForm", () => {
  describe("Create form functionality", () => {
    it("should renders without crashing", () => {
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);
    });

    it("should display error messages when for not valid after submit", async () => {
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);
      await userEvent.click(screen.getByRole("button", { name: /submit/i }));
      expect(await screen.findAllByRole("alert")).toHaveLength(6);
      expect(
        screen.getByText(ERROR_MESSAGES.name.required)
      ).toBeInTheDocument();
      expect(
        screen.getByText(ERROR_MESSAGES.type.required)
      ).toBeInTheDocument();
      expect(
        screen.getByText(ERROR_MESSAGES.rarity.required)
      ).toBeInTheDocument();
      expect(
        screen.getByText(ERROR_MESSAGES.health.outOfRange)
      ).toBeInTheDocument();
      expect(
        screen.getByText(ERROR_MESSAGES.attack.outOfRange)
      ).toBeInTheDocument();
      expect(
        screen.getByText(ERROR_MESSAGES.defense.outOfRange)
      ).toBeInTheDocument();
    });

    it('should call "onSubmit" function with form values when form is valid', async () => {
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "Bulbasaur");
      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));
      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      fireEvent.change(screen.getByRole("slider", { name: /health/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /attack/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /defense/i }), {
        target: { value: 50 },
      });

      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(onSubmit).toHaveBeenCalledWith({
        name: "Bulbasaur",
        type: [2],
        rarity: 6,
        stats: {
          health: 50,
          attack: 50,
          defense: 50,
        },
      });
    });

    it('should clear form when click on "reset" button', async () => {
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "Bulbasaur");
      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));
      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      await userEvent.click(screen.getByRole("button", { name: /reset/i }));

      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(
        screen.getByRole("checkbox", { name: /normal/i })
      ).not.toBeChecked();
      expect(
        screen.getByRole("radio", { name: /legendary/i })
      ).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: /fire/i })).not.toBeChecked();
    });

    it("should display submit error message when submit function throw error", async () => {
      const onSubmit = vi.fn().mockRejectedValueOnce(new Error("test error"));
      customRender(<PokemonForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "Bulbasaur");
      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));

      fireEvent.change(screen.getByRole("slider", { name: /health/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /attack/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /defense/i }), {
        target: { value: 50 },
      });

      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(await screen.findByRole("alert")).toHaveTextContent(/test error/i);
    });

    it("should not be possible to edit for during subbmitting process", async () => {
      const onSubmit = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });
      customRender(<PokemonForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "Bulbasaur");
      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));

      fireEvent.change(screen.getByRole("slider", { name: /health/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /attack/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /defense/i }), {
        target: { value: 50 },
      });

      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByRole("textbox", { name: /name/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();
      expect(screen.getByRole("checkbox", { name: /fire/i })).toBeDisabled();
      expect(screen.getByRole("radio", { name: /Mythical/i })).toBeDisabled();
    });

    it("should disable types section during loading", async () => {
      server.use(
        http.get("http://localhost:8080/types", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json([
            { id: 1, value: "Normal" },
            { id: 2, value: "Fire" },
            { id: 3, value: "Water" },
            { id: 4, value: "Grass" },
            { id: 5, value: "Electric" },
            { id: 6, value: "Ice" },
            { id: 7, value: "Fighting" },
            { id: 8, value: "Poison" },
            { id: 9, value: "Ground" },
            { id: 10, value: "Flying" },
            { id: 11, value: "Psychic" },
            { id: 12, value: "Bug" },
            { id: 13, value: "Rock" },
            { id: 14, value: "Ghost" },
            { id: 15, value: "Dragon" },
            { id: 16, value: "Dark" },
            { id: 17, value: "Steel" },
            { id: 18, value: "Fairy" },
          ]);
        })
      );
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);
      expect(
        screen.getByRole("group", {
          name: /type/i,
        })
      ).toHaveStyle("opacity: 0.5");

      await waitFor(() =>
        expect(
          screen.queryByRole("group", {
            name: /type/i,
          })
        ).toHaveStyle("opacity: 1")
      );
    });

    it("should display retry when types select fail, and retry button should work", async () => {
      let counter = 0;
      server.use(
        //@ts-expect-error - test http error
        http.get("http://localhost:8080/types", () => {
          if (counter === 0) {
            counter++;
            return HttpResponse.json({ error: "test error" }, { status: 500 });
          }
          return HttpResponse.json([
            { id: 1, value: "Normal" },
            { id: 2, value: "Fire" },
            { id: 3, value: "Water" },
            { id: 4, value: "Grass" },
            { id: 5, value: "Electric" },
            { id: 6, value: "Ice" },
            { id: 7, value: "Fighting" },
            { id: 8, value: "Poison" },
            { id: 9, value: "Ground" },
            { id: 10, value: "Flying" },
            { id: 11, value: "Psychic" },
            { id: 12, value: "Bug" },
            { id: 13, value: "Rock" },
            { id: 14, value: "Ghost" },
            { id: 15, value: "Dragon" },
            { id: 16, value: "Dark" },
            { id: 17, value: "Steel" },
            { id: 18, value: "Fairy" },
          ]);
        })
      );
      const onSubmit = vi.fn();
      customRender(<PokemonForm onSubmit={onSubmit} />);

      expect(screen.queryByRole("checkbox", { name: /normal/i }));
      const retryButton = await screen.findByRole("button", { name: /retry/i });
      await userEvent.click(retryButton);
      expect(await screen.findByRole("checkbox", { name: /normal/i }));
    });

    it('should clean form after successfully submit', async () => {
      const onSubmit = vi.fn().mockImplementation(() => {
        return Promise.resolve();
      });
      customRender(<PokemonForm onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "Bulbasaur");
      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));

      fireEvent.change(screen.getByRole("slider", { name: /health/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /attack/i }), {
        target: { value: 50 },
      });

      fireEvent.change(screen.getByRole("slider", { name: /defense/i }), {
        target: { value: 50 },
      });

      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(
        screen.getByRole("checkbox", { name: /normal/i })
      ).not.toBeChecked();
      expect(
        screen.getByRole("radio", { name: /legendary/i })
      ).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: /fire/i })).not.toBeChecked();
    });
  });

  describe("Edit form functionality", () => {
    it("should renders with initial values", async () => {
      const onSubmit = vi.fn();
      const initialValues = {
        name: "Pikachu",
        type: [1, 2],
        rarity: 5,
        stats: {
          health: 23,
          attack: 56,
          defense: 98,
        },
      };
      customRender(
        <PokemonForm initialValues={initialValues} onSubmit={onSubmit} />
      );

      expect(
        await screen.findByRole("checkbox", { name: /normal/i })
      ).toBeChecked();

      expect(
        await screen.findByRole("radio", { name: /legendary/i })
      ).toBeChecked();

      expect(screen.getByRole("checkbox", { name: /fire/i })).toBeChecked();
      expect(screen.getByRole("slider", { name: /health/i })).toHaveValue("23");
      expect(screen.getByRole("slider", { name: /attack/i })).toHaveValue("56");
      expect(screen.getByRole("slider", { name: /defense/i })).toHaveValue(
        "98"
      );
    });

    it("should render fallback component when initial values are provided and not valid sctructure", () => {
      const onSubmit = vi.fn();
      const initialValues = {
        name: "Pikachu",
        type: { name: "test" },
        rarity: 5,
        stats: {
          health: 23,
          attack: 56,
          defense: 98,
        },
      };
      customRender(
        //@ts-expect-error - test invalid initial
        <PokemonForm initialValues={initialValues} onSubmit={onSubmit} />
      );

      expect(screen.getByRole("alert")).toHaveTextContent(/invalid initial/i);
    });

    it('should reset form to the initial values when click on "reset" button', async () => {
      const onSubmit = vi.fn();
      const initialValues = {
        name: "Pikachu",
        type: [1, 2],
        rarity: 5,
        stats: {
          health: 23,
          attack: 56,
          defense: 98,
        },
      };
      customRender(
        <PokemonForm initialValues={initialValues} onSubmit={onSubmit} />
      );
      expect(
        await screen.findByRole("checkbox", { name: /normal/i })
      ).toBeChecked();

      expect(
        await screen.findByRole("radio", { name: /legendary/i })
      ).toBeChecked();

      await userEvent.type(
        screen.getByLabelText(/name/i),
        "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}Bulbasaur"
      );

      await userEvent.click(screen.getByRole("checkbox", { name: /fire/i }));
      await userEvent.click(screen.getByRole("radio", { name: /Mythical/i }));

      expect(screen.getByRole("checkbox", { name: /fire/i })).not.toBeChecked();
      expect(screen.getByRole("radio", { name: /Mythical/i })).toBeChecked();
      expect(screen.getByLabelText(/name/i)).toHaveValue("Bulbasaur");

      await userEvent.click(screen.getByRole("button", { name: /reset/i }));

      expect(screen.getByLabelText(/name/i)).toHaveValue("Pikachu");
      expect(screen.getByRole("checkbox", { name: /normal/i })).toBeChecked();
      expect(screen.getByRole("radio", { name: /legendary/i })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: /fire/i })).toBeChecked();
    });
  });
});
