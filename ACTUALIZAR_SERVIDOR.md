# 🚀 Guía de Actualización - Servidor Remoto

## 📊 Credenciales de Acceso

```
DNS: 6d7023b3-44c4-443a-a076-cad5527eb374.clouding.host
IP: 85.208.23.89
Usuario Linux: root
Usuario Windows: administrator
```

---

## 🔒 Opción 1: SSH (Recomendado - Más Seguro)

### Paso 1: Conectarse al servidor

**Desde Windows (PowerShell o CMD con OpenSSH):**
```powershell
ssh root@85.208.23.89
# O con DNS:
ssh root@6d7023b3-44c4-443a-a076-cad5527eb374.clouding.host
```

**Desde Mac/Linux:**
```bash
ssh root@85.208.23.89
```

### Paso 2: Ejecutar actualización

Una vez conectado al servidor:

```bash
# 1. Ir a directorio del proyecto
cd /ruta/del/proyecto  # Ajusta según tu instalación

# 2. Hacer backup de la BD
mysqldump -u transportes_user -p transportes_db > backup_$(date +%Y%m%d_%H%M%S).sql
# Te pedirá contraseña de MySQL

# 3. Descargar cambios
git pull origin main

# 4. Actualizar dependencias (sin borrar node_modules)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 5. Parar procesos actuales (si está corriendo con PM2)
pm2 stop all
pm2 delete all

# 6. Reiniciar
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Ver logs
pm2 logs
```

---

## 🪟 Opción 2: RDP (Si es Windows Server)

### Paso 1: Conectar con Escritorio Remoto

**Windows:**
- Presiona `WIN + R`
- Escribe: `mstsc`
- IP o DNS: `85.208.23.89`
- Usuario: `administrator`

**Mac:**
- Descarga "Microsoft Remote Desktop" de App Store
- Conecta con la IP o DNS

### Paso 2: Abrir PowerShell/CMD en el servidor

```powershell
cd C:\transportes  # O donde esté tu proyecto
```

### Paso 3: Ejecutar script

```powershell
.\scripts\deploy.bat
```

---

## 🔄 Procedimiento Manual (Más Control)

Si prefieres hacerlo paso a paso:

### 1️⃣ Backup de Base de Datos
```bash
mysqldump -u transportes_user -p transportes_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2️⃣ Descar cambios de GitHub
```bash
cd /ruta/proyecto
git pull origin main
```

### 3️⃣ Instalar dependencias (SIN BORRAR DATOS)
```bash
# Backend
cd backend
npm install --no-save  # --no-save evita cambios innecesarios

# Frontend
cd ../frontend
npm install --no-save
cd ..
```

### 4️⃣ Detener app
```bash
# Si usas PM2:
pm2 stop all

# Si está en primer plano: Ctrl + C
```

### 5️⃣ Reiniciar
```bash
# Con PM2:
pm2 start ecosystem.config.js

# O desarrollo:
npm run dev
```

---

## ✅ Verificar que funcionó

```bash
# Ver logs
pm2 logs

# Ver procesos activos
pm2 status

# Probar acceso
curl http://localhost:5000/api
# Debería retornar: {"message":"API de Sistema de Transporte funcionando correctamente"}

# Desde el navegador:
http://85.208.23.89
```

---

## ⚠️ Si Algo Sale Mal - RESTAURAR BACKUP

```bash
# Detener app
pm2 stop all

# Restaurar BD desde backup
mysql -u transportes_user -p transportes_db < backup_20250410_1234.sql

# Reiniciar
pm2 start ecosystem.config.js
```

---

## 📋 Checklist Final

- [ ] Conectado al servidor (SSH o RDP)
- [ ] Backup de BD creado
- [ ] `git pull origin main` ejecutado sin errores
- [ ] `npm install` completado en backend y frontend
- [ ] App reiniciada (`pm2 start` o `npm run dev`)
- [ ] Logs verificados (sin errores rojos)
- [ ] Acceso funciona: http://85.208.23.89
- [ ] Puedes iniciar sesión
- [ ] Datos originales intactos (verificar en un viaje/conductor)

---

## 🆘 Problemas Comunes

**Error: "pm2: command not found"**
```bash
# Instalar PM2 globalmente
npm install -g pm2
```

**Error: "git: command not found"**
```bash
# Instalar Git
apt-get install git  # Linux
# O descargarlo en Windows desde git-scm.com
```

**Error: "npm: command not found"**
```bash
# Instalar Node.js y npm
# https://nodejs.org/
```

**Puerto 5000/3000 ya en uso**
```bash
# Linux: matar proceso
lsof -i :5000
kill -9 <PID>

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📞 Soporte

Si tienes dudas:
1. Revisa los logs: `pm2 logs`
2. Verifica que la BD esté corriendo
3. Confirma que git está actualizado: `git status`
4. Restaura el backup si es necesario

¡Éxito con la actualización! 🚀
