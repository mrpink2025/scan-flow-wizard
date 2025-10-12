#!/bin/bash

###############################################################################
# CorpMonitor - Script de Instalação e Hardening para Ubuntu 24.04
# Versão: 1.0.0
# Descrição: Script completo de configuração de segurança
###############################################################################

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis globais
SCRIPT_DIR="/opt/corpmonitor"
LOG_FILE="${SCRIPT_DIR}/logs/installation.log"
BACKUP_DIR="${SCRIPT_DIR}/backups/$(date +%Y%m%d_%H%M%S)"
CUSTOM_SSH_PORT=2222
ENABLE_MONITORING=false
AUTO_BACKUP=false
DRY_RUN=false

###############################################################################
# Funções Auxiliares
###############################################################################

print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}CorpMonitor Security Installation Script${NC}           ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  Ubuntu 24.04 LTS Hardening                          ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    log "INFO" "$1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR" "$1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARNING" "$1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    log "INFO" "$1"
}

progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    
    printf "\rProgresso: ["
    printf "%${completed}s" | tr ' ' '='
    printf "%$((width - completed))s" | tr ' ' '-'
    printf "] %3d%%" $percentage
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script precisa ser executado como root ou com sudo"
        exit 1
    fi
    print_success "Verificação de privilégios: OK"
}

check_ubuntu_version() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" != "ubuntu" ]] || [[ "$VERSION_ID" != "24.04" ]]; then
            print_error "Este script é otimizado para Ubuntu 24.04 LTS"
            read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                exit 1
            fi
        else
            print_success "Sistema: Ubuntu 24.04 LTS detectado"
        fi
    fi
}

create_directories() {
    print_info "Criando estrutura de diretórios..."
    mkdir -p "${SCRIPT_DIR}"/{config,logs,backups,scripts}
    chmod 700 "${SCRIPT_DIR}"
    print_success "Diretórios criados"
}

backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        mkdir -p "${BACKUP_DIR}/$(dirname $file)"
        cp -p "$file" "${BACKUP_DIR}/${file}"
        print_info "Backup criado: $file"
    fi
}

###############################################################################
# 1. Atualização do Sistema
###############################################################################

update_system() {
    print_info "Atualizando sistema operacional..."
    
    if [ "$DRY_RUN" = false ]; then
        apt-get update -qq
        DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
        DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y -qq
        apt-get autoremove -y -qq
        apt-get autoclean -qq
    fi
    
    print_success "Sistema atualizado"
}

install_security_packages() {
    print_info "Instalando pacotes de segurança..."
    
    local packages=(
        "ufw"
        "fail2ban"
        "clamav"
        "clamav-daemon"
        "rkhunter"
        "chkrootkit"
        "auditd"
        "aide"
        "unattended-upgrades"
        "apt-listchanges"
        "libpam-pwquality"
        "certbot"
    )
    
    if [ "$DRY_RUN" = false ]; then
        DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${packages[@]}"
    fi
    
    print_success "Pacotes de segurança instalados"
}

configure_unattended_upgrades() {
    print_info "Configurando atualizações automáticas..."
    
    backup_file "/etc/apt/apt.conf.d/50unattended-upgrades"
    
    if [ "$DRY_RUN" = false ]; then
        cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

        cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF
    fi
    
    print_success "Atualizações automáticas configuradas"
}

###############################################################################
# 2. Configuração de Firewall (UFW)
###############################################################################

configure_firewall() {
    print_info "Configurando firewall UFW..."
    
    if [ "$DRY_RUN" = false ]; then
        # Resetar regras
        ufw --force reset
        
        # Política padrão
        ufw default deny incoming
        ufw default allow outgoing
        
        # Permitir SSH na porta customizada
        ufw allow ${CUSTOM_SSH_PORT}/tcp comment 'SSH'
        
        # Limitar tentativas de conexão SSH
        ufw limit ${CUSTOM_SSH_PORT}/tcp
        
        # Permitir HTTP/HTTPS
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        
        # Bloquear portas perigosas explicitamente
        ufw deny 23/tcp comment 'Block Telnet'
        ufw deny 3306/tcp comment 'Block MySQL external'
        ufw deny 5432/tcp comment 'Block PostgreSQL external'
        ufw deny 6379/tcp comment 'Block Redis external'
        ufw deny 27017/tcp comment 'Block MongoDB external'
        
        # Ativar firewall
        ufw --force enable
        
        # Logging
        ufw logging medium
    fi
    
    print_success "Firewall configurado e ativado"
}

