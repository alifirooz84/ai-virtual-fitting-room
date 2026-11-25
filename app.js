// cPanel Node.js Application Startup File
// Multi-Store AI Virtual Fitting Room Backend v2.0
process.chdir(__dirname);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log('[cPanel Startup] Application Directory:', __dirname);
console.log('[cPanel Startup] Server Port:', process.env.PORT);

require('./dist/server.cjs');
