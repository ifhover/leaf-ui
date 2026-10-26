import { Result, Text } from '@ifhover/leaf-ui';
import { Archive } from 'lucide-react';

export function ResultCustom() {
  return (
    <Result
      status="success"
      title="文件已归档"
      description="归档内容可在文件列表中查看。"
      icon={<Archive />}
    >
      <Text>归档文件：季度报告.pdf</Text>
    </Result>
  );
}
