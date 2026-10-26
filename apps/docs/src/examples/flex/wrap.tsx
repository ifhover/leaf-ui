import { Flex, Tag } from '@ifhover/leaf-ui';

export function FlexWrap() {
  return (
    <Flex gap={[12, 16]} wrap>
      {['需求调研', '设计', '开发', '测试', '评审', '发布', '监控', '支持'].map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </Flex>
  );
}
