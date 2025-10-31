# Mudanças: Armazenamento no Servidor

## O que mudou?

O LimaBank utiliza agora um backend Express dedicado. Todos os dados são gravados no servidor em arquivos JSON, eliminando a dependência de `localStorage` e garantindo isolamento entre usuários.

## Benefícios

✅ **Múltiplos dispositivos**: mesma conta acessível em qualquer navegador
✅ **Sincronização automática**: atualizações a cada 1 segundo via SWR
✅ **Persistência real**: dados sobrevivem a limpezas de cache/localStorage
✅ **Isolamento por usuário**: ninguém enxerga registros financeiros de terceiros

## Arquitetura

### Armazenamento

- **Diretório base**: `/home/ubuntu/BANCO_DATA`
- **Arquivos**:
  - `auth.json` – lista de usuários cadastrados
  - `finance-<userId>.json` – transações e contas de um usuário específico

O diretório é criado automaticamente na primeira requisição, com permissões recursivas.

### APIs REST (Express)

- **Autenticação**
  - `POST /api/auth/register` – cria um novo usuário
  - `POST /api/auth/login` – autentica e retorna `{ userId, email }`
- **Dados Financeiros**
  - `GET /api/finance/:userId` – retorna contas e transações
  - `POST /api/finance/:userId` – atualiza o snapshot completo (uso interno)
- **Contas/Cartões**
  - `POST /api/accounts/:userId` – adiciona uma conta ou cartão
  - `DELETE /api/accounts/:userId?id=<accountId>` – remove uma conta/cartão
- **Transações**
  - `POST /api/transactions/:userId` – registra receita/despesa com múltiplos pagamentos
  - `DELETE /api/transactions/:userId?id=<transactionId>` – remove uma transação

### Atualização em tempo real

O front-end usa **SWR** com intervalo de 1 segundo:
- Revalida automaticamente quando a aba recebe foco
- Revalida após reconectar à internet
- Cache inteligente para minimizar requisições

## Arquivos importantes

- `server/storage.js` – leitura/escrita dos JSONs em disco
- `server/timezone.js` – normalização de datas para o fuso de Brasília
- `server.js` – servidor Express (HTTP/HTTPS) + rotas REST
- `src/lib/api-client.ts` – cliente TypeScript consumido pelo front-end
- `src/App.tsx` – dashboard React que consome as APIs

## Fluxos principais

### Login
1. Usuário informa email/senha
2. Front-end chama `POST /api/auth/login`
3. Express consulta `auth.json`
4. Retorna `{ success, userId, email }`
5. Front-end grava `userId` e `email` em `localStorage`
6. Dashboard consome dados via SWR

### Carregamento de dados
1. SWR inicializa com `/api/finance/:userId`
2. Servidor retorna contas e transações do arquivo correspondente
3. SWR revalida a cada 1000 ms, garantindo visão em tempo quase real

### Nova transação
1. Usuário preenche formulário e seleciona contas/pagamentos
2. Front-end chama `POST /api/transactions/:userId`
3. Servidor valida valores, ajusta saldos das contas e salva o arquivo JSON
4. SWR revalida e atualiza a interface instantaneamente

## Segurança

> ⚠️ Baseado em arquivos JSON – ideal para ambientes controlados ou uso interno.

Recomendações para produção:
- Hash de senhas (ex.: bcrypt)
- Tokens de sessão (JWT) + refresh tokens
- Rate limiting em todas as rotas públicas
- Validação e sanitização extra de entradas
- Backups e versionamento dos JSONs
- HTTPS habilitado (porta 443)

## Backup

```bash
# Backup completo dos dados
sudo tar -czf limabank-backup-$(date +%Y%m%d-%H%M%S).tar.gz /home/ubuntu/BANCO_DATA

# Restaurar backup
sudo tar -xzf limabank-backup-AAAAmmdd-HHMMSS.tar.gz -C /
```

## Observabilidade

```bash
# Verificar arquivos salvos
ls -lh /home/ubuntu/BANCO_DATA

# Ler usuários cadastrados
cat /home/ubuntu/BANCO_DATA/auth.json | jq .

# Retomar a sessão screen ativa
screen -ls
screen -r limabank   # nome sugerido no guia de deploy

# Checar processo Node
ps aux | grep server.js
```

---

**DevLima Soluções**
