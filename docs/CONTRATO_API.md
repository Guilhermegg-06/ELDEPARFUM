# Cloud Demand — contrato v1 (congelado)
Escopo: interesses explícitos por referências ausentes. Catálogo, carrinho, compra via WhatsApp e autenticação existentes permanecem no sistema atual. API implantada separadamente em Azure Functions, prefixo /api. Este contrato libera a Frente B; mudanças incompatíveis exigem coordenação com A.

## Integração da Frente B
Base: NEXT_PUBLIC_DEMAND_API_URL=https://<function-app>.azurewebsites.net (sem /api).
Mock local: http://localhost:7072; executar node cloud-demand/scripts/mock.mjs.
Usar fetch(base + '/api/interesses', ...). Para o radar, adminApi(base + '/api/demanda') reutiliza o access_token do Supabase. Não modificar lib/adminApiClient.ts: os erros continuam tendo error textual.

Em app/catalogo/page.tsx, manter /api/products e filtros. Somente oferecer "Registrar interesse" após resposta 2xx válida da busca textual atual, q não vazio e ausência de resultados também na busca sem filtros adicionais. Erro de rede, carregamento, filtros restritivos ou resposta antiga não significam referência ausente. Cancelar/desconsiderar respostas obsoletas.
Exibir referência a confirmar/editável. Nunca enviar POST ao digitar, buscar, renderizar ou ao abrir a página. Apenas clique explícito envia confirmado=true. Não prometer produção, disponibilidade ou aviso futuro.

## POST /api/interesses
Público; Content-Type: application/json; Idempotency-Key: UUID v4 gerado por crypto.randomUUID().
Corpo:
    {"referencia":"Asad","nomePesquisado":"contratipo do Assad","confirmado":true}
Somente estes três campos são permitidos. Os dois nomes devem representar a mesma referência após normalização. Strings de 2 a 100 caracteres após trim, máximo bruto 120; letras/números/espaços/apóstrofo/ponto/vírgula/parênteses/&/hífen. Pelo menos duas letras. Sem controles, HTML, URL ou contatos. Corpo máximo 2.048 bytes.

201:
    {"id":"<UUID enviado>","referenciaNormalizada":"asad","criadoEm":"2026-11-15T18:00:00.000Z","repetido":false}
200 (mesma chave e mesmo corpo validado):
    {"id":"<mesmo UUID>","referenciaNormalizada":"asad","criadoEm":"<data original>","repetido":true}
Manter a chave ao repetir a mesma solicitação após timeout/503; gerar nova chave apenas para nova intenção. Desabilitar botão durante envio e manter confirmação após sucesso. Mesma chave com outro corpo: 409. Idempotência não significa uma pessoa única: não identificamos clientes.

## GET /api/demanda?limite=20
Authorization: Bearer <access_token Supabase existente>. limite inteiro entre 1 e 100, padrão 20.
Azure verifica o token junto ao serviço Auth e compara o ID verificado com DEMAND_ADMIN_USER_IDS, configuração exclusiva do servidor. Login comum, metadados editáveis e acesso à tela não concedem permissão. Usar contas sintéticas de demonstração; nenhum ID de cliente é gravado.

200:
    {"dados":[{"referenciaNormalizada":"asad","contagem":3}],"totalInteresses":3,"totalReferencias":1,"limite":20}
Ordenação: contagem decrescente, empate por referência em ordem lexical. Contagem = solicitações confirmadas, não usuários únicos. Acumula histórico, sem filtro de data; máximo 10.000 registros por leitura. Acima disso retornar 503 sem ranking parcial (arquivar/replanejar antes de ampliar MVP). Resposta vazia: dados=[], totais=0.
Sem cache nas respostas. Não há endpoint público de leitura dos registros brutos.

## Erros (ambos os endpoints)
    {"error":"Mensagem segura em português.","code":"ENTRADA_INVALIDA"}
400 ENTRADA_INVALIDA: JSON/nome/campos/chave/limite inválidos ou confirmação ausente.
401 NAO_AUTENTICADO: token ausente, inválido ou expirado.
403 ACESSO_NEGADO: usuário válido fora da lista.
409 CHAVE_REUTILIZADA: chave já usada com conteúdo diferente.
413 CORPO_MUITO_GRANDE; 415 TIPO_NAO_SUPORTADO.
429 LIMITE_DIARIO: cota global diária de gravações atingida (UTC; padrão 100). Retry-After: 3600.
503 INDISPONIVEL: configuração, autenticação externa, storage, concorrência ou limite de leitura. Não exibir erro interno.
Métodos não registrados: resposta do host Functions (404/405, não garantida neste envelope).
CORS e OPTIONS pertencem ao host Azure, com origens exatas; sem "*" em produção.

## Normalização v1
Trim, espaços únicos, minúsculas, remoção de acentos, pontuação como separador, remoção do prefixo "contratipo [do/de/da]".
Mapa explícito: asad, assad, lattafa asad, asad lattafa => asad.
"asad bourbon" e nomes não mapeados NÃO são unidos por similaridade. Sem IA/fuzzy matching.
Mapa versionado em cloud-demand/src/domain.mjs. Registrar normalizacaoVersao=1 em cada evento; mudar aliases não reclassifica histórico automaticamente.

## Modelo Azure Table Storage
Tabela DemandInterests, PartitionKey=demand-v1.
Evento: RowKey=UUID, tipo=interesse, referenciaNormalizada, nomePesquisado, referenciaInformada, normalizacaoVersao, criadoEm (UTC ISO), payloadHash.
Controle: RowKey=quota-AAAA-MM-DD, tipo=quota, contagem.
Transação atômica na mesma partição: evento + contador diário com ETag. Evita perda de contagem e repetição por retry. A leitura administrativa filtra tipo=interesse e calcula o ranking no Azure.
Sem nome do cliente, e-mail, telefone, IP ou token nas entidades/logs. Campos textuais são apenas nomes de fragrâncias; usar exclusivamente dados fictícios na demonstração.
