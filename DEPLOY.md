# Tutorial de Deploy - LimaBank na VPS Ubuntu (1GB RAM)

## Importante: Servidor com Pouca RAM

Este guia foi otimizado para servidores com apenas **1GB de RAM**. O processo de instalação usa técnicas especiais para evitar travamentos.

## Pré-requisitos
- VPS Ubuntu com **mínimo 1GB RAM** + acesso root/sudo
- Node.js 20.x instalado
- Domínio: con.devlima.wtf apontando para o IP da VPS
- Certificados SSL já configurados em `/etc/letsencrypt/live/con.devlima.wtf/`

## Passo 1: Instalar Dependências no Servidor

\`\`\`bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalações
node --version  # Deve mostrar v20.x.x
npm --version
pm2 --version
\`\`\`

## Passo 2: Preparar o Projeto

\`\`\`bash
# Criar diretório para o projeto
sudo mkdir -p /var/www/limabank
sudo chown -R $USER:$USER /var/www/limabank

# Navegar para o diretório
cd /var/www/limabank

# Fazer upload dos arquivos do projeto
# (use scp, rsync, git clone, etc.)
\`\`\`

## Passo 3: Instalar Dependências (IMPORTANTE para 1GB RAM)

### Opção A: Script Automático com Swap (RECOMENDADO)

\`\`\`bash
cd /var/www/limabank

# Dar permissão de execução ao script
chmod +x install-with-swap.sh

# Executar script como root
sudo bash install-with-swap.sh
\`\`\`

O script irá:
1. Criar swap temporário de 2GB
2. Instalar dependências de forma otimizada
3. Fazer build do projeto
4. Perguntar se deseja manter o swap permanente

### Opção B: Manual com Swap Temporário

\`\`\`bash
# Criar swap de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar swap ativo
free -h

# Instalar dependências com flags otimizadas
npm ci --prefer-offline --no-audit --progress=false

# Build do projeto
npm run build

# Remover swap temporário (opcional)
sudo swapoff /swapfile
sudo rm /swapfile
\`\`\`

### Opção C: Build Local (Melhor para RAM muito limitada)

Se mesmo com swap o servidor travar, faça o build localmente:

\`\`\`bash
# No seu computador local:
npm install
npm run build

# Fazer upload apenas dos arquivos necessários:
# - .next/
# - public/
# - node_modules/
# - server.js
# - ecosystem.config.js
# - package.json

# Na VPS, apenas inicie:
pm2 start ecosystem.config.js
\`\`\`

## Passo 4: Configurar Swap Permanente (Recomendado)

Para evitar problemas futuros, mantenha o swap ativo:

\`\`\`bash
# Criar swap de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Otimizar uso de swap (usar apenas quando necessário)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verificar
free -h
\`\`\`

## Passo 5: Configurar Permissões para Portas 80 e 443

\`\`\`bash
# Dar permissão ao Node.js para usar portas privilegiadas
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# Verificar
getcap $(which node)
# Deve mostrar: /usr/bin/node = cap_net_bind_service+ep
\`\`\`

## Passo 6: Iniciar Aplicação

\`\`\`bash
cd /var/www/limabank

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Execute o comando sugerido pelo PM2

# Verificar status
pm2 status
pm2 logs limabank --lines 50
\`\`\`

## Passo 7: Configurar Firewall

\`\`\`bash
# Permitir tráfego necessário
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH - NÃO ESQUEÇA!

# Ativar firewall
sudo ufw enable

# Verificar
sudo ufw status
\`\`\`

## Passo 8: Verificar Funcionamento

\`\`\`bash
# Verificar portas
sudo netstat -tlnp | grep node

# Testar HTTP (deve redirecionar para HTTPS)
curl -I http://con.devlima.wtf

# Testar HTTPS
curl -I https://con.devlima.wtf

# Ver logs
pm2 logs limabank
\`\`\`

## Otimizações para 1GB RAM

### Limitar Memória do PM2

\`\`\`bash
# Editar ecosystem.config.js para limitar memória
pm2 start ecosystem.config.js --max-memory-restart 800M
pm2 save
\`\`\`

### Monitorar Uso de Memória

\`\`\`bash
# Ver uso em tempo real
pm2 monit

# Ver uso de memória do sistema
free -h
htop  # (instale com: sudo apt install htop)
\`\`\`

### Limpar Cache Regularmente

\`\`\`bash
# Limpar cache do npm
npm cache clean --force

# Limpar logs antigos do PM2
pm2 flush
\`\`\`

## Comandos Úteis

### Gerenciar Aplicação

\`\`\`bash
# Ver logs
pm2 logs limabank --lines 100

# Reiniciar
pm2 restart limabank

# Parar
pm2 stop limabank

# Status
pm2 status

# Monitorar
pm2 monit
\`\`\`

### Atualizar Aplicação

\`\`\`bash
cd /var/www/limabank

# Parar aplicação
pm2 stop limabank

# Atualizar código (git pull, upload, etc.)

# Se package.json mudou, reinstalar com swap:
sudo bash install-with-swap.sh

# Ou apenas rebuild:
npm run build

# Reiniciar
pm2 restart limabank
\`\`\`

## Troubleshooting

### Servidor Travou Durante npm install

\`\`\`bash
# Reiniciar servidor
sudo reboot

# Após reiniciar, usar o script com swap:
cd /var/www/limabank
sudo bash install-with-swap.sh
\`\`\`

### Erro de Memória

\`\`\`bash
# Verificar memória disponível
free -h

# Verificar swap
swapon --show

# Se não tiver swap, criar:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
\`\`\`

### Aplicação Travando

\`\`\`bash
# Verificar uso de memória
pm2 monit

# Limitar memória e reiniciar automaticamente
pm2 delete limabank
pm2 start ecosystem.config.js --max-memory-restart 800M
pm2 save
\`\`\`

### Build Falhando

\`\`\`bash
# Opção 1: Aumentar swap temporariamente
sudo fallocate -l 4G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2

npm run build

sudo swapoff /swapfile2
sudo rm /swapfile2

# Opção 2: Fazer build localmente e fazer upload
\`\`\`

## Renovação de Certificados SSL

\`\`\`bash
# Renovar certificados
sudo certbot renew

# Reiniciar aplicação
pm2 restart limabank

# Automatizar (adicionar ao crontab)
sudo crontab -e
# Adicione: 0 3 1 * * certbot renew --quiet && pm2 restart limabank
\`\`\`

## Monitoramento de Recursos

### Script de Monitoramento

Crie um script para alertar sobre uso alto de memória:

\`\`\`bash
sudo nano /usr/local/bin/check-memory.sh
\`\`\`

Adicione:

\`\`\`bash
#!/bin/bash
THRESHOLD=90
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}' | cut -d. -f1)

if [ $MEMORY_USAGE -gt $THRESHOLD ]; then
    echo "ALERTA: Uso de memória em ${MEMORY_USAGE}%"
    pm2 restart limabank
fi
\`\`\`

\`\`\`bash
# Dar permissão
sudo chmod +x /usr/local/bin/check-memory.sh

# Adicionar ao cron (verificar a cada 5 minutos)
crontab -e
# Adicione: */5 * * * * /usr/local/bin/check-memory.sh
\`\`\`

## Acesso

Após completar todos os passos:

- **HTTP**: http://con.devlima.wtf (redireciona para HTTPS)
- **HTTPS**: https://con.devlima.wtf

## Arquitetura

\`\`\`
Internet (porta 80/443)
         ↓
    Node.js Server (server.js)
         ↓
    Next.js Application
         ↓
    localStorage (dados do usuário)
\`\`\`

**Sem nginx, sem proxy reverso - Node.js serve diretamente!**

## Checklist de Deploy

- [ ] Node.js 20.x instalado
- [ ] PM2 instalado globalmente
- [ ] Swap de 2GB configurado
- [ ] Arquivos do projeto em `/var/www/limabank`
- [ ] Dependências instaladas com `install-with-swap.sh`
- [ ] Build concluído com sucesso
- [ ] Permissões setcap configuradas
- [ ] PM2 iniciado e salvo
- [ ] PM2 startup configurado
- [ ] Firewall configurado (80, 443, 22)
- [ ] Site acessível via HTTPS
- [ ] Certificados SSL funcionando
- [ ] Logs sem erros

---

**Desenvolvido por DevLima Soluções**
