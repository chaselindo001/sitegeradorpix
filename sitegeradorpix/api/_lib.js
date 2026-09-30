const API = 'https://api.blackcatoficial.com/api';
exports.API = API;
exports.bc = (p, opts = {}) => fetch(API + p, { ...opts, headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.BLACKCAT_API_KEY } });
exports.authed = req => !process.env.APP_PASSWORD || req.headers['x-app-password'] === process.env.APP_PASSWORD;
exports.digits = s => String(s || '').replace(/\D/g, '');
