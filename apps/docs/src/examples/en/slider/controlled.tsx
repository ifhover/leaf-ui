import { Button, Flex, Form, FormField, Slider, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SliderControlled() {
  const [value, setValue] = useState(35);
  const [completed, setCompleted] = useState(35);

  return (
    <Form
      layout="vertical"
      onReset={() => {
        setValue(35);
        setCompleted(35);
      }}
    >
      <FormField label="Volume" help={`Current value: ${value}`}>
        <Slider
          name="volume"
          value={value}
          onChange={setValue}
          onChangeComplete={(next) => {
            if (typeof next === 'number') setCompleted(next);
          }}
        />
      </FormField>
      <Text tone="muted" role="status">
        Committed: {completed}
      </Text>
      <Flex align="center">
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </Flex>
    </Form>
  );
}
