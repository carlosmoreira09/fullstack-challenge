# Desafio Full-stack Júnior — Sistema de Gestão de Tarefas Colaborativo
> 
> #### Initial Database Details
>```
>┌──────────┐          ┌────────────┐        ┌────────────┐
>│  users   │1       * │ assignments│ *    1 │   tasks     │
>├──────────┤          ├────────────┤        ├────────────┤
>│id (pk)   │          │id (pk)     │        │id (pk)     │
>│41*    │          │user_id (fk)│        │title*      │
>│username* │          │task_id (fk)│        │description │
>│password  │          │role        │        │priority*   │ {LOW,MEDIUM,HIGH,URGENT}
>│created_at│          │created_at  │        │status*     │ {TODO,IN_PROGRESS,REVIEW,DONE}
>└──────────┘          └────────────┘        │due_date    │
>                                            │created_by  │ (fk users)
>                                            │updated_at  │
>                                            └────────────┘
>             1     *
>┌──────────┐  ──────>  ┌────────────┐
>│  tasks   │           │  comments  │
>├──────────┤           ├────────────┤
>│id        │           │id (pk)     │
>│...       │           │task_id (fk)│
>│          │           │author_id   │ (fk users)
>└──────────┘           │content*    │
>                       │created_at  │
>                       └────────────┘
>>
>┌──────────────────┐
>│  task_history    │  (audit log simplificado)
>├──────────────────┤
>│id (pk)           │
>│task_id (fk)      │
>│actor_id (fk)     │
>│change_type*      │ {CREATE, UPDATE, STATUS_CHANGE, ASSIGN, COMMENT}
>│before (jsonb)    │
>│after  (jsonb)    │
>│created_at        │
>└──────────────────┘
>
>┌──────────────────┐
>│  notifications   │
>├──────────────────┤
>│id (pk)           │
>│user_id (fk)      │ (quem deve ser notificado)
>│type*             │ {TASK_ASSIGNED, TASK_STATUS, COMMENT_NEW}
>│payload (jsonb)   │ (dados do evento)
>│read_at (nullable)│
>│created_at        │
>└──────────────────┘
>```

## 🎯 Contexto & Objetivo

Construir um **Sistema de Gestão de Tarefas Colaborativo** com autenticação simples, CRUD de tarefas, comentários, atribuição e notificações. O sistema deve rodar em **monorepo** e expor uma **UI** limpa, responsiva e usável. O back‑end deve ser composto por **microserviços Nest** que se comunicam via **RabbitMQ**; o acesso HTTP externo passa por um **API Gateway** (Nest HTTP).

**O que queremos observar:**

* Organização, clareza e pragmatismo.
* Segurança básica (hash de senha, validação de entrada).
* Divisão de responsabilidades entre serviços.
* Qualidade da UI e DX (developer experience).

---

## 🧱 Requisitos Funcionais

### Autenticação & Gateway

* **JWT** com **cadastro/login** (email, username, password) e **proteção de rotas no API Gateway**.
* **Hash de senha** com **bcrypt** (ou argon2).
* **Tokens:** `accessToken` (15 min) e `refreshToken` (7 dias) + **endpoint de refresh**.
* **Swagger/OpenAPI** exposto no Gateway.

### Tarefas (inclui comentários e histórico)

* **CRUD completo** com campos: **título**, **descrição**, **prazo**, **prioridade** (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) e **status** (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
* **Atribuição a múltiplos usuários**.
* **Comentários**: criar e listar em cada tarefa.
* **Histórico de alterações** (audit log simplificado).

### Notificações & Tempo Real

* Ao **criar/atualizar/comentar** uma tarefa, **publicar evento** no broker (**RabbitMQ**).
* Serviço de **notifications** consome da fila, **persiste** e **entrega via WebSocket**.
* WebSocket notifica quando:

  * a tarefa é **atribuída** ao usuário;
  * o **status** da tarefa muda;
  * há **novo comentário** em tarefa da qual participa.

### Docker

* **Obrigatório subir tudo com Docker Compose** (serviços do app, broker, dbs, etc.).


## ⚡ HTTP Endpoints & WebSocket Events

### HTTP (Gateway)


### WebSocket Events

---

## 🏗️ Estrutura do Monorepo (sugerida)

---

## 🧭 Front-end (exigências)

* **React.js** com **TanStack Router**.
* **UI:** mínimo 5 componentes com **shadcn/ui** + **Tailwind CSS**.
* **Páginas obrigatórias:**
  * Login/Register com validação (Pode ser um modal)
  * Lista de tarefas com filtros e busca
  * Detalhe da tarefa com comentários
* **Estado:** Context API ou Zustand para auth.
* **WebSocket:** conexão para notificações em tempo real.
* **Validação:** `react-hook-form` + `zod`.
* **Loading/Error:** Skeleton loaders (shimmer effect) e toast notifications.

> **Diferencial:** TanStack Query.

---

## 🛠️ Back-end (exigências)

* **Nest.js** com **TypeORM** (PostgreSQL).
* **JWT** com Guards e estratégias Passport.
* **Swagger** completo no Gateway (`/api/docs`).
* **DTOs** com `class-validator` e `class-transformer`.
* **Microserviços** Nest.js com **RabbitMQ**.
* **WebSocket** Gateway para eventos real-time.
* **Migrations** com TypeORM.
* **Rate limiting** no API Gateway (10 req/seg).

> **Diferencial:** health checks, Logging com Winston ou Pino, testes unitários.

---

## 🐳 Docker & Compose (sugerido)

---

## 📝 Documentação Esperada

No seu README, inclua:

1. **Arquitetura** (diagrama simples ASCII ou imagem)
2. **Decisões técnicas** e trade-offs
3. **Problemas conhecidos** e o que melhoraria
4. **Tempo gasto** em cada parte
5. **Instruções específicas** se houver

---

## 📚 Material de Referência

Para auxiliar no desenvolvimento deste desafio, disponibilizamos alguns conteúdos que podem ser úteis:

### Vídeos Recomendados


---

## ❓ Nice to Have

**Posso usar NextJS ao invés de React puro?**
Não. React com TanStack Router é obrigatório.

**Preciso implementar reset de senha?**
Não é obrigatório, mas seria um diferencial.

**WebSocket é obrigatório?**
Sim, para notificações em tempo real.

**Posso usar Prisma ou MikroORM ao invés de TypeORM?**
Não. TypeORM é requisito obrigatório.
---
## 💡 Dicas Finais
* **Comece pelo básico:** Auth → CRUD → RabbitMQ → WebSocket.
* **Logs claros:** Facilita debug do fluxo assíncrono.
---

**Boa sorte!** 🚀
