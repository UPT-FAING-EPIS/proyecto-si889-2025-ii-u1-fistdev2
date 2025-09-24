#!/bin/bash

# DevFlow Deployment Script
# Este script maneja el deployment completo del sistema DevFlow

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
ENVIRONMENT="${1:-development}"
FORCE_REBUILD="${2:-false}"
ENABLE_MONITORING="${3:-false}"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker no está ejecutándose"
    fi
    
    success "Todas las dependencias están disponibles"
}

# Configurar variables de entorno
setup_environment() {
    log "Configurando variables de entorno para: $ENVIRONMENT"
    
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        warning "Archivo .env.$ENVIRONMENT no encontrado, usando valores por defecto"
        cp .env.example .env.$ENVIRONMENT
    fi
    
    # Copiar archivo de entorno correspondiente
    cp .env.$ENVIRONMENT .env
    
    success "Variables de entorno configuradas"
}

# Construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    if [ "$FORCE_REBUILD" = "true" ]; then
        log "Forzando reconstrucción completa..."
        docker-compose build --no-cache
    else
        docker-compose build
    fi
    
    success "Imágenes construidas exitosamente"
}

# Ejecutar migraciones de base de datos
run_migrations() {
    log "Ejecutando migraciones de base de datos..."
    
    # Esperar a que PostgreSQL esté listo
    log "Esperando que PostgreSQL esté disponible..."
    timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U devflow_user -d devflow; do sleep 2; done'
    
    # Ejecutar migraciones
    docker-compose exec backend npm run migration:deploy
    
    success "Migraciones ejecutadas exitosamente"
}

# Ejecutar seeders
run_seeds() {
    log "Ejecutando seeders de base de datos..."
    
    docker-compose exec backend npm run seed
    
    success "Seeders ejecutados exitosamente"
}

# Verificar health checks
verify_health() {
    log "Verificando health checks de servicios..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "healthy"; then
            success "Servicios están saludables"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Intento $attempt/$max_attempts - Esperando que los servicios estén saludables..."
        sleep 10
    done
    
    error "Los servicios no pasaron los health checks"
}

# Ejecutar tests de integración
run_integration_tests() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log "Ejecutando tests de integración..."
        
        # Esperar a que la API esté disponible
        timeout 60 bash -c 'until curl -f http://localhost:3001/auth/health; do sleep 5; done'
        
        # Ejecutar tests con Newman (Postman CLI)
        if command -v newman &> /dev/null; then
            newman run tests/postman/coleccion.json \
                --environment tests/postman/environment.json \
                --reporters cli,json \
                --reporter-json-export test-results.json
            
            success "Tests de integración completados"
        else
            warning "Newman no está instalado, saltando tests de integración"
        fi
    fi
}

# Configurar monitoreo
setup_monitoring() {
    if [ "$ENABLE_MONITORING" = "true" ]; then
        log "Configurando servicios de monitoreo..."
        
        docker-compose --profile monitoring up -d prometheus grafana postgres-exporter redis-exporter
        
        success "Servicios de monitoreo configurados"
        log "Grafana disponible en: http://localhost:3003 (admin/admin123)"
        log "Prometheus disponible en: http://localhost:9090"
    fi
}

# Mostrar información del deployment
show_deployment_info() {
    log "=== INFORMACIÓN DEL DEPLOYMENT ==="
    echo ""
    echo "Ambiente: $ENVIRONMENT"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:3001"
    echo "Base de datos: localhost:5432"
    echo "Redis: localhost:6379"
    echo ""
    
    if [ "$ENABLE_MONITORING" = "true" ]; then
        echo "Monitoreo:"
        echo "  Grafana: http://localhost:3003"
        echo "  Prometheus: http://localhost:9090"
        echo ""
    fi
    
    echo "Para ver logs: docker-compose logs -f [servicio]"
    echo "Para detener: docker-compose down"
    echo "Para reiniciar: docker-compose restart [servicio]"
    echo ""
}

# Limpiar recursos
cleanup() {
    log "Limpiando recursos antiguos..."
    
    # Detener contenedores existentes
    docker-compose down --remove-orphans
    
    # Limpiar imágenes sin usar
    docker image prune -f
    
    success "Limpieza completada"
}

# Función principal
main() {
    log "=== INICIANDO DEPLOYMENT DE DEVFLOW ==="
    log "Ambiente: $ENVIRONMENT"
    log "Reconstruir: $FORCE_REBUILD"
    log "Monitoreo: $ENABLE_MONITORING"
    echo ""
    
    check_dependencies
    setup_environment
    
    if [ "$FORCE_REBUILD" = "true" ]; then
        cleanup
    fi
    
    build_images
    
    # Iniciar servicios base
    log "Iniciando servicios..."
    docker-compose up -d postgres redis
    
    # Esperar que estén listos
    sleep 10
    
    # Iniciar backend
    docker-compose up -d backend
    
    # Ejecutar migraciones y seeds
    sleep 15
    run_migrations
    run_seeds
    
    # Iniciar frontend y nginx
    docker-compose up -d frontend nginx
    
    # Verificar salud de servicios
    verify_health
    
    # Ejecutar tests
    run_integration_tests
    
    # Configurar monitoreo si está habilitado
    setup_monitoring
    
    # Mostrar información
    show_deployment_info
    
    success "Deployment completado exitosamente!"
}

# Manejar errores
trap 'error "Deployment falló. Revisar logs con: docker-compose logs"' ERR

# Ejecutar función principal
main "$@"
