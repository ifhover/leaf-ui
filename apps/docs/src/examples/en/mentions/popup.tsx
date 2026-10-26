import { Mentions } from '@ifhover/leaf-ui';

export function MentionsPopup() {
  return (
    <Mentions
      aria-label="Content-sized mention suggestions"
      placeholder="Type @ to see suggestions"
      popupWidth="auto"
      popupMaxWidth={280}
      options={[
        { value: 'design', label: 'Design team' },
        { value: 'engineering', label: 'Engineering team' },
      ]}
    />
  );
}
