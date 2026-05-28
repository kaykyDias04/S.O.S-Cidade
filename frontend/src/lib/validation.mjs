// Funções de lógica de negócio — testáveis de forma isolada

export function validateLoginForm({ email, password }) {
  const errors = [];
  if (!email || !email.includes('@'))
    errors.push('E-mail inválido.');
  if (!password || password.length < 6)
    errors.push('Senha deve ter no mínimo 6 caracteres.');
  return errors;
}

export function validateDenunciaForm({ tipoDenuncia, bairro, descricao, consentimento }) {
  const errors = [];
  if (!tipoDenuncia)
    errors.push('Selecione o tipo da denúncia.');
  if (!bairro || bairro.length < 2)
    errors.push('Selecione o bairro da ocorrência.');
  if (!descricao || descricao.trim().length < 20)
    errors.push('Descreva com no mínimo 20 caracteres.');
  if (!consentimento)
    errors.push('Você precisa autorizar o compartilhamento dos dados.');
  return errors;
}

export function determineNomeDenunciante({ isAnonima, userName }) {
  return isAnonima ? 'Anônimo' : (userName || 'Anônimo');
}

export function validateStatusUpdate({ perfil, newStatus }) {
  const validStatuses = ['Em andamento', 'Finalizada'];
  if (perfil !== 'GESTOR')
    return { valid: false, error: 'Apenas Gestores podem atualizar o status.' };
  if (!validStatuses.includes(newStatus))
    return { valid: false, error: 'Status inválido.' };
  return { valid: true };
}

export function validateDescription(desc) {
  return typeof desc === 'string' && desc.trim().length >= 20;
}

export function generateProtocol(year) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `SOS-${year}-${random}`;
}
