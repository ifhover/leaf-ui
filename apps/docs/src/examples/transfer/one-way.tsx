import { Flex, Transfer, type TransferItem } from '@ifhover/leaf-ui';

const items: TransferItem[] = [
  { key: '1', label: '资源 1' },
  { key: '2', label: '资源 2' },
  { key: '3', label: '资源 3' },
  { key: '4', label: '资源 4' },
  { key: '5', label: '资源 5', disabled: true },
  { key: '6', label: '资源 6' },
];

export function TransferOneWay() {
  return (
    <Flex justify="center">
      <Transfer items={items} defaultValue={['2', '4']} oneWay />
    </Flex>
  );
}
