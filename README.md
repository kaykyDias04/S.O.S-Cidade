# S.O.S Cidade - Recife

Sistema de denuncias urbanas projetado para a cidade do Recife. A plataforma permite que os cidadaos registrem problemas urbanos de diversas naturezas e que gestores publicos acompanhem, filtrem e solucionem as ocorrencias de maneira centralizada e georreferenciada.

---

## Descricao Geral do Projeto

O S.O.S Cidade tem o objetivo de servir como ponte oficial de comunicacao sobre zeladoria urbana entre o recifense e a prefeitura ou orgaos publicos. 

O cidadao acessa o portal, registra uma nova ocorrencia identificando o tipo de problema e o bairro exato. Caso opte, a denuncia pode ser anonima.
Do outro lado, o gestor publico tem acesso a um painel analitico (Dashboard) e um Mapa Interativo atualizado em tempo real, onde as denuncias sao agrupadas por bairro para rapida tomada de decisao e priorizacao de acoes publicas.

---

## Arquitetura e Tecnologias Utilizadas

O sistema possui uma arquitetura moderna dividida entre Frontend, Backend e servicos de Infraestrutura rodando de forma isolada via Docker.

### Frontend
- Framework: Next.js (App Router)
- Linguagem: TypeScript
- Estilizacao: TailwindCSS e Shadcn/ui
- Mapas: Leaflet (React Leaflet)
- Gerenciamento de Estado Global: Zustand

### Backend
- Ambiente: Node.js com Express
- Linguagem: TypeScript
- ORM: Prisma
- Autenticacao: JSON Web Tokens (JWT) trafegados via Cookies (HttpOnly)
- Banco de Dados: PostgreSQL
- Cache: Redis (ioredis)
- Tarefas Agendadas: node-cron

---

## Estrutura de Diretorios

```text
S.O.S-Cidade/
├── backend/                      # API REST em Node.js
│   ├── prisma/                   # Schema do banco de dados relacional
│   └── src/
│       ├── controllers/          # Controladores das rotas
│       ├── jobs/                 # Tarefas agendadas (Cron)
│       ├── lib/                  # Instancias estaticas (Redis, Prisma)
│       ├── middlewares/          # Validacoes e Autenticacao
│       ├── repositories/         # Persistencia de dados
│       ├── routes/               # Declaracao de Endpoints
│       ├── services/             # Regras de Negocio e Cache
│       ├── app.ts                # Inicializacao Express e Swagger
│       └── server.ts             # Entrypoint da aplicacao
│
├── frontend/                     # Aplicacao Web em Next.js
│   ├── src/
│   │   ├── app/                  # Rotas da aplicacao Web
│   │   │   ├── (auth)/           # Contexto de autenticacao e login
│   │   │   ├── (denunciante)/    # Interfaces restritas ao cidadao
│   │   │   └── (gestor)/         # Interfaces restritas ao orgao publico
│   │   ├── components/           # Componentes modulares e UI
│   │   ├── lib/                  # Utilitarios (store, configuracao de api)
│   │   └── middleware.ts         # Protecao de rotas Next.js
│   └── public/
│
└── docker-compose.yml            # Orquestracao dos servicos
```

---

## Perfis de Usuario

O sistema lida primariamente com dois perfis com niveis de permissao e interfaces totalmente distintos:

1. Denunciante (Cidadao)
Pode realizar novas denuncias e visualizar seu proprio historico de ocorrencias (incluindo aquelas registradas sob anonimato em sua conta). Nao tem acesso aos dados gerais da cidade.

2. Gestor (Poder Publico)
Nao pode criar denuncias. Seu foco e a visualizacao. Possui acesso a uma listagem em tabela de todas as denuncias ativas na cidade do Recife, permitindo alterar a situacao de uma ocorrencia (Ex: Em Andamento -> Finalizada) e acompanhar a concentracao espacial dos problemas por bairro via Mapa de Ocorrencias.

---

