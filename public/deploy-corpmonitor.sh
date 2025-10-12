#!/bin/bash

################################################################################
# Script de Deploy Completo - CorpMonitor
# Domínio: corpmonitor.net
# Repositório: https://github.com/mrpink2025/scan-flow-wizard.git
# Sistema Operacional: Ubuntu 24.04 LTS
################################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DOMAIN="corpmonitor.net"
WWW_DOMAIN="www.corpmonitor.net"
EMAIL="admin@corpmonitor.net"
GITHUB_URL="https://github.com/mrpink2025/scan-flow-wizard.git"
GITHUB_BRANCH="main"
SITE_DIR="/var/www/corpmonitor"
DEPLOY_DIR="/opt/corpmonitor-deploy"
BACKUP_DIR="$DEPLOY_DIR/backups"
LOG_FILE="$DEPLOY_DIR/logs/deploy.log"

# Variáveis de ambiente Supabase
SUPABASE_PROJECT_ID="aceywpdeahxkbgzshiex"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZXl3cGRlYWh4a2JnenNoaWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDQyNzgsImV4cCI6MjA3NTU4MDI3OH0.7qo9fF7VwqDTxu-gujet6b8P0-gjEp-TC5HYLjZpLDM"
SUPABASE_URL="https://aceywpdeahxkbgzshiex.supabase.co"

# Flags
SKIP_SSL=false
SKIP_FIREWALL=false
DRY_RUN=false
UPDATE_ONLY=false
UNINSTALL=false

################################################################################
# Funções auxiliares
################################################################################

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

show_help() {
    cat << EOF
Script de Deploy - CorpMonitor

Uso: sudo ./deploy-corpmonitor.sh [OPÇÕES]

Opções:
  --help              Mostra esta ajuda
  --dry-run           Simula execução sem fazer mudanças
  --skip-ssl          Pula configuração de SSL (apenas HTTP)
  --skip-firewall     Não configura o UFW
  --update-only       Apenas atualiza site existente
  --uninstall         Remove completamente a instalação

Exemplos:
  sudo ./deploy-corpmonitor.sh
  sudo ./deploy-corpmonitor.sh --skip-ssl
  sudo ./deploy-corpmonitor.sh --update-only
  sudo ./deploy-corpmonitor.sh --uninstall

EOF
    exit 0
}

################################################################################
# Validações iniciais
################################################################################

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script deve ser executado como root ou com sudo"
        exit 1
    fi
    print_success "Executando como root"
}

check_ubuntu_version() {
    if [[ ! -f /etc/os-release ]]; then
        print_error "Não foi possível detectar a versão do sistema operacional"
        exit 1
    fi
    
    source /etc/os-release
    
    if [[ "$ID" != "ubuntu" ]]; then
        print_error "Este script foi projetado para Ubuntu"
        exit 1
    fi
    
    if [[ "$VERSION_ID" != "24.04" ]]; then
        print_warning "Este script foi testado no Ubuntu 24.04, você está usando $VERSION_ID"
        read -p "Deseja continuar mesmo assim? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 1
        fi
    else
        print_success "Ubuntu 24.04 detectado"
    fi
}

check_internet() {
    print_info "Verificando conectividade com internet..."
    if ping -c 1 google.com &> /dev/null; then
        print_success "Conexão com internet OK"
    else
        print_error "Sem conexão com internet"
        exit 1
    fi
}

check_dns() {
    print_info "Verificando configuração de DNS..."
    
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
    DOMAIN_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1)
    
    if [[ -z "$SERVER_IP" ]]; then
        print_warning "Não foi possível detectar o IP público do servidor"
        return
    fi
    
    if [[ -z "$DOMAIN_IP" ]]; then
        print_warning "Domínio $DOMAIN não possui registro DNS configurado"
        print_info "Configure os seguintes registros DNS:"
        echo "   A     $DOMAIN     →  $SERVER_IP"
        echo "   A     $WWW_DOMAIN →  $SERVER_IP"
        
        if [[ "$SKIP_SSL" == false ]]; then
            print_error "SSL requer DNS configurado. Configure o DNS ou use --skip-ssl"
            exit 1
        fi
        return
    fi
    
    if [[ "$SERVER_IP" == "$DOMAIN_IP" ]]; then
        print_success "DNS configurado corretamente ($DOMAIN → $SERVER_IP)"
    else
        print_warning "DNS pode não estar propagado corretamente"
        print_info "IP do servidor: $SERVER_IP"
        print_info "IP do domínio:  $DOMAIN_IP"
        
        if [[ "$SKIP_SSL" == false ]]; then
            print_warning "Aguarde a propagação do DNS antes de continuar com SSL"
            read -p "Deseja continuar mesmo assim? (s/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                exit 1
            fi
        fi
    fi
}

