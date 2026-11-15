# Issues preparadas — criação remota bloqueada (403)
Criar três issues sem atribuir usernames presumidos. Estados abaixo são planejados, não issues já publicadas.

## A — Backend, contratos e Azure (Em andamento)
Responsável: Guilherme.
- Implementar POST explícito, normalização e idempotência; GET protegido e ranking calculado na nuvem.
- Integrar Table Storage, testes unitários, workflow CI, configuração de deploy e custo.
- Entregar contrato v1, mock e handoff; abrir PR para main sem merge.
- Aceite local: testes/check passam, nenhum arquivo B/C alterado.
- Aceite remoto pendente: CI verde, Azure persistente e API pública confirmados.
Arquivos reservados: ver handoff. Não fechar issue apenas com mock local.

## B — Busca e radar administrativo (Ready após G1)
Responsável: integrante 2 (definir conta GitHub).
- Reutilizar catálogo, diferenciar vazio real de filtros/erros/loading/respostas antigas.
- Confirmação explícita; botão com loading/sucesso/erro; chave UUID mantida em retries.
- Radar /admin/demanda usando login atual, contrato v1 e estados 401/403/503.
- Base API por variável pública; zero credenciais de storage ou chaves administrativas no browser.
- Executar contra mock antes do Azure; PR própria, preservar compra/carrinho.
Dependência: CONTRATO_API v1. Não depende de provisionamento para desenvolver.

## C — Integração, evidências e entrega acadêmica (Ready para planejar; E2E bloqueado)
Responsável: integrante 3 (definir conta GitHub).
C deve elaborar/executar a matriz; A apenas informa os pontos necessários:
- Demonstrar entrada inválida não persistida e ausência de POST ao somente pesquisar.
- Asad/contratipo do Assad agrupados; Asad Bourbon separado.
- Retry com mesma chave não duplica; usuário comum e token expirado não acessam ranking.
- Inserir pela URL pública Azure, confirmar entidade no Table Storage e GET após reiniciar Function; excluir possibilidade de mock.
- Demonstrar processamento no Azure com logs de invocação sem payload/token, versão publicada e ranking consistente.
- Verificar CORS/preflight no navegador, isolamento do catálogo/carrinho, falha de rede/storage e resposta vazia.
- Evidenciar Resource Group, Function App, tabela, RBAC, configurações mascaradas e consumo real.
- Relatório PDF 4–6 páginas; arquitetura PaaS/FaaS; estimativa de custo com data/região/oferta; limitações.
- Demonstração 10–15 minutos com participação dos três e dados sintéticos.
Dependências: PR A + PR B + Azure autorizado. Não considerar CI unitário como prova de Azure.
