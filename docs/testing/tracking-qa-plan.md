# Fase 5 · QA de tracking

## Resumen

- **Objetivo**: verificar los nuevos flujos de lectura y share en escenarios con lectores invitados y autenticados.
- **Ambiente sugerido**: staging con datos productivos anonimizados o sandbox local con `npm run dev` y `npx convex dev`.
- **Prerequisitos**:
  - Variables `VITE_CONVEX_URL` y credenciales admin configuradas.
  - Seed con al menos una nota publicada (`convex/seed.ts` o dashboard).
  - Navegador desktop y móvil (puede usarse modo responsive) para cubrir variantes de UI.
  - Tooling recomendado: DevTools Network, Convex Dashboard > Data Explorer.

## Checklist de pruebas manuales

| ID | Escenario | Pasos | Esperado | Resultado |
| --- | --- | --- | --- | --- |
| M1 | Vista nota como invitado | 1. Abrir home.<br>2. Entrar a la primera nota pública.<br>3. Observar red en pestaña Network. | Llamada `analytics.recordArticleView` con `readerType=guest`.<br>Fila en `article_views` y `article_events` (`article_view`).<br>Counter `articles.views` se incrementa. | Pendiente |
| M2 | Sesión de lectura invitado | 1. En la misma nota, generar scroll hasta 75%.<br>2. Esperar 5 s.<br>3. Cerrar la pestaña. | Mutación `tracking.recordReadingProgress` (si implementada frontend) o heartbeats en `article_events`.<br>Registro en `reading_sessions` con `progressPercent >= 75`.<br>`lastEventAt` actualizado. | Pendiente |
| M3 | Completar lectura invitado | 1. Reabrir la nota con un nuevo `sessionToken` (clean localStorage `pdp_article_views`).<br>2. Llegar al final y permanecer 3 s.<br>3. Trigger de `tracking.completeReadingSession` (si aplica). | Evento `reading_session_completed` con `progressPercent=100`. `completedAt` seteado en sesión. | Pendiente |
| M4 | Share inline invitado | 1. En la misma nota, click en botón _Compartir en Facebook_.<br>2. Aceptar popup. | Evento `share` en `article_events`.<br>Fila en `share_events` con `channel=facebook` y `context=inline`. | Pendiente |
| M5 | Share botón flotante | 1. Scroll > 200px para mostrar botón flotante.<br>2. Abrir menú y copiar link.<br>3. Ver notificación de confirmación. | Registro en `share_events` con `channel=copy_link`, `context=floating`.<br>Clipboard contiene URL. | Pendiente |
| M6 | Vista nota como usuario logueado | 1. Autenticarse en `/panel/login`.<br>2. Abrir nota en nueva pestaña con sesión activa.<br>3. Revisar eventos guardados. | Eventos con `readerType=registered` y `userId` del admin.<br>Sesión reutilizada en sucesivas vistas dentro de 30 min. | Pendiente |
| M7 | Share desde lector logueado | 1. Con sesión activa, compartir vía Twitter.<br>2. Confirmar popup. | `share_events` y `article_events` con `readerType=registered` y `userId` presente.<br>Sin duplicar `reading_sessions`. | Pendiente |
| M8 | Métricas tablero | 1. Ingresar a `/panel/analytics`.<br>2. Refrescar pestaña tras completar pruebas M1-M7.<br>3. Ver cards y gráficos. | Indicadores `viewsToday` y `topArticles` reflejan los nuevos eventos.<br>Sin regresiones en totales históricos. | Pendiente |

> _Notas_: actualizar la columna **Resultado** con `PASS` / `FAIL` / `Bloqueado` y observaciones (timestamp, id de artículo, user). Adjuntar capturas o extractos de registros si hay incidencias.

## Checklist rápido (móvil)

- [ ] Scroll en iOS/Android muestra botón flotante y permite share.
- [ ] Copiar link desde menú flotante funciona en navegadores móviles (Safari, Chrome).
- [ ] Modal de Instagram Stories se visualiza sin solaparse con teclado virtual.
- [ ] Eventos en Convex mantienen `deviceType` dispersado (`mobile` vs `desktop`).

## Evidencia sugerida

- Export de `reading_sessions` filtrado por `sessionToken` usado durante la prueba.
- Screenshots de `article_events` y `share_events` para cada canal.
- Historial de red (HAR) con mutaciones `analytics.recordArticleView` y `tracking.recordShareEvent`.
- Captura del dashboard con métricas actualizadas post prueba.

## Observaciones y seguimiento

Registrar hallazgos en el tablero de incidencias con la siguiente metadata mínima:

- Artículo y `sessionToken` afectados.
- Estado de autenticación (guest / registered + userId).
- Canal de share y superficie (`inline`, `floating`, etc.).
- Timestamp UTC del evento observado.

> Una vez completado el ciclo, actualizar esta página con los resultados y enlazar a logs o issues abiertos.


