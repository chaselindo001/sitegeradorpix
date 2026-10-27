const { tp, digits, getApiKey } = require('./_lib');

// Tudo automático: só o valor é obrigatório. Dados do cliente vêm das variáveis da Vercel.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const apiKey = getApiKey();
  if (!apiKey) return res.status(500).json({ error: 'TIGGERPAY_API_KEY não configurada na Vercel' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const cents = Math.round(Number(b.valor) * 100);
  if (!Number.isFinite(cents) || cents < 100) return res.status(400).json({ error: 'Informe um valor válido (mínimo R$ 1,00)' });

  const doc = digits(b.cpf) || digits(process.env.CUSTOMER_CPF);
  const phone = digits(b.telefone) || digits(process.env.CUSTOMER_PHONE);

  const customer = {
    name: (b.nome || process.env.CUSTOMER_NAME || 'Cliente').trim(),
    email: (b.email || process.env.CUSTOMER_EMAIL || 'cliente@email.com').trim(),
  };
  if (phone) customer.cellphone = phone;
  if (doc) customer.taxId = doc;

  const payload = {
    amount: cents,
    description: (b.descricao || 'Pagamento').slice(0, 100),
    api_key: apiKey,
    customer,
  };

  try {
    const r = await tp('/create-pix-duck', { method: 'POST', body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok || j.error) return res.status(r.status >= 400 ? r.status : 502).json({ error: j.error || j.message || 'Erro ao gerar PIX' });

    const copiaECola = j.pix_code || j.pix_qr_code;
    res.json({
      id: j.txid,
      status: 'PENDING',
      valor: cents / 100,
      copiaECola,
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(copiaECola),
      expiraEm: null,
    });
  } catch {
    res.status(502).json({ error: 'Falha ao contatar a TiggerPay' });
  }
};
