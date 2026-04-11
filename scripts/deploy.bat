@echo off
REM Script de Actualización para Windows Server
REM Sistema de Transporte - Actualización Segura

echo.
echo =========================================
echo Actualizacion de APP - Sistema Transporte
echo =========================================
echo.

REM Configuración
set APP_DIR=C:\transportes
set BACKUP_DIR=%APP_DIR%\backups
set DB_USER=transportes_user
set DB_NAME=transportes_db

REM Obtener timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime%

REM 1. BACKUP
echo [1/5] Haciendo backup de base de datos...
mkdir %BACKUP_DIR% 2>nul
mysqldump -u %DB_USER% -p %DB_NAME% > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
echo. ✓ Backup completado

REM 2. DESCARGAR CAMBIOS
echo.
echo [2/5] Descargando cambios de GitHub...
cd %APP_DIR%
git pull origin main
echo. ✓ Cambios descargados

REM 3. INSTALAR DEPENDENCIAS
echo.
echo [3/5] Instalando dependencias...
cd backend
call npm install
cd ..
cd frontend
call npm install
cd ..
echo. ✓ Dependencias instaladas

REM 4. PARAR PROCESOS (opcional -requiere PM2)
echo.
echo [4/5] Reiniciando procesos...
REM Si tienes PM2 instalado, descomenta:
REM npx pm2 restart all

REM 5. NOTIFICACION FINAL
echo.
echo =========================================
echo. ✅ ACTUALIZACION COMPLETADA
echo =========================================
echo.
echo Backup: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
echo.
echo Siguiente paso:
echo. 1. Para modo desarrollo: npm run dev
echo. 2. Para restaurar si hay error:
echo.    mysql -u %DB_USER% -p %DB_NAME% ^< %BACKUP_DIR%\backup_%TIMESTAMP%.sql
echo.
pause
