import { test } from 'node:test';
import assert from 'node:assert/strict';
import { determineNomeDenunciante, validateStatusUpdate } from '../src/lib/validation.mjs';

// ATDD-01: Denúncia anônima deve ocultar identidade do denunciante
// História: Como Denunciante, quero registrar de forma anônima
// Critério de aceitação: coluna Denunciante exibe "Anônimo" na visão do Gestor
test('ATDD-01: denúncia anônima deve exibir "Anônimo" para o Gestor', () => {
  const nome = determineNomeDenunciante({ isAnonima: true, userName: 'Levi Carvalho' });
  assert.equal(nome, 'Anônimo');
});

// ATDD-02: Gestor deve conseguir atualizar status para "Finalizada"
// História: Como Gestor, quero atualizar o status das ocorrências
// Critério de aceitação: status deve ser salvo com sucesso pelo perfil Gestor
test('ATDD-02: Gestor deve conseguir atualizar status para "Finalizada"', () => {
  const result = validateStatusUpdate({ perfil: 'GESTOR', newStatus: 'Finalizada' });
  assert.equal(result.valid, true);
});
