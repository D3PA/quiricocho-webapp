# Quiricocho – Plataforma para gestionar jugadores de FIFA


<div align="center">
  
<img src="./frontend/public/assets/images/logo.webp" alt="Quiricocho" width="500">

</div>

---

<img src="./frontend/public/assets/images/logo-min.webp" width="80" align="left">

<b>Una aplicación moderna para gestionar jugadores de FIFA con datos desde 2015 hasta 2023.</b><br>
Crea, edita, filtra y analiza jugadores con estadísticas completas y timeline de habilidades.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-17.x-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![SASS](https://img.shields.io/badge/SASS-1.x-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)

---

<div align="center">

## Características principales

<table>
<tr>
<td width="33%" valign="top" align="left">

### 🧍‍♂️ Gestión de Jugadores
- CRUD completo con +100 habilidades FIFA  
- 8 categorías organizadas (Ataque, Defensa, etc.)  
- Posiciones múltiples y especiales  
- Datos físicos y financieros  

### 🔎 Búsqueda Inteligente
- Filtros por nombre, club, posición  
- Versiones FIFA 15–23  
- Ordenamiento y paginación  

</td>
<td width="33%" valign="top" align="left">

### 📊 Análisis Visual
- Timeline de evolución  
- Gráficos radar  
- Colores por nivel  
- Comparativas de progreso  

### 💾 Gestión de Datos
- Exportación/Importación CSV  
- Backup y sincronización  
- Traits interactivos  
- Ratings con estrellas  

</td>
<td width="33%" valign="top" align="left">

### 🔐 Seguridad
- Autenticación JWT  
- Roles de usuario  
- Validaciones completas  
- Protección de rutas  

</td>
</tr>
</table>

</div>


<div align="center">

## Tecnologías utilizadas

<table>
<tr>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
<br><strong>Node.js</strong>
<br><sub>Runtime Backend</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" width="48" height="48" alt="Angular" />
<br><strong>Angular</strong>
<br><sub>Framework Frontend</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width="48" height="48" alt="MySQL" />
<br><strong>MySQL 8</strong>
<br><sub>Base de Datos</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="48" height="48" alt="Docker" />
<br><strong>Docker</strong>
<br><sub>Contenedores</sub>
</td>
</tr>
<tr>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="48" height="48" alt="Express" />
<br><strong>Express.js</strong>
<br><sub>Framework Backend</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<br><strong>TypeScript</strong>
<br><sub>Lenguaje</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg" width="48" height="48" alt="Sequelize" />
<br><strong>Sequelize</strong>
<br><sub>ORM Database</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" width="48" height="48" alt="Nginx" />
<br><strong>Nginx</strong>
<br><sub>Web Server</sub>
</td>
</tr>
<tr>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" width="48" height="48" alt="SASS" />
<br><strong>SASS</strong>
<br><sub>Estilos</sub>
</td>
<td align="center" width="150">
<img src="https://www.chartjs.org/media/logo-title.svg" width="48" height="48" alt="Chart.js" />
<br><strong>Chart.js</strong>
<br><sub>Gráficos</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="48" height="48" alt="Git" />
<br><strong>Git</strong>
<br><sub>Control de versiones</sub>
</td>
<td align="center" width="150">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="48" height="48" alt="npm" />
<br><strong>npm</strong>
<br><sub>Gestión de paquetes</sub>
</td>
</tr>
</table>

</div>

## Instalación 

### Prerrequisitos
- 🐳 **Docker** y **Docker Compose** instalados  
- 🔧 **Git** para clonar el repositorio  

---

### Instalación rápida 

1. **Clonar el repositorio**
```bash
git clone https://github.com/D3PA/quiricocho-webapp.git
```

```bash
cd quiricocho-webapp
```

2. **Configurar variables de entorno**
```bash
cd backend
cp ../sample.env .env

# El archivo sample.env ya incluye todas las variables configuradas y listas para usar
```

3. **Levantar los servicios con Docker**
```bash
docker-compose up -d --build
```

```bash
# ⚠️ La primera vez que levantes la aplicación, usa --build para asegurarte de que las imágenes se construyan correctamente.
# En ejecuciones posteriores, docker-compose up -d es suficiente.

# Ver estado de los servicios
docker-compose ps

# Ver logs en tiempo real  
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache
```

4. **Acceder a la aplicación**
<div align="center">

| Servicio | URL |
|----------|-----|
| 🌐 **Frontend** | [http://localhost:4200](http://localhost:4200) |
| 🔧 **Backend API** | [http://localhost:3000](http://localhost:3000) |
| 📚 **Swagger docs** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) |
| 🗄️ **MySQL** | `localhost:3306` |

</div>

## Usuarios predefinidos
<div align="center">

| Usuario | Email | Password | Permisos |
|---------|-------|----------|----------|
| **Administrador** | admin@quiricocho.com | admin123 | ✅ Ver, crear y editar jugadores + Importación CSV |
| **Usuario regular** | rodritest@quiricocho.com | rodri123 | ✅ Ver y crear jugadores |

</div>

## Decisiones técnicas y funcionales

### 🔧 Problemas y soluciones implementadas

#### Problema con Imágenes de Jugadores
- **Problema:** Las imágenes de Sofifa estaban bloqueadas por políticas **CORS**.  
- **Solución temporal:** Se implementó un **sistema mixto de imágenes**:
  - **Jugadores top:** 11 jugadores tienen imágenes **locales personalizadas**.  
  - **Resto de jugadores:** Imagen por defecto genérica (`assets/images/players/default-player.png`).  
- **Nota importante:** El sistema está preparado para soportar imágenes personalizadas.  
  - Los jugadores top como **Messi, Ronaldo, Mbappé, etc.** ya cuentan con sus imágenes reales, demostrando que la arquitectura soporta imágenes específicas por jugador.

---

### 🏗️ Arquitectura preparada para imágenes
- El campo `player_face_url` ya existe en el modelo de jugadores.  
- El frontend está diseñado para mostrar imágenes desde **URLs externas o locales**.  
- **Jugadores con imágenes especiales:**  
  Messi, Ronaldo, Mbappé, Lewandowski, De Bruyne, Van Dijk, Neymar, Benzema, Oblak, Hazard, De Gea.

#### Cómo implementar imágenes reales en el futuro:
1. Configurar un servidor de imágenes sin restricciones **CORS**.  
2. Actualizar las URLs en la base de datos (`player_face_url`).  
3. El frontend mostrará automáticamente las nuevas imágenes.

## Demo
https://github.com/user-attachments/assets/8d507d73-964f-4118-a6c2-0f4c645be36b





