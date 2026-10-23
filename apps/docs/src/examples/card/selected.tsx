import { Avatar, Button, Card, CardTitle, Flex, Grid, Space, Tag, Text } from '@ifhover/leaf-ui';
import { Check, CircleAlert, Phone, Sparkles, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';

export function CardSelected() {
  const [selected, setSelected] = useState('reassign');
  const descriptionStyle = {
    fontSize: 'var(--leaf-font-size-sm)',
    lineHeight: 'var(--leaf-line-height-sm)',
  };
  const options = [
    {
      key: 'reassign',
      title: '改派给林晓',
      recommended: true,
      details: [
        '距离 6 分钟，预计 13:53 到达',
        '熟悉客户，已完成 2 次服务',
        '可按时赶往下一场预约',
      ],
    },
    {
      key: 'keep',
      title: '保留当前安排',
      recommended: false,
      details: ['预计 14:17 到达，将迟到 17 分钟', '这是本月第 3 次延迟到达'],
    },
  ];
  return (
    <Grid columns={{ xs: 1, md: 2 }} gap={20}>
      {options.map((option) => {
        const active = selected === option.key;
        const Icon = option.recommended ? Check : CircleAlert;
        return (
          <Card key={option.key} selected={active}>
            <Flex direction="column" justify="space-between" gap="lg" style={{ minHeight: 340 }}>
              <Space direction="vertical" align="stretch" size="lg">
                <Flex align="center" justify="space-between" gap="sm" wrap>
                  <CardTitle>{option.title}</CardTitle>
                  {option.recommended && (
                    <Tag dot={false} icon={<Sparkles size={12} />}>
                      推荐
                    </Tag>
                  )}
                </Flex>
                {option.recommended ? (
                  <Flex align="center" gap="sm">
                    <Avatar size="lg" alt="林晓">
                      林
                    </Avatar>
                    <Space direction="vertical" align="start" size={4}>
                      <Text strong>上门护理 · 15:30 前空闲</Text>
                      <Text tone="muted" style={descriptionStyle}>
                        匹配度 88% · 已认证
                      </Text>
                    </Space>
                  </Flex>
                ) : (
                  <Text tone="muted" style={descriptionStyle}>
                    联系陈安尽快出发，并将新的到达时间告知客户。
                  </Text>
                )}
                <Space direction="vertical" align="stretch" size="sm">
                  {option.details.map((detail) => (
                    <Flex key={detail} align="start" gap="sm">
                      <Text tone={option.recommended ? 'success' : 'warning'}>
                        <Icon size={16} aria-hidden="true" />
                      </Text>
                      <Text tone={option.recommended ? 'default' : 'warning'}>{detail}</Text>
                    </Flex>
                  ))}
                </Space>
              </Space>
              <Button
                variant={active ? 'solid' : 'outline'}
                startIcon={option.recommended ? <UserRoundCheck /> : <Phone />}
                aria-pressed={active}
                onClick={() => setSelected(option.key)}
              >
                {option.recommended ? '改派护理员' : '保留当前安排'}
              </Button>
            </Flex>
          </Card>
        );
      })}
    </Grid>
  );
}
