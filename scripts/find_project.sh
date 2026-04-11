#!/bin/bash

echo "🔍 Buscando proyecto de transportes..."
echo ""

# Buscar ecosystem.config.js
echo "📂 Buscando ecosystem.config.js..."
find / -name "ecosystem.config.js" -type f 2>/dev/null | head -5

echo ""
echo "📂 Buscando carpetas 'transporte' o 'admin'..."
find / -maxdepth 3 -name "*transporte*" -o -name "*admin*" 2>/dev/null | grep -v "proc\|sys" | head -10

echo ""
echo "🔧 Verificando procesos activos con PM2..."
pm2 list

echo ""
echo "📍 Ubicación actual:"
pwd

echo ""
echo "📂 Carpetas en /opt/:"
ls -la /opt/ 2>/dev/null || echo "No existe /opt/"

echo ""
echo "📂 Carpetas en /srv/:"
ls -la /srv/ 2>/dev/null || echo "No existe /srv/"

echo ""
echo "📂 Carpetas en /var/www/:"
ls -la /var/www/ 2>/dev/null || echo "No existe /var/www/"

echo ""
echo "📂 Carpetas en /home/:"
ls -la /home/ 2>/dev/null || echo "No existe /home/"

echo ""
echo "✅ Búsqueda completada"
