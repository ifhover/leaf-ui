import { Card, Masonry, Text } from '@ifhover/leaf-ui';

const notes = [
  'Write down an idea.',
  'Visit the library this weekend and find a few books about plants.',
  'Found a quiet path on a walk, with shade from the trees and benches to stop and rest.',
  'Save a short note.',
  'Collect favorite articles and set aside some time to read them slowly.',
  'Make a list for the next trip, including places to visit and things to bring.',
];

export function MasonryBasic() {
  return (
    <Masonry>
      {notes.map((note, index) => (
        <Card key={note} title={`Note ${index + 1}`}>
          <Text>{note}</Text>
        </Card>
      ))}
    </Masonry>
  );
}
