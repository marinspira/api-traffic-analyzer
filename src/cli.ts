#!/usr/bin/env node

import { program } from 'commander';
import { analyzeLog } from './analyzer';

program
  .name('log-analyzer')
  .description('Analyze API logs for users, endpoints, and IPs')
  .argument('<logfile>', 'Path to the log file')
  .action((logfile: string) => {
    try {
      const result = analyzeLog(logfile);

      console.log(`\nTotal unique users: ${result.totalUsers}`);

      console.log('\n📍 Endpoints accessed:');
      for (const [endpoint, users] of Object.entries(result.endpoints)) {
        console.log(`- ${endpoint} → ${users.size} user(s): [${[...users].join(', ')}]`);
      }

      console.log('\nUsers by IP:');
      for (const [ip, users] of Object.entries(result.ips)) {
        console.log(`- ${ip} → ${users.size} user(s): [${[...users].join(', ')}]`);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();