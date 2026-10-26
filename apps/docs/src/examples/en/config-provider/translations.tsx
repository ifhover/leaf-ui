import {
  ConfigProvider,
  DatePicker,
  Form,
  FormField,
  type LeafTranslations,
  Select,
} from '@ifhover/leaf-ui';

const translations = {
  'fr-FR': {
    datePicker: { placeholder: 'Choisir une date' },
    select: { placeholder: 'Choisir une option', empty: 'Aucun résultat' },
  },
} satisfies LeafTranslations;

export function ConfigProviderTranslations() {
  return (
    <ConfigProvider locale={['fr-FR', 'en-US']} translations={translations}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormField label="Date">
          <DatePicker />
        </FormField>
        <FormField label="Empty options">
          <Select options={[]} />
        </FormField>
      </Form>
    </ConfigProvider>
  );
}
