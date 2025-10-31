#!/bin/bash

echo "=== Script de Instalação Otimizado para Servidores com Pouca RAM ==="
echo "Este script adiciona swap temporário e instala as dependências de forma otimizada"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "Por favor, execute como root: sudo bash install-with-swap.sh"
    exit 1
fi

# Verificar memória disponível
echo "Memória atual:"
free -h
echo ""

SWAP_EXISTS=false
if [ -f /swapfile ]; then
    echo "⚠ Arquivo de swap já existe em /swapfile"
    if swapon --show | grep -q '/swapfile'; then
        echo "✓ Swap já está ativo"
        SWAP_EXISTS=true
    else
        echo "Ativando swap existente..."
        swapon /swapfile
        SWAP_EXISTS=true
    fi
else
    # Criar arquivo de swap de 2GB
    echo "Criando arquivo de swap de 2GB..."
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "✓ Swap criado e ativado"
fi

echo ""
echo "Swap atual:"
free -h
echo ""

echo "Instalando dependências do Node.js..."
echo "Isso pode levar alguns minutos (5-10 min em servidores com 1GB RAM)..."
echo ""

# Limpar cache do npm para economizar espaço
npm cache clean --force 2>/dev/null

# Instalar com flags otimizadas para pouca RAM
NODE_OPTIONS="--max-old-space-size=512" npm install \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --loglevel=error \
    --legacy-peer-deps

# Verificar se instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Dependências instaladas com sucesso!"
    echo ""
    
    # Build do projeto
    echo "Fazendo build do projeto..."
    echo "Isso pode levar 5-10 minutos..."
    NODE_OPTIONS="--max-old-space-size=768" npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Build concluído com sucesso!"
        echo ""
    else
        echo ""
        echo "✗ Erro ao fazer build do projeto"
        echo "Tente executar manualmente: NODE_OPTIONS='--max-old-space-size=768' npm run build"
        echo ""
    fi
else
    echo ""
    echo "✗ Erro ao instalar dependências"
    echo "Tente executar manualmente: NODE_OPTIONS='--max-old-space-size=512' npm install --legacy-peer-deps"
    echo ""
fi

if [ "$SWAP_EXISTS" = false ]; then
    echo ""
    read -p "Deseja manter o swap permanente? (s/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        # Adicionar swap ao fstab para persistir após reboot
        if ! grep -q '/swapfile' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            echo "✓ Swap configurado para persistir após reboot"
        fi
        
        # Otimizar swappiness (quanto menor, menos usa swap)
        if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
            echo "vm.swappiness=10" >> /etc/sysctl.conf
            sysctl -p > /dev/null 2>&1
            echo "✓ Swappiness configurado para 10 (uso mínimo de swap)"
        fi
    else
        # Desativar swap temporário
        swapoff /swapfile
        rm /swapfile
        echo "✓ Swap temporário removido"
    fi
else
    echo "✓ Usando swap existente do sistema"
fi

echo ""
echo "=== Instalação concluída! ==="
echo ""
echo "Próximos passos:"
echo "1. Configure as permissões: sudo setcap 'cap_net_bind_service=+ep' \$(which node)"
echo "2. Inicie a aplicação: pm2 start ecosystem.config.js"
echo "3. Salve a configuração: pm2 save"
echo "4. Configure startup: pm2 startup"
echo ""
