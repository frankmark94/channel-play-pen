// Simple health check for Docker
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 10000,
  path: '/api/health',
  timeout: 3000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});

request.end();