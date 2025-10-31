# Tutorial de Deploy - LimaBank na VPS Ubuntu (1GB RAM)

Este guia foi otimizado para servidores com **1 GB de RAM** executando **Ubuntu 24.04** e **Node.js 20**. O backend Express expõe HTTP na porta 80 e, se certificados válidos estiverem disponíveis, HTTPS na porta 443.

## ✅ Pré-requisitos

- VPS Ubuntu 24.04 com acesso root ou sudo
- Node.js 20.x instalado
- Domínio apontando para a VPS (ex.: `con.devlima.wtf`)
- Certificados Let's Encrypt opcionais em `/etc/letsencrypt/live/<domínio>/`
- Usuário `ubuntu` com diretório `/home/ubuntu/BANCO_DATA` gravável (criado automaticamente pelo app)

## 1. Preparar o servidor

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale dependências de build essenciais (útil para alguns pacotes npm)
sudo apt install -y build-essential curl

# Instale Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifique versões
node --version   # v20.x
npm --version
```

### (Opcional) Conceder acesso às portas 80/443

```bash
sudo setcap 'cap_net_bind_service=+ep' "$(command -v node)"
sudo getcap "$(command -v node)"  # deve exibir cap_net_bind_service+ep
```

## 2. Obter o projeto

```bash
# Caminho sugerido pelo cliente
sudo mkdir -p /home/ubuntu/LIMABANK
sudo chown -R $USER:$USER /home/ubuntu/LIMABANK
cd /home/ubuntu/LIMABANK

git clone <seu-repositorio> .
```

> Caso esteja atualizando uma instalação existente, basta atualizar o diretório e executar novamente `npm install`.

## 3. Instalar dependências com pouca RAM

Para evitar estouro de memória em VPS com 1 GB, é recomendado utilizar swap temporário durante a instalação.

```bash
# Criar swap temporário de 2 GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Conferir
free -h

# Instalar dependências
npm install --no-progress

# (opcional) Remover swap temporário
sudo swapoff /swapfile
sudo rm /swapfile
```

## 4. Compilar e iniciar o serviço

O comando `npm start` recompila o front-end com Vite e inicia o servidor Express na sequência. Execute-o dentro de uma sessão `screen` ou `tmux` para manter o processo ativo após desconexões.

```bash
cd /home/ubuntu/LIMABANK

# Compila e inicia (porta 80 e 443)
npm start
```

Dentro de uma sessão `screen`:

```bash
screen -S limabank
npm start
# Para desconectar sem encerrar: Ctrl + A, depois D
```

## 5. Estrutura de persistência

- Todos os dados de usuários são gravados em `/home/ubuntu/BANCO_DATA`
- O diretório é criado automaticamente na primeira requisição
- Cada usuário recebe arquivos `finance-<userId>.json` com contas e transações
- Credenciais ficam armazenadas em `auth.json` no mesmo diretório

Faça backups periódicos desse diretório para preservar o histórico financeiro.

## 6. Variáveis de ambiente importantes

| Variável            | Descrição                                                                                  |
|--------------------|----------------------------------------------------------------------------------------------|
| `PORT`             | Porta HTTP (padrão 80)                                                                       |
| `HTTP_PORT`        | Porta HTTP alternativa                                                                       |
| `HTTPS_PORT`       | Porta HTTPS (padrão 443)                                                                     |
| `HTTPS_CERT_PATH`  | Caminho do certificado TLS (padrão `/etc/letsencrypt/live/con.devlima.wtf/fullchain.pem`)    |
| `HTTPS_KEY_PATH`   | Caminho da chave privada TLS (padrão `/etc/letsencrypt/live/con.devlima.wtf/privkey.pem`)    |

Para executar apenas em HTTP, basta não definir (ou remover) os certificados.

## 7. Atualizações futuras

Quando houver uma nova versão do sistema:

```bash
cd /home/ubuntu/LIMABANK
git pull
npm install --no-progress
npm start
```

> Recomenda-se parar a sessão anterior (Ctrl + C dentro do `screen`) antes de iniciar novamente para evitar processos duplicados.

---

Pronto! O LimaBank estará disponível nas portas 80/443 respondendo diretamente pelo Node.js, sem necessidade de Nginx ou PM2.
