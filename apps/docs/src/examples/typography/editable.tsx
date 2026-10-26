import { Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TypographyEditable() {
  const [text, setText] = useState('项目说明');
  return <Text editable={{ onChange: setText }}>{text}</Text>;
}
