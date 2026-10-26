import { Paragraph } from '@ifhover/leaf-ui';

export function TypographyEllipsis() {
  return (
    <Paragraph ellipsis={{ rows: 2, expandable: true }}>
      {
        '项目说明集中记录讨论结论、待确认的问题和后续安排。每次讨论后，将新的记录分享给团队，让成员能够了解事情的来龙去脉、找到最近的变更，并在开始下一项工作前确认彼此的理解一致，避免反复追溯之前的沟通内容。'
      }
    </Paragraph>
  );
}
