import { createHash } from 'node:crypto';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const aliases = new Map([
  ['asad', 'asad'], ['assad', 'asad'],
  ['lattafa asad', 'asad'], ['asad lattafa', 'asad'],
]);

function invalid(message) {
  throw new ApiError(400, 'ENTRADA_INVALIDA', message);
}

function name(value, field) {
  if (typeof value !== 'string' || value.length > 120 ||
      /[\p{Cc}\p{Cf}]/u.test(value)) invalid(field + ' inválido.');
  const clean = value.trim().replace(/\s+/g, ' ');
  if (clean.length < 2 || clean.length > 100 ||
      !/^[\p{L}\p{M}\p{N} .'’(),&-]+$/u.test(clean) ||
      (clean.match(/\p{L}/gu) || []).length < 2 ||
      /(?:https?|www)[.:]|(?:\d[\s().-]*){8}/i.test(clean)) {
    invalid(field + ' deve conter somente um nome de fragrância (2–100 caracteres).');
  }
  return clean;
}

export function normalize(value) {
  const normalized = value.normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ').trim()
    .replace(/^contratipo(?: do| de| da)?\s+/, '').trim();
  return aliases.get(normalized) || normalized;
}

export function validateInterest(body, idempotencyKey) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !['referencia', 'nomePesquisado', 'confirmado'].includes(key))) {
    invalid('Envie somente referencia, nomePesquisado e confirmado.');
  }
  if (body.confirmado !== true) invalid('Confirme explicitamente o interesse.');
  if (typeof idempotencyKey !== 'string' || !UUID.test(idempotencyKey)) {
    invalid('Idempotency-Key deve ser um UUID v4.');
  }
  const referenciaInformada = name(body.referencia, 'referencia');
  const nomePesquisado = name(body.nomePesquisado, 'nomePesquisado');
  const referenciaNormalizada = normalize(referenciaInformada);
  if (referenciaNormalizada.length < 2 || referenciaNormalizada === 'contratipo' ||
      normalize(nomePesquisado) !== referenciaNormalizada) {
    invalid('Os nomes devem representar a mesma referência.');
  }
  const payloadHash = createHash('sha256')
    .update(JSON.stringify([referenciaInformada, nomePesquisado, true])).digest('hex');
  return {
    rowKey: idempotencyKey.toLowerCase(), tipo: 'interesse',
    referenciaInformada, nomePesquisado, referenciaNormalizada,
    normalizacaoVersao: 1, payloadHash,
  };
}

export function parseLimit(value) {
  if (value === null) return 20;
  if (!/^[1-9]\d?$|^100$/.test(value)) invalid('limite deve ser inteiro entre 1 e 100.');
  return Number(value);
}

export function rank(rows, limit) {
  const counts = new Map();
  for (const row of rows) {
    counts.set(row.referenciaNormalizada, (counts.get(row.referenciaNormalizada) || 0) + 1);
  }
  const dados = [...counts].map(([referenciaNormalizada, contagem]) => ({ referenciaNormalizada, contagem }))
    .sort((a, b) => b.contagem - a.contagem ||
      (a.referenciaNormalizada < b.referenciaNormalizada ? -1 : a.referenciaNormalizada > b.referenciaNormalizada ? 1 : 0));
  return { dados: dados.slice(0, limit), totalInteresses: rows.length, totalReferencias: counts.size, limite: limit };
}
