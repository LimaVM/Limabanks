# Deploy Rápido - LimaBank (Servidor 1GB RAM)

## Diretório de Deploy

**Sempre usar:** `/home/ubuntu/LIMABANK`

## Armazenamento de Dados

**Diretório de dados:** `/home/ubuntu/BANCO_APP`

Os dados são armazenados em arquivos JSON no servidor:
- `auth.json` - Usuários cadastrados
- `finance-{userId}.json` - Dados financeiros de cada usuário

O sistema cria automaticamente o diretório na primeira execução.

## Instalação Rápida

\`\`\`bash
# 1. Instalar Node.js 20 e PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Ir para o diretório do projeto
cd /home/ubuntu/LIMABANK

# 3. Instalar com swap (IMPORTANTE para 1GB RAM)
chmod +x install-with-swap.sh
sudo bash install-with-swap.sh
# Responda 's' para manter o swap permanente

# 4. Configurar permissões para portas 80/443
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# 5. Criar diretório de dados
sudo mkdir -p /home/ubuntu/BANCO_APP
sudo chown -R ubuntu:ubuntu /home/ubuntu/BANCO_APP
sudo chmod 755 /home/ubuntu/BANCO_APP

# 6. Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Execute o comando sugerido pelo PM2

# 7. Configurar firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# 8. Verificar
pm2 status
pm2 logs limabank
curl -I https://con.devlima.wtf
\`\`\`

## Pronto!

Acesse: https://con.devlima.wtf

## Recursos do Sistema

- ✅ Armazenamento no servidor (não no navegador)
- ✅ Múltiplos usuários com login/senha
- ✅ Sincronização em tempo real (atualiza a cada 3 segundos)
- ✅ Múltiplos dispositivos podem usar a mesma conta
- ✅ PWA instalável
- ✅ Modo escuro/claro automático

## Comandos Úteis

\`\`\`bash
# Ver logs
pm2 logs limabank

# Reiniciar
pm2 restart limabank

# Status
pm2 status

# Monitorar memória
pm2 monit
free -h

# Ver dados armazenados
ls -lh /home/ubuntu/BANCO_APP
cat /home/ubuntu/BANCO_APP/auth.json

# Backup dos dados
tar -czf backup-$(date +%Y%m%d).tar.gz /home/ubuntu/BANCO_APP
\`\`\`

## Problemas?

### npm install travando?
\`\`\`bash
cd /home/ubuntu/LIMABANK
sudo bash install-with-swap.sh
\`\`\`

### Aplicação usando muita memória?
\`\`\`bash
pm2 restart limabank
\`\`\`

### Certificados SSL?
\`\`\`bash
sudo certbot renew
pm2 restart limabank
\`\`\`

### Erro ao salvar dados?
\`\`\`bash
# Verificar permissões
ls -la /home/ubuntu/BANCO_APP
sudo chown -R ubuntu:ubuntu /home/ubuntu/BANCO_APP
pm2 restart limabank
\`\`\`

## Documentação Completa

Veja `DEPLOY.md` para instruções detalhadas e troubleshooting.

---

**DevLima Soluções**
