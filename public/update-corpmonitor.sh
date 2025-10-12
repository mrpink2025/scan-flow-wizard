#!/bin/bash

#############################################
# CorpMonitor - Script de Atualização
# Atualiza o site em servidor já configurado
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_DIR="/var/www/corpmonitor"
BACKUP_DIR="/var/backups/corpmonitor"
SITE_URL="https://corpmonitor.net"

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
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║     CorpMonitor - Script de Atualização   ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    log_error "Este script precisa ser executado com sudo"
    echo "Use: sudo bash update-corpmonitor.sh"
    exit 1
fi

# Verificar se o diretório do projeto existe
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Diretório do projeto não encontrado: $PROJECT_DIR"
    log_info "Parece que o site ainda não foi instalado"
    log_info "Execute primeiro: sudo bash deploy-corpmonitor.sh"
    exit 1
fi

log_info "Iniciando processo de atualização..."
echo

# 1. Criar backup
log_info "Criando backup da versão atual..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_DIR" "$BACKUP_PATH"
log_success "Backup criado em: $BACKUP_PATH"
echo

# 2. Navegar para o diretório do projeto
cd "$PROJECT_DIR"

# 3. Verificar status do Git
log_info "Verificando repositório Git..."
if [ ! -d ".git" ]; then
    log_error "Diretório .git não encontrado!"
    log_info "Este diretório não parece ser um repositório Git"
    exit 1
fi

# Adicionar diretório como seguro para o Git
log_info "Configurando permissões do Git..."
git config --global --add safe.directory "$PROJECT_DIR"

# 4. Salvar mudanças locais se houver
if ! git diff-index --quiet HEAD --; then
    log_warning "Existem mudanças locais não commitadas"
    log_info "Salvando mudanças locais..."
    git stash
    STASHED=true
else
    STASHED=false
fi

# 5. Baixar atualizações
log_info "Baixando atualizações do GitHub..."
CURRENT_COMMIT=$(git rev-parse HEAD)
git fetch origin
git pull origin main || git pull origin master

NEW_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    log_info "Nenhuma atualização disponível. Site já está na versão mais recente."
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 0
fi

log_success "Código atualizado com sucesso"
echo

# 6. Instalar/atualizar dependências
log_info "Verificando dependências..."
if [ -f "package.json" ]; then
    npm install
    log_success "Dependências atualizadas"
else
    log_warning "package.json não encontrado"
fi
echo

# 7. Build do projeto
log_info "Compilando projeto..."
if npm run build; then
    log_success "Build concluído com sucesso"
else
    log_error "Erro durante o build!"
    log_warning "Revertendo para versão anterior..."
    
    # Rollback
    rm -rf "$PROJECT_DIR"
    cp -r "$BACKUP_PATH" "$PROJECT_DIR"
    systemctl reload nginx
    
    log_error "Atualização falhou! Versão anterior restaurada."
    exit 1
fi
echo

# 8. Verificar permissões
log_info "Ajustando permissões..."
chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
log_success "Permissões configuradas"
echo

# 9. Recarregar Nginx
log_info "Recarregando servidor web..."
if systemctl reload nginx; then
    log_success "Nginx recarregado"
else
    log_warning "Erro ao recarregar Nginx, tentando restart..."
    systemctl restart nginx
fi
echo

# 10. Verificar se o site está acessível
log_info "Verificando disponibilidade do site..."
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" || echo "000")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    log_success "Site está acessível! (HTTP $HTTP_CODE)"
else
    log_warning "Site pode estar com problemas (HTTP $HTTP_CODE)"
fi
echo

# 11. Restaurar mudanças locais se houver
if [ "$STASHED" = true ]; then
    log_info "Restaurando mudanças locais..."
    git stash pop || log_warning "Não foi possível restaurar mudanças locais automaticamente"
fi

# 12. Limpar backups antigos (manter últimos 5)
log_info "Limpando backups antigos..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
BACKUP_COUNT=$(ls -1 | wc -l)
log_success "Mantidos $BACKUP_COUNT backups mais recentes"
echo

# Relatório Final
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║    ✓ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO    ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📊 Resumo da Atualização:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓${NC} Site: $SITE_URL"
echo -e "${GREEN}✓${NC} Versão anterior: ${CURRENT_COMMIT:0:7}"
echo -e "${GREEN}✓${NC} Versão atual: ${NEW_COMMIT:0:7}"
echo -e "${GREEN}✓${NC} Backup: $BACKUP_PATH"
echo

echo -e "${BLUE}📝 Comandos Úteis:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ver logs do Nginx:"
echo "    sudo tail -f /var/log/nginx/corpmonitor.net.access.log"
echo
echo "  Status do Nginx:"
echo "    sudo systemctl status nginx"
echo
echo "  Reverter para backup anterior:"
echo "    sudo bash rollback-corpmonitor.sh"
echo
echo "  Nova atualização:"
echo "    sudo bash update-corpmonitor.sh"
echo

log_success "Atualização finalizada! Seu site está na versão mais recente."
