# Handoff — Produto Fantasma
## Objetivo
Capturar demanda explícita por perfumes ausentes; sem novo e-commerce e sem automatizar produção.
## G0
Base remota main: 041de4a7e428fca364200141612e47105b87666a.
Next.js 16.1.6 / React 19 / TypeScript; busca em app/catalogo/page.tsx -> /api/products -> lib/products.ts; catálogo Supabase com fallback JSON. Admin usa token Supabase validado no servidor e lista de e-mails. Sem testes ou CI versionados na base; sem AGENTS.md no repositório.
Enunciado PDF lido: R1–R6, Azure real obrigatório, API documentada aceita, relatório 4–6 páginas e apresentação 10–15 minutos.
## Contrato e decisões
docs/CONTRATO_API.md v1 congelado. Azure Functions v4 / Node 22 + Table Storage; serviço JS ESM isolado (não invade build TS do frontend). Supabase apenas autentica admin; catálogo não migra. Allowlist de IDs de teste no servidor Azure. Aliases explícitos, confirmação obrigatória, idempotência, cota diária atômica.
## Responsáveis / arquivos
A — Guilherme/agente: cloud-demand/**, infra/cloud-demand/**, .github/workflows/cloud-demand.yml, docs/CONTRATO_API.md, docs/AGENT_HANDOFF.md, docs/AZURE_DEPLOY.md, docs/CLOUD_ISSUES.md.
B — integrante 2: app/catalogo/page.tsx, componentes de busca/estado vazio, app/admin/demanda/**, cliente HTTP e configuração pública da base da API. Não implementada por A.
C — integrante 3: docs/qa/**, evidências, matriz de integração/aceitação, relatório e demonstração. Não implementada por A.
A não altera telas, catálogo, carrinho, tabelas existentes ou autenticação compartilhada.
## Estado / bloqueios
G0 concluído; G1 documentado; G2/A em implementação local.
GitHub leitura disponível, mas create_branch e create_issue retornaram 403 "Resource not accessible by integration". Sem issue ou PR remota criada.
Clone git: "Could not resolve host: github.com". Snapshot local reconstruído pela conexão GitHub; histórico local NÃO é clone. Aplicar somente patches da feature sobre clone real para publicar.
Azure CLI/Core Tools ausentes; assinatura e credenciais não disponibilizadas nesta sessão. Nenhum serviço criado; nenhum custo autorizado. Azure real e aplicação online NÃO verificados.
## Próximos passos
A: testes, CI, instruções de deploy e pacote de patches revisável.
B pode iniciar pelo contrato/mock; C pode preparar a matriz com as verificações em docs/CLOUD_ISSUES.md.
Sem merge automático; branch de trabalho feat/cloud-demand-frente-a. G3/G4 dependem de Azure autorizado e PRs B/C.
