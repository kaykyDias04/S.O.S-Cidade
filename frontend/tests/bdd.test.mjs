import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateLoginForm, validateDenunciaForm } from '../src/lib/validation.mjs';

// BDD-01: Login com credenciais válidas como Denunciante
describe('BDD-01: Login como Denunciante', () => {
  it('deve retornar sem erros para credenciais válidas', () => {
    // Given
    const credentials = { email: 'levi@sos.com', password: '123456' };
    // When
    const errors = validateLoginForm(credentials);
    // Then
    assert.equal(errors.length, 0);
  });
});

// BDD-02: Envio de formulário com campos obrigatórios vazios
describe('BDD-02: Formulário de nova denúncia com campos vazios', () => {
  it('deve retornar 4 erros ao enviar formulário vazio', () => {
    // Given
    const form = { tipoDenuncia: '', bairro: '', descricao: '', consentimento: false };
    // When
    const errors = validateDenunciaForm(form);
    // Then
    assert.equal(errors.length, 4);
  });
});
