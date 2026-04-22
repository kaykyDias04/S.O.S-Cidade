# Integração S.O.S-Cidade com FakeAPI

## Visão Geral

O S.O.S-Cidade foi integrado com a FakeAPI para funcionar com dados reais de uma API REST, eliminando a dependência de dados mockados no código-fonte.

## Arquitetura

### FakeAPI (Backend)
- **Porta**: 8000 (padrão)
- **Localização**: `/fakeapi`
- **Banco de dados**: JSON em `/fakeapi/data/db.json`
- **Endpoints principais**:
  - `POST /auth/login` - Autenticação
  - `GET /denuncias` - Listar denúncias
  - `POST /denuncias` - Criar denúncia
  - `GET /users` - Listar usuários
  - `POST /users` - Registrar novo usuário

### S.O.S-Cidade (Frontend)
- **Localização**: `/sos-cidade`
- **Framework**: Next.js 14+
- **Configuração de API**: `.env.local`

## Estrutura de Arquivos Criados/Modificados

### Novos Arquivos:
1. **`src/lib/api.ts`** - Serviço de API com funções genéricas
2. **`src/hooks/useDenuncias.ts`** - Hooks React para gerenciar denúncias
3. **`.env.local`** - Variáveis de ambiente (desenvolvimento)
4. **`.env.example`** - Template de variáveis de ambiente

### Arquivos Modificados:
1. **`src/contexts/auth-context.tsx`** - Atualizado para usar API de login
2. **`src/components/login-form.tsx`** - Integrado com API de autenticação
3. **`src/components/form-denuncias.tsx`** - Integrado com API de criação de denúncias
4. **`app/(professor)/denuncias-recentes/page.tsx`** - Busca dados da API
5. **`src/components/app-sidebar-professor.tsx`** - Mostra casos prioritários da API
6. **`src/components/app-sidebar-aluno.tsx`** - Mostra denúncias do aluno da API
7. **`fakeapi/data/db.json`** - Dados iniciais atualizados

## Como Usar

### 1. Instalar Dependências

**FakeAPI:**
```bash
cd fakeapi
npm install
```

**S.O.S-Cidade:**
```bash
cd sos-cidade
npm install
```

### 2. Configurar Variáveis de Ambiente

**S.O.S-Cidade** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Iniciar o Servidor FakeAPI

```bash
cd fakeapi
npm start
```

A API estará disponível em `http://localhost:8000`

### 4. Iniciar o Frontend S.O.S-Cidade

```bash
cd sos-cidade
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Credenciais de Teste

### Professor:
- **Email**: kaykydiasdi@gmail.com
- **Senha**: 123456
- **Acesso**: Dashboard, Denúncias Recentes, etc.

### Aluno:
- **Email**: kaykydias123@gmail.com
- **Senha**: 123456
- **Acesso**: Homepage, Nova Denúncia, Minhas Denúncias, etc.

## Fluxo de Dados

### Autenticação:
```
LoginForm
  ↓
login(email, password) em useAuth()
  ↓
POST /auth/login
  ↓
Armazenar token + userData em localStorage
  ↓
Redirecionar para dashboard/homepage
```

### Criação de Denúncia:
```
FormDenuncias (preenchimento)
  ↓
ConfirmationModal (confirmação)
  ↓
POST /denuncias (com dados mapeados)
  ↓
ProtocolModal (exibe protocolo)
  ↓
Redirecionar para homepage-aluno
```

### Listagem de Denúncias:
```
useDenuncias() hook
  ↓
GET /denuncias?_page=1&_limit=50&_meta=1
  ↓
Render DenunciasDataTable com dados
```

## API Types

### Estrutura de Denúncia:
```typescript
interface Denuncia {
  id: number;
  tipoDenuncia: string;           // "Agressão", "Bullying", "Vandalismo", "Outros"
  identificacao: boolean;          // true = identificado, false = anônimo
  nomeAluno: string;
  localOcorrencia: string;
  descricaoOcorrencia: string;
  dataOcorrencia: string;          // Format: "DD/MM/YYYY"
  protocolo: string;               // "SOS-2025-0001", etc
  situacao: string;                // "Finalizada", "Em andamento"
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
}
```

### Estrutura de Usuário:
```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: string;                    // "PROFESSOR", "ALUNO", "admin"
  scopes: string[];
}
```

## Hooks Disponíveis

### useDenuncias(page, limit)
Gerencia lista de denúncias com paginação.

```typescript
const { 
  denuncias,      // Denuncia[]
  loading,        // boolean
  error,          // string | null
  refetch,        // () => Promise<void>
  page,           // number
  setPage,        // (page: number) => void
  total           // number | undefined
} = useDenuncias(1, 50);
```

### useDenuncia(id?)
Gerencia uma denúncia individual.

```typescript
const { 
  denuncia,       // Denuncia | null
  loading,        // boolean
  error,          // string | null
  creating,       // boolean
  updating,       // boolean
  deleting,       // boolean
  create,         // (data) => Promise<Denuncia | null>
  update,         // (id, data) => Promise<Denuncia | null>
  delete          // (id) => Promise<boolean>
} = useDenuncia(id);
```

## Configuração Avançada

### Timeout de Requisições
Editar em `src/lib/api.ts`:
```typescript
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers,
  signal: AbortSignal.timeout(10000), // 10 segundos
});
```

### Autenticação JWT
O token é automaticamente incluído no header `Authorization: Bearer {token}` em todas as requisições.

### Paginação
Use os parâmetros de query na API:
- `_page`: número da página (padrão: 1)
- `_limit`: itens por página (padrão: 50, máx: 100)
- `_meta=1`: incluir metadados de paginação

## Troubleshooting

### "Failed to fetch" / CORS Error
- Verifique se FakeAPI está rodando em `http://localhost:8000`
- Verifique `.env.local` em S.O.S-Cidade tem `NEXT_PUBLIC_API_URL` correto
- Restart o servidor FakeAPI

### Login não funciona
- Verifique credenciais em `fakeapi/data/db.json`
- Verifique se a senha é "123456" (bcrypt hash já está no db.json)
- Verifique console do navegador para erros

### Denúncias não aparecem
- Verifique se há dados em `fakeapi/data/db.json` no array `denuncias`
- Veja o console do navegador para erros da API
- Use `refetch()` do hook para recarregar manualmente

## Contribuindo

Ao adicionar novos endpoints ou tipos de dados:

1. Atualize `fakeapi/data/db.json` com os novos dados
2. Crie/atualize o serviço em `src/lib/api.ts`
3. Crie/atualize o hook em `src/hooks/`
4. Atualize os componentes que usam os dados
5. Teste em desenvolvimento local

## Próximas Melhorias

- [ ] Implementar filtros avançados em listagem de denúncias
- [ ] Adicionar busca por texto em denúncias
- [ ] Implementar download de relatórios em PDF
- [ ] Adicionar notificações em tempo real (WebSocket)
- [ ] Implementar cache de requisições
- [ ] Adicionar retry automático para requisições falhadas
- [ ] Implementar paginação infinita (infinite scroll)
