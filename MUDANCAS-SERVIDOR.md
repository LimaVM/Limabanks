# Mudanças: Armazenamento no Servidor

## O que mudou?

O LimaBank agora armazena todos os dados no servidor em arquivos JSON, ao invés de usar localStorage do navegador.

## Benefícios

✅ **Múltiplos dispositivos**: Use a mesma conta em vários dispositivos
✅ **Sincronização em tempo real**: Dados atualizam automaticamente a cada 3 segundos
✅ **Dados persistentes**: Não perde dados ao limpar cache do navegador
✅ **Compartilhamento**: Várias pessoas podem usar o mesmo login

## Arquitetura

### Armazenamento

**Diretório:** `/home/ubuntu/BANCO_APP`

**Arquivos:**
- `auth.json` - Lista de usuários cadastrados
- `finance-{userId}.json` - Dados financeiros de cada usuário (transações e contas)

### APIs Criadas

**Autenticação:**
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Fazer login

**Dados Financeiros:**
- `GET /api/finance/{userId}` - Buscar todos os dados
- `POST /api/finance/{userId}` - Atualizar dados completos

**Contas/Cartões:**
- `POST /api/accounts/{userId}` - Adicionar conta
- `DELETE /api/accounts/{userId}?id={accountId}` - Deletar conta

**Transações:**
- `POST /api/transactions/{userId}` - Adicionar transação
- `DELETE /api/transactions/{userId}?id={transactionId}` - Deletar transação

### Atualização em Tempo Real

Usando **SWR** (stale-while-revalidate):
- Revalida dados a cada 3 segundos
- Revalida ao focar na janela
- Revalida ao reconectar à internet
- Cache inteligente para melhor performance

## Arquivos Modificados

### Novos Arquivos

1. `lib/server-storage.ts` - Funções para ler/escrever JSON no servidor
2. `lib/api-client.ts` - Cliente para fazer chamadas às APIs
3. `app/api/auth/register/route.ts` - API de registro
4. `app/api/auth/login/route.ts` - API de login
5. `app/api/finance/[userId]/route.ts` - API de dados financeiros
6. `app/api/accounts/[userId]/route.ts` - API de contas
7. `app/api/transactions/[userId]/route.ts` - API de transações

### Arquivos Atualizados

1. `app/page.tsx` - Agora usa SWR e APIs do servidor
2. `components/login-page.tsx` - Usa APIs ao invés de localStorage
3. `package.json` - Adicionada dependência `swr`

### Arquivos Obsoletos (não deletar ainda)

1. `lib/auth-storage.ts` - Substituído por APIs
2. `lib/finance-storage.ts` - Substituído por APIs

## Como Funciona

### Fluxo de Login

1. Usuário entra com email/senha
2. Frontend chama `POST /api/auth/login`
3. Servidor verifica credenciais em `auth.json`
4. Retorna `userId` e `email`
5. Frontend salva no localStorage (apenas sessão)
6. Redireciona para dashboard

### Fluxo de Dados

1. Frontend carrega dados com SWR: `useSWR('/api/finance/{userId}')`
2. SWR busca dados do servidor automaticamente
3. Dados são exibidos na interface
4. A cada 3 segundos, SWR revalida os dados
5. Se houver mudanças, interface atualiza automaticamente

### Fluxo de Transação

1. Usuário adiciona transação
2. Frontend chama `POST /api/transactions/{userId}`
3. Servidor:
   - Adiciona transação ao array
   - Atualiza saldo da conta
   - Salva em `finance-{userId}.json`
4. Frontend chama `mutate()` para revalidar dados
5. Interface atualiza com novos dados

## Segurança

⚠️ **IMPORTANTE**: Este sistema é básico e adequado para uso pessoal/interno.

**Para produção, adicione:**
- Hash de senhas (bcrypt)
- JWT tokens para autenticação
- Rate limiting nas APIs
- Validação de entrada mais robusta
- HTTPS obrigatório
- Backup automático dos dados

## Backup

\`\`\`bash
# Backup manual
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz /home/ubuntu/BANCO_APP

# Restaurar backup
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz -C /
\`\`\`

## Monitoramento

\`\`\`bash
# Ver logs em tempo real
pm2 logs limabank --lines 100

# Ver uso de memória
pm2 monit

# Ver arquivos de dados
ls -lh /home/ubuntu/BANCO_APP

# Ver conteúdo de um arquivo
cat /home/ubuntu/BANCO_APP/auth.json | jq .
\`\`\`

---

**DevLima Soluções**
