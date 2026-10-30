import { Alert, Button } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AlertExtra() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Alert
      title="Your draft is saved"
      description={showDetails ? 'Continue editing when you reopen the page.' : undefined}
      extra={
        <Button variant="link" onClick={() => setShowDetails((value) => !value)}>
          {showDetails ? 'Hide details' : 'View details'}
        </Button>
      }
      closable
    />
  );
}
