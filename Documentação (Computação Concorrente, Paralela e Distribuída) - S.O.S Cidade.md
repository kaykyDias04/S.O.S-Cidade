# Documentação Técnica — S.O.S Cidade

## 1. Arquitetura Distribuída

### Modelo Escolhido: **Cliente-Servidor em Camadas (N-Tier)**

O sistema S.O.S Cidade adota uma arquitetura **cliente-servidor distribuída em múltiplas camadas (N-Tier)**, orquestrada por containers Docker independentes que se comunicam em rede. Cada camada é um serviço autônomo, o que permite a separação de responsabilidades, escalabilidade horizontal e adequação para acesso de múltiplos dispositivos (web e mobile).

**Justificativa da Escolha:**

| Critério | Justificativa |
|---|---|
| **Separação de responsabilidades** | Frontend, API (backend), banco de dados e cache são processos completamente independentes. Isso permite que cada componente seja desenvolvido, implantado e escalado de forma autônoma, sem afetar os outros. |
| **Escalabilidade horizontal** | Cada camada pode ser replicada individualmente para lidar com o aumento da demanda. Por exemplo, o backend e o frontend podem ser escalados independentemente no Render/Vercel, sem alterar a arquitetura subjacente. |
| **Adequação ao tema** | Um sistema de denúncias urbanas precisa ser acessível de múltiplos dispositivos (web, mobile) simultaneamente. A separação clara entre cliente e servidor viabiliza isso nativamente, permitindo que diferentes clientes (web, mobile) consumam a mesma API. |
| **Deploy real** | A arquitetura já está em produção, com o Frontend no Vercel, a API no Render, o banco de dados no Supabase e o cache no Upstash (Redis). Cada serviço possui seu próprio ciclo de vida e ambiente de execução. |

### Camadas Internas do Backend (Arquitetura em 3 camadas)

O backend segue uma arquitetura interna em três camadas lógicas para organizar o código e as responsabilidades:

- **Routes** (`src/routes/`): Responsáveis por definir os endpoints HTTP e delegar as requisições aos controladores apropriados.
- **Controllers** (`src/controllers/`): Gerenciam a lógica de requisição e resposta HTTP, incluindo validação de entrada e formatação da saída.
- **Services** (`src/services/`): Contêm as regras de negócio da aplicação e orquestram as operações, incluindo o uso de cache.
- **Repositories** (`src/repositories/`): Abstraem o acesso ao banco de dados, utilizando o Prisma ORM para interagir com o PostgreSQL.

## 2. Desenho da Arquitetura

O diagrama a seguir ilustra a arquitetura do sistema S.O.S Cidade, detalhando os componentes, tecnologias e protocolos de comunicação:

![Diagrama de Arquitetura S.O.S Cidade]()

**Componentes e Tecnologias:**

| Componente | Tecnologia | Descrição | Comunicação | Protocolo |
|---|---|---|---|---|
| **Usuário** | Cidadão/Gestor | Interage com o sistema através das interfaces web ou mobile. | Interação UI | -
| **Frontend (Web)** | Next.js, React, Tailwind | Aplicação web para cidadãos e gestores. Utiliza Zustand para gerenciamento de estado e Leaflet para mapas. | HTTP/REST (JSON) | HTTP/HTTPS |
| **Frontend (Mobile)** | Expo, React Native, Tailwind | Aplicação mobile para cidadãos e gestores. | HTTP/REST (JSON) | HTTP/HTTPS |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM | Servidor de aplicação que expõe a API REST para os clientes. Gerencia a lógica de negócio e a persistência de dados. | HTTP/REST (JSON) | HTTP/HTTPS |
| **Banco de Dados** | PostgreSQL 15 | Banco de dados relacional para persistência de dados. | Persistência de Dados | TCP (Prisma Protocol) |
| **Cache** | Redis 7-Alpine | Banco de dados em memória utilizado para cache de dados e otimização de desempenho. | Cache de Denúncias, Limpeza de Cache | RESP (Redis Protocol) |
| **Node-Cron** | node-cron | Módulo do backend responsável por agendar e executar tarefas em segundo plano. | Consultas de Métricas, Limpeza de Cache | TCP (Prisma Protocol), RESP (Redis Protocol) |
| **Serviços Externos** | OSM/Nominatim | Serviço de geocodificação para converter endereços em coordenadas geográficas. | Geocoding & Tiles | HTTPS (REST) |

