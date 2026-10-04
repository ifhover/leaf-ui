import { useEffect, useState } from 'react';
/** Gate browser-only lazy dependencies so SSR never evaluates their modules. */
export function useClient() {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  return client;
}
