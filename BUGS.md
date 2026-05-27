# Relatório de Bugs — S.O.S Cidade

## BUG-01 — Rota `/gestores` acessível pelo perfil Denunciante (omitida no middleware)

**Arquivo:** `frontend/src/middleware.ts`, linha 27
**Severidade:** Alta
**Status:** Aberto

### Descrição
O arquivo `middleware.ts` protege as rotas de Gestor verificando se o perfil é `DENUNCIANTE` e redirecionando para `/homepage-denunciante`. Porém, o array `gestorRoutes` não inclui a rota `/gestores`, tornando-a acessível a qualquer usuário autenticado independente do perfil.

### Passos para reproduzir
1. Fazer login com perfil Denunciante
2. Digitar manualmente `/gestores` na barra de endereços do navegador
3. Observar que a página carrega sem redirecionamento

### Comportamento esperado
O middleware deve interceptar o acesso de um Denunciante à rota `/gestores` e redirecioná-lo para `/homepage-denunciante`.

### Comportamento observado
A página `/gestores` carrega normalmente para um Denunciante autenticado, expondo a listagem de gestores cadastrados.

### Causa
```ts
// middleware.ts — linha 27 (incompleto)
const gestorRoutes = ['/denuncias-recentes', '/mapa-ocorrencias', '/dashboard'];
//                    ↑ /gestores foi omitido da lista
```

### Correção sugerida
Adicionar `/gestores` ao array `gestorRoutes`:
```ts
const gestorRoutes = ['/denuncias-recentes', '/mapa-ocorrencias', '/dashboard', '/gestores'];
```

---

## BUG-02 — Validação da descrição rejeita exatamente 20 caracteres (off-by-one)

**Arquivo:** `frontend/src/components/form-denuncias.tsx`, linha 90
**Severidade:** Média
**Status:** Aberto

### Descrição
O schema Zod do formulário de nova denúncia define o mínimo da descrição como `21` caracteres, mas a mensagem de erro exibida ao usuário diz _"Descreva com no mínimo 20 caracteres"_. Um usuário que digita exatamente 20 caracteres atende ao critério exibido na tela, mas o formulário continua bloqueado.

### Passos para reproduzir
1. Acessar `/nova-denuncia` como Denunciante autenticado
2. Preencher todos os campos corretamente
3. No campo "Descrição", digitar exatamente 20 caracteres (ex.: `"Buraco na calçada ok"`)
4. Clicar em "Enviar"
5. Observar que a mensagem _"Descreva com no mínimo 20 caracteres"_ aparece mesmo com 20 caracteres preenchidos

### Comportamento esperado
Uma descrição com 20 ou mais caracteres deve passar na validação.

### Comportamento observado
O formulário exige 21 caracteres para aceitar a descrição, mas exibe mensagem indicando 20 como mínimo.

### Causa
```ts
// form-denuncias.tsx — (errado)
descricao: z.string().min(21, { message: "Descreva com no mínimo 20 caracteres." }),

// Correto
descricao: z.string().min(20, { message: "Descreva com no mínimo 20 caracteres." }),
```

### Correção sugerida
Alinhar o valor de `min()` com o número exibido na mensagem: mudar `min(21)` para `min(20)`.

---

## BUG-03 — Cores de status invertidas no sidebar do Denunciante

**Arquivo:** `frontend/src/components/app-sidebar-denunciante.tsx`, linhas 25–26
**Severidade:** Baixa
**Status:** Aberto

### Descrição
A função `getStatusColor` no sidebar do Denunciante mapeia as cores dos indicadores de status de forma invertida: denúncias com situação **"Finalizada"** exibem indicador **laranja** (cor de alerta), enquanto **"Em andamento"** exibe indicador **verde** (cor de conclusão).

### Passos para reproduzir
1. Fazer login como Denunciante com ao menos uma denúncia "Finalizada" e uma "Em andamento"
2. Observar os indicadores coloridos no bloco "Denúncias Recentes" no sidebar
3. Verificar que "Finalizada" aparece com bolinha laranja e "Em andamento" com bolinha verde

### Comportamento esperado
- "Finalizada" → indicador **verde**
- "Em andamento" → indicador **laranja**

### Comportamento observado
- "Finalizada" → indicador **laranja**
- "Em andamento" → indicador **verde**

### Causa
```ts
// app-sidebar-denunciante.tsx — (errado)
if (s.includes("finalizada")) return "bg-orange-400";
if (s.includes("andamento"))  return "bg-green-500";

// Correto
if (s.includes("finalizada")) return "bg-green-500";
if (s.includes("andamento"))  return "bg-orange-400";
```

### Correção sugerida
Inverter as classes CSS retornadas para cada condição na função `getStatusColor`.

---

## BUG-04 — Botão "Minhas Denúncias" redireciona para página errada

**Arquivo:** `frontend/src/app/(denunciante)/homepage-denunciante/page.tsx`, linha 48
**Severidade:** Média
**Status:** Aberto

### Descrição
O card "Minhas Denúncias" na página inicial do Denunciante contém um link com `href="/nova-denuncia"`. Ao clicar no botão, o usuário é levado para o formulário de nova denúncia em vez da listagem de suas denúncias.

### Passos para reproduzir
1. Fazer login como Denunciante
2. Na página inicial (`/homepage-denunciante`), clicar no botão **"Minhas Denúncias"** no card correspondente
3. Observar que o sistema redireciona para `/nova-denuncia`

### Comportamento esperado
O botão deve redirecionar para `/minhas-denuncias`.

### Comportamento observado
O botão redireciona para `/nova-denuncia`.

### Causa
```tsx
// homepage-denunciante/page.tsx — (errado)
<Link href="/nova-denuncia">Minhas Denúncias</Link>

// Correto
<Link href="/minhas-denuncias">Minhas Denúncias</Link>
```

### Correção sugerida
Corrigir o `href` de `/nova-denuncia` para `/minhas-denuncias`.
