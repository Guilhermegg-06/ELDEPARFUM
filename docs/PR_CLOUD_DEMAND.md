# feat: registra demanda de perfumes ausentes com Azure Functions

A Frente A entrega a API para registrar interesse explícito por perfumes ausentes e consultar um ranking administrativo, preservando o catálogo existente. O POST exige `confirmado=true`, normaliza aliases como Asad/Assad, mantém Asad Bourbon separado e usa idempotência e quota diária atômica no adaptador Table Storage. O GET valida a sessão Supabase e a allowlist do servidor antes de consultar e agregar a demanda.

Inclui contrato v1, mock para desenvolvimento de B, 24 testes unitários, CI e Bicep/manual de operação. Os cinco patches foram aplicados com `git am` sobre o clone real em `041de4a7`; os commits do snapshot não foram publicados. O SDK `@azure/functions` foi atualizado de 4.7.0 para 4.17.1, no mesmo major, para eliminar os avisos do backend. O lockfile foi revisado e o CI agora exige `npm ci`.

## Verificações executadas

- Backend: `npm ci --ignore-scripts`, 24/24 testes unitários e checagem sintática aprovados; audit com zero vulnerabilidades. Os testes de armazenamento/autenticação usam doubles.
- SDK/host local real: Core Tools 4.16.1, runtime 4.1054.250.26428 e Node 22.20.0 indexaram `registrarInteresse` e `consultarDemanda`; GET sem token retornou 401 e POST desabilitado retornou 503. Storage e credenciais Azure não foram utilizados.
- Mock HTTP em memória: criação 201, replay 200, conflito 409, validação 400, autenticação 401/403, aliases/variante, ranking, CORS/preflight 204, corpo 413 e rota 404 aprovados.
- Frontend existente: `npm ci`, `npm run build` e `npm run lint` aprovados, sem credenciais reais. O build avisa sobre variáveis Supabase ausentes.
- Bicep 0.49.2: compilação aprovada, sem provisionamento.
- CI remoto: [execução 43749302397](https://github.com/Guilhermegg-06/ELDEPARFUM/actions/runs/43749302397) no commit `cd008bb1` aprovada nos jobs `backend`, `frontend` e `infrastructure`. Os checks dos commits posteriores são acompanhados na PR #5; código liberado para revisão após sua aprovação, com Azure pendente.

## Limitações e continuidade

Azure não foi provisionado. API pública, persistência Table real, reinício da Function, autenticação Supabase real e CORS da implantação continuam pendentes de assinatura e autorização específica. SDK/host local e mock não comprovam integração Azure.

O audit do frontend aponta 20 vulnerabilidades preexistentes (1 crítica, 14 altas, 4 moderadas, 1 baixa), incluindo Next 16.1.6. Suas dependências não foram alteradas nesta Frente A; a correção precisa de trabalho separado.

Relaciona-se a [A #2](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/2), [B #3](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/3) e [C #4](https://github.com/Guilhermegg-06/ELDEPARFUM/issues/4). A permanece aberta até comprovar o aceite Azure. B implementará busca/radar em PR própria; C produzirá matriz, evidências, relatório e apresentação. Essas frentes não foram implementadas aqui.

Sem merge automático. Detalhes e próximos passos em `docs/AGENT_HANDOFF.md` e `docs/AZURE_DEPLOY.md`.
