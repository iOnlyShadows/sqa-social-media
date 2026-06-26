# Testes E2E e de API — Atividade 5

Projeto de testes **caixa-preta** do SQA Social Media, feito com **Playwright**.
Diferente da Atividade 4 (testes internos com Jest/JUnit), aqui testamos o **sistema rodando**:
o navegador de verdade (E2E) e os endpoints da API publicamente.

## Estrutura

```
tests/
├── e2e/                       # Testes End-to-End (navegador real)
│   ├── cadastro.spec.ts       #   fluxo de cadastro
│   ├── login.spec.ts          #   fluxo de login
│   └── curtir-deslogado.spec.ts  # curtir sem autenticação (alerta)
├── api/                       # Testes de API (caixa-preta)
│   ├── auth.spec.ts           #   signup, signin, reset-password (6 testes)
│   └── posts.spec.ts          #   GET /posts (1 teste)
├── support/
│   └── dados.ts               # helpers (e-mail único, senha, URL da API)
└── playwright.config.ts       # configuração do Playwright
```

Total: **3 testes E2E** + **7 testes de API** (o mínimo exigido é 2 E2E + 4 de API).

## Pré-requisito: o sistema PRECISA estar rodando

Os testes batem no sistema de verdade, então antes de rodar abra **dois terminais**:

**Terminal 1 — Backend (API):**
```bash
cd ../api
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```
Sobe em `http://localhost:8080`. (Precisa do MySQL configurado no `api/src/main/resources/application.properties`.)

**Terminal 2 — Frontend (site):**
```bash
cd ../client
npm run dev
```
Sobe em `http://localhost:3000`.

## Como rodar os testes

Num terceiro terminal, dentro da pasta `tests/`:

```bash
npm test            # roda TODOS os testes (E2E + API)
npm run test:e2e    # só os testes End-to-End
npm run test:api    # só os testes de API
npm run test:ui     # abre o modo visual interativo do Playwright
npm run report      # abre o último relatório em HTML
```

## Observação sobre o bug da Atividade 4

O teste de e-mail duplicado (`api/auth.spec.ts`) confirma que a API responde **409**, mas
a mensagem é "E-mail já está em uso" em vez de "E-mail já cadastrado" (o bug encontrado na
Atividade 4). Aqui validamos o comportamento real do endpoint.