################################################################################
# Instalação de dependências
################################################################################

install_nodejs() {
    print_info "Instalando Node.js 20.x LTS..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_VERSION" -ge 20 ]]; then
            print_success "Node.js $(node -v) já instalado"
            return
        fi
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    print_success "Node.js $(node -v) instalado"
    print_success "npm $(npm -v) instalado"
}

install_dependencies() {
    print_info "Atualizando sistema..."
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
    
    print_info "Instalando dependências do sistema..."
    apt-get install -y \
        git \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        curl \
        wget \
        dnsutils \
        openssl
    
    print_success "Dependências instaladas"
}

################################################################################
# Configuração do Firewall
################################################################################

configure_firewall() {
    if [[ "$SKIP_FIREWALL" == true ]]; then
        print_info "Pulando configuração do firewall (--skip-firewall)"
        return
    fi
    
    print_info "Configurando firewall UFW..."
    
    # Resetar regras
    ufw --force reset
    
    # Configurar políticas padrão
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH, HTTP, HTTPS
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Rate limiting para SSH
    ufw limit 22/tcp
    
    # Ativar firewall
    ufw --force enable
    
    print_success "Firewall configurado e ativo"
}

################################################################################
# Setup do projeto
################################################################################

setup_directories() {
    print_info "Criando estrutura de diretórios..."
    
    mkdir -p "$SITE_DIR"
    mkdir -p "$DEPLOY_DIR"/{scripts,logs,backups}
    
    print_success "Diretórios criados"
}

clone_repository() {
    print_info "Clonando repositório do GitHub..."
    
    if [[ -d "$SITE_DIR/.git" ]]; then
        print_info "Repositório já existe, atualizando..."
        cd "$SITE_DIR"
        git fetch origin
        git reset --hard origin/$GITHUB_BRANCH
    else
        rm -rf "$SITE_DIR"
        git clone -b "$GITHUB_BRANCH" "$GITHUB_URL" "$SITE_DIR"
    fi
    
    print_success "Repositório clonado/atualizado"
}

create_env_file() {
    print_info "Criando arquivo .env..."
    
    cat > "$SITE_DIR/.env" << EOF
VITE_SUPABASE_PROJECT_ID="$SUPABASE_PROJECT_ID"
VITE_SUPABASE_PUBLISHABLE_KEY="$SUPABASE_KEY"
VITE_SUPABASE_URL="$SUPABASE_URL"
EOF
    
    chmod 600 "$SITE_DIR/.env"
    print_success "Arquivo .env criado"
}

install_npm_dependencies() {
    print_info "Instalando dependências do projeto..."
    
    cd "$SITE_DIR"
    npm install
    
    print_success "Dependências instaladas"
}

build_project() {
    print_info "Gerando build de produção..."
    
    cd "$SITE_DIR"
    npm run build
    
    if [[ ! -f "$SITE_DIR/dist/index.html" ]]; then
        print_error "Build falhou - index.html não encontrado"
        exit 1
    fi
    
    print_success "Build gerado com sucesso"
}

################################################################################
# Configuração do Nginx
################################################################################

configure_nginx() {
    print_info "Configurando Nginx..."
    
    cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
# Redirecionamento HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name corpmonitor.net www.corpmonitor.net;
    
    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirecionar para HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Servidor HTTPS principal
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name corpmonitor.net www.corpmonitor.net;

    # SSL (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/corpmonitor.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/corpmonitor.net/privkey.pem;
    
    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Diretório raiz
    root /var/www/corpmonitor/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https://aceywpdeahxkbgzshiex.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://aceywpdeahxkbgzshiex.supabase.co wss://aceywpdeahxkbgzshiex.supabase.co" always;
    
    # HSTS (Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Ocultar versão do Nginx
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Rotas do React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Logs
    access_log /var/log/nginx/corpmonitor.net-access.log;
    error_log /var/log/nginx/corpmonitor.net-error.log;
}
EOF
    
    # Criar configuração temporária para HTTP (antes do SSL)
    if [[ "$SKIP_SSL" == true ]] || [[ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]]; then
        cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name corpmonitor.net www.corpmonitor.net;
    
    root /var/www/corpmonitor/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    access_log /var/log/nginx/corpmonitor.net-access.log;
    error_log /var/log/nginx/corpmonitor.net-error.log;
}
EOF
    fi
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    systemctl reload nginx
    
    print_success "Nginx configurado"
}

