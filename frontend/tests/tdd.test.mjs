import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDescription, generateProtocol } from '../src/lib/validation.mjs';

// TDD-01: validateDescription() — escrito antes da implementação da função
test('TDD-01a: validateDescription retorna false para descrição com menos de 20 caracteres', () => {
  assert.equal(validateDescription('Buraco grande'), false);
});

test('TDD-01b: validateDescription retorna true para descrição com 20 ou mais caracteres', () => {
  assert.equal(validateDescription('Buraco grande na rua'), true);
});

// TDD-02: generateProtocol() — escrito antes da implementação da função
test('TDD-02a: generateProtocol retorna string no formato SOS-AAAA-XXXXXXXX', () => {
  const protocolo = generateProtocol(2026);
  assert.match(protocolo, /^SOS-\d{4}-[A-Z0-9]{8}$/);
});

test('TDD-02b: generateProtocol gera protocolos únicos a cada chamada', () => {
  const p1 = generateProtocol(2026);
  const p2 = generateProtocol(2026);
  assert.notEqual(p1, p2);
});
