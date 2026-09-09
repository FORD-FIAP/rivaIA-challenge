/**
 * Testa se marca/modelo dos nossos veículos (Ford, Mitsubishi, RAM, BYD)
 * existem na base da CarAPI (carapi.app) — dataset gratuito 2015-2020,
 * sem custo, só precisa de cadastro grátis.
 *
 * Como usar:
 *   1. Crie uma conta grátis em https://carapi.app/register
 *   2. No dashboard, gere um API Token e API Secret
 *   3. Rode:
 *        CARAPI_TOKEN=seu_token CARAPI_SECRET=seu_secret node scripts/testCarApiCoverage.js
 *
 * Não sobe nada pro app — é só um teste manual de cobertura, rodado uma vez.
 */

const TOKEN = process.env.CARAPI_TOKEN;
const SECRET = process.env.CARAPI_SECRET;

if (!TOKEN || !SECRET) {
  console.error('Defina CARAPI_TOKEN e CARAPI_SECRET (veja o cabeçalho deste arquivo).');
  process.exit(1);
}

const BASE_URL = 'https://carapi.app/api';

// Marca -> termos de modelo que a gente usa no RIVA, pra ver se aparecem.
const CHECKS = {
  Ford: ['Ranger', 'Territory', 'Maverick', 'F-150', 'Bronco Sport', 'Mustang'],
  Mitsubishi: ['Triton', 'Eclipse Cross', 'Outlander'],
  RAM: ['1500', '2500', '3500'],
  BYD: ['Dolphin', 'Song', 'Seal', 'Han', 'Yuan', 'Tan', 'King'],
};

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_token: TOKEN, api_secret: SECRET }),
  });
  if (!res.ok) throw new Error(`Login falhou: HTTP ${res.status}`);
  return res.text(); // JWT vem como texto puro
}

async function getModels(jwt, make, year) {
  const url = `${BASE_URL}/models/v2?make=${encodeURIComponent(make)}&year=${year}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` } });
  if (!res.ok) {
    console.log(`  (HTTP ${res.status} em ${url})`);
    return [];
  }
  const data = await res.json();
  return (data?.data ?? []).map((m) => m.name);
}

async function main() {
  console.log('Autenticando na CarAPI...');
  const jwt = await login();
  console.log('OK, JWT obtido.\n');

  // Dataset gratuito cobre 2015-2020 — usamos 2020 (ano mais recente livre) como amostra.
  const YEAR = 2020;

  for (const [make, terms] of Object.entries(CHECKS)) {
    console.log(`\n=== ${make} (modelos ${YEAR}) ===`);
    const models = await getModels(jwt, make, YEAR);
    if (models.length === 0) {
      console.log('  (nenhum modelo retornado — marca pode não existir na base, ou ano fora do range gratuito)');
      continue;
    }
    console.log(`  ${models.length} modelo(s) encontrado(s):`, models.join(', '));
    for (const term of terms) {
      const match = models.some((m) => m.toLowerCase().includes(term.toLowerCase()));
      console.log(`  ${match ? '✅' : '❌'} ${term}`);
    }
  }
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
