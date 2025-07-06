#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';

program
  .name('ts-log-analyzer')
  .description('Analyze API logs for users, endpoints, and IPs')
  .argument('<logfile>', 'Path to the log file')
  .action((logfile: string) => {
    const filePath = path.resolve(logfile);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    const users = new Set<string>();
    const endpointMap: Record<string, Set<string>> = {};
    const ipMap: Record<string, Set<string>> = {};

    lines.forEach((line, index) => {
      const userMatch = line.match(/user_id=(\d+)/);
      const endpointMatch = line.match(/(GET|POST|PUT|DELETE) (\/[^\s]+)/);
      const ipMatch = line.match(/ip=([0-9.]+)/);

      if (userMatch && endpointMatch && ipMatch) {
        const userId = userMatch[1];
        const endpoint = endpointMatch[2];
        const ip = ipMatch[1];

        users.add(userId);

        if (!endpointMap[endpoint]) {
          endpointMap[endpoint] = new Set();
        }
        endpointMap[endpoint].add(userId);

        if (!ipMap[ip]) {
          ipMap[ip] = new Set();
        }
        ipMap[ip].add(userId);
      } else {
        console.warn(`Skipped invalid line ${index + 1}: ${line}`);
      }
    });

    console.log(`\nTotal unique users: ${users.size}`);

    console.log('\n ---- Endpoints accessed: ---- ');
    for (const [endpoint, userSet] of Object.entries(endpointMap)) {
      console.log(`- ${endpoint} → ${userSet.size} user(s): [${[...userSet].join(', ')}]`);
    }

    console.log('\n ---- Users by IP: ----');
    for (const [ip, userSet] of Object.entries(ipMap)) {
      console.log(`- ${ip} → ${userSet.size} user(s): [${[...userSet].join(', ')}]`);
    }
  });

program.parse();