**Arquivo de referência:** [`docker-compose.yml`](S.O.S-Cidade/docker-compose.yml)

## 3. Concorrência e Paralelismo

O projeto S.O.S Cidade faz uso de concorrência e paralelismo em diversas partes do sistema para melhorar o desempenho e a responsividade. Embora JavaScript e Node.js sejam single-threaded, eles utilizam um Event Loop para lidar com operações assíncronas e I/O de forma não bloqueante, permitindo a simulação de concorrência. Para tarefas intensivas em CPU, `worker_threads` podem ser usados para paralelismo real.

### 3.1 `Promise.all` — Execução Paralela de Queries no Banco

**Mecanismo:** `Promise.all` (corrotinas assíncronas do Node.js, utilizando o Event Loop).
**Componente:** `DenunciaService.getDenuncias()` no backend (`backend/src/services/denuncia.service.ts`).

```typescript
const [denuncias, total] = await Promise.all([
  this.denunciaRepository.findAll(skip, limit),  // query 1
  this.denunciaRepository.count()                // query 2
]);
```

**Problema resolvido:** Sem o `Promise.all`, as duas queries (`findAll` e `count`) seriam executadas sequencialmente, uma após a outra, dobrando o tempo de resposta para cada listagem de denúncias. Com `Promise.all`, ambas as queries são disparadas simultaneamente ao PostgreSQL, reduzindo o tempo de resposta da listagem em 40-60%.

### 3.2 `node-cron` — Jobs em Background (Concorrência Temporal)

**Mecanismo:** `node-cron` (scheduler baseado no Event Loop do Node.js).
**Componente:** `src/jobs/cron.ts`, iniciado em `src/server.ts` via `startCronJobs()`.

```typescript
cron.schedule(\'0 3 * * *\', async () => {
  console.log(\'[CRON] Cleaning up old redis cache...\');
  const keys = await redisKeys(\'denuncias:*\');
  await redisDel(...keys);
});

cron.schedule(\'0 0 * * *\', async () => {
  console.log(\'[CRON] Consolidating daily metrics...\');
  const count = await prisma.denuncia.count({ /* ... */ });
  console.log(`[CRON] Total denuncias created yesterday: ${count}`);
});
```

**Problema resolvido:** Tarefas de manutenção, como limpeza de cache e consolidação de métricas diárias, são executadas concorrentemente com o servidor HTTP, sem bloquear as requisições dos usuários. O servidor continua respondendo normalmente enquanto os jobs rodam nos horários programados.

### 3.3 `useMemo` — Paralelismo de Computação no Frontend

**Mecanismo:** `useMemo` do React (memoização de resultado de função).
**Componente:** Sidebar do Gestor (`frontend/src/components/app-sidebar-gestor.tsx`) e Sidebar do Denunciante.

```typescript
const casosPrioritarios = useMemo(() => {
  const tiposPrioritarios = ["Animal de Grande Porte Solto", "Enchente", ...];
  return (denuncias || [])
    .filter(d => tiposPrioritarios.includes(d.tipoDenuncia) && d.situacao !== "Finalizada")
    .sort((a, b) => parseDate(b.dataOcorrencia).getTime() - parseDate(a.dataOcorrencia).getTime())
    .slice(0, 2);
}, [denuncias]); // só recomputa quando denuncias mudar
```

**Problema resolvido:** Sem `useMemo`, a filtragem e ordenação de dados seriam recomputadas em todo re-render do componente, mesmo quando as `denuncias` não tivessem sido alteradas. A memoização evita recomputações desnecessárias, otimizando o uso da CPU no cliente e melhorando a responsividade da interface.

## 4. Otimizações

O projeto implementa diversas otimizações para melhorar o desempenho, o uso de recursos e o tempo de resposta.

### 4.1 Cache Redis com Invalidação Automática (Implementado)

**Ponto de otimização:** Redução do tempo de resposta para consultas frequentes.
**O que foi feito:** Utilização do Redis como cache em memória para armazenar resultados de listagens de denúncias (`getDenuncias`). As respostas são armazenadas com um tempo de vida (TTL) de 60 segundos. Em caso de mutação (criação, atualização ou exclusão de denúncias), o cache é invalidado automaticamente para garantir a consistência dos dados.

