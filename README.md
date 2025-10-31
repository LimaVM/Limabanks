# 🏦 LimaBank

Sistema completo de gestão financeira pessoal desenvolvido por **DevLima Soluções**.

![LimaBank Logo](public/logo.png)

## 📋 Sobre o Projeto

LimaBank é uma aplicação web Progressive Web App (PWA) que permite aos usuários gerenciar suas finanças pessoais de forma simples e eficiente. Com interface moderna e intuitiva, o sistema oferece controle total sobre receitas, despesas, cartões e contas bancárias.

## ✨ Funcionalidades

- 🔐 **Sistema de Autenticação**: Login e registro de usuários com senha
- 💳 **Gestão de Cartões e Bancos**: Adicione e gerencie múltiplos cartões e contas bancárias
- 💰 **Controle de Transações**: Registre receitas e despesas vinculadas a cartões/bancos específicos
- 📊 **Dashboard Completo**: Visualize resumos financeiros com gráficos e estatísticas
- 📈 **Gráficos por Categoria**: Análise visual de gastos por categoria
- 🌓 **Modo Escuro**: Interface adaptável com tema claro e escuro
- 💾 **Armazenamento Local**: Todos os dados salvos localmente no navegador
- 📱 **PWA**: Instale como aplicativo no celular ou desktop
- ⚡ **Saldos Negativos**: Suporte para contas e cartões com saldo negativo
- 📤 **Exportação de Dados**: Exporte seus dados financeiros em JSON

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Componentes**: shadcn/ui + Radix UI
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Temas**: next-themes
- **Formulários**: React Hook Form + Zod
- **TypeScript**: Tipagem completa

## 📦 Instalação Local

### Pré-requisitos

- Node.js 18+ 
- npm ou pnpm

### Passos

\`\`\`bash
# Clone o repositório
git clone <seu-repositorio>
cd limabank

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Acesse http://localhost:3000
\`\`\`

## 🌐 Deploy em Produção

O projeto está configurado para deploy em VPS Ubuntu com Nginx e PM2.

### Acesso em Produção

- **URL**: https://con.devlima.wtf
- **Portas**: 80 (HTTP) e 443 (HTTPS)
- **SSL**: Let's Encrypt

### Guia Completo de Deploy

Consulte o arquivo [DEPLOY.md](DEPLOY.md) para instruções detalhadas de como fazer o deploy em uma VPS Ubuntu.

### Deploy Rápido

\`\`\`bash
# Na VPS, execute:
cd /var/www/limabank
./deploy.sh
\`\`\`

## 📱 PWA - Progressive Web App

O LimaBank pode ser instalado como aplicativo:

### No Desktop (Chrome/Edge)
1. Acesse https://con.devlima.wtf
2. Clique no ícone de instalação na barra de endereços
3. Clique em "Instalar"

### No Mobile (Android/iOS)
1. Acesse https://con.devlima.wtf
2. Abra o menu do navegador
3. Selecione "Adicionar à tela inicial"

## 🎨 Recursos Visuais

- **Logo**: Design futurista com elementos de segurança e tecnologia
- **Cores**: Paleta verde e azul escuro com acentos ciano
- **Tipografia**: Fontes modernas e legíveis
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🔒 Segurança

- Autenticação local com hash de senhas
- Dados armazenados apenas no navegador do usuário
- Sem envio de dados para servidores externos
- HTTPS obrigatório em produção
- Headers de segurança configurados no Nginx

## 📊 Estrutura de Dados

Os dados são armazenados em localStorage no formato JSON:

\`\`\`json
{
  "users": {
    "username": {
      "password": "hashed_password",
      "accounts": [...],
      "transactions": [...]
    }
  }
}
\`\`\`

## 🛠️ Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar em produção
npm run start

# Lint
npm run lint

# Deploy (com PM2)
npm run deploy
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
limabank/
├── app/                    # Páginas Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial/dashboard
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── login-page.tsx    # Tela de login
│   ├── account-manager.tsx
│   ├── transaction-form.tsx
│   └── ...
├── lib/                   # Utilitários
│   ├── auth-storage.ts   # Gerenciamento de autenticação
│   ├── finance-storage.ts # Gerenciamento de dados financeiros
│   └── utils.ts          # Funções auxiliares
├── public/               # Arquivos estáticos
│   ├── logo.png         # Logo do LimaBank
│   ├── manifest.json    # Manifest PWA
│   └── sw.js           # Service Worker
├── DEPLOY.md           # Guia de deploy
├── nginx.conf          # Configuração Nginx
├── ecosystem.config.js # Configuração PM2
└── deploy.sh          # Script de deploy
\`\`\`

## 🤝 Suporte

Para suporte técnico ou dúvidas:

- **Email**: contato@devlima.wtf
- **Website**: https://devlima.wtf

## 📄 Licença

Propriedade de DevLima Soluções. Todos os direitos reservados.

## 👨‍💻 Desenvolvido por

**DevLima Soluções**

Sistema de gestão financeira pessoal moderno e eficiente.

---

© 2025 DevLima Soluções - LimaBank
