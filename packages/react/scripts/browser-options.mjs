import path from 'node:path';

export function browserOptions(env = process.env) {
  const port = Number(env.LEAF_TEST_PORT ?? 4178);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('LEAF_TEST_PORT must be an integer between 1024 and 65535.');
  const run = env.LEAF_TEST_RUN ?? `${Date.now()}-${process.pid}`;
  if (!/^[a-zA-Z0-9_-]+$/u.test(run))
    throw new Error('LEAF_TEST_RUN may only contain letters, numbers, underscores and hyphens.');
  return {
    port,
    run,
    baseURL: `http://127.0.0.1:${port}`,
    directory: path.resolve(import.meta.dirname, '..', '.quality', 'browser', run),
  };
}
