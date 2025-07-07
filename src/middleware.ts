import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// IP → ID tracking (optional)
const ipToId = new Map<string, number>();
let ipCounter = 0;

// Log file setup
const logFilePath = path.resolve('logs/users.log');
fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

// Cookie name for tracking
const COOKIE_NAME = 'api-traffic-analyzer_uid';

export function logAnalyzer(req: Request, res: Response, next: NextFunction) {
  // Handle IP normalization
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  const ip = rawIp === '::1' ? '127.0.0.1' : rawIp;

  // Track IPs (optional)
  if (!ipToId.has(ip)) {
    ipToId.set(ip, ipCounter++);
  }
  const ipId = ipToId.get(ip);

  // Check for user ID in cookie
  let userId = req.cookies?.[COOKIE_NAME];

  // If not present, generate one and set the cookie
  if (!userId) {
    userId = crypto.randomUUID();
    res.cookie(COOKIE_NAME, userId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Log entry
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();

  const logLine = `${timestamp} ip=${ip} ip_id=${ipId} user_id=${userId} ${method} ${url}\n`;
  fs.appendFileSync(logFilePath, logLine);

  next();
}