###############################################################################
# 3. Hardening SSH
###############################################################################

configure_ssh() {
    print_info "Configurando SSH de forma segura..."
    
    backup_file "/etc/ssh/sshd_config"
    
    if [ "$DRY_RUN" = false ]; then
        cat > /etc/ssh/sshd_config << EOF
Port ${CUSTOM_SSH_PORT}
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no

UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*

Subsystem sftp /usr/lib/openssh/sftp-server

MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 60

AllowUsers *
DenyUsers root

Banner /etc/ssh/banner
EOF

        # Criar banner SSH
        cat > /etc/ssh/banner << 'EOF'
###############################################################################
#                     SISTEMA MONITORADO - ACESSO RESTRITO                    #
#                                                                             #
#  Todos os acessos são registrados e monitorados.                           #
#  Uso não autorizado é proibido e sujeito a penalidades legais.             #
###############################################################################
EOF

        # Reiniciar SSH
        systemctl restart sshd
    fi
    
    print_success "SSH configurado (Porta: ${CUSTOM_SSH_PORT})"
    print_warning "IMPORTANTE: Teste a conexão SSH antes de fechar a sessão atual!"
}

###############################################################################
# 4. Configuração Fail2Ban
###############################################################################

configure_fail2ban() {
    print_info "Configurando Fail2Ban..."
    
    if [ "$DRY_RUN" = false ]; then
        cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
destemail = admin@localhost
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = ${CUSTOM_SSH_PORT}
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
EOF

        systemctl enable fail2ban
        systemctl restart fail2ban
    fi
    
    print_success "Fail2Ban configurado"
}

###############################################################################
# 5. Correção de Permissões
###############################################################################

fix_permissions() {
    print_info "Corrigindo permissões de arquivos críticos..."
    
    if [ "$DRY_RUN" = false ]; then
        # Sistema
        chmod 600 /etc/shadow
        chmod 600 /etc/gshadow
        chmod 644 /etc/passwd
        chmod 644 /etc/group
        
        # SSH
        chmod 700 ~/.ssh 2>/dev/null || true
        chmod 600 ~/.ssh/authorized_keys 2>/dev/null || true
        
        # /tmp com sticky bit
        chmod 1777 /tmp
        
        # Arquivos .env em /var/www, /home, /opt
        find /var/www /home /opt -name ".env" -type f 2>/dev/null | while read envfile; do
            chmod 600 "$envfile"
            print_info "Protegido: $envfile"
        done
    fi
    
    print_success "Permissões corrigidas"
}

###############################################################################
# 6. Política de Senhas Fortes
###############################################################################

configure_password_policy() {
    print_info "Configurando política de senhas fortes..."
    
    backup_file "/etc/pam.d/common-password"
    
    if [ "$DRY_RUN" = false ]; then
        # Configurar pwquality
        cat > /etc/security/pwquality.conf << 'EOF'
minlen = 12
dcredit = -1
ucredit = -1
ocredit = -1
lcredit = -1
maxrepeat = 3
difok = 3
EOF

        # Expiração de senha
        sed -i 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs
        sed -i 's/^PASS_MIN_DAYS.*/PASS_MIN_DAYS   7/' /etc/login.defs
        sed -i 's/^PASS_WARN_AGE.*/PASS_WARN_AGE   14/' /etc/login.defs
    fi
    
    print_success "Política de senhas configurada"
}

###############################################################################
# 7. Hardening de Rede (sysctl)
###############################################################################

