# Gerador de PIX (TiggerPay) — Vercel

1. Suba este repo e importe na Vercel (Framework: Other, sem build).
2. Em Settings → Environment Variables cadastre:
   - `TIGGERPAY_API_KEY`: sua chave de API da TiggerPay (`tiggerpay_apikey_...`)
   - `CUSTOMER_NAME`: (opcional) nome padrão do cliente (padrão: `Cliente`)
   - `CUSTOMER_EMAIL`: (opcional) e-mail padrão do cliente (padrão: `cliente@email.com`)
   - `CUSTOMER_CPF`: (opcional) CPF ou CNPJ padrão do cliente
   - `CUSTOMER_PHONE`: (opcional) telefone padrão do cliente
3. Deploy. Abra o site, digite o valor, copie o PIX.

A chave nunca vai para o front-end nem para o GitHub.
