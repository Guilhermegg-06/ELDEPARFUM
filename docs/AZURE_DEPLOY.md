# Azure — operação da Frente A
Estado em 15/11/2026: 24 testes unitários, smoke HTTP do mock, SDK/host local real, build/lint e compilação Bicep aprovados; CI de código aprovado. Azure NÃO provisionado nem verificado. Nenhuma despesa autorizada. O contrato/mock pode liberar B; não satisfaz R1–R5 sem implantação real. Resultados e links em AGENT_HANDOFF.md.

## Arquitetura e motivo
Frontend Next existente (hospedagem atual preservada) -> HTTPS -> Azure Functions v4 / Node 22 -> Azure Table Storage.
GET administrativo valida token no Supabase Auth existente antes de ler a tabela. POST valida/normaliza; GET agrega/ordena no processo Azure Functions. Supabase não armazena interesses.
Functions é PaaS/FaaS; Storage é serviço gerenciado PaaS. Sem VM e sem migração do catálogo.
Windows Consumption Y1 mantém Node 22 e ZIP local simples. StorageV2 LRS aloja Table + arquivos/runtime. A arquitetura preferida foi mantida; Windows é apenas escolha de hospedagem.
Infra preparada em infra/cloud-demand/main.bicep e compilada com Bicep 0.49.2, sem provisionamento. App Insights não provisionado; usar logs do host/stream e métricas básicas para a primeira demonstração.