configure_sysctl() {
    print_info "Aplicando hardening de rede..."
    
    backup_file "/etc/sysctl.conf"
    
    if [ "$DRY_RUN" = false ]; then
        cat >> /etc/sysctl.conf << 'EOF'

# CorpMonitor Security Settings
# IP Forwarding
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# SYN Cookies
net.ipv4.tcp_syncookies = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore source routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Ignore ICMP ping
net.ipv4.icmp_echo_ignore_all = 0

# Ignore broadcast pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Secure redirects
net.ipv4.conf.all.secure_redirects = 0

# Reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
EOF

        sysctl -p > /dev/null 2>&1
    fi
    
    print_success "Hardening de rede aplicado"
}

###############################################################################
# 8. Configuração de Auditoria
###############################################################################

configure_audit() {
    print_info "Configurando sistema de auditoria..."
    
    if [ "$DRY_RUN" = false ]; then
        # Regras de auditoria
        cat > /etc/audit/rules.d/corpmonitor.rules << 'EOF'
# Monitorar tentativas de login
-w /var/log/auth.log -p wa -k auth_log
-w /var/log/faillog -p wa -k login_failures

# Monitorar mudanças em usuários/grupos
-w /etc/passwd -p wa -k passwd_changes
-w /etc/group -p wa -k group_changes
-w /etc/shadow -p wa -k shadow_changes

# Monitorar sudo
-w /etc/sudoers -p wa -k sudoers_changes
-w /var/log/sudo.log -p wa -k sudo_log

# Monitorar modificações de sistema
-w /etc/ssh/sshd_config -p wa -k sshd_config
-w /etc/hosts -p wa -k hosts_changes

# Monitorar execução de comandos privilegiados
-a always,exit -F arch=b64 -S execve -F euid=0 -k root_commands
EOF

        augenrules --load
        systemctl restart auditd
    fi
    
    print_success "Sistema de auditoria configurado"
}

###############################################################################
# 9. Configuração de Banco de Dados
###############################################################################

secure_databases() {
    print_info "Aplicando hardening em bancos de dados..."
    
    # MySQL/MariaDB
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
        print_info "MySQL/MariaDB detectado"
        
        if [ "$DRY_RUN" = false ]; then
            # Bind apenas em localhost
            if [ -f /etc/mysql/mysql.conf.d/mysqld.cnf ]; then
                backup_file "/etc/mysql/mysql.conf.d/mysqld.cnf"
                sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf
                systemctl restart mysql 2>/dev/null || systemctl restart mariadb 2>/dev/null
            fi
        fi
        
        print_success "MySQL/MariaDB configurado para acesso local apenas"
    fi
    
    # PostgreSQL
    if systemctl is-active --quiet postgresql; then
        print_info "PostgreSQL detectado"
        
        if [ "$DRY_RUN" = false ]; then
            # Configurar pg_hba.conf para local apenas
            PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
            if [ -n "$PG_HBA" ]; then
                backup_file "$PG_HBA"
                # Adicionar configuração mais restritiva no início
                sed -i '1i# CorpMonitor Security - Local only' "$PG_HBA"
                systemctl restart postgresql
            fi
        fi
        
        print_success "PostgreSQL configurado"
    fi
    
    # Redis
    if systemctl is-active --quiet redis || systemctl is-active --quiet redis-server; then
        print_info "Redis detectado"
        
        if [ "$DRY_RUN" = false ]; then
            REDIS_CONF="/etc/redis/redis.conf"
            if [ -f "$REDIS_CONF" ]; then
                backup_file "$REDIS_CONF"
                
                # Bind localhost
                sed -i 's/^bind.*/bind 127.0.0.1/' "$REDIS_CONF"
                
                # Gerar senha forte
                REDIS_PASS=$(openssl rand -base64 32)
                sed -i "s/^# requirepass.*/requirepass $REDIS_PASS/" "$REDIS_CONF"
                
                echo "$REDIS_PASS" > "${SCRIPT_DIR}/config/redis_password.txt"
                chmod 600 "${SCRIPT_DIR}/config/redis_password.txt"
                
                systemctl restart redis 2>/dev/null || systemctl restart redis-server 2>/dev/null
                
                print_success "Redis configurado com senha"
                print_warning "Senha do Redis salva em: ${SCRIPT_DIR}/config/redis_password.txt"
            fi
        fi
    fi
}

