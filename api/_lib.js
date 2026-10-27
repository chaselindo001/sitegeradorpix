const API = 'https://api.tiggerpayments.com';
exports.API = API;
exports.getApiKey = () => process.env.TIGGERPAY_API_KEY || process.env.BLACKCAT_API_KEY || '';
exports.tp = (p, opts = {}) => {
  const apiKey = exports.getApiKey();
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    ...(opts.headers || {})
  };
  return fetch(API + p, { ...opts, headers });
};
exports.bc = exports.tp;
exports.authed = () => true;
exports.digits = s => String(s || '').replace(/\D/g, '');

