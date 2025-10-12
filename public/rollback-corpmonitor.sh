#!/bin/bash

#############################################
# CorpMonitor - Script de Rollback
# Reverte para backup anterior
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
PROJECT_DIR="/var/www/corpmonitor"
BACKUP_DIR="/var/backups/corpmonitor"

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Banner
echo -e "${RED}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║     CorpMonitor - Rollback do Sistema     ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    log_error "Este script precisa ser executado com sudo"
    exit 1
fi

# Verificar se existem backups
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR)" ]; then
    log_error "Nenhum backup encontrado em $BACKUP_DIR"
    exit 1
fi

# Listar backups disponíveis
echo
log_info "Backups disponíveis:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BACKUPS=($(ls -t "$BACKUP_DIR"))
for i in "${!BACKUPS[@]}"; do
    BACKUP_DATE=$(echo "${BACKUPS[$i]}" | sed 's/backup_//' | sed 's/_/ /')
    echo "  [$i] ${BACKUPS[$i]} - $BACKUP_DATE"
done
echo

# Selecionar backup
read -p "Digite o número do backup para restaurar [0]: " BACKUP_INDEX
BACKUP_INDEX=${BACKUP_INDEX:-0}

if [ "$BACKUP_INDEX" -ge "${#BACKUPS[@]}" ]; then
    log_error "Backup inválido"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$BACKUP_INDEX]}"
BACKUP_PATH="$BACKUP_DIR/$SELECTED_BACKUP"

log_warning "Você está prestes a restaurar: $SELECTED_BACKUP"
read -p "Tem certeza? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    log_info "Operação cancelada"
    exit 0
fi

# Criar backup da versão atual antes do rollback
log_info "Criando backup de segurança da versão atual..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SAFETY_BACKUP="$BACKUP_DIR/before_rollback_$TIMESTAMP"
cp -r "$PROJECT_DIR" "$SAFETY_BACKUP"
log_success "Backup de segurança criado"

# Restaurar backup
log_info "Restaurando backup..."
rm -rf "$PROJECT_DIR"
cp -r "$BACKUP_PATH" "$PROJECT_DIR"

# Ajustar permissões
log_info "Ajustando permissões..."
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"

# Recarregar Nginx
log_info "Recarregando Nginx..."
systemctl reload nginx

log_success "Rollback concluído!"
echo
log_info "Site restaurado para versão: $SELECTED_BACKUP"
log_info "Backup de segurança salvo em: $SAFETY_BACKUP"