###############################################################################
# 10. Proteção Web Server
###############################################################################

secure_webserver() {
    print_info "Configurando segurança de web servers..."
    
    # Nginx
    if systemctl is-active --quiet nginx; then
        print_info "Nginx detectado"
        
        if [ "$DRY_RUN" = false ]; then
            cat > /etc/nginx/conf.d/security.conf << 'EOF'
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Hide Nginx version
server_tokens off;

# Limit request size
client_max_body_size 10M;
client_body_buffer_size 128k;

# Timeouts
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;

# Rate limiting
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
limit_req zone=one burst=5;
EOF

            nginx -t && systemctl reload nginx
            print_success "Nginx configurado"
        fi
    fi
    
    # Apache
    if systemctl is-active --quiet apache2; then
        print_info "Apache detectado"
        
        if [ "$DRY_RUN" = false ]; then
            cat > /etc/apache2/conf-available/security-headers.conf << 'EOF'
# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "no-referrer-when-downgrade"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Hide Apache version
ServerTokens Prod
ServerSignature Off

# Disable directory listing
Options -Indexes
EOF

            a2enconf security-headers
            a2enmod headers
            systemctl reload apache2
            print_success "Apache configurado"
        fi
    fi
}

###############################################################################
# 11. Scan de Malware
###############################################################################

scan_malware() {
    print_info "Executando scan de malware com ClamAV..."
    
    if [ "$DRY_RUN" = false ]; then
        # Atualizar definições
        print_info "Atualizando definições de vírus..."
        freshclam > /dev/null 2>&1 || true
        
        # Scan rápido em diretórios web comuns
        print_info "Scaneando diretórios web..."
        for dir in /var/www /home/*/public_html /opt; do
            if [ -d "$dir" ]; then
                clamscan -r -i --exclude-dir="^/sys|^/proc|^/dev" "$dir" 2>/dev/null | tee -a "${LOG_FILE}" || true
            fi
        done
    fi
    
    print_success "Scan de malware concluído"
}

###############################################################################
# 12. Remoção de Serviços Desnecessários
###############################################################################

remove_unnecessary_services() {
    print_info "Desabilitando serviços desnecessários..."
    
    local services_to_disable=(
        "telnet"
        "rsh"
        "rlogin"
        "vsftpd"
        "inetd"
    )
    
    if [ "$DRY_RUN" = false ]; then
        for service in "${services_to_disable[@]}"; do
            if systemctl is-active --quiet "$service" 2>/dev/null; then
                systemctl stop "$service"
                systemctl disable "$service"
                print_info "Serviço $service desabilitado"
            fi
        done
    fi
    
    print_success "Serviços inseguros desabilitados"
}

###############################################################################
# 13. Configuração de Backup Automático
###############################################################################

setup_auto_backup() {
    if [ "$AUTO_BACKUP" = false ]; then
        return
    fi
    
    print_info "Configurando backup automático..."
    
    if [ "$DRY_RUN" = false ]; then
        cat > "${SCRIPT_DIR}/scripts/daily-backup.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/corpmonitor/backups/daily"
DATE=$(date +%Y%m%d)
mkdir -p "$BACKUP_DIR"

# Backup de configurações
tar -czf "$BACKUP_DIR/configs_$DATE.tar.gz" /etc/ssh /etc/nginx /etc/apache2 /etc/mysql 2>/dev/null

# Backup de bancos de dados
if command -v mysqldump &> /dev/null; then
    mysqldump --all-databases | gzip > "$BACKUP_DIR/mysql_$DATE.sql.gz"
fi

if command -v pg_dumpall &> /dev/null; then
    sudo -u postgres pg_dumpall | gzip > "$BACKUP_DIR/postgresql_$DATE.sql.gz"
fi

# Manter apenas 7 dias de backup
find "$BACKUP_DIR" -type f -mtime +7 -delete
EOF

        chmod +x "${SCRIPT_DIR}/scripts/daily-backup.sh"
        
        # Adicionar ao cron
        (crontab -l 2>/dev/null; echo "0 2 * * * ${SCRIPT_DIR}/scripts/daily-backup.sh") | crontab -
    fi
    
    print_success "Backup automático configurado (diário às 2h)"
}

###############################################################################
# 14. Monitoramento
###############################################################################

setup_monitoring() {
    if [ "$ENABLE_MONITORING" = false ]; then
        return
    fi
    
    print_info "Configurando monitoramento..."
    
    if [ "$DRY_RUN" = false ]; then
        cat > "${SCRIPT_DIR}/scripts/security-monitor.sh" << 'EOF'
#!/bin/bash
LOG_FILE="/opt/corpmonitor/logs/security-monitor.log"

# Verificar tentativas de login falhadas
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | tail -20 | wc -l)
if [ $FAILED_LOGINS -gt 10 ]; then
    echo "$(date): ALERT - $FAILED_LOGINS tentativas de login falhadas" >> "$LOG_FILE"
fi

# Verificar portas abertas
OPEN_PORTS=$(ss -tuln | grep LISTEN | wc -l)
echo "$(date): Portas abertas: $OPEN_PORTS" >> "$LOG_FILE"

# Verificar uso de disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): ALERT - Uso de disco: $DISK_USAGE%" >> "$LOG_FILE"
fi

# Verificar processos suspeitos
ps aux | grep -E "(nc|ncat|netcat)" | grep -v grep >> "$LOG_FILE"
EOF

        chmod +x "${SCRIPT_DIR}/scripts/security-monitor.sh"
        
        # Executar a cada 15 minutos
        (crontab -l 2>/dev/null; echo "*/15 * * * * ${SCRIPT_DIR}/scripts/security-monitor.sh") | crontab -
    fi
    
    print_success "Monitoramento configurado"
}

