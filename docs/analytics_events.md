# Fase 1 - Arquitectura de datos de eventos

## Alcance cubierto
- Se definieron los eventos clave para medir lectura y acciones sociales en notas.
- Se modelaron en Convex las nuevas entidades `reading_sessions`, `article_events` y `share_events`.
- Se anadieron mutaciones para capturar el ciclo completo de lectura y compartidos sin romper las metricas actuales basadas en `article_views`.

## Modelo de datos en Convex

### `reading_sessions`
- `articleId` (`Id<"articles">`): articulo asociado.
- `sessionToken` (`string`): identificador unico generado en frontend por cada visita.
- `readerType` (`"guest" | "registered"`): tipo de lector segun estado de autenticacion.
- `userId` (`Id<"users">?`): presente unicamente para lectores registrados.
- `visitorKey` (`string?`): identificador estable (por ejemplo, cookie hash) para invitados.
- `startedAt` / `lastEventAt` (`ISO string`): inicio y ultimo evento recibido.
- `completedAt` (`ISO string?`): marcado al finalizar la lectura.
- `durationSeconds` (`number?`): segundos efectivos estimados.
- `progressPercent` (`number?`): mayor porcentaje alcanzado (0-100).
- `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `deviceType` (`string?`): contexto de adquisicion.
- Indices: por `articleId`, `sessionToken`, `userId`, `startedAt` para consultas de analitica y deduplicacion.

### `article_events`
- `articleId`, `sessionId?`, `eventType`, `eventTimestamp`.
- `eventType`: `article_view`, `reading_session_started`, `reading_session_heartbeat`, `reading_session_completed`, `share`, `custom`.
- `readerType`, `userId?`, `visitorKey?`: metadata de identidad del lector.
- `metadata` (`string?`): JSON serializado con payload especifico de cada evento.
- Indices: `by_article`, `by_session`, `by_type`, `by_timestamp`.

### `share_events`
- `articleId`, `sessionId?`, `eventTimestamp`.
- `channel` (`string`): `whatsapp`, `facebook`, `x`, `instagram`, `linkedin`, `copy_link`, etc. (sin restriccion rigida para permitir nuevos canales).
- `readerType`, `userId?`, `visitorKey?`, `context?` (ubicacion del boton, p. ej. `floating`, `inline`).
- `metadata` (`string?`): JSON con datos adicionales (UTMs de salida, destino, etc.).
- Indices: `by_article`, `by_channel`, `by_timestamp`.

## Lista de eventos y payload

| Evento logico | Trigger | Payload minimo | Negocio | Caducidad recomendada |
| --- | --- | --- | --- | --- |
| `article_view` | carga de la nota (legacy + nuevo tracking) | `{ articleId, sessionToken?, reader, context }` | Incrementa contador historico y genera sesion si es nueva | 12 meses (365 dias) |
| `reading_session_started` | primera confirmacion de lectura activa | `{ articleId, sessionToken, reader, context }` | Se crea fila en `reading_sessions`; se marca solo una vez por `sessionToken` | 12 meses |
| `reading_session_heartbeat` | actualizacion de progreso / permanencia | `{ articleId, sessionToken, progressPercent, elapsedSeconds? }` | Solo aumenta `progressPercent` y `durationSeconds` si el nuevo valor es mayor | 6 meses (resumen se mantiene en sesion) |
| `reading_session_completed` | lector alcanza >=90% o cierra lectura | `{ articleId, sessionToken, progressPercent?, elapsedSeconds?, reason? }` | Marca `completedAt`, actualiza metricas finales; evita sobrescribir con valores menores | 12 meses |
| `share` (en `article_events`) | usuario pulsa compartir | `{ articleId, channel, sessionToken?, reader, context?, metadataJson? }` | Registra accion para embudos internos y alimenta `share_events` | 12 meses |
| Registro dedicado en `share_events` | mismo trigger que `share` | `{ articleId, channel, sessionToken?, reader, context?, metadataJson? }` | Permite consultas rapidas por canal y deduplicacion | 12 meses |

> **Identidad del lector**: `readerType` se obtiene segun autenticacion. Para invitados se recomienda generar `visitorKey` (cookie persistente) para medir recurrencia sin PII.

## Mutaciones incorporadas

| Mutacion | Uso esperado | Notas |
| --- | --- | --- |
| `analytics.recordArticleView` | Mantener compatibilidad con frontend actual; ahora acepta `sessionToken`, `reader` y `context` opcionales. | Inserta en `article_views` y propaga a las nuevas tablas cuando hay `sessionToken`. Devolvera `sessionId` y bandera `sessionCreated`. |
| `tracking.beginReadingSession` | Nuevo punto unico para inicializar sesion y registrar vista. | Ideal para reemplazar al `recordArticleView` en frontend una vez migrado. |
| `tracking.recordReadingProgress` | Se dispara con hitos de scroll/tiempo (p. ej. al 25%, 50%, 75%). | Enriquecer `metadata` con `elapsedSeconds` cuando este disponible. |
| `tracking.completeReadingSession` | Llamado al salir de la nota (visibility change o navegacion). | Acepta un `reason` (`"completed"`, `"bounced"`, `"timeout"`). |
| `tracking.recordShareEvent` | Centraliza cualquier share (floating button, barra social, footer). | Puede recibir `metadataJson` con payload del canal (ej. URL final) que se serializa y guarda. |

### Reglas de negocio clave
- `sessionToken` debe ser unico por lector/articulo y persistir mientras dure la sesion (p. ej. UUID almacenado en memoria + storage).
- El backend valida que `progressPercent` y `durationSeconds` solo crezcan; evita retrocesos si llegan eventos fuera de orden.
- `reading_session_completed` fuerza `progressPercent` a `100` si no se envia valor.
- `share_events` no crean sesiones nuevas: si no se encuentra `sessionToken`, se registran como `guest` utilizando los datos recibidos.
- Se mantiene el contador de vistas en `articles.views` para dashboards existentes; los nuevos eventos aportan granularidad sin interrumpir metricas previas.

## Retencion y caducidad
- `reading_sessions`: purgar registros >12 meses mediante tarea programada (futuro cron) conservando metricas agregadas.
- `article_events`: 12 meses de historial en bruto; los datos agregados pueden exportarse antes del purge.
- `share_events`: misma ventana de 12 meses; permite comparativas YOY.
- Se recomienda crear una rutina mensual que elimine eventos cuyo `eventTimestamp` este fuera de la ventana, priorizando primero `reading_session_heartbeat`.

## Compatibilidad y proximos pasos
- El frontend actual puede seguir usando `recordArticleView` sin cambios; nuevas props son opcionales.
- Para aprovechar las nuevas metricas se planificara la migracion del frontend hacia `tracking.beginReadingSession`, `tracking.recordReadingProgress` y `tracking.completeReadingSession`.
- Las consultas existentes (`analytics.getDashboardStats`) continuaran operativas; una segunda fase incorporara vistas basadas en las nuevas tablas (retencion, profundidad, funnels de share).
- Documentacion tecnica anclada al repositorio para facilitar revision y seguimiento en pull requests posteriores.

