import { ConfigProvider, Form, FormField, type FormProps } from '../src';
import type { FormProps as SubpathFormProps } from '../src/form';

export function formWidthTypeContracts() {
  const props: FormProps = { labelWidth: 140 };
  const subpath: SubpathFormProps = props;
  const form = <Form {...subpath} />;
  const field = <FormField labelWidth={80} />;
  const defaults = <ConfigProvider components={{ Form: props, FormField: { labelWidth: 80 } }} />;
  const cssWidth = <Form labelWidth="112px" />;
  const percentageWidth = <Form labelWidth="20%" />;
  const cssWidthDefaults = <ConfigProvider components={{ Form: { labelWidth: '12rem' } }} />;
  const cssWidthField = <FormField labelWidth="clamp(112px, 20%, 240px)" />;
  return { form, field, defaults, cssWidth, percentageWidth, cssWidthDefaults, cssWidthField };
}
