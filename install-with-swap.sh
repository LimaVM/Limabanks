#!/usr/bin/env bash
set -euo pipefail

# Variáveis de configuração
APP_DIR="/home/ubuntu/LIMABANK"
DATA_DIR="/home/ubuntu/BANCO_DATA"
SWAPFILE="/swapfile"
SWAP_SIZE_GB=2
NODE_MAJOR=20

log() {
  echo -e "\033[1;32m==>\033[0m $*"
}

warn() {
  echo -e "\033[1;33m[!]\033[0m $*"
}

error() {
  echo -e "\033[1;31m[erro]\033[0m $*" >&2
}

require_root() {
  if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
    error "Execute este script como root: sudo bash install-with-swap.sh"
    exit 1
  fi
}

ensure_directory() {
  if [[ ! -d "$APP_DIR" ]]; then
    error "Diretório do projeto não encontrado em $APP_DIR"
    exit 1
  fi
}

ensure_data_directory() {
  if [[ ! -d "$DATA_DIR" ]]; then
    log "Criando diretório de dados em $DATA_DIR..."
    install -d -m 0750 "$DATA_DIR"
    chown ubuntu:ubuntu "$DATA_DIR"
  fi
}

current_swap_megabytes() {
  awk '/SwapTotal/ { printf "%d", $2 / 1024 }' /proc/meminfo
}

create_swap_if_needed() {
  local current_swap
  current_swap=$(current_swap_megabytes)
  local required_swap=$((SWAP_SIZE_GB * 1024))

  if (( current_swap >= required_swap )); then
    log "Swap atual (${current_swap}MiB) é suficiente. Nenhuma alteração necessária."
    return
  fi

  if swapon --show | grep -q "${SWAPFILE}"; then
    warn "Swap ativo em ${SWAPFILE}, mas menor que ${required_swap}MiB."
    warn "Ajuste manualmente caso deseje aumentar o tamanho."
    return
  fi

  if [[ -f "$SWAPFILE" ]]; then
    warn "Arquivo ${SWAPFILE} existe porém não está ativo. Será reutilizado."
  else
    log "Criando arquivo de swap de ${SWAP_SIZE_GB}GB em ${SWAPFILE}..."
    if ! fallocate -l "${SWAP_SIZE_GB}G" "$SWAPFILE" 2>/dev/null; then
      log "fallocate indisponível, utilizando dd (pode demorar)..."
      dd if=/dev/zero of="$SWAPFILE" bs=1M count=$((SWAP_SIZE_GB * 1024)) status=progress
    fi
    chmod 600 "$SWAPFILE"
  fi

  log "Formatando swap..."
  mkswap "$SWAPFILE" >/dev/null
  log "Ativando swap..."
  swapon "$SWAPFILE"

  if ! grep -q "${SWAPFILE}" /etc/fstab; then
    log "Persistindo swap em /etc/fstab"
    printf '%s\n' "${SWAPFILE} none swap sw 0 0" >> /etc/fstab
  fi

  if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    log "Ajustando vm.swappiness para 10"
    printf '%s\n' 'vm.swappiness=10' >> /etc/sysctl.conf
  fi
  sysctl -p >/dev/null 2>&1 || true

  log "Swap configurado. Situação atual:"
  free -h
}

install_base_dependencies() {
  log "Atualizando lista de pacotes..."
  apt-get update -y

  log "Instalando pacotes essenciais..."
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    build-essential
}

install_node() {
  if command -v node >/dev/null 2>&1; then
    local current_version
    current_version=$(node -v | sed 's/^v//')
    if [[ "$current_version" == ${NODE_MAJOR}.* ]]; then
      log "Node.js ${current_version} já instalado."
      return
    fi
    warn "Node.js encontrado na versão ${current_version}. Será atualizado para a série ${NODE_MAJOR}."
  else
    log "Node.js não encontrado. Instalando versão ${NODE_MAJOR}."
  fi

  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  printf 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_%s.x nodistro main\n' "$NODE_MAJOR" \
    > /etc/apt/sources.list.d/nodesource.list

  apt-get update -y
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

  log "Node.js $(node -v) instalado."
}

install_dependencies() {
  log "Instalando dependências do projeto..."
  cd "$APP_DIR"

  export NODE_OPTIONS="--max-old-space-size=512"
  export npm_config_audit=false
  export npm_config_fund=false
  export npm_config_progress=false

  if [[ -f package-lock.json ]]; then
    npm ci --legacy-peer-deps
  else
    npm install --legacy-peer-deps
  fi
}

build_project() {
  log "Gerando build otimizado..."
  cd "$APP_DIR"
  NODE_OPTIONS="--max-old-space-size=768" npm run build
}

main() {
  require_root
  ensure_directory
  ensure_data_directory
  create_swap_if_needed
  install_base_dependencies
  install_node
  install_dependencies
  build_project

  log "Processo concluído com sucesso!"
  cat <<'INFO'

Próximos passos sugeridos:
  1. Acesse o diretório do projeto: cd "$APP_DIR"
  2. (Opcional) Inicie uma sessão screen: screen -S limabank
  3. Inicie a aplicação: npm start
  4. Para sair da screen mantendo o processo ativo: pressione Ctrl+A e depois D
  5. Para retornar à sessão screen: screen -r limabank
INFO
}

main "$@"
