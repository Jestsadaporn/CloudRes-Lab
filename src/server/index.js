import { createAppServer } from './app.js';

const rawPort = process.env.PORT ?? '3000';
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port > 65535) {
  console.error('PORT must be a whole number between 0 and 65535.');
  process.exit(1);
}

const server = createAppServer();

server.on('error', (error) => {
  console.error(`Application failed to listen: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, '0.0.0.0', () => {
  const listeningPort = server.address().port;
  console.log(`CloudRes Lab listening on 0.0.0.0:${listeningPort}`);
  console.log(`Local URL: http://localhost:${listeningPort}`);
});