################################################################################
# Configuração SSL
################################################################################

configure_ssl() {
    if [[ "$SKIP_SSL" == true ]]; then
        print_info "Pulando configuração SSL (--skip-ssl)"
        return
    fi
    
    print_info "Configurando SSL com Let's Encrypt..."
    
    # Criar diretório para desafios do certbot
    mkdir -p /var/www/certbot
    
    # Obter certificado
    certbot --nginx \
        -d $DOMAIN \
        -d $WWW_DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect \
        2>&1 | tee -a "$LOG_FILE"
    
    if [[ $? -eq 0 ]]; then
        print_success "Certificado SSL instalado"
        
        # Atualizar configuração do Nginx com SSL
        configure_nginx
        
        # Testar renovação automática
        certbot renew --dry-run
        
        # Ativar timer de renovação
        systemctl enable certbot.timer
        systemctl start certbot.timer
        
        print_success "Renovação automática de SSL configurada"
    else
        print_error "Falha ao obter certificado SSL"
        print_warning "Verifique se o DNS está configurado corretamente"
        print_info "Você pode executar novamente com --skip-ssl e configurar SSL manualmente depois"
        exit 1
    fi
}

################################################################################
# Permissões
################################################################################

set_permissions() {
    print_info "Configurando permissões..."
    
    chown -R www-data:www-data "$SITE_DIR"
    chmod -R 755 "$SITE_DIR"
    chmod 600 "$SITE_DIR/.env"
    chmod 700 "$DEPLOY_DIR"
    
    print_success "Permissões configuradas"
}

################################################################################
# Scripts auxiliares
################################################################################

create_helper_scripts() {
    print_info "Criando scripts auxiliares..."
    
    # Script de atualização
    cat > "$DEPLOY_DIR/scripts/update-site.sh" << 'EOFUPDATE'
#!/bin/bash
set -e

SITE_DIR="/var/www/corpmonitor"
BACKUP_DIR="/opt/corpmonitor-deploy/backups/$(date +%Y%m%d_%H%M%S)"

echo "🔄 Iniciando atualização do site..."

# Fazer backup
echo "📦 Criando backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$SITE_DIR/dist" "$BACKUP_DIR/" 2>/dev/null || true
cp "$SITE_DIR/.env" "$BACKUP_DIR/" 2>/dev/null || true

# Atualizar código
echo "📥 Baixando última versão do GitHub..."
cd "$SITE_DIR"
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build
echo "🏗️ Gerando build de produção..."
npm run build

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
systemctl reload nginx

echo "✅ Site atualizado com sucesso!"
echo "📁 Backup salvo em: $BACKUP_DIR"
EOFUPDATE
    
    # Script de rollback
    cat > "$DEPLOY_DIR/scripts/rollback-site.sh" << 'EOFROLLBACK'
#!/bin/bash
SITE_DIR="/var/www/corpmonitor"
BACKUP_DIR="/opt/corpmonitor-deploy/backups"

echo "📋 Backups disponíveis:"
ls -1t "$BACKUP_DIR" 2>/dev/null || echo "Nenhum backup encontrado"

read -p "Digite o nome do backup para restaurar: " BACKUP_NAME

if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    echo "🔄 Restaurando backup..."
    rm -rf "$SITE_DIR/dist"
    cp -r "$BACKUP_DIR/$BACKUP_NAME/dist" "$SITE_DIR/"
    cp "$BACKUP_DIR/$BACKUP_NAME/.env" "$SITE_DIR/" 2>/dev/null || true
    systemctl reload nginx
    echo "✅ Rollback concluído!"
else
    echo "❌ Backup não encontrado!"
    exit 1
fi
EOFROLLBACK
    
    # Script de healthcheck
    cat > "$DEPLOY_DIR/scripts/healthcheck.sh" << 'EOFHEALTH'
#!/bin/bash
URL="https://corpmonitor.net"

# Tentar HTTPS primeiro, depois HTTP
if curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null | grep -q "200"; then
    echo "✅ Site está online (HTTPS - 200 OK)"
    exit 0
elif curl -s -o /dev/null -w "%{http_code}" "http://corpmonitor.net" 2>/dev/null | grep -q "200"; then
    echo "✅ Site está online (HTTP - 200 OK)"
    exit 0
else
    echo "❌ Site está offline ou com erro"
    exit 1
fi
EOFHEALTH
    
    # Tornar executáveis
    chmod +x "$DEPLOY_DIR/scripts/"*.sh
    
    print_success "Scripts auxiliares criados"
}

