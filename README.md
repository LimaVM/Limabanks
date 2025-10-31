# 🏦 LimaBank

Sistema completo de gestão financeira pessoal desenvolvido por **DevLima Soluções**.

![LimaBank Logo](public/logo.png)

## 📋 Sobre o Projeto

LimaBank é uma aplicação web responsiva que permite aos usuários gerenciar suas finanças pessoais de forma simples e eficiente. O sistema entrega controle total sobre receitas, despesas, cartões e contas bancárias, mantendo cada usuário isolado em seus próprios arquivos de dados no servidor.

## ✨ Funcionalidades

- 🔐 **Autenticação**: Registro e login com credenciais individuais
- 💳 **Gestão de Contas e Cartões**: Cadastre saldos iniciais, tipos e cores personalizadas
- 💰 **Controle de Transações**: Registre receitas e despesas com múltiplas formas de pagamento
- 📊 **Dashboard Completo**: Resumo financeiro, gráfico por categoria e histórico detalhado
- 📈 **Exportação em PDF**: Gere relatórios completos com contas e movimentos
- 🕒 **Datas em Brasília**: Todos os registros são normalizados para o fuso de Brasília
- 🌓 **Tema Dinâmico**: Alternância entre modo claro e escuro com persistência local
- 📱 **PWA**: Pode ser instalado como aplicativo em desktop e dispositivos móveis

## 🚀 Tecnologias

- **Front-end**: React 19 + Vite + Tailwind CSS 4
- **Componentes**: shadcn/ui + Radix UI + Recharts
- **Gerenciamento de estado**: SWR para sincronização automática dos dados
- **Back-end**: Express 4 servindo APIs REST e arquivos estáticos
- **Persistência**: Arquivos JSON por usuário em `/home/ubuntu/BANCO_DATA`
- **Tipagem**: TypeScript end-to-end

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm 9+

### Passos

```bash
# Clone o repositório
git clone <seu-repositorio>
cd Limabank

# Instale as dependências
npm install

# Compile e inicie o servidor HTTP/HTTPS (porta 80/443)
npm start
```

O comando `npm start` recompila o front-end com Vite e inicia o servidor Express, que por padrão escuta em `0.0.0.0:80` e tenta habilitar HTTPS em `0.0.0.0:443` utilizando certificados de `/etc/letsencrypt/live/con.devlima.wtf/` (personalizáveis via variáveis de ambiente `HTTPS_CERT_PATH` e `HTTPS_KEY_PATH`).

### Desenvolvimento

Para desenvolvimento de interface, utilize o servidor Vite:

```bash
npm run dev
```

> ⚠️ O servidor de desenvolvimento não expõe as rotas de API. Para testar o fluxo completo em ambiente local, execute `npm start` (que compila e sobe o Express) após realizar `npm run build`.

## 📁 Estrutura do Projeto

```
limabank/
├── public/                 # Assets estáticos e manifest PWA
├── server/                 # Utilitários do back-end (armazenamento e timezone)
├── server.js               # Servidor Express (HTTP/HTTPS) + APIs REST
├── src/
│   ├── App.tsx             # Dashboard principal
│   ├── components/         # Componentes React (shadcn/ui + telas)
│   ├── lib/                # Clientes de API e utilitários de fuso horário
│   └── styles/globals.css  # Estilos globais e tokens CSS
├── index.html              # Entrada do Vite
├── package.json            # Scripts e dependências
└── vite.config.ts          # Configuração do bundler
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev    # Inicia o Vite para desenvolvimento do front-end
npm run build  # Gera a versão de produção do front-end em dist/
npm start      # Compila e inicia o servidor Express (HTTP 80 / HTTPS 443)
npm run lint   # Verifica o código com ESLint
```

## 🔒 Segurança & Persistência

- Dados financeiros e credenciais são gravados por usuário em arquivos JSON no diretório `/home/ubuntu/BANCO_DATA`
- Os arquivos são criados automaticamente se não existirem
- O servidor aplica cabeçalhos de segurança via `helmet`
- O processo Node opera fixado no fuso horário `America/Sao_Paulo`
- HTTPS é habilitado automaticamente quando os certificados válidos estão disponíveis

## 📄 Exportação em PDF

Os relatórios PDF incluem:

- Listagem de contas com tipo e saldo atual
- Todas as transações, com data/hora formatadas para Brasília e detalhamento das formas de pagamento
- Totais de receitas, despesas e saldo consolidado

## 📱 Instalação como PWA

1. Acesse a aplicação em produção
2. No navegador (Chrome/Edge), clique no ícone de instalação na barra de endereços
3. No mobile, utilize “Adicionar à tela inicial” para instalar como app standalone

---

Desenvolvido por **DevLima Soluções**.
