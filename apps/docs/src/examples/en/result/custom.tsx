import { Result, Text } from '@ifhover/leaf-ui';
import { Archive } from 'lucide-react';

export function ResultCustom() {
  return (
    <Result
      status="success"
      title="File archived"
      description="Find the archived file in the file list."
      icon={<Archive />}
    >
      <Text>Archived file: quarterly-report.pdf</Text>
    </Result>
  );
}
