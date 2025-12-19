# Guía de Despliegue: PDP Diario Digital

Esta guía detalla los pasos para poner tu aplicación en producción, conectando el Frontend (Hostinger) con el Backend (Convex).

## Arquitectura
- **Backend (Base de Datos + API)**: Alojado en **Convex Cloud**. No se sube a Hostinger.
- **Frontend (Web)**: Alojado en **Hostinger**. Se conecta al backend a través de internet.

---

## Parte 1: Publicar el Backend (Convex)

1. **Desplegar a Producción**:
   Abre una terminal en tu proyecto y ejecuta:
   ```bash
   npx convex deploy
   ```
   *Esto subirá tu base de datos y funciones a los servidores de Convex.*

2. **Obtener la URL de Producción**:
   - El comando anterior te mostrará una URL en la consola.
   - O ve a tu [Dashboard de Convex](https://dashboard.convex.dev), selecciona tu proyecto, y ve a **Settings** -> **URL and Deploy Key**.
   - Copia la **Deployment URL**. Se verá algo como: `https://happy-otter-123.convex.cloud`.
1.  **Desplegar a Producción**:
    Abre una terminal en tu proyecto y ejecuta:
    ```bash
    npx convex deploy
    ```
    *Esto subirá tu base de datos y funciones a los servidores de Convex.*

2.  **Obtener la URL de Producción**:
    -   El comando anterior te mostrará una URL en la consola.
    -   O ve a tu [Dashboard de Convex](https://dashboard.convex.dev), selecciona tu proyecto, y ve a **Settings** -> **URL and Deploy Key**.
    -   Copia la **Deployment URL**. Se verá algo como: `https://happy-otter-123.convex.cloud`.

---

## Parte 2: Preparar el Frontend (Para Hostinger)

   *Esto creará una carpeta llamada `dist` en tu proyecto. Esta carpeta contiene tu página web lista para subir.*

---

## Parte 3: Subir a Hostinger

1. **Acceder al File Manager**:
   - Entra a tu panel de Hostinger.
   - Ve al **Administrador de Archivos** (File Manager) de tu dominio.

2. **Limpiar carpeta pública**:
   - Navega a la carpeta `public_html`.
   - Borra cualquier archivo que haya ahí (a menos que tengas cosas de otro sitio).

3. **Subir Archivos**:
   - Sube **TODO el contenido** que está DENTRO de tu carpeta `dist` (la que creaste en el Parte 2) a la carpeta `public_html` de Hostinger.
   - *Nota: No subas la carpeta `dist` entera, sino los archivos que tiene adentro (index.html, carpeta assets, etc).*

4. **Configurar Rutas (Importante)**:
   Para que las rutas como `/politica` o `/panel` funcionen al recargar la página, crea un nuevo archivo en `public_html` llamado `.htaccess` con este contenido:

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## ¡Listo!
Tu web ahora debería estar accesible en tu dominio y conectada a la base de datos de Convex.

---

## Operativa de Analíticas & Métricas

### Eventos registrados
- **`analytics.recordArticleView`**: llamado automáticamente en `NewsDetailPage` cada vez que un visitante ve una nota. El front evita duplicados durante 30 minutos por usuario mediante `localStorage`.
- **Tablas Convex involucradas**:
  - `article_views`: almacena cada evento (articleId + timestamp).
  - `articles`: columna `views` se actualiza con el acumulado general.
- **Consultas**:
  - `analytics.getDashboardStats`: agrega métricas diarias/semanales/mensuales, top artículos y vistas por sección para el panel de administración.

### Flujo de datos
1. El frontend registra la vista con `api.analytics.recordArticleView`.
2. Convex inserta el evento y actualiza el contador del artículo.
3. Las páginas `/panel` y `/panel/analytics` leen `getDashboardStats` mediante `AdminContext`.
4. Si no hay eventos aún, las tarjetas muestran estados estimados/placeholder para evitar fallos.

### Cómo habilitar y monitorear
1. **Claves de despliegue**: confirmar que `VITE_CONVEX_URL` apunta al deployment de producción antes de construir el frontend.
2. **Verificar eventos**:
   - En el dashboard de Convex > Data Explorer, revisar `article_views` para comprobar que se insertan filas tras navegar noticias en producción.
3. **Dashboards**:
   - `/panel` muestra métricas clave (vistas del mes, pendientes, etc.) y advierte si los datos son estimados.
   - `/panel/analytics` incluye gráficas de tendencias, vistas por sección y listado de top artículos.
4. **Alertas recomendadas**:
   - Configurar en Convex Logs filtros por `analytics.recordArticleView` para detectar errores.
   - Revisar periódicamente la métrica `viewsAreEstimated` en el panel: si se mantiene en `true`, significa que aún no hay eventos reales.

---

## Checklist de Go-Live & Seguimiento

### Antes del despliegue
- [ ] Confirmar credenciales de Convex (deploy key) vigentes.
- [ ] Revisar `.env.production` con `VITE_CONVEX_URL` correcto.
- [ ] Ejecutar `npm run build` localmente y validar que `/panel/analytics` carga sin errores.
- [ ] Hacer smoke test local: abrir una noticia y verificar en consola que no hay errores al llamar `recordArticleView`.

### Despliegue
1. **Backend**: `npx convex deploy` (esperar confirmación de éxito).
2. **Frontend**:
   - Construir: `npm run build`.
   - Subir contenido de `dist/` a `public_html` en Hostinger.
   - Confirmar que `.htaccess` existe con las reglas de rutas SPA.

### Verificación inmediata post-release
- [ ] Navegar a `/panel` y `/panel/analytics` en producción (con usuario admin) y confirmar que las tarjetas cargan.
- [ ] Abrir una noticia publicada y luego verificar en Convex `article_views` que existe un registro reciente.
- [ ] Revisar la consola de Hostinger (o logs del navegador) para asegurarse de que no hay errores 4xx/5xx al llamar la API de Convex.

### Monitoreo continuo (primeras 48h)
- [ ] Revisar `analytics.getDashboardStats` desde el panel: confirmar que `viewsToday` y `viewsThisWeek` aumentan conforme llegan visitas.
- [ ] Validar que `monthlyViewGrowth` no sea `null` después de tener datos de dos meses consecutivos; si se mantiene `null`, investigar si los eventos se están registrando.
- [ ] Supervisar logs de Convex para detectar errores repetidos del mutation `analytics.recordArticleView`.
- [ ] Coordinar con el equipo editorial: solicitar confirmación de que las vistas reportadas coinciden con expectativas y que los placeholders no aparecen de forma errónea.

Con esta secuencia el despliegue se mantiene controlado, las nuevas métricas quedan disponibles y todo el equipo entiende cómo usarlas y monitorearlas en producción. 