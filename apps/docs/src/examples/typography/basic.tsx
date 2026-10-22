import { Link, Paragraph, Text, Title, Typography } from '@ifhover/leaf-ui';
export function TypographyBasic({ english = false }: { english?: boolean }) {
  return (
    <Typography>
      <Title level={3}>{english ? 'Project notes' : '项目说明'}</Title>
      <Paragraph>
        {english
          ? 'Organize headings, body text and links with a consistent reading rhythm.'
          : '用一致的阅读节奏组织标题、正文和链接。'}
      </Paragraph>
      <Text tone="muted">{english ? 'Updated today' : '今天更新'}</Text>
      {' · '}
      <Link href="#typography-api">{english ? 'Read the API' : '查看 API'}</Link>
    </Typography>
  );
}
