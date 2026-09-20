/**
 * Instagram Proxy Server Startup Script
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Instagram Proxy Server...');

// Install dependencies if needed
const installProcess = spawn('npm', ['install'], {
    cwd: __dirname,
    stdio: 'inherit'
});

installProcess.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }
    
    console.log('✅ Dependencies installed');
    
    // Start the proxy server
    const serverProcess = spawn('node', ['instagram-proxy.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    serverProcess.on('close', (code) => {
        console.log(`Proxy server exited with code ${code}`);
        process.exit(code);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down proxy server...');
        serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down proxy server...');
        serverProcess.kill('SIGTERM');
    });
});
