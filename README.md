# ELDEPARFUM - Vitrine de Perfumes Premium

Uma plataforma elegante, moderna e responsiva para catálogo de perfumes premium, construída com Next.js (App Router), TypeScript, Tailwind CSS e Framer Motion.

> **Nota:** A partir da fase 2 o site integra com Supabase para armazenamento de produtos, autenticação de administradores e upload de imagens.

## 🎯 Visão Geral

ELDEPARFUM é uma vitrine de e-commerce sem banco de dados (Fase 1) que oferece:

- ✨ Catálogo completo de perfumes com descrições detalhadas
- 🛒 Carrinho funcional com persistência em localStorage
- 💬 Checkout simplificado via WhatsApp
- 🎨 Design minimalista premium (preto/branco/cinza)
- 🌐 Painel admin com Decap CMS para gerenciar produtos
- 📱 Totalmente responsivo (mobile-first)
- ⚡ Animações suaves com Framer Motion
- 🔍 Filtros e busca no catálogo

## 🚀 Como Rodar Localmente

## Variáveis de ambiente
A seguir estão as variáveis que podem ser definidas em `.env.local` (copie de `.env.example`):

```env
# dados do whatsapp (continua sendo usado para checkout)
NEXT_PUBLIC_WHATSAPP_PHONE=55XXXXXXXXXXX

# Supabase (caso queira usar o BD ao invés do mock de JSON)
NEXT_PUBLIC_SUPABASE_URL=\
NEXT_PUBLIC_SUPABASE_ANON_KEY=\
SUPABASE_SERVICE_ROLE_KEY=\

# Lista de e‑mails autorizados a acessar o painel admin
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Ativa botão de login com Apple (opcional)
NEXT_PUBLIC_ENABLE_APPLE_AUTH=true
```

As chaves do Supabase são obtidas no dashboard do seu projeto. A `SERVICE_ROLE_KEY` **não deve** ser colocada em um cliente público, por isso apenas usos no servidor (API) devem acessá‑la.

Continuando com os passos de instalação:

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd eldeparfum

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Atualize o número do WhatsApp em .env.local
# NEXT_PUBLIC_WHATSAPP_PHONE=55XXXXXXXXXXX (sem hífens ou espaços)
```

### Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
eldeparfum/
├── app/                           # Rotas Next.js (App Router)
│   ├── layout.tsx                 # Layout principal
│   ├── page.tsx                   # Home
│   ├── catalogo/page.tsx          # Catálogo com filtros
│   ├── p/[slug]/page.tsx          # Detalhe do produto
│   ├── carrinho/page.tsx          # Página do carrinho
│   ├── sobre/page.tsx             # Sobre a loja
│   ├── contato/page.tsx           # Contato
│   └── globals.css                # Estilos globais
│
├── components/                    # Componentes React
│   ├── Header.tsx                 # Header sticky
│   ├── Footer.tsx                 # Footer
│   ├── ProductCard.tsx            # Card de produto
│   ├── ProductGrid.tsx            # Grid de produtos
│   ├── FiltersBar.tsx             # Barra de filtros
│   ├── CartDrawer.tsx             # Drawer do carrinho
│   └── QuantitySelector.tsx       # Seletor de quantidade
│
├── lib/                           # Funções utilitárias
│   ├── types.ts                   # Types/Interfaces TypeScript
│   ├── cart.ts                    # Lógica do carrinho (localStorage)
│   ├── whatsapp.ts                # Gerador de links WhatsApp
│   ├── format.ts                  # Formatação (preços, datas, etc)
│   └── products.ts                # Carregamento e filtragem de produtos
│
├── content/
│   └── products/                  # Produtos em JSON
│       ├── invictus-100ml.json
│       ├── la-vie-est-belle-50ml.json
│       └── ... (mais produtos)
│
├── public/
│   ├── products/                  # Imagens dos produtos
│   │   └── placeholder-*.jpg
│   └── admin/                     # Decap CMS
│       ├── index.html
│       └── config.yml
│
├── .env.example                   # Variáveis de ambiente (exemplo)
├── .env.local                     # Variáveis de ambiente (local)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md                      # Este arquivo
```

## 🛍️ Como Adicionar Produtos (Admin)

### Opção 1: Via Decap CMS (Recomendado para Fase 2)

1. Acesse `/admin` no seu site
2. Configure a autenticação via Git Gateway (veja seção de Setup do CMS)
3. Clique em "New Product"
4. Preencha os campos
5. Publique (faz commit no repositório)

### Opção 2: Adicionar Manualmente em JSON (Atual)

1. Crie um novo arquivo em `content/products/` com o nome `{slug}.json`
2. Siga este template:

```json
{
  "id": "nome-volume-ml",
  "slug": "nome-volume-ml",
  "name": "Nome do Perfume",
  "brand": "Marca",
  "price": 299.90,
  "ml": 100,
  "gender": "unissex",
  "family": "Família Olfativa",
  "notes_top": ["Nota 1", "Nota 2", "Nota 3"],
  "notes_heart": ["Nota 1", "Nota 2", "Nota 3"],
  "notes_base": ["Nota 1", "Nota 2", "Nota 3"],
  "description": "Descrição completa do perfume...",
  "images": ["/products/imagem-1.jpg", "/products/imagem-2.jpg"],
  "rating_avg": 4.8,
  "rating_count": 150,
  "in_stock_label": "Em estoque",
  "featured": true,
  "best_seller": true
}
```