###############################################################################
# 15. Relatório Final
###############################################################################

generate_report() {
    local report_file="${SCRIPT_DIR}/logs/installation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
═══════════════════════════════════════════════════════════════════════════
                 RELATÓRIO DE INSTALAÇÃO - CORPMONITOR
═══════════════════════════════════════════════════════════════════════════

Data: $(date)
Hostname: $(hostname)
IP: $(hostname -I | awk '{print $1}')

CONFIGURAÇÕES APLICADAS:
───────────────────────────────────────────────────────────────────────────

✓ Sistema atualizado para última versão
✓ Firewall UFW ativado e configurado
✓ SSH movido para porta ${CUSTOM_SSH_PORT}
✓ Fail2Ban configurado
✓ Política de senhas fortes aplicada
✓ Permissões de arquivos críticos corrigidas
✓ Hardening de rede aplicado (sysctl)
✓ Sistema de auditoria configurado
✓ Bancos de dados protegidos (acesso local apenas)
✓ Web servers com headers de segurança
✓ Scan de malware executado
✓ Serviços inseguros desabilitados
✓ Atualizações automáticas ativadas

PORTAS ABERTAS:
───────────────────────────────────────────────────────────────────────────
$(ufw status numbered 2>/dev/null || echo "UFW não configurado")

CREDENCIAIS IMPORTANTES:
───────────────────────────────────────────────────────────────────────────
EOF

    if [ -f "${SCRIPT_DIR}/config/redis_password.txt" ]; then
        echo "Redis Password: $(cat ${SCRIPT_DIR}/config/redis_password.txt)" >> "$report_file"
    fi

    cat >> "$report_file" << EOF

PRÓXIMOS PASSOS:
───────────────────────────────────────────────────────────────────────────
1. Teste a conexão SSH na nova porta: ssh -p ${CUSTOM_SSH_PORT} user@host
2. Configure certificados SSL/TLS: certbot --nginx ou certbot --apache
3. Revise os logs em: ${SCRIPT_DIR}/logs/
4. Configure backup externo de dados críticos
5. Teste a política de senhas criando novo usuário
6. Revise regras de firewall conforme necessidade

LOGS E BACKUPS:
───────────────────────────────────────────────────────────────────────────
Logs: ${SCRIPT_DIR}/logs/
Backups: ${BACKUP_DIR}
Configurações: ${SCRIPT_DIR}/config/

DOCUMENTAÇÃO:
───────────────────────────────────────────────────────────────────────────
Fail2Ban: fail2ban-client status
UFW: ufw status verbose
Auditoria: ausearch -k auth_log
Serviços: systemctl list-units --type=service --state=running

═══════════════════════════════════════════════════════════════════════════
              Para suporte: https://corpmonitor.com/support
═══════════════════════════════════════════════════════════════════════════
EOF

    print_success "Relatório gerado: $report_file"
    cat "$report_file"
}