################################################################################
# Configuração de logs
################################################################################

configure_logrotate() {
    print_info "Configurando logrotate..."
    
    cat > /etc/logrotate.d/corpmonitor << 'EOFLOGROTATE'
/var/log/nginx/corpmonitor.net-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOFLOGROTATE
    
    print_success "Logrotate configurado"
}

################################################################################
# Testes pós-deploy
################################################################################

run_tests() {
    print_header "EXECUTANDO TESTES"
    
    # Teste 1: Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx está ativo"
    else
        print_error "Nginx não está ativo"
    fi
    
    # Teste 2: Site responde
    sleep 2
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        print_success "Site responde corretamente"
    else
        print_warning "Site pode não estar respondendo corretamente"
    fi
    
    # Teste 3: Arquivos do build
    if [[ -f "$SITE_DIR/dist/index.html" ]]; then
        print_success "Arquivos do build presentes"
    else
        print_error "Arquivos do build não encontrados"
    fi
    
    # Teste 4: SSL (se configurado)
    if [[ "$SKIP_SSL" == false ]] && [[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]]; then
        if echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates &>/dev/null; then
            print_success "Certificado SSL válido"
        else
            print_warning "Problema com certificado SSL"
        fi
    fi
    
    # Teste 5: Firewall (se configurado)
    if [[ "$SKIP_FIREWALL" == false ]]; then
        if ufw status | grep -q "Status: active"; then
            print_success "Firewall ativo"
        else
            print_warning "Firewall não está ativo"
        fi
    fi
}

################################################################################
# Relatório final
################################################################################

show_final_report() {
    clear
    print_header "INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    
    echo -e "${GREEN}🌐 Site disponível em:${NC}"
    if [[ "$SKIP_SSL" == false ]]; then
        echo "   - https://$DOMAIN"
        echo "   - https://$WWW_DOMAIN"
    else
        echo "   - http://$DOMAIN"
        echo "   - http://$WWW_DOMAIN"
    fi
    
    echo -e "\n${BLUE}📁 Diretórios importantes:${NC}"
    echo "   - Código:   $SITE_DIR"
    echo "   - Scripts:  $DEPLOY_DIR/scripts"
    echo "   - Backups:  $BACKUP_DIR"
    echo "   - Logs:     /var/log/nginx/corpmonitor.net-*.log"
    
    echo -e "\n${BLUE}🔧 Comandos úteis:${NC}"
    echo "   - Atualizar site:  sudo $DEPLOY_DIR/scripts/update-site.sh"
    echo "   - Fazer rollback:  sudo $DEPLOY_DIR/scripts/rollback-site.sh"
    echo "   - Healthcheck:     sudo $DEPLOY_DIR/scripts/healthcheck.sh"
    echo "   - Ver logs access: sudo tail -f /var/log/nginx/corpmonitor.net-access.log"
    echo "   - Ver logs error:  sudo tail -f /var/log/nginx/corpmonitor.net-error.log"
    echo "   - Status Nginx:    sudo systemctl status nginx"
    
    if [[ "$SKIP_SSL" == false ]]; then
        echo "   - Status SSL:      sudo certbot certificates"
    fi
    
    echo -e "\n${BLUE}📊 Status dos serviços:${NC}"
    systemctl is-active --quiet nginx && echo -e "   ${GREEN}✅ Nginx: Ativo${NC}" || echo -e "   ${RED}❌ Nginx: Inativo${NC}"
    
    if [[ "$SKIP_SSL" == false ]]; then
        [[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]] && echo -e "   ${GREEN}✅ SSL: Configurado${NC}" || echo -e "   ${YELLOW}⚠️  SSL: Não configurado${NC}"
    fi
    
    if [[ "$SKIP_FIREWALL" == false ]]; then
        ufw status | grep -q "Status: active" && echo -e "   ${GREEN}✅ Firewall: Ativo${NC}" || echo -e "   ${YELLOW}⚠️  Firewall: Inativo${NC}"
    fi
    
    echo -e "\n${YELLOW}⚠️  IMPORTANTE:${NC}"
    if [[ "$SKIP_SSL" == false ]]; then
        echo "   - Certificado SSL será renovado automaticamente"
    fi
    echo "   - Faça backup antes de qualquer atualização"
    echo "   - Use os scripts em $DEPLOY_DIR/scripts para gerenciar o site"
    
    echo -e "\n${BLUE}📝 Log de instalação:${NC} $LOG_FILE"
    echo ""
}