3. Adicione as imagens em `public/products/`
4. Commit e push

## ⚙️ Configuração do WhatsApp

### Atualizar o Número

Edite `.env.local`:

```
NEXT_PUBLIC_WHATSAPP_PHONE=5511987654321
```

**Formato:** Código do país (55) + DDD (11) + Número (9 dígitos) - **SEM hífens ou espaços**

### Customizar Mensagem

Edite `lib/whatsapp.ts` na função `generateWhatsAppMessage()` para personalizar o texto.

---

## ⚙️ Configuração do Supabase (fase 2)

Para começar a usar o banco de dados e o painel admin, siga estes passos:

1. Crie um projeto em https://supabase.com e copie as variáveis de ambiente para o `.env.local` do repositório.
2. No **SQL Editor** execute o script `docs/supabase_schema.sql` para criar as tabelas e trigger.
3. Na seção **Authentication → Providers** habilite Google (e Apple se desejar).
   - Quando habilitar Apple, defina `NEXT_PUBLIC_ENABLE_APPLE_AUTH=true` em .env.local.
4. Crie o bucket `product-images` em **Storage → Buckets** e marque como público.
6. (Importante) desabilite Row Level Security nas tabelas `products` e `product_images` ou configure políticas que permitam que o *anon key* realize operações de leitura e escrita. O painel admin atual usa o **anon** client para CRUD; se preferir você pode trocar para usar APIs server-side com a service role key.
7. Popule a variável `ADMIN_EMAILS` com os e‑mails de quem poderá acessar `/admin`.
8. Reinicie o servidor (`npm run dev`).

Depois disso o site público irá ler produtos do Supabase e o painel em `/admin` ficará disponível para administradores autorizados.

### Usando o painel
- Abra `https://<seu-site>/admin`.
- Se não estiver autenticado, você será redirecionado para `/admin/login`.
- Entre com Google (ou Apple, se habilitado) usando um e‑mail presente em `ADMIN_EMAILS`.
- Ao entrar você verá a lista de produtos e poderá criar/editar/excluir.

> Nota: há também uma rota pública `/login` pensada para clientes finais. Ela apenas inicia o fluxo de OAuth (sem restrições) e retorna à home; o carrinho permanece via WhatsApp.

## 🎨 Customizar Design

### Cores

Edite `tailwind.config.ts`:

```ts
theme: {
  colors: {
    // Customize aqui
  }
}
```

### Tipografia

Edite `app/globals.css` e `tailwind.config.ts`

### Espaçamento

Todos os espaços usam classes Tailwind (p-4, m-8, etc). Customize em `tailwind.config.ts`.

## 📦 Instalações Adicionais

Se quiser adicionar mais funcionalidades:

```bash
# Icones extras
npm install @heroicons/react

# Validação de formulários
npm install zod react-hook-form

# Notificações
npm install sonner

# Carrossel
npm install embla-carousel-react
```

## 🔐 Segurança

- ✅ CSRF Protection habilitado por padrão no Next.js
- ✅ Headers de segurança configurados
- ✅ Validação de inputs no front-end
- ⚠️ Fase 1: Sem backend/banco de dados
- 🔄 Fase 2: Adicionar autenticação e backend seguro

## 📊 Análise e SEO

### Meta Tags por Produto

Cada página de produto tem:
- `<title>` dinâmico
- `meta description`
- Open Graph tags para compartilhamento
- Schema.json (pronto para implementar)

### Sitemap e Robots.txt

Crie quando fizer deploy em produção:

```
/public/sitemap.xml
/public/robots.txt
```

## 🚢 Deployment na Vercel

### Passo 1: Push para GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Passo 2: Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Import do seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_WHATSAPP_PHONE`
   - `NEXT_PUBLIC_API_URL` (se usar backend)
4. Deploy automático em push

### Passo 3: Configurar Decap CMS (Opcional)

1. Instale Netlify CLI: `npm install -g netlify-cli`
2. Crie conta em [netlify.com](https://netlify.com)
3. Configure Git Gateway em Netlify
4. Atualize `public/admin/config.yml` com sua URL

## 🔮 Roadmap Fase 2

- [ ] Backend FastAPI em Vercel Functions
  - GET `/api/products` - lista paginada
  - GET `/api/products/{slug}` - detalhe
  - GET `/api/filters` - filtros derivados
  - POST `/api/orders` - salvar pedidos

- [ ] Banco de Dados
  - Supabase (PostgreSQL) ou Firebase
  - Tabelas: products, orders, customers

- [ ] Autenticação
  - NextAuth.js para admin
  - OAuth com GitHub/Google

- [ ] Funcionalidades Extras
  - Wishlist/Favoritos
  - Avaliações reais de clientes
  - Email transacional
  - Analytics avançado
  - Programa de fidelidade

## 🐛 Troubleshooting

### "Produto não encontrado"
- Verifique se o arquivo JSON existe em `content/products/`
- Certifique-se que o `slug` no arquivo corresponde à URL

### "Carrinho não salva"
- Limpe o localStorage: F12 → Application → Clear Storage
- Verifique se `NEXT_PUBLIC_WHATSAPP_PHONE` está configurado

### "WhatsApp link não funciona"
- Certifique-se que o número tem 13 caracteres (55 + DDD + 9 dígitos)
- Tente abrir manualmente: `https://wa.me/5511999999999`

## 📝 Licença

MIT

## 👥 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

Feito com profissionalismo para ELDEPARFUM This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
