import { ConfigProvider, Form, FormField, type FormProps } from '../src';
import type { FormProps as SubpathFormProps } from '../src/form';

export function formWidthTypeContracts() {
  const props: FormProps = { labelWidth: 140 };
  const subpath: SubpathFormProps = props;
  const form = <Form {...subpath} />;
  const field = <FormField labelWidth={80} />;
  const defaults = <ConfigProvider components={{ Form: props, FormField: { labelWidth: 80 } }} />;
  // @ts-expect-error Automatic label measurement is no longer supported.
  const automatic = <Form labelWidth="auto" />;
  // @ts-expect-error Widths must be pixel numbers, not CSS strings.
  const cssWidth = <Form labelWidth="112px" />;
  // @ts-expect-error Regional defaults cannot re-enable automatic label measurement.
  const automaticDefaults = <ConfigProvider components={{ Form: { labelWidth: 'auto' } }} />;
  // @ts-expect-error Field overrides also require pixel numbers.
  const automaticField = <FormField labelWidth="auto" />;
  return { form, field, defaults, automatic, cssWidth, automaticDefaults, automaticField };
}
