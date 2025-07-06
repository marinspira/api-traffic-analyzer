import fs from 'fs';
import path from 'path';

export interface LogResult {
  totalUsers: number;
  endpoints: Record<string, Set<string>>;
  ips: Record<string, Set<string>>;
}

export function analyzeLog(filePath: string): LogResult {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  const lines = content.split('\n').filter(Boolean);

  const users = new Set<string>();
  const endpointMap: Record<string, Set<string>> = {};
  const ipMap: Record<string, Set<string>> = {};

  lines.forEach((line) => {
    const userMatch = line.match(/user_id=(\d+)/);
    const endpointMatch = line.match(/(GET|POST|PUT|DELETE) (\/[^\s]+)/);
    const ipMatch = line.match(/ip=([0-9.]+)/);

    if (userMatch && endpointMatch && ipMatch) {
      const userId = userMatch[1];
      const endpoint = endpointMatch[2];
      const ip = ipMatch[1];

      users.add(userId);

      endpointMap[endpoint] ||= new Set();
      endpointMap[endpoint].add(userId);

      ipMap[ip] ||= new Set();
      ipMap[ip].add(userId);
    }
  });

  return {
    totalUsers: users.size,
    endpoints: endpointMap,
    ips: ipMap,
  };
}
