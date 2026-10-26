import { Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TypographyActions({ english = false }: { english?: boolean }) {
  const [text, setText] = useState(english ? 'Project notes' : '项目说明');
  return (
    <Text copyable editable={{ onChange: setText }}>
      {text}
    </Text>
  );
}
