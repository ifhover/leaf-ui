import { Checkbox, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function CheckboxDisabled() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Unchecked</Text>
      <Flex align="center" wrap>
        <Checkbox disabled>Receive project news</Checkbox>
      </Flex>
      <Text tone="muted">Checked</Text>
      <Flex align="center" wrap>
        <Checkbox disabled defaultChecked>
          Receive project news
        </Checkbox>
      </Flex>
    </Grid>
  );
}
