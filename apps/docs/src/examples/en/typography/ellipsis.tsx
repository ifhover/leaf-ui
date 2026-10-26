import { Paragraph } from '@ifhover/leaf-ui';

export function TypographyEllipsis() {
  return (
    <Paragraph ellipsis={{ rows: 2, expandable: true }}>
      Project notes collect decisions, open questions and next steps in one place. Share them with
      the team after each discussion so everyone can review the context, find the latest changes and
      continue the work without repeating earlier conversations.
    </Paragraph>
  );
}
