# S.O.S Cidade — Recife

Sistema de denúncias urbanas para a cidade do Recife. Permite que cidadãos registrem problemas como buracos, assaltos, falta de iluminação, lixo e trânsito, e que gestores públicos acompanhem e gerenciem as ocorrências.

---

## Estrutura do Projeto

```
S.O.S-Cidade/
├── fakeapi-backend/          # API REST (Node.js + Express)
│   ├── data/db.json          # Banco de dados local (JSON)
│   └── src/
│       ├── auth/             # Autenticação JWT
│       ├── controllers/
│       ├── routes/
│       └── server.js
│
└── sos-cidade2/              # Frontend (Next.js 16 + TypeScript)
    ├── app/
    │   ├── (auth)/           # Página de login/cadastro
    │   ├── (denunciante)/    # Área do cidadão
    │   │   ├── homepage-denunciante/
    │   │   └── nova-denuncia/
    │   └── (gestor)/         # Área do gestor público
    │       └── denuncias-recentes/
    └── src/
        ├── components/
        ├── contexts/
        ├── hooks/
        └── lib/
```

---

## Perfis de Usuário

| Perfil         | Descrição                              | Acesso                         |
|----------------|----------------------------------------|--------------------------------|
| **Denunciante** | Cidadão de Recife                     | Homepage + Formulário          |
| **Gestor**      | Funcionário da prefeitura/órgão público | Tabela de denúncias recentes  |

### Credenciais de teste
| Email                        | Senha  | Perfil      |
|------------------------------|--------|-------------|
| gestor@recife.pe.gov.br      | 123456 | Gestor      |
| joao.silva@gmail.com         | 123456 | Denunciante |

---

## Como Rodar

### 1. Backend (API)
```bash
cd fakeapi-backend
npm i
cd frontend
npm i

docker-compose up
```

### Variável de Ambiente (opcional)
Crie `sos-cidade2/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
### Deploy

https://sos-cidade-front.vercel.app/

---

## Tipos de Denúncia

- **Segurança Pública** — assaltos, violência
- **Infraestrutura** — buracos, calçadas, obras
- **Iluminação Pública** — postes sem luz
- **Limpeza Urbana** — lixo, entulho irregular
- **Trânsito** — semáforo, sinalização
- **Outro**

---

## Rotas do Frontend

| Rota                     | Perfil       | Descrição                    |
|--------------------------|--------------|------------------------------|
| `/`                      | Público      | Login e Cadastro             |
| `/homepage-denunciante`  | Denunciante  | Página inicial do cidadão    |
| `/nova-denuncia`         | Denunciante  | Formulário de denúncia       |
| `/denuncias-recentes`    | Gestor       | Tabela com todas as denúncias|

---

## Rotas da API

| Método | Rota             | Descrição                     |
|--------|------------------|-------------------------------|
| POST   | /auth/login      | Autenticar usuário            |
| POST   | /auth/register   | Cadastrar novo usuário        |
| GET    | /denuncias       | Listar denúncias              |
| POST   | /denuncias       | Criar nova denúncia           |
| PATCH  | /denuncias/:id   | Atualizar denúncia            |
| DELETE | /denuncias/:id   | Remover denúncia              |
