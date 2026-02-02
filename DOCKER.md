# 🐳 Despliegue con Docker

Este proyecto incluye configuración completa de Docker para desplegar la aplicación fácilmente.

## 📋 Requisitos

- Docker Desktop instalado
- Docker Compose (incluido en Docker Desktop)

## 🚀 Despliegue Rápido

### 1. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores de producción (contraseñas seguras, etc.)

### 2. Construir y levantar los contenedores

```bash
docker-compose up -d --build
```

Este comando:
- Construye las imágenes del backend y frontend
- Descarga la imagen de MariaDB
- Crea la red entre contenedores
- Inicia todos los servicios en segundo plano

### 3. Verificar que todo esté funcionando

```bash
docker-compose ps
```

Deberías ver 3 contenedores corriendo:
- `transportes-db` (MariaDB)
- `transportes-backend` (Node.js API)
- `transportes-frontend` (Nginx + React)

### 4. Acceder a la aplicación

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Base de datos**: localhost:3306

**Credenciales por defecto:**
- Usuario admin: `admin` / `admin123`
- Usuario normal: `usuario` / `user123`

## 🛠️ Comandos Útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Detener todos los contenedores
```bash
docker-compose down
```

### Detener y eliminar volúmenes (¡cuidado, borra la BD!)
```bash
docker-compose down -v
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
```

### Reconstruir una imagen específica
```bash
docker-compose up -d --build backend
```

### Ejecutar comandos dentro de un contenedor
```bash
# Acceder a la base de datos
docker-compose exec database mysql -u root -p

# Acceder al backend
docker-compose exec backend sh
```

## 📦 Estructura de Contenedores

### Frontend (Puerto 80)
- **Imagen**: Node.js 18 (build) + Nginx Alpine (producción)
- **Función**: Sirve la aplicación React compilada
- **Nginx**: Configurado para SPA con fallback a index.html

### Backend (Puerto 5000)
- **Imagen**: Node.js 18 Alpine
- **Función**: API REST con Express
- **Healthcheck**: Verifica disponibilidad cada 30s

### Database (Puerto 3306)
- **Imagen**: MariaDB 10.11
- **Función**: Base de datos
- **Persistencia**: Volumen Docker para datos
- **Inicialización**: Scripts SQL automáticos al primer inicio

## 🔧 Actualizar la Aplicación

### 1. Actualizar código
```bash
git pull origin main
```

### 2. Reconstruir y reiniciar
```bash
docker-compose up -d --build
```

## 🌐 Despliegue en Servidor

### Opción 1: VPS con Docker

1. **Conectar al servidor por SSH**
   ```bash
   ssh usuario@tu-servidor.com
   ```

2. **Instalar Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clonar repositorio**
   ```bash
   git clone https://github.com/tu-usuario/tu-repo.git
   cd tu-repo
   ```

4. **Configurar .env**
   ```bash
   cp .env.example .env
   nano .env  # Editar con valores de producción
   ```

5. **Levantar aplicación**
   ```bash
   docker-compose up -d --build
   ```

### Opción 2: Configurar Nginx como Reverse Proxy

Si quieres usar un dominio con HTTPS:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Luego configura SSL con Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

## 🔒 Seguridad en Producción

1. **Cambiar contraseñas por defecto** en `.env`
2. **Generar JWT_SECRET único**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. **Configurar firewall** para exponer solo puertos necesarios
4. **Habilitar HTTPS** con certificado SSL
5. **Backups automáticos** de la base de datos:
   ```bash
   docker-compose exec database mysqldump -u root -p transportes_db > backup.sql
   ```

## 📊 Monitoreo

### Verificar uso de recursos
```bash
docker stats
```

### Ver espacio usado
```bash
docker system df
```

### Limpiar recursos no usados
```bash
docker system prune -a
```

## 🆘 Solución de Problemas

### Los contenedores no inician
```bash
docker-compose logs
```

### Error de conexión a la base de datos
```bash
docker-compose exec database mysql -u root -p -e "SHOW DATABASES;"
```

### Resetear todo y empezar de cero
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Puerto ya en uso
```bash
# Ver qué usa el puerto 80 o 5000
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Cambiar puertos en docker-compose.yml si es necesario
```

## 📈 Escalabilidad

Para escalar el backend con múltiples instancias:

```bash
docker-compose up -d --scale backend=3
```

Necesitarás un load balancer como Nginx o Traefik para distribuir las peticiones.
