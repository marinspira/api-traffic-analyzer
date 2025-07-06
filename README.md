# TS Log Analyzer

A simple CLI tool written in **TypeScript** that reads API server logs and reports:

- ✅ Total number of unique users
- 📍 All accessed endpoints
- 🌐 Users grouped by IP address

---

## Log Format

This tool expects logs in the following format, one line per request:

```bash
2025-07-06T12:00:00Z ip=192.168.1.2 user_id=1001 GET /api/login
2025-07-06T12:01:00Z ip=192.168.1.3 user_id=1002 GET /api/products
2025-07-06T12:02:00Z ip=192.168.1.2 user_id=1001 POST /api/orders
2025-07-06T12:03:00Z ip=192.168.1.4 user_id=1003 GET /api/products
2025-07-06T12:04:00Z ip=192.168.1.3 user_id=1002 GET /api/profile
```