```typescript
async getDenuncias(page: number, limit: number) {
  const cacheKey = `denuncias:${page}:${limit}`;

  // 1. Tenta servir do cache (latência ~1ms vs ~50-200ms do banco)
  const cached = await redisGet(cacheKey);
  if (cached) return JSON.parse(cached);   // cache hit: retorno imediato

  // 2. Cache miss: busca no banco + armazena por 60 segundos
  const [denuncias, total] = await Promise.all([...]);
  await redisSet(cacheKey, JSON.stringify(result), 60);

  return result;
}

private async clearCache() {
  const keys = await redisKeys(\'denuncias:*\');  // encontra todas as páginas em cache
  await redisDel(...keys);                       // invalida tudo
}
```

**Impacto esperado:** Requisições repetidas para a mesma página de denúncias dentro do período de 60 segundos são respondidas em aproximadamente 1-5ms (do Redis), em vez de 50-200ms (do PostgreSQL). Isso é crucial para componentes que carregam denúncias frequentemente, como a sidebar.

### 4.2 Degradação Graciosa do Redis (Implementado)

**Ponto de otimização:** Resiliência do sistema em caso de falha do serviço de cache.
**O que foi feito:** O código do Redis (`backend/src/lib/redis.ts`) foi implementado para verificar a disponibilidade do serviço. Se o Redis não estiver configurado ou falhar, as operações de cache são ignoradas, e as requisições são direcionadas diretamente ao banco de dados.

```typescript
export const redis = REDIS_URL ? new Redis(REDIS_URL, { ... }) : null;

export async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null;   // se Redis indisponível, retorna null
  try {
    return await redis.get(key);
  } catch {
    return null;             // erro de conexão? continua sem cache
  }
}
```

**Impacto esperado:** O sistema nunca falha completamente devido a problemas com o cache. Se o Redis estiver offline, as requisições continuam sendo processadas pelo banco de dados, garantindo a disponibilidade do serviço. Isso é um exemplo do padrão **circuit breaker** aplicado ao cache.

### 4.3 Paginação no Banco (Implementado)

**Ponto de otimização:** Redução do volume de dados transferidos e processados.
**O que foi feito:** As consultas ao banco de dados para listagem de denúncias utilizam paginação (`skip` e `take`) através do Prisma ORM (`backend/src/repositories/denuncia.repository.ts`).

```typescript
async findAll(skip: number, take: number) {
  return prisma.denuncia.findMany({ skip, take, orderBy: { createdAt: \'desc\' } });
}
```

**Impacto esperado:** Em vez de carregar todos os registros do banco de dados para a memória do servidor e depois filtrá-los, apenas os registros da página atual são buscados. Isso é fundamental para bancos de dados grandes, onde a diferença pode ser entre buscar 10.000 registros versus apenas 10 registros por requisição.

### 4.4 Memoização no Frontend (Implementado)

**Ponto de otimização:** Otimização do desempenho da interface do usuário.
**O que foi feito:** Conforme detalhado na seção 3.3, o `useMemo` do React é aplicado em componentes como `app-sidebar-gestor.tsx` e `app-sidebar-denunciante.tsx` para memorizar resultados de funções de filtragem e ordenação de dados.

**Impacto esperado:** Evita recomputações desnecessárias em cada re-render do componente, melhorando a fluidez e a responsividade da interface, especialmente em listas de dados potencialmente grandes.

### 4.5 Otimizações Futuras

| Ponto | O que pode ser feito | Impacto esperado |
|---|---|---|
| **Cache por usuário** | Implementar chaves de cache específicas para denúncias de cada usuário (`denuncias:userId:page`). | Eliminar queries repetidas por sessão de usuário, melhorando o desempenho para usuários logados. |
| **Índices no banco de dados** | Adicionar índices no schema do Prisma, por exemplo, `@@index([tipoDenuncia, situacao])`. | Acelerar consultas que filtram por `tipoDenuncia` e `situacao`, beneficiando o Dashboard e a Sidebar. |
| **Stale-While-Revalidate (SWR)** | Manter o cache expirado disponível para o usuário enquanto uma nova versão é buscada em segundo plano. | Eliminar a latência percebida pelo usuário durante a revalidação do cache, proporcionando uma experiência mais fluida. |
| **WebSocket ou Server-Sent Events (SSE)** | Substituir o polling (requisições periódicas) por notificações em tempo real para o gestor. | Reduzir 100% das requisições de atualização desnecessárias, diminuindo a carga no servidor e a latência para o gestor. |
| **React.memo** | Envolver componentes React pesados (gráficos, tabelas complexas) com `React.memo`. | Evitar re-renders de componentes quando suas `props` não foram alteradas, otimizando o ciclo de renderização do frontend. |