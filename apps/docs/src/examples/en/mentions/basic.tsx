import { Mentions } from '@ifhover/leaf-ui';

export function MentionsBasic() {
  return (
    <Mentions
      aria-label="Comment"
      placeholder="Type @ to mention a teammate"
      options={[
        { value: 'ada', label: 'Ada' },
        { value: 'lin', label: 'Lin' },
        { value: 'morgan', label: 'Morgan', disabled: true },
      ]}
    />
  );
}
