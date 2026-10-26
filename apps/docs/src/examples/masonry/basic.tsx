import { Card, Masonry, Text } from '@ifhover/leaf-ui';

const notes = [
  '记录一个想法。',
  '周末去图书馆，找几本关于植物的书。',
  '散步时发现一条安静的小路，沿途有树荫和可以休息的长椅。',
  '保存一段简短笔记。',
  '把喜欢的文章整理在一起，留出时间慢慢阅读。',
  '为下次旅行列一份清单，记下想去的地方和需要带的东西。',
];

export function MasonryBasic() {
  return (
    <Masonry>
      {notes.map((note, index) => (
        <Card key={note} title={`便笺 ${index + 1}`}>
          <Text>{note}</Text>
        </Card>
      ))}
    </Masonry>
  );
}
