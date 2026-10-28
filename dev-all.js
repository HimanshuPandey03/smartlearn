import { spawn } from 'child_process';

console.log('🚀 Starting SmartLearn Fullstack (Backend + Frontend)...');

const server = spawn('node', ['server/index.js'], { stdio: 'inherit' });
const vite = spawn('npx', ['vite'], { stdio: 'inherit' });

function cleanExit() {
  try { server.kill(); } catch (e) {}
  try { vite.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
