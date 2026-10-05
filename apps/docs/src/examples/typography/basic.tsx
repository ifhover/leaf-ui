import { Link, Paragraph, Text, Title, Typography } from '@sudden3/leaf-ui';
import { useState } from 'react';

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
export function TypographyActions({ english = false }: { english?: boolean }) {
  const [text, setText] = useState('Leaf workspace');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Text copyable editable={{ onChange: setText }}>
        {text}
      </Text>
      <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ maxWidth: 320 }}>
        {english
          ? 'A workspace helps the team organize projects and share useful information. Keep the most important content visible, then expand the paragraph when more detail is needed.'
          : '工作区帮助团队整理项目并分享有用的信息。先展示最重要的内容，阅读者需要更多细节时，可以展开段落查看完整说明。'}
      </Paragraph>
    </div>
  );
}
