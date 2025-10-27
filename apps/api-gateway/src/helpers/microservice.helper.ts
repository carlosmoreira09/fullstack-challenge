export function parseTcpUrl(url: string): { host: string; port: number } {
  // Parse URLs like "tcp://auth-service:3002"
  const match = url.match(/tcp:\/\/([^:]+):(\d+)/);
  if (!match) {
    throw new Error(`Invalid TCP URL format: ${url}`);
  }
  return {
    host: match[1],
    port: parseInt(match[2], 10),
  };
}

export function getMicroserviceConfig(
  envVar: string,
  defaultHost: string,
  defaultPort: number,
) {
  const url = process.env[envVar];
  if (url) {
    return parseTcpUrl(url);
  }
  return { host: defaultHost, port: defaultPort };
}