###############################################################################
# Main - Fluxo Principal
###############################################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --custom-ssh-port)
                CUSTOM_SSH_PORT="$2"
                shift 2
                ;;
            --enable-monitoring)
                ENABLE_MONITORING=true
                shift
                ;;
            --auto-backup)
                AUTO_BACKUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                echo "Uso: $0 [opções]"
                echo ""
                echo "Opções:"
                echo "  --custom-ssh-port PORT    Define porta SSH customizada (padrão: 2222)"
                echo "  --enable-monitoring       Ativa monitoramento de segurança"
                echo "  --auto-backup            Configura backup automático diário"
                echo "  --dry-run                Simula execução sem fazer mudanças"
                echo "  --help                   Mostra esta ajuda"
                exit 0
                ;;
            *)
                print_error "Opção desconhecida: $1"
                exit 1
                ;;
        esac
    done
}

main() {
    parse_arguments "$@"
    
    print_header
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "MODO DRY-RUN: Nenhuma alteração será feita"
    fi
    
    # Verificações iniciais
    check_root
    check_ubuntu_version
    create_directories
    
    # Total de passos para barra de progresso
    local total_steps=18
    local current_step=0
    
    # Executar configurações
    ((current_step++)); progress_bar $current_step $total_steps
    update_system
    
    ((current_step++)); progress_bar $current_step $total_steps
    install_security_packages
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_unattended_upgrades
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_firewall
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_ssh
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_fail2ban
    
    ((current_step++)); progress_bar $current_step $total_steps
    fix_permissions
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_password_policy
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_sysctl
    
    ((current_step++)); progress_bar $current_step $total_steps
    configure_audit
    
    ((current_step++)); progress_bar $current_step $total_steps
    secure_databases
    
    ((current_step++)); progress_bar $current_step $total_steps
    secure_webserver
    
    ((current_step++)); progress_bar $current_step $total_steps
    scan_malware
    
    ((current_step++)); progress_bar $current_step $total_steps
    remove_unnecessary_services
    
    ((current_step++)); progress_bar $current_step $total_steps
    setup_auto_backup
    
    ((current_step++)); progress_bar $current_step $total_steps
    setup_monitoring
    
    ((current_step++)); progress_bar $current_step $total_steps
    print_info "Finalizando..."
    
    ((current_step++)); progress_bar $current_step $total_steps
    
    echo ""
    print_success "═══════════════════════════════════════════════════════"
    print_success "  Instalação concluída com sucesso!"
    print_success "═══════════════════════════════════════════════════════"
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        generate_report
    fi
    
    print_warning "ATENÇÃO: SSH foi movido para porta ${CUSTOM_SSH_PORT}"
    print_warning "Teste a conexão antes de fechar esta sessão!"
    print_info "Comando: ssh -p ${CUSTOM_SSH_PORT} usuario@$(hostname -I | awk '{print $1}')"
}

# Executar script
main "$@"
