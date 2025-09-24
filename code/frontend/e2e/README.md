# Pruebas Automatizadas con Playwright para DevFlow

Este directorio contiene pruebas automatizadas end-to-end (e2e) para el sistema DevFlow utilizando Playwright.

## Estructura de Carpetas

- `tests/`: Contiene los archivos de pruebas organizados por funcionalidad
- `fixtures/`: Contiene datos de prueba reutilizables
- `utils/`: Contiene funciones de utilidad para las pruebas

## Pruebas Implementadas

Se han implementado pruebas para las siguientes funcionalidades:

1. **Autenticación y Gestión de Usuarios** (`auth.spec.ts`)
   - Inicio de sesión
   - Registro de usuarios
   - Gestión de perfiles
   - Acceso a rutas protegidas

2. **Gestión de Proyectos** (`projects.spec.ts`)
   - Creación de proyectos
   - Edición de proyectos
   - Eliminación de proyectos
   - Compartir proyectos

3. **Tableros Kanban y Tareas** (`boards.spec.ts`)
   - Creación de tableros
   - Gestión de columnas
   - Creación y edición de tareas
   - Arrastrar y soltar tareas entre columnas

4. **Funcionalidades de Colaboración** (`collaboration.spec.ts`)
   - Gestión de miembros del proyecto
   - Comentarios en tareas
   - Indicadores de presencia
   - Historial de actividad

5. **Notificaciones** (`notifications.spec.ts`)
   - Centro de notificaciones
   - Marcar notificaciones como leídas
   - Notificaciones de invitación a proyectos
   - Notificaciones de actividad en proyectos compartidos

## Cómo Ejecutar las Pruebas

### Requisitos Previos

- Node.js instalado
- Proyecto DevFlow configurado (frontend y backend)
- Playwright instalado (`npm install -D @playwright/test`)
- Navegadores de Playwright instalados (`npx playwright install`)

### Ejecutar Todas las Pruebas

```bash
npm run test:e2e
```

### Ejecutar Pruebas Específicas

```bash
# Pruebas de autenticación
npm run test:e2e:auth

# Pruebas de proyectos
npm run test:e2e:projects

# Pruebas de tableros
npm run test:e2e:boards

# Pruebas de colaboración
npm run test:e2e:collab

# Pruebas de notificaciones
npm run test:e2e:notifications
```

### Ejecutar Pruebas en Modo UI

```bash
npm run test:e2e:ui
```

### Ejecutar Pruebas en Modo Debug

```bash
npm run test:e2e:debug
```

### Ver Reporte de Pruebas

```bash
npm run test:e2e:report
```

## Consideraciones Importantes

1. **Datos de Prueba**: Las pruebas utilizan datos de prueba definidos en los archivos de fixtures. Asegúrate de que estos datos sean válidos para tu entorno.

2. **Estado del Backend**: El backend debe estar en ejecución para que las pruebas funcionen correctamente.

3. **Limpieza de Datos**: Algunas pruebas crean datos que pueden persistir entre ejecuciones. Considera implementar una limpieza de datos antes o después de las pruebas.

4. **Configuración**: La configuración de Playwright se encuentra en `playwright.config.ts` en la raíz del proyecto frontend.

5. **Selectores**: Las pruebas utilizan selectores como `data-testid` para identificar elementos. Asegúrate de que estos atributos estén presentes en los componentes correspondientes.

## Solución de Problemas

- **Fallos en las Pruebas**: Verifica que el backend esté en ejecución y que los datos de prueba sean válidos.
- **Problemas de Timing**: Ajusta los tiempos de espera en `playwright.config.ts` si las pruebas fallan debido a problemas de timing.
- **Selectores No Encontrados**: Asegúrate de que los componentes tengan los atributos `data-testid` correctos.