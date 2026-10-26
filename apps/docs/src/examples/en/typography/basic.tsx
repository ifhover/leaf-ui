import { Flex, Link, Paragraph, Text, Title, Typography } from '@ifhover/leaf-ui';

export function TypographyBasic() {
  return (
    <Typography>
      <Title level={3}>Project notes</Title>
      <Paragraph>
        Organize headings, body text and links with a consistent reading rhythm.
      </Paragraph>
      <Flex gap="md" align="center" wrap>
        <Text tone="muted">Updated today</Text>
        <Link href="#typography-api">Read the API</Link>
      </Flex>
    </Typography>
  );
}