## Desenvolvimento
Node 22. Na pasta cloud-demand:
- npm ci — obrigatório com o lockfile versionado; no PowerShell com scripts desabilitados usar npm.cmd.
- node --test test/*.test.mjs
- node scripts/check.mjs
- node scripts/mock.mjs — somente contrato local, memória; nunca importar o mock na função.
Para runtime real local: instalar dependências, Azure Functions Core Tools v4 e Azurite com suporte a Tables; copiar local.settings.example.json para local.settings.json, criar tabela DemandInterests no emulador e definir DEMAND_ENABLED=true; npm start.
Mock: token Bearer mock-admin permite GET; mock-user retorna 403; demais 401. Use fetch específico no desenvolvimento, sem alterar o login real para aceitar estes tokens. Não enviar credenciais reais ao mock.
Dependências instaladas e lockfile revisado: @azure/functions 4.17.1 e @azure/data-tables 13.3.0; audit do backend sem vulnerabilidades. O SDK Functions foi atualizado dentro do mesmo major para resolver os avisos da versão 4.7.0. CI exige npm ci; não há fallback para instalação sem lock.
Core Tools 4.16.1 / runtime 4.1054.250.26428 indexaram as duas Functions no host local; GET sem token retornou 401 e POST desabilitado retornou 503, sem storage nem auth remotos. Isso não valida persistência ou implantação Azure.
Build e lint do frontend aprovados sem credenciais reais; avisos de ambiente Supabase ausente eram esperados. O audit do lockfile original do frontend tem 20 vulnerabilidades preexistentes, incluindo uma crítica; registradas separadamente no handoff, sem alterar dependências do catálogo.

## Gate de implantação
1. Confirmar assinatura acadêmica/institucional autorizada, saldo/crédito, região e permissão de criação. Não assinar plano particular.
2. Obter aprovação expressa para o conjunto concreto: Resource Group dedicado, Function App Windows Consumption Y1, StorageV2 Standard_LRS (Table + runtime/Files); sem VM, premium, banco novo ou App Insights. Storage pode cobrar mesmo com franquia de Functions.
3. Revisar custo no calculator da oferta/região escolhida. Criar alerta de orçamento no Portal. Alerta não é limite rígido de gastos; cota de gravação não impede custo de requisições abusivas.
4. Preparar contas/cenários sintéticos: administrador autorizado, usuário sem privilégio e token inválido/expirado. Não usar dados pessoais reais.

## Provisionamento manual após o gate
Exemplos de comandos; NÃO executados por este agente.
Autenticar com az login e confirmar az account show (não colar tokens/segredos no chat).
Copiar infra/cloud-demand/parameters.example.json para parameters.local.json (ignorado).
Ajustar nome global único minúsculo, região, origem HTTPS EXATA, URL/chave publicável do Supabase e UUID de conta sintética autorizada. Não usar service_role.
O exemplo tem custosAutorizados=false e será recusado pelo template. Alterar para true somente após aprovação expressa.

    az account set --subscription <ID_AUTORIZADO>
    az bicep build --file infra/cloud-demand/main.bicep
    az group create --name rg-elde-demand-demo --location <REGIAO_APROVADA>
    az deployment group what-if --resource-group rg-elde-demand-demo --template-file infra/cloud-demand/main.bicep --parameters @infra/cloud-demand/parameters.local.json
    az deployment group create --resource-group rg-elde-demand-demo --template-file infra/cloud-demand/main.bicep --parameters @infra/cloud-demand/parameters.local.json

What-if não substitui aprovação nem estimativa de custo. Restringir IAM do grupo à equipe autorizada.
Configuração inicial DEMAND_ENABLED=false; habilitar no Portal somente após publicar e verificar dependências, CORS e autorização.
Reaplicar Bicep substitui appsettings e desabilita gravações novamente; revisar alterações posteriores antes de reaplicar.

## Empacotamento e publicação
Após lock revisado, npm ci --omit=dev na pasta cloud-demand. Executar node scripts/package.mjs; retorna pasta nova deploy-UUID com apenas src, host.json, package*, node_modules.
Comprimir o CONTEÚDO dessa pasta para demand.zip, garantindo host.json na raiz; não incluir local.settings.json, parâmetros, testes ou mocks.
Após autorização e login:
    az functionapp deployment source config-zip --resource-group rg-elde-demand-demo --name <APP_NAME> --src <CAMINHO_DO_ZIP>
No Portal, confirmar duas funções registrarInteresse e consultarDemanda.
Configurar DEMAND_ENABLED=true. A origem pública da API é saída apiBaseUrl do template. B define NEXT_PUBLIC_DEMAND_API_URL no frontend e redeploya sua própria PR.

## Segurança e operação
- Storage connection string somente em App Settings; nunca NEXT_PUBLIC, git, logs, screenshots ou respostas. Template calcula a chave sem output; limitar quem pode ler configuração/deployment. Rotacionar após exposição.
- HTTPS/TLS1.2; blob público desabilitado. Table exige chave de conta. Rede pública do storage continua habilitada neste MVP; credencial de conta é ampla. Evolução: managed identity com Storage Table Data Contributor, sem migrar catálogo.
- Allowlist de UUIDs de teste no servidor Azure, sem confiar em e-mail/metadados do navegador. authLevel anonymous no host é intencional: handler GET faz autenticação e autorização. POST público.
- CORS só origens específicas; não é controle de autenticação nem proteção contra scripts externos.
- Confirmação explícita, UUID idempotente, máximo 2KiB, cota global diária de 100 gravações em transação com ETag, 10 concorrentes no host e uma instância configurada. Isso NÃO elimina abuso/DoS; quotas limitam dados, não todas as invocações/custos. Avaliar proteção adicional antes de ampliar uso público.
- Kill switch DEMAND_ENABLED=false interrompe gravações, preservando leitura admin; parar Function App reduz execução mas storage permanece faturável.
- Evitar logs de payload, Authorization e erros do SDK. Correlacionar pelo ID de invocação.
- Retenção: dados sintéticos até a avaliação. Depois, obter autorização para excluir Resource Group ou arquivar/remover entidades; exclusão é destrutiva e não automatizada.
- Ranking falha com 503 acima de 10.000 registros, sem soma parcial. Não remover quota corrente isoladamente (reabriria cota). Alterar aliases exige decisão sobre histórico.
- Host pode rejeitar corpo grande antes do handler com 413 e envelope próprio; frontend deve tratar status mesmo sem JSON.

## Estimativa reproduzível de consumo/custo
Premissa mensal: 1.000 POST confirmados + 100 leituras admin = 1.100 execuções; duração média estimada 0,5s, memória faturável assumida 0,5GB => 275 GB-s.
Cada inserção sem retry faz duas leituras e transação de duas operações; reservar conservadoramente 4.000 operações + paginações do ranking + retries. Reservar 0,01GB para entidades; arquivos do runtime/pacote são cobrados à parte.
Fórmula: Functions da oferta + 0,01 × preço Table GB-mês + (operações / 10.000) × preço transações + Files/Blob/Queue do host + tráfego/logs.
Windows Consumption pode ter franquia de 1 milhão de execuções e 400.000 GB-s/mês por assinatura em ofertas elegíveis. Cenário abaixo desses volumes NÃO comprova custo zero: confirmar franquia compartilhada/oferta acadêmica; storage não está incluído.
Páginas públicas retornaram preços monetários dinâmicos ("$-"), sem cotação da assinatura/região. Custo monetário final BLOQUEADO, não inventado. C deve preencher tarifas/total com oferta e data antes de provisionar.
Nenhuma reserva financeira aprovada ou promessa de gratuidade. Verificar Cost Management após demonstração.

Fontes oficiais consultadas em 15/11/2026:
- https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node
- https://learn.microsoft.com/en-us/azure/azure-functions/functions-infrastructure-as-code?tabs=bicep
- https://learn.microsoft.com/en-us/azure/azure-functions/run-functions-from-deployment-package
- https://azure.microsoft.com/en-us/pricing/details/functions/
- https://azure.microsoft.com/en-us/pricing/details/storage/tables/
- https://supabase.com/docs/reference/javascript/auth-getuser

## Verificação após implantação (A com suporte de C)
POST real com UUID, retry 200 sem duplicar; ler como admin e comparar. Reiniciar Function e ler novamente. Confirmar entidades no Resource Group correto. Confirmar 400/401/403 e nenhuma gravação inválida. Logs/métricas e resposta pública devem vir da Function publicada, não do mock.
C cuida da matriz, E2E integrado, capturas e relatório; testes unitários não substituem estas provas.
