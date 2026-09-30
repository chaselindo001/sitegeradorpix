const { bc, authed } = require('./_lib');
module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({ error: 'Senha incorreta' });
  const id = String(req.query.id || '');
  if (!/^[\w-]+$/.test(id)) return res.status(400).json({ error: 'id inválido' });
  try {
    const r = await bc(`/sales/${id}/status`);
    const j = await r.json();
    res.status(r.status).json(j.data ? { status: j.data.status, paidAt: j.data.paidAt } : { error: j.message || 'Erro' });
  } catch { res.status(502).json({ error: 'Falha ao consultar' }); }
};
