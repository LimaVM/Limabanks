# Deploy Rápido - LimaBank (Servidor 1GB RAM)

## Diretório do Projeto

Utilize sempre: `/home/ubuntu/LIMABANK`

## Armazenamento de Dados

- Diretório: `/home/ubuntu/BANCO_DATA`
- Arquivos criados automaticamente:
  - `auth.json` – usuários
  - `finance-<userId>.json` – dados financeiros por usuário

## Passo a Passo

```bash
# 1. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# 2. Preparar diretório do projeto
sudo mkdir -p /home/ubuntu/LIMABANK
sudo chown -R $USER:$USER /home/ubuntu/LIMABANK
cd /home/ubuntu/LIMABANK

git clone <seu-repositorio> .

# 3. Criar swap temporário (evita travamentos com 1 GB de RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 4. Instalar dependências
npm install --no-progress

# 5. Habilitar Node nas portas 80/443
sudo setcap 'cap_net_bind_service=+ep' "$(command -v node)"

# 6. (Opcional) remover swap
sudo swapoff /swapfile
sudo rm /swapfile

# 7. Iniciar dentro de uma screen
screen -S limabank
npm start
# Para sair da sessão mantendo o app rodando: Ctrl + A, depois D
```

O comando `npm start` recompila o front-end (Vite) e, em seguida, inicia o servidor Express nas portas 80 e 443. Se os certificados de `/etc/letsencrypt/live/con.devlima.wtf/` não existirem, apenas HTTP ficará disponível.

## Recursos do Sistema

- ✅ Armazenamento por usuário no servidor
- ✅ Login/registro com isolamento de dados
- ✅ Atualização automática a cada 1 segundo
- ✅ Exportação financeira em PDF
- ✅ PWA instalável e responsivo
- ✅ Fuso horário fixo em Brasília

## Comandos Úteis

```bash
# Reanexar à sessão
screen -r limabank

# Ver sessões screen ativas
screen -ls

# Atualizar para uma nova versão
git pull
npm install --no-progress
npm start

# Conferir dados salvos
ls -lh /home/ubuntu/BANCO_DATA
cat /home/ubuntu/BANCO_DATA/auth.json | jq .

# Backup rápido
sudo tar -czf backup-$(date +%Y%m%d).tar.gz /home/ubuntu/BANCO_DATA
```

## Problemas Comuns

- **`npm install` travando?** – Crie swap (passo 3).
- **Permissão negada ao salvar dados?** – `sudo chown -R ubuntu:ubuntu /home/ubuntu/BANCO_DATA`
- **Porta 80 indisponível?** – Verifique se outro serviço está escutando e confirme o `setcap`.
- **HTTPS não inicia?** – Ajuste `HTTPS_CERT_PATH` e `HTTPS_KEY_PATH` antes de rodar `npm start`.

## Documentação Completa

Consulte `DEPLOY.md` para detalhes e troubleshooting.

---

**DevLima Soluções**
