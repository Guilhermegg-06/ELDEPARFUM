# feat: registra demanda de perfumes ausentes com Azure Functions

Clientes que procuram referências ainda ausentes poderão confirmar interesse sem alterar o catálogo existente. A Frente A entrega uma API Azure Functions com Table Storage, normalização por aliases, gravação idempotente e ranking administrativo protegido pelo token Supabase existente e allowlist no servidor.

POST exige confirmado=true; Asad/Assad são agrupados por mapa explícito. A quota diária usa transação/ETag; GET calcula contagens no Azure. Inclui contrato v1, mock local para B, divisão de issues, CI e Bicep/manual de deploy. Frontend e entregas de C não foram implementados.

Validação realizada: 24 testes unitários (validação, auth, ranking, replay, concorrência e falhas) e checagem sintática passaram. Sem alterações em arquivos preexistentes.
Limitações: SDK/host Azure não executados; registry npm inacessível e lock pendente. Frontend build bloqueado por instalação EPERM/next ausente. Workflow e Bicep ainda não executados. Azure não provisionado, custo monetário depende de região/oferta; aplicação pública e persistência real não comprovadas.

Abrir esta PR para main somente após aplicar os patches numa branch real. Estado recomendado inicial: draft até instalar dependências, fixar lock e obter CI verde; depois marcar ready para revisão de código. A comprovação em Azure permanece requisito de entrega acadêmica.
Não fazer merge automático. Issues A/B/C precisam ser criadas conforme docs/CLOUD_ISSUES.md; nenhum número foi inventado.
