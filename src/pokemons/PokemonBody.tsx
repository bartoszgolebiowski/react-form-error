import * as React from "react";

import { useForm } from "./form";
import FieldError from "./FieldError";
import OptionsError from "./OptionsError";

type Props = {
  children: React.ReactElement<{ isValid: boolean }>;
};

const PokemonBody = (props: Props) => {
  const { children } = props;
  const form = useForm();

  return (
    <div>
      <label style={{ display: "flex", flexDirection: "column" }}>
        {form.labels.name}
        <input {...form.fields.name} />
      </label>
      {form.errors.name ? <FieldError {...form.errors.name} /> : null}
      <fieldset
        disabled={form.options.type.isLoading}
        style={{
          border: form.options.type.isError ? "1px red solid" : "",
          opacity: form.options.type.isLoading ? 0.5 : 1,
        }}
      >
        <legend>{form.labels.type}</legend>
        {form.options.type.options.map((option) => (
          <label key={option.value}>
            <input
              {...form.fields.type}
              value={option.id}
              checked={form.fields.type.value.includes(option.id)}
            />
            {option.value}
          </label>
        ))}
        {form.options.type.isError ? (
          <OptionsError retry={form.options.type.retry} />
        ) : null}
        {form.errors.type ? <FieldError {...form.errors.type} /> : null}
      </fieldset>
      <fieldset
        disabled={form.options.rarity.isLoading}
        style={{
          border: form.options.rarity.isError ? "1px red solid" : "",
          opacity: form.options.rarity.isLoading ? 0.5 : 1,
        }}
      >
        <legend>{form.labels.rarity}</legend>
        {form.options.rarity.options.map((option) => (
          <label key={option.value}>
            <input
              {...form.fields.rarity}
              value={option.id}
              checked={form.fields.rarity.value === option.id}
            />
            {option.value}
          </label>
        ))}
        {form.options.rarity.isError ? (
          <OptionsError retry={form.options.rarity.retry} />
        ) : null}
        {form.errors.rarity ? <FieldError {...form.errors.rarity} /> : null}
      </fieldset>
      <fieldset style={{ display: "flex", flexDirection: "column" }}>
        <legend>{form.labels.stats}</legend>
        <label>
          {form.labels.health}
          <input {...form.fields.health} />
        </label>
        <label>
          {form.labels.attack}
          <input {...form.fields.attack} />
        </label>
        <label>
          {form.labels.defense}
          <input {...form.fields.defense} />
        </label>
        {form.errors.health ? <FieldError {...form.errors.health} /> : null}
        {form.errors.attack ? <FieldError {...form.errors.attack} /> : null}
        {form.errors.defense ? <FieldError {...form.errors.defense} /> : null}
      </fieldset>
      {React.cloneElement(children, {
        isValid: form.isValid,
      })}
    </div>
  );
};

export default PokemonBody;
