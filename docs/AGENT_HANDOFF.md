# Handoff — ELDEPARFUM Cloud Demand / Produto Fantasma

Atualizado em 15/11/2026. A Frente A foi integrada e publicada no GitHub. Azure não foi provisionado; aplicação pública e persistência reais continuam pendentes.

## Repositório e publicação

- Repositório: https://github.com/Guilhermegg-06/ELDEPARFUM.
- Branch: `feat/cloud-demand-frente-a`; base real `origin/main` em `041de4a7e428fca364200141612e47105b87666a`, sem avanço desde a inspeção original.
- [PR #5 para main](https://github.com/Guilhermegg-06/ELDEPARFUM/pull/5): revisão de código com validação Azure pendente. Sem merge automático.
- Issues: [A/backend #2](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/2), [B/frontend #3](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/3), [C/testes e entrega #4](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/4). Nenhuma conta atribuída por suposição. A permanece aberta até o aceite Azure real.
- Worktree isolado: `C:\Users\anena\AppData\Local\Temp\eldeparfum-cloud-demand-20261115`. O projeto aberto permanece em `organização`, preservando alterações locais em `.env.exemple`, `.gitignore` e `.vscode/`.
- Não havia AGENTS.md aplicável no projeto ou nos ancestrais inspecionados. `git fetch origin` executado no clone real; apenas os cinco patches numerados foram aplicados com `git am`. O histórico do snapshot não foi publicado.

## Commits reais

Os hashes do snapshot anterior foram substituídos pelos commits aplicados sobre o histórico remoto:

| Commit | Conteúdo |
| --- | --- |
| [7a40f449](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/7a40f449) | Contrato e divisão das frentes |
| [fd4e87cd](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/fd4e87cd) | Backend, ranking protegido e testes |
| [42b70216](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/42b70216) | CI e infraestrutura sem provisionamento |
| [62e3eede](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/62e3eede) | Handoff do ambiente anterior |
| [7f7e05cd](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/7f7e05cd) | Registro do antigo bloqueio HTTP |
| [8f378baa](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/8f378baa) | SDK Azure compatível e lockfile revisado |
| [cd008bb1](https://github.com/Guilhermegg-06/ELDEPARFUM/commit/cd008bb1) | CI exige npm ci com lockfile versionado |

O commit documental posterior, que contém esta atualização, aparece na aba de commits da PR #5.

## Contrato e escopo

Contrato v1 em `docs/CONTRATO_API.md` mantido. Azure Functions v4 / Node 22, JS ESM isolado e Table Storage. POST com confirmação explícita, aliases, idempotência e quota diária atômica; GET agrega ranking após validar sessão Supabase e allowlist de IDs no servidor.

A não implementou a busca, botão de interesse ou radar visual de B, nem matriz, relatório, evidências ou apresentação de C. Não alterou telas, catálogo/banco existente, autenticação compartilhada, carrinho ou compra por WhatsApp. Os arquivos e o lockfile do frontend permanecem iguais aos de origin/main.

## Testes efetivamente executados

- **Backend/dependências:** instalação e reinstalação por `npm ci --ignore-scripts` aprovadas. Lock v3 revisado: 29 pacotes com integridade e URL HTTPS do registry npm, nenhum install script. Node 22.20.0 / npm 10.9.3. No PowerShell com scripts desabilitados usar `npm.cmd`.
- **Segurança do backend:** audit inicial com 3 vulnerabilidades (2 altas, 1 moderada), ligadas ao SDK Functions antigo. Atualização manual compatível de @azure/functions 4.7.0 para 4.17.1, no mesmo major; @azure/data-tables mantido em 13.3.0. Audit posterior: zero vulnerabilidades. Sem audit fix --force.
- **Unitários/sintaxe:** 24/24 testes e `npm --prefix cloud-demand run check` aprovados após a atualização. Validação, auth, aliases, ranking, replay, concorrência, quota e falhas; armazenamento e autenticação usam doubles.
- **SDK/host local real:** Core Tools 4.16.1, runtime 4.1054.250.26428 e SDK real indexaram registrarInteresse e consultarDemanda. GET sem token 401; POST com DEMAND_ENABLED=false 503. Storage/auth remotos vazios; nenhum Azure ou emulador acessado. Processo encerrado.
- **Mock HTTP local:** 127.0.0.1:7072 aprovou criação 201, replay 200, conflito 409, validação 400, auth 401/403, aliases Asad/Assad, variante Asad Bourbon, ranking, CORS/preflight 204, corpo 413 e rota 404. Dados fictícios em memória, processo encerrado.
- **Frontend existente:** npm ci, npm run build e npm run lint aprovados sem credenciais reais. Build com avisos de variáveis Supabase ausentes; não valida login remoto.
- **Bicep:** CLI 0.49.2 compilou infra/cloud-demand/main.bicep sem erros. Sem login, what-if, provisionamento ou deploy.
- **CI remoto:** [Cloud Demand 43749302397](https://github.com/Guilhermegg-06/ELDEPARFUM/actions/runs/43749302397), commit cd008bb1, aprovado nos jobs backend, frontend e infrastructure. Backend: npm ci/test/check/import; frontend: instalação/build; infraestrutura: compilação Bicep. Execuções posteriores aparecem na PR #5. O import isolado do CI usa modo de teste do SDK; registro no worker real foi confirmado separadamente no host local.

Testes unitários validam regras com doubles; mock valida HTTP em memória; host local valida SDK/indexação/worker. Nenhum deles comprova persistência Azure ou autenticação Supabase real.

## Bloqueios resolvidos

DNS/npm, lockfile, instalação do SDK/host, build antes bloqueado por EPERM/Next ausente, conexão HTTP local e compilação Bicep foram resolvidos. Push, issues e PR publicados.

O conector GitHub permite leitura, mas create_issue retornou 403 Resource not accessible by integration. A credencial Git já configurada foi verificada como autorizada para escrita e usada em memória pelo Git Credential Manager/API, sem imprimir ou gravar tokens, para issues e PR. Não foram alteradas permissões do conector.

## Pendências preexistentes do frontend

Audit do lockfile original: **20 vulnerabilidades (1 crítica, 14 altas, 4 moderadas, 1 baixa)**, incluindo Next 16.1.6, axios e transitivas. Pacotes/lockfile do frontend não alterados. Build/lint aprovados não resolvem esses avisos; planejar correção separada com revisão e testes próprios.

## Azure real ainda pendente

G0/G1 e implementação/verificações de código de A concluídos. G3/G4 dependem das frentes integradas e Azure autorizado. Faltam assinatura/oferta/região aprovadas, autorização expressa para custos, provisionamento/publicação, API HTTPS pública, Table persistente após reinício, auth com contas sintéticas reais, CORS publicado, logs/RBAC e consumo real. Custo monetário depende da oferta/região; não foi inventado. Nenhum recurso Azure ou serviço pago criado nesta tarefa.

## Próximos passos dos três integrantes

- **A — Guilherme / #2:** revisar PR #5; após autorização específica, seguir docs/AZURE_DEPLOY.md, revisar custos/parâmetros e validar publicação, storage, reinício, auth e CORS reais. Não fechar A apenas com CI/mock e não fazer merge automático.
- **B — integrante 2 / #3:** definir conta GitHub; usar contrato/mock para implementar busca/estado vazio, confirmação/botão com retry idempotente e radar /admin/demanda em PR própria. Preservar login, catálogo, carrinho e WhatsApp; depois configurar URL Azure autorizada.
- **C — integrante 3 / #4:** definir conta GitHub e preparar sua matriz/roteiro com os pontos de docs/CLOUD_ISSUES.md. Executar E2E após A/B e Azure autorizado; produzir evidências reais, relatório de 4–6 páginas e apresentação de 10–15 minutos com os três e dados sintéticos.
