import { Flex, Link, Paragraph, Text, Title, Typography } from '@ifhover/leaf-ui';
export function TypographyBasic() {
  return (
    <Typography>
      <Title level={3}>{'项目说明'}</Title>
      <Paragraph>{'用一致的阅读节奏组织标题、正文和链接。'}</Paragraph>
      <Flex gap="md" align="center" wrap>
        <Text tone="muted">{'今天更新'}</Text>
        <Link href="#typography-api">{'查看 API'}</Link>
      </Flex>
    </Typography>
  );
}
