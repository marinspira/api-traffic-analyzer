# api-traffic-analyzer Middleware Library

## Overview

Track and analyze who’s using your API, how often, and from where.

api-traffic-analyzer is a lightweight Express middleware + CLI tool that helps you:

- Monitor unique visitors by IP (with auto-assigned numeric IDs)
- Optionally identify users with persistent cookies
- Automatically log each request's timestamp, IP, user ID, method, and endpoint
- Store logs in a simple text format for later analysis
- Use a CLI tool to inspect API traffic and usage patterns


## Features
- Easy to drop into any Express-based app
- In-memory IP-to-ID mapping for tracking sessions
- Cookie-based user fingerprinting (optional, configurable)
- CLI support to analyze usage per endpoint, per user, per IP

-----------------

## How It Works

- When a request hits your Express server and passes through the `logAnalyzer` middleware:
  - The client’s IP is extracted.
  - If the IP is new, it is assigned a new unique numeric ID (`0`, `1`, `2`, ...).
  - Request metadata including timestamp, IP, IP ID, user ID (from request header), HTTP method, and endpoint are logged to a file (`logs/users.log` by default).
- The library maintains an **in-memory mapping** of IPs to their assigned IDs while the server is running.
- Logs can be later analyzed by your companion CLI tool or other analysis utilities.

------------------

## Installation

```bash
npm install api-traffic-analyzer
npm install express          # Peer dependency, if not already installed
npm install --save-dev @types/express
```

### Usage

1 - Import and apply the middleware in your `index.js` file in your Express.js app or router:

```bash
import express from 'express';
import { logAnalyzer } from 'api-traffic-analyzer';

const app = express();

app.use(logAnalyzer);  // Logs all requests on every route

app.get('/api/products', (req, res) => {
  res.json({ message: 'Products list' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

Or apply selectively on specific routes:

```bash
import express from 'express';
import { logAnalyzer } from 'api-traffic-analyzer';

router.get('/events', logAnalyzer, (req, res) => {
  res.send('Events data');
});
```

2 - Add a user-id header in requests to track users. 
If user-id is missing, it defaults to "unknown" in logs.

The middleware looks for user-id in request headers:

```bash
GET /api/products HTTP/1.1
Host: example.com
user-id: 1001
```

3 - Logs are saved at `logs/users.log`

Example log line:
```bash
2025-07-06T12:00:00Z ip=192.168.1.2 ip_id=0 user_id=[cookie_or_header_user_id] GET /api/login
```

4 - Add `analyze` into your scripts in the folder `package.json` to be able to run `npm run analyze` and see the logs details.

```bash
"scripts": {
    "analyze": "node ./node_modules/api-traffic-analyzer/dist/cli.js logs/users.log",
  }
```

Run `npm run analyze` and make requests in your application or in the endpoints you added it. The output should be something like:

```bash
Total unique users: 1

📍 Endpoints accessed:
- /api/login → 1 user(s): [1001]

Users by IP:
- 192.168.1.2 → 1 user(s): [1001]
```

----------

## 🍪 Optional: Cookie-based user tracking

If your API doesn’t already provide a `user-id` in the request headers (such as authenticated sessions or tokens), the `api-traffic-analyzer` can **automatically generate and assign a unique user ID via cookies**.

This allows you to identify unique users across multiple requests **even without authentication**.

---

### Why use cookies?

Without a user ID in the request header, tracking how many unique users access your API would be based solely on IP addresses—which can change or be shared. To improve accuracy, the middleware sets a persistent cookie (`api-traffic-analyzer_uid`) with a unique UUID for each client.

### Setup Steps

1 - **Install [`cookie-parser`](https://www.npmjs.com/package/cookie-parser):**

```bash
npm install cookie-parser
```

2 - Apply it before logAnalyzer in your Express app:

```bash
import express from 'express';
import cookieParser from 'cookie-parser';
import { logAnalyzer } from 'api-traffic-analyzer';

app.use(cookieParser());   // 👈 Required for cookie-based tracking
app.use(logAnalyzer);      // Now supports automatic user ID via cookies

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### About the Cookie
- Name: `api-traffic-analyzer_uid`
- Type: httpOnly (not accessible from client-side JavaScript)
- Duration: 1 year
- Purpose: Identify unique users anonymously in your log file

## Example Log Entry With Cookie
```bash
2025-07-06T21:03:55.560Z ip=192.168.1.2 ip_id=0 user_id=3c80a32b-021c-4aa3-a867-22fc3a90e924 GET /api-docs/
```

If your app already sets a user-id in headers, this cookie-based fallback will not override it—it’s completely optional.