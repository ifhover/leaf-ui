import { Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TypographyEditable() {
  const [text, setText] = useState('Project notes');
  return <Text editable={{ onChange: setText }}>{text}</Text>;
}
