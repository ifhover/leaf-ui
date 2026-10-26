import { Flex, Tag } from '@ifhover/leaf-ui';

export function FlexWrap() {
  return (
    <Flex gap={[12, 16]} wrap>
      {['Research', 'Design', 'Develop', 'Test', 'Review', 'Release', 'Monitor', 'Support'].map(
        (label) => (
          <Tag key={label}>{label}</Tag>
        ),
      )}
    </Flex>
  );
}
