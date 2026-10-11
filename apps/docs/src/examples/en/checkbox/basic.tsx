import { Checkbox, Space } from '@ifhover/leaf-ui';

export function CheckboxBasic() {
  return (
    <Space wrap>
      <Checkbox defaultChecked>Receive project news</Checkbox>
      <Checkbox>Receive weekly updates</Checkbox>
      <Checkbox disabled>Unavailable</Checkbox>
      <Checkbox disabled defaultChecked>
        Locked
      </Checkbox>
    </Space>
  );
}
