#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';

program
  .name('log-analyzer')
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
      const ipMatch = line.match(/ip=([^\s]+)/);
      const userIdMatch = line.match(/user_id=([^\s]+)/);
      const endpointMatch = line.match(/\b(GET|POST|PUT|DELETE|PATCH)\b\s+([^\s]+)/);

      if (ipMatch && userIdMatch && endpointMatch) {
        const ip = ipMatch[1];
        const userId = userIdMatch[1];
        const endpoint = `${endpointMatch[1]} ${endpointMatch[2]}`;

        users.add(userId);

        if (!endpointMap[endpoint]) endpointMap[endpoint] = new Set();
        endpointMap[endpoint].add(userId);

        if (!ipMap[ip]) ipMap[ip] = new Set();
        ipMap[ip].add(userId);
      } else {
        console.warn(`⚠️  Skipped invalid line ${index + 1}: ${line}`);
      }
    });

    console.log(`\n👥 Total unique users: ${users.size}`);

    console.log('\n📍 Endpoints accessed:');
    for (const [endpoint, userSet] of Object.entries(endpointMap)) {
      console.log(`- ${endpoint} → ${userSet.size} user(s): [${[...userSet].join(', ')}]`);
    }

    console.log('\n🌐 Users by IP:');
    for (const [ip, userSet] of Object.entries(ipMap)) {
      console.log(`- ${ip} → ${userSet.size} user(s): [${[...userSet].join(', ')}]`);
    }
  });

program.parse();
