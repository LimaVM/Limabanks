#!/bin/bash

echo "=== Verificação de Deploy - LimaBank ==="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# Verificar Node.js
echo "Verificando Node.js..."
node --version > /dev/null 2>&1
check "Node.js instalado"

# Verificar PM2
echo "Verificando PM2..."
pm2 --version > /dev/null 2>&1
check "PM2 instalado"

# Verificar memória
echo ""
echo "Memória disponível:"
free -h | grep -E "Mem|Swap"

TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
SWAP_MEM=$(free -m | awk '/^Swap:/{print $2}')

echo ""
if [ $TOTAL_MEM -lt 1500 ]; then
    if [ $SWAP_MEM -lt 1000 ]; then
        echo -e "${YELLOW}⚠${NC} Servidor com pouca RAM ($TOTAL_MEM MB) e swap insuficiente ($SWAP_MEM MB)"
        echo "  Recomendação: Execute 'sudo bash install-with-swap.sh'"
    else
        echo -e "${GREEN}✓${NC} Swap configurado ($SWAP_MEM MB)"
    fi
else
    echo -e "${GREEN}✓${NC} Memória suficiente ($TOTAL_MEM MB)"
fi

# Verificar certificados SSL
echo ""
echo "Verificando certificados SSL..."
if [ -f "/etc/letsencrypt/live/con.devlima.wtf/fullchain.pem" ]; then
    check "Certificado SSL encontrado"
    
    # Verificar validade
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/con.devlima.wtf/fullchain.pem | cut -d= -f2)
    echo "  Expira em: $EXPIRY"
else
    echo -e "${RED}✗${NC} Certificado SSL não encontrado"
fi

# Verificar permissões do Node.js
echo ""
echo "Verificando permissões para portas 80/443..."
CAPS=$(getcap $(which node) 2>/dev/null)
if [[ $CAPS == *"cap_net_bind_service"* ]]; then
    check "Permissões configuradas"
else
    echo -e "${RED}✗${NC} Permissões não configuradas"
    echo "  Execute: sudo setcap 'cap_net_bind_service=+ep' \$(which node)"
fi

# Verificar se aplicação está rodando
echo ""
echo "Verificando aplicação..."
pm2 describe limabank > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check "Aplicação registrada no PM2"
    
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="limabank") | .pm2_env.status')
    if [ "$STATUS" == "online" ]; then
        echo -e "${GREEN}✓${NC} Aplicação online"
    else
        echo -e "${RED}✗${NC} Aplicação offline (status: $STATUS)"
    fi
else
    echo -e "${RED}✗${NC} Aplicação não encontrada no PM2"
fi

# Verificar portas
echo ""
echo "Verificando portas..."
PORT_80=$(sudo netstat -tlnp 2>/dev/null | grep ":80 " | grep node)
PORT_443=$(sudo netstat -tlnp 2>/dev/null | grep ":443 " | grep node)

if [ -n "$PORT_80" ]; then
    check "Porta 80 em uso pelo Node.js"
else
    echo -e "${RED}✗${NC} Porta 80 não está sendo usada pelo Node.js"
fi

if [ -n "$PORT_443" ]; then
    check "Porta 443 em uso pelo Node.js"
else
    echo -e "${RED}✗${NC} Porta 443 não está sendo usada pelo Node.js"
fi

# Verificar firewall
echo ""
echo "Verificando firewall..."
UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -E "80|443|22")
if [ -n "$UFW_STATUS" ]; then
    check "Firewall configurado"
    echo "$UFW_STATUS" | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠${NC} Firewall não configurado ou inativo"
fi

# Verificar DNS
echo ""
echo "Verificando DNS..."
DNS_IP=$(nslookup con.devlima.wtf 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DNS_IP" == "$SERVER_IP" ]; then
    check "DNS apontando corretamente para este servidor"
    echo "  IP: $SERVER_IP"
else
    echo -e "${YELLOW}⚠${NC} DNS pode não estar apontando para este servidor"
    echo "  DNS aponta para: $DNS_IP"
    echo "  IP deste servidor: $SERVER_IP"
fi

# Teste de conectividade
echo ""
echo "Testando conectividade..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null)
if [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    check "HTTP respondendo (redirecionando para HTTPS)"
else
    echo -e "${YELLOW}⚠${NC} HTTP retornou código: $HTTP_CODE"
fi

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://localhost:443 -k 2>/dev/null)
if [ "$HTTPS_CODE" == "200" ]; then
    check "HTTPS respondendo"
else
    echo -e "${YELLOW}⚠${NC} HTTPS retornou código: $HTTPS_CODE"
fi

echo ""
echo "=== Verificação Concluída ==="
echo ""
echo "Para ver logs: pm2 logs limabank"
echo "Para reiniciar: pm2 restart limabank"
echo "Para monitorar: pm2 monit"
echo ""
