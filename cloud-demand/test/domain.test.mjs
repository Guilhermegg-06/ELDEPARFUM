import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, validateInterest, parseLimit, rank } from '../src/domain.mjs';

const id = '11111111-1111-4111-8111-111111111111';
const valid = { referencia: 'Asad', nomePesquisado: 'contratipo do Assad', confirmado: true };
test('aliases conhecidos e prefixo agrupam; variantes diferentes permanecem separadas', () => {
  for (const value of ['  ASÁD ', 'Contratipo do Assad', 'Asad Lattafa', 'Lattafa Asad']) assert.equal(normalize(value), 'asad');
  assert.equal(normalize('Asad Bourbon'), 'asad bourbon');
  assert.notEqual(normalize('Assad Bourbon'), 'asad bourbon');
});
test('valida confirmação explícita e campos conhecidos', () => {
  assert.equal(validateInterest(valid, id).referenciaNormalizada, 'asad');
  for (const body of [null, [], {}, { ...valid, confirmado: false }, { ...valid, confirmado: 'true' }, { ...valid, email: 'demo@example.invalid' }]) {
    assert.throws(() => validateInterest(body, id), { status: 400 });
  }
});
test('rejeita HTML, controles, contatos, corpo incoerente e limites', () => {
  for (const value of ['<script>', 'a@b.com', 'https://x.com', '99999999999', 'Asad\n', 'Asad\u200b', 'a', '123', 'a'.repeat(101)]) {
    assert.throws(() => validateInterest({ referencia: value, nomePesquisado: value, confirmado: true }, id), { status: 400 });
  }
  assert.throws(() => validateInterest({ ...valid, referencia: 'Sauvage' }, id), { status: 400 });
  assert.throws(() => validateInterest({ ...valid, referencia: 'Contratipo', nomePesquisado: 'Contratipo' }, id), { status: 400 });
});
test('limites válidos, Unicode e chave v4', () => {
  const value = 'é'.repeat(100);
  assert.equal(validateInterest({ referencia: value, nomePesquisado: value, confirmado: true }, id).referenciaInformada.length, 100);
  for (const key of ['', '123', id.replace('-4111-', '-1111-')]) assert.throws(() => validateInterest(valid, key), { status: 400 });
});
test('ranking determinístico, top limitado e totais integrais', () => {
  const rows = ['z', 'a', 'z', 'a', 'b'].map(referenciaNormalizada => ({ referenciaNormalizada }));
  assert.deepEqual(rank(rows, 1), { dados: [{ referenciaNormalizada: 'a', contagem: 2 }], totalInteresses: 5, totalReferencias: 3, limite: 1 });
  assert.deepEqual(rank([], 20), { dados: [], totalInteresses: 0, totalReferencias: 0, limite: 20 });
});
test('limite rejeita floats, zeros, texto e excesso', () => {
  assert.equal(parseLimit(null), 20);
  assert.equal(parseLimit('100'), 100);
  for (const value of ['0', '01', '101', '-1', '1.5', '10abc', '']) assert.throws(() => parseLimit(value), { status: 400 });
});
