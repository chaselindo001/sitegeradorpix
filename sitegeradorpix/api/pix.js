const { bc, authed, digits } = require('./_lib');

// Tudo automático: só o valor é obrigatório. Dados do cliente vêm das variáveis da Vercel.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!authed(req)) return res.status(401).json({ error: 'Senha incorreta' });
  if (!process.env.BLACKCAT_API_KEY) return res.status(500).json({ error: 'BLACKCAT_API_KEY não configurada na Vercel' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const cents = Math.round(Number(b.valor) * 100);
  if (!Number.isFinite(cents) || cents < 100) return res.status(400).json({ error: 'Informe um valor válido (mínimo R$ 1,00)' });

  const doc = digits(b.cpf) || digits(process.env.CUSTOMER_CPF);
  if (!doc) return res.status(500).json({ error: 'Configure CUSTOMER_CPF na Vercel' });

  const payload = {
    amount: cents, currency: 'BRL', paymentMethod: 'pix',
    items: [{ title: (b.descricao || 'Pagamento').slice(0, 100), unitPrice: cents, quantity: 1, tangible: false }],
    customer: {
      name: b.nome || process.env.CUSTOMER_NAME || 'Cliente',
      email: b.email || process.env.CUSTOMER_EMAIL || 'cliente@email.com',
      phone: digits(b.telefone) || digits(process.env.CUSTOMER_PHONE) || '11999999999',
      document: { number: doc, type: doc.length > 11 ? 'cnpj' : 'cpf' },
    },
    pix: { expiresInDays: 1 },
    externalRef: 'GEN-' + Date.now(),
  };
  try {
    const r = await bc('/sales/create-sale', { method: 'POST', body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok || !j.success) return res.status(r.status || 502).json({ error: j.error || j.message || 'Erro na API' });
    const d = j.data;
    res.json({ id: d.transactionId, status: d.status, valor: d.amount / 100, copiaECola: d.paymentData.copyPaste,
      qrCode: d.paymentData.qrCodeBase64, expiraEm: d.paymentData.expiresAt });
  } catch { res.status(502).json({ error: 'Falha ao contatar a Blackcat' }); }
};
