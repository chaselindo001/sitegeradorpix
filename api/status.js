const { tp, getApiKey } = require('./_lib');

module.exports = async (req, res) => {

  const id = String(req.query.id || '');
  if (!/^[\w-]+$/.test(id)) return res.status(400).json({ error: 'id inválido' });

  const apiKey = getApiKey();
  if (!apiKey) return res.status(500).json({ error: 'TIGGERPAY_API_KEY não configurada na Vercel' });

  try {
    const r = await tp(`/api/verificar-pix/${encodeURIComponent(id)}`);
    const j = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: j.error || j.message || 'Erro ao consultar status' });
    }

    let status = 'PENDING';
    if (j.status === 'approved' || j.status === 'paid' || j.status === 'PAID') {
      status = 'PAID';
    } else if (j.status === 'refused' || j.status === 'cancelled' || j.status === 'expired') {
      status = 'CANCELLED';
    } else if (j.status === 'waiting_payment' || j.status === 'pendente' || j.status === 'PENDING') {
      status = 'PENDING';
    } else {
      status = j.status || 'PENDING';
    }

    res.status(200).json({
      status,
      rawStatus: j.status,
      paidAt: j.paidAt || (status === 'PAID' ? new Date().toISOString() : null),
      valor: j.valor,
    });
  } catch {
    res.status(502).json({ error: 'Falha ao consultar a TiggerPay' });
  }
};
