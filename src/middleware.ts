import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Keep IP->ID map and counter in module scope (will persist while server runs)
const ipToId = new Map<string, number>();
let ipCounter = 0;

const logFilePath = path.resolve('logs/users.log');
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

export function logAnalyzer(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!ipToId.has(ip)) {
    ipToId.set(ip, ipCounter++);
  }

  const ipId = ipToId.get(ip);
  const userId = req.headers['user-id'] || 'unknown';
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();

  const logLine = `${timestamp} ip=${ip} ip_id=${ipId} user_id=${userId} ${method} ${url}\n`;
  fs.appendFileSync(logFilePath, logLine);

  next();
}
