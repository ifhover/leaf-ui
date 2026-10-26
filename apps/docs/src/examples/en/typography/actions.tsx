import { Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TypographyActions() {
  const [text, setText] = useState('Project notes');
  return (
    <Text copyable editable={{ onChange: setText }}>
      {text}
    </Text>
  );
}
