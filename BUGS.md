# Relatório de Bugs — S.O.S Cidade

## BUG-01 — Rota `/gestores` acessível pelo perfil Denunciante (TC05)

**Arquivo:** `frontend/src/middleware.ts`, linha 27
**Severidade:** Alta
**Caso de Teste:** TC05

### Descrição
O array `gestorRoutes` no middleware não inclui `/gestores`, tornando essa rota acessível a qualquer Denunciante autenticado que a acesse diretamente pela barra de endereços.

### Passos para reproduzir
1. Fazer login com perfil Denunciante
2. Digitar manualmente `/gestores` na barra de endereços do navegador
3. Observar que a página carrega sem redirecionamento

### Comportamento esperado
O middleware deve redirecionar o Denunciante para `/homepage-denunciante`.

### Comportamento observado
A página `/gestores` carrega normalmente, expondo a listagem de gestores cadastrados.

### Causa
```ts
// middleware.ts — linha 27 (incompleto)
const gestorRoutes = ['/denuncias-recentes', '/mapa-ocorrencias', '/dashboard'];
//                    ↑ /gestores foi omitido da lista
```

### Correção sugerida
```ts
const gestorRoutes = ['/denuncias-recentes', '/mapa-ocorrencias', '/dashboard', '/gestores'];
```

---

## BUG-02 — Denúncia anônima exibe nome do Denunciante para o Gestor (TC10)

**Arquivo:** `frontend/src/components/form-denuncias.tsx`, linha 176
**Severidade:** Alta
**Caso de Teste:** TC10

### Descrição
A lógica de anonimização do nome do denunciante está invertida. Quando o toggle "Denúncia Anônima" está **ativo**, o sistema envia o nome real do usuário. Quando está **inativo**, envia "Anônimo". O comportamento é o oposto do esperado.

### Passos para reproduzir
1. Fazer login como Denunciante
2. Acessar `/nova-denuncia`
3. Ativar o toggle "Denúncia Anônima"
4. Preencher todos os campos e enviar a denúncia
5. Fazer login como Gestor e acessar `/denuncias-recentes`
6. Localizar a denúncia pelo protocolo gerado
7. Observar a coluna "Denunciante"

### Comportamento esperado
A coluna "Denunciante" deve exibir **"Anônimo"** para denúncias enviadas com o toggle ativo.

### Comportamento observado
A coluna "Denunciante" exibe o **nome real** do cidadão mesmo com o toggle de anonimato ativo.

### Causa
```ts
// form-denuncias.tsx — (errado)
nomeDenunciante: !dataToSubmit.isAnonima ? "Anônimo" : (user?.name || "Anônimo"),

// Correto
nomeDenunciante: dataToSubmit.isAnonima ? "Anônimo" : (user?.name || "Anônimo"),
```

### Correção sugerida
Remover a negação `!` da condição `isAnonima`.

---

## BUG-03 — Badge de status "Finalizada" exibe cor laranja em vez de verde (TC15)

**Arquivo:** `frontend/src/components/gestor-data-table.tsx`, linha 68
**Severidade:** Baixa
**Caso de Teste:** TC15

### Descrição
A configuração de estilo do badge de status na tabela de denúncias do Gestor aplica a classe laranja para o status "Finalizada", quando deveria aplicar verde. O resultado esperado de TC15 menciona explicitamente "badge verde" para o status "Finalizada".

### Passos para reproduzir
1. Fazer login como Gestor
2. Acessar `/denuncias-recentes`
3. Localizar uma denúncia com status "Em andamento"
4. Clicar em "Editar" e selecionar "Finalizada"
5. Confirmar a atualização
6. Observar a cor do badge na coluna "Situação"

### Comportamento esperado
Badge com fundo **verde** para o status "Finalizada".

### Comportamento observado
Badge com fundo **laranja** para o status "Finalizada".

### Causa
```ts
// gestor-data-table.tsx — (errado)
"finalizada": "text-orange-700 bg-orange-50 border-orange-300 hover:bg-orange-600/20",

// Correto
"finalizada": "text-green-700 bg-green-50 border-green-300 hover:bg-green-600/20",
```

### Correção sugerida
Restaurar as classes CSS verdes para o status "Finalizada" em `situacaoConfig`.

---

## BUG-04 — Cancelar modal de confirmação apaga o formulário preenchido (TC11)

**Arquivo:** `frontend/src/components/form-denuncias.tsx`, linha 222
**Severidade:** Média
**Caso de Teste:** TC11

### Descrição
Ao clicar em "Cancelar" no modal de confirmação de envio, a função `handleCloseModal` chama `form.reset()`, limpando todos os campos do formulário. O comportamento esperado em TC11 é que o formulário permaneça intacto após o cancelamento.

### Passos para reproduzir
1. Fazer login como Denunciante e acessar `/nova-denuncia`
2. Preencher todos os campos obrigatórios corretamente
3. Clicar em "Enviar Denúncia"
4. No modal "Confirmar Envio da Denúncia", clicar em "Cancelar"
5. Observar o estado do formulário

### Comportamento esperado
Modal fecha; formulário permanece na tela com todos os dados preenchidos intactos.

### Comportamento observado
Modal fecha e todos os campos do formulário são **limpos**, perdendo os dados digitados pelo usuário.

### Causa
```ts
// form-denuncias.tsx — (errado)
function handleCloseModal() {
  form.reset();  // ← limpa o formulário indevidamente
  setIsConfirmModalOpen(false);
  setDataToSubmit(null);
}

// Correto
function handleCloseModal() {
  setIsConfirmModalOpen(false);
  setDataToSubmit(null);
}
```

### Correção sugerida
Remover a chamada `form.reset()` da função `handleCloseModal`.
