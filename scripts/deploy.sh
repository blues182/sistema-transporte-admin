#!/bin/bash

# Script de Actualización Segura - Sistema de Transporte
# Este script actualiza la app SIN perder datos

set -e  # Detener si hay error

echo "========================================="
echo "🚀 Iniciando actualización de app..."
echo "========================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
APP_DIR="/home/transporte"  # Cambiar según tu ruta
BACKUP_DIR="$APP_DIR/backups"
DB_USER="transportes_user"
DB_NAME="transportes_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 1. BACKUP DE BASE DE DATOS
echo -e "\n${YELLOW}[1/6]${NC} Haciendo backup de la base de datos..."
mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
echo -e "${GREEN}✓ Backup guardado en: $BACKUP_DIR/backup_$TIMESTAMP.sql${NC}"

# 2. PARAR PROCESOS ACTUALES
echo -e "\n${YELLOW}[2/6]${NC} Deteniendo procesos actuales..."
cd $APP_DIR

# Si usas PM2
if command -v pm2 &> /dev/null; then
    pm2 stop all || true
    echo -e "${GREEN}✓ PM2 detenido${NC}"
else
    # Si es manual, aquí se detiene con Ctrl+C
    echo -e "${YELLOW}⚠ PM2 no encontrado. Asegúrate de detener los procesos manualmente${NC}"
    read -p "Presiona Enter cuando hayas detenido los servidores..."
fi

# 3. DESCARGAR CAMBIOS DE GIT
echo -e "\n${YELLOW}[3/6]${NC} Descargando cambios de GitHub..."
git pull origin main
echo -e "${GREEN}✓ Cambios descargados${NC}"

# 4. INSTALAR DEPENDENCIAS
echo -e "\n${YELLOW}[4/6]${NC} Instalando dependencias..."

# Backend
echo "  → Backend..."
cd backend
npm install
cd ..

# Frontend
echo "  → Frontend..."
cd frontend
npm install
cd ..

echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# 5. OPCIONAL: Revisar migraciones (sin ejecutar)
echo -e "\n${YELLOW}[5/6]${NC} Revisando cambios en base de datos..."
if git diff HEAD~1 database/*; then
    echo -e "${YELLOW}⚠ Hay cambios en estructura de BD. Revisa antes de aplicar.${NC}"
else
    echo -e "${GREEN}✓ Sin cambios en estructura de BD${NC}"
fi

# 6. REINICIAR LA APP
echo -e "\n${YELLOW}[6/6]${NC} Reiniciando aplicación..."

if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✓ App reiniciada con PM2${NC}"
else
    echo -e "${YELLOW}⚠ Para iniciar manualmente, ejecuta:${NC}"
    echo "    npm run dev"
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ ¡ACTUALIZACIÓN COMPLETADA!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n📋 Resumen:"
echo "  • Backup: $BACKUP_DIR/backup_$TIMESTAMP.sql"
echo "  • URL: http://85.208.23.89"
echo "  • Logs: pm2 logs"
echo ""
echo "⚠️  Si hay problemas, restaura el backup:"
echo "   mysql -u $DB_USER -p $DB_NAME < $BACKUP_DIR/backup_$TIMESTAMP.sql"
