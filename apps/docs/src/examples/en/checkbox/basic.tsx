import { Checkbox } from '@sudden3/leaf-ui';

export function CheckboxBasic() {
  return (
    <>
      <Checkbox defaultChecked>Receive project news</Checkbox>
      <Checkbox>Receive weekly updates</Checkbox>
      <Checkbox disabled>Unavailable</Checkbox>
      <Checkbox disabled defaultChecked>
        Locked
      </Checkbox>
    </>
  );
}
