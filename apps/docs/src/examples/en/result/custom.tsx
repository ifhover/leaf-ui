import { Result } from '@sudden3/leaf-ui';
import { Leaf } from 'lucide-react';
export function ResultCustom() {
  return (
    <Result
      title="Let your ideas grow"
      description="Replace the icon, content and actions to suit your workflow."
      icon={<Leaf />}
    >
      <p>Add next steps, issue details or other helpful information here.</p>
    </Result>
  );
}