################################################################################
# Função de desinstalação
################################################################################

uninstall() {
    print_header "DESINSTALANDO CORPMONITOR"
    
    print_warning "Isso removerá completamente a instalação do CorpMonitor"
    read -p "Tem certeza? Digite 'SIM' para confirmar: " CONFIRM
    
    if [[ "$CONFIRM" != "SIM" ]]; then
        echo "Desinstalação cancelada"
        exit 0
    fi
    
    print_info "Parando serviços..."
    systemctl stop nginx || true
    
    print_info "Removendo arquivos..."
    rm -rf "$SITE_DIR"
    rm -rf "$DEPLOY_DIR"
    rm -f /etc/nginx/sites-available/$DOMAIN
    rm -f /etc/nginx/sites-enabled/$DOMAIN
    
    print_info "Removendo certificado SSL..."
    certbot delete --cert-name $DOMAIN --non-interactive 2>/dev/null || true
    
    print_info "Reiniciando Nginx..."
    systemctl start nginx || true
    
    print_success "Desinstalação concluída"
    exit 0
}

################################################################################
# Função de atualização
################################################################################

update_only() {
    print_header "ATUALIZANDO CORPMONITOR"
    
    if [[ ! -d "$SITE_DIR/.git" ]]; then
        print_error "Site não está instalado. Execute sem --update-only para instalar."
        exit 1
    fi
    
    # Executar script de atualização
    if [[ -f "$DEPLOY_DIR/scripts/update-site.sh" ]]; then
        bash "$DEPLOY_DIR/scripts/update-site.sh"
    else
        print_error "Script de atualização não encontrado"
        exit 1
    fi
    
    print_success "Atualização concluída"
    exit 0
}

################################################################################
# Main
################################################################################

main() {
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help)
                show_help
                ;;
            --dry-run)
                DRY_RUN=true
                print_warning "Modo DRY RUN ativado - nenhuma mudança será feita"
                shift
                ;;
            --skip-ssl)
                SKIP_SSL=true
                shift
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
                shift
                ;;
            --update-only)
                UPDATE_ONLY=true
                shift
                ;;
            --uninstall)
                UNINSTALL=true
                shift
                ;;
            *)
                print_error "Opção desconhecida: $1"
                show_help
                ;;
        esac
    done
    
    # Processar comandos especiais
    if [[ "$UNINSTALL" == true ]]; then
        uninstall
    fi
    
    if [[ "$UPDATE_ONLY" == true ]]; then
        update_only
    fi
    
    # Dry run
    if [[ "$DRY_RUN" == true ]]; then
        print_info "Modo DRY RUN - simulando instalação..."
        check_root
        check_ubuntu_version
        check_internet
        check_dns
        print_success "Todas as validações passaram"
        print_info "Execute sem --dry-run para instalar"
        exit 0
    fi
    
    # Instalação normal
    print_header "DEPLOY CORPMONITOR - corpmonitor.net"
    
    # Criar diretório de logs
    mkdir -p "$DEPLOY_DIR/logs"
    log "Iniciando instalação"
    
    # Validações
    check_root
    check_ubuntu_version
    check_internet
    check_dns
    
    # Instalação
    install_dependencies
    install_nodejs
    configure_firewall
    setup_directories
    clone_repository
    create_env_file
    install_npm_dependencies
    build_project
    configure_nginx
    configure_ssl
    set_permissions
    create_helper_scripts
    configure_logrotate
    
    # Testes
    run_tests
    
    # Relatório final
    log "Instalação concluída"
    show_final_report
}

# Executar
main "$@"
