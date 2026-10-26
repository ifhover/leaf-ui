export function browserOptions(env?: Record<string, string | undefined>): {
  port: number;
  run: string;
  baseURL: string;
  directory: string;
};
