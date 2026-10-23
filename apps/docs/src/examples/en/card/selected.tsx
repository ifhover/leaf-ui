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
      title: 'Reassign to Lin Xiao',
      recommended: true,
      details: [
        '6 min away, arrives at 1:53 PM',
        'Knows the client · 2 previous visits',
        'On time for the next appointment',
      ],
    },
    {
      key: 'keep',
      title: 'Keep the current plan',
      recommended: false,
      details: ['Arrives at 2:17 PM, 17 min late', 'Third late arrival this month'],
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
                      Suggested
                    </Tag>
                  )}
                </Flex>
                {option.recommended ? (
                  <Flex align="center" gap="sm">
                    <Avatar size="lg" alt="Lin Xiao">
                      LX
                    </Avatar>
                    <Space direction="vertical" align="start" size={4}>
                      <Text strong>Home care · Available until 3:30 PM</Text>
                      <Text tone="muted" style={descriptionStyle}>
                        88% match · Verified
                      </Text>
                    </Space>
                  </Flex>
                ) : (
                  <Text tone="muted" style={descriptionStyle}>
                    Ask Chen An to leave now and let the client know the new arrival time.
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
                {option.recommended ? 'Reassign caregiver' : 'Keep current plan'}
              </Button>
            </Flex>
          </Card>
        );
      })}
    </Grid>
  );
}