## Como Executar o Projeto Localmente

Todo o ambiente de desenvolvimento e banco de dados foi integrado utilizando Docker para facilitar a execucao e eliminar problemas de compatibilidade.

### Pre-requisitos
- Docker e Docker Compose instalados na maquina.

### Passos de Inicializacao

1. Clone o repositorio e abra o terminal na raiz do projeto (mesmo local onde esta o arquivo docker-compose.yml).
2. Execute o comando para construir e inicializar as maquinas virtuais:
   ```bash
   docker-compose up --build -d
   ```
3. O Docker iniciara automaticamente quatro servicos:
   - Banco de Dados (PostgreSQL na porta 5432)
   - Cache (Redis na porta 6379)
   - Backend API (Node.js na porta 8000)
   - Frontend Web (Next.js na porta 3000)

4. Apos o terminal concluir a subida dos servicos, aguarde alguns segundos para a geracao das tabelas do banco.
5. Acesse a aplicacao pelo navegador:
   - Web App: http://localhost:3000
   - Documentacao da API (Swagger): http://localhost:8000/api-docs

---

## Integracao de Componentes Chaves

### 1. Sistema de Mapas (Leaflet)
Para a visualizacao do Gestor, o frontend conta com um componente customizado de mapas que agrupa dinamicamente denuncias proximas por bairro utilizando Leaflet. Foi construido um fallback interno de coordenadas aproximadas dos bairros do Recife associado a uma consulta de Geocoding sob demanda.

### 2. Cache e Performance (Redis)
Rotas custosas (como listar denuncias massivamente para os mapas) possuem cache no Redis. Para preservar consistencia, a politica de cache e limpa toda vez que qualquer operacao de escrita, atualizacao ou exclusao de denuncia e realizada. Um Cron job noturno garante que nao havera chaves residuais de longo prazo.

### 3. Protecao e Rotas Seguras
Ao fazer login, o backend injeta as credenciais do usuario em um Cookie seguro e criptografado (HttpOnly). O Frontend Next.js utiliza o seu Middleware de Servidor para validar se o usuario pode acessar determinada URL de acordo com o cargo armazenado na sessao, bloqueando tentativas de burla.

---

## Rotas do Frontend

| Caminho da URL           | Publico-Alvo | Funcionalidade Principal                          |
|--------------------------|--------------|---------------------------------------------------|
| /                        | Todos        | Autenticacao e Direcionamento Inicial             |
| /homepage-denunciante    | Denunciante  | Tela de boas-vindas do cidadao                    |
| /nova-denuncia           | Denunciante  | Formulario guiado de abertura de denuncia         |
| /minhas-denuncias        | Denunciante  | Historico de solicitacoes do usuario atual        |
| /dashboard               | Gestor       | Visão estatística básica das denúncias + filtros  |
| /denuncias-recentes      | Gestor       | Painel de administracao (Tabela de ocorrencias)   |
| /mapa-ocorrencias        | Gestor       | Visao cartografica dos chamados em aberto         |

---

## Endpoints do Backend

Todas as chamadas exigem autenticacao (exceto login/cadastro). Os dados tecnicos estruturados e modelos JSON devem ser acessados e testados nativamente atraves da pagina do Swagger.

| Verbo HTTP | Endpoint            | Contexto                            |
|------------|---------------------|-------------------------------------|
| POST       | /auth/login         | Gera sessao de Cookie HttpOnly      |
| POST       | /auth/logout        | Limpa Cookie da sessao              |
| POST       | /users              | Cadastra novo cidadao               |
| GET        | /denuncias          | Lista ocorrencias (suporta paginacao)|
| POST       | /denuncias          | Registra uma nova ocorrencia        |
| GET        | /denuncias/{id}     | Busca detalhes de uma ocorrencia    |
| PATCH      | /denuncias/{id}     | Altera status da ocorrencia         |
| DELETE     | /denuncias/{id}     | Remove uma ocorrencia do banco      |
