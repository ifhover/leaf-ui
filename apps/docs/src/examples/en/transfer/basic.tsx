import { Flex, Transfer, type TransferItem } from '@ifhover/leaf-ui';

const items: TransferItem[] = [
  { key: '1', label: 'Resource 1' },
  { key: '2', label: 'Resource 2' },
  { key: '3', label: 'Resource 3' },
  { key: '4', label: 'Resource 4' },
  { key: '5', label: 'Resource 5', disabled: true },
  { key: '6', label: 'Resource 6' },
];

export function TransferBasic() {
  return (
    <Flex justify="center">
      <Transfer items={items} defaultValue={['2', '4']} />
    </Flex>
  );
}
