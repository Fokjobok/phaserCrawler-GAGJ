# Visión General del Proyecto

Este repositorio contiene un juego desarrollado con Phaser 3 dividido en dos fases:

- Fase 1: Novela Visual (VnScene). Enfocada en narrativa, diálogos, NPCs, misiones y exploración por escenarios.
- Fase 2: Dungeon Crawler (DcScene). En desarrollo; actualmente aparcada.

Objetivo actual: terminar VnScene añadiendo contenido real (diálogos, historia, progresión), misiones completas y persistencia básica, además de corregir bugs conocidos (por ejemplo, la misión de “princesas envenenadas” al rechazar/aceptar).


## Cómo Ejecutar

- Servir `index.html` con un servidor estático (p. ej., VS Code Live Server). Phaser se carga desde CDN.
- Punto de entrada: `main.js`.


## Arquitectura de Carpetas

- `index.html`: HTML principal. Carga `phaser` por CDN y `main.js` como módulo.
- `main.js`: Configura Phaser, tamaños y lista de escenas: `MainMenuScene`, `CharacterDataScene`, `IntroScene`, `DcScene`, `VnScene`.
- `scenes/`: escenas del juego.
  - `VnScene.js`: fase VN; diálogo, menús, NPCs y misiones.
  - `IntroScene.js`: introducción y transición a `VnScene`.
  - `MainMenuScene.js`: menú principal.
  - `CharacterDataScene.js`: selección/estado de personaje.
  - `DcScene.js`: prototipo de fase 2 (aparcar por ahora).
- `config/`: módulos de configuración y UI (DOM overlay) reutilizables entre escenas.
  - `config.js`: constantes (pantalla, velocidad de texto, colores, posiciones de combate).
  - `preload.js`: precarga (fondos, enemigos, y estilos CSS para textbox/menús).
  - `create.js`: utilidades de creación de UI (textbox, nombre del interlocutor, imagen NPC, carga de escenarios).
  - `dialogs.js`: sistema de diálogos (efecto letra a letra, paginación, color de palabras clave, transición de fondos, finalización).
  - `hud.js`: HUD básico para stats/vida.
  - `menus.js`: menús in‑game (escenario, NPCs, conversación, tienda, inventario, estado, misiones). Integra con `questManager`.
- `src/`: lógica de dominio.
  - `questManager.js`: asignación/avance de misiones a partir de definiciones unificadas.
  - `character/`: jugador y NPCs.
    - `player.js`, `player_db.js`: datos y helpers de jugador.
    - `npc.js`: generación de NPCs (aleatorios/predefinidos) e inicialización.
  - `database/`: datos JSON para enemigos, ítems, NPCs, escenarios, etc.
    - `npc/`:
      - `quest_definitions.json`: definiciones canónicas de misiones (id, tipo, título, descripción, steps, recompensas).
      - `npc_quests.json`: guiones conversacionales por NPC (rutas con etiquetas, líneas, subopciones, y questChanges por opción).
      - `npc_predefined.json`: NPCs permanentes (nombre, diálogos, tienda, imagen, etc.).
      - Otros: roles, nombres, apariencias, diálogos genéricos.
    - `scenarios/`: `scenario_db.json` describe escenarios (fondo, número de NPCs, NPCs permanentes, viajes, etc.).
    - `items/`, `enemy/`, `exploration/`: bases de datos auxiliares.


## Flujo de VnScene (Fase 1)

- Carga de datos en `VnScene.preload`: escenarios, NPCs, tiendas, quests, ítems.
- `create`: construye UI de diálogo (DOM), nombre e imagen del interlocutor y carga `scenario_db`. Establece `scene.npcs` con:
  - NPCs permanentes vía `permanent_npc_ids` (de `npc_predefined.json`).
  - NPCs efímeros hasta completar `npc_count` según `role_category` y `npc_type`.
- `visitScenario(scene, key)`: pinta el fondo, gestiona la “intro” del escenario/NPC si `force_dialogue` y luego muestra `showScenarioMenu`.
- Menú de escenario (`showScenarioMenu`): Hablar, Viajar, Inventario, Estado, Misiones.
- Menú de NPCs (`showNPCSubMenu`): lista NPCs con afinidad y acciones (hablar, tienda si procede). Integra con sistema de misiones:
  - Si el NPC tiene misión y el jugador no la tiene: muestra introducción y después el menú de elección de misión.
  - Si en progreso: recordatorio del paso actual.
  - Si completada: opciones post‑misión.
  - Si sin misión: diálogo/rutas genéricas.


## Sistema de Misiones

- Fuente de verdad: `scene.questDefs` = mezcla de `src/database/npc/npc_quest_db.js` y `quest_definitions.json` (prioridad JSON con steps).
- Representación de misión en `player.quests`:
  - `{ id, type, title, description, steps[], currentStep (0‑based), completed, rewards }`
- API (`src/questManager.js`):
  - `assignQuest(scene, player, questId)`: añade entrada normalizada si no existe.
  - `advanceQuest(scene, player, questId, newStep)`: avanza a step 1‑based; asigna si no existe; marca `completed` si corresponde.
  - `applyQuestChanges(scene, player, questChanges)`: helper para aplicar un lote.
- Guiones de NPC (`npc_quests.json`):
  - Cada ruta tiene `label`, `lines`, opcional `questChanges` y `subOptions` (p. ej., Aceptar/Rechazar) que pueden tener su propio `questChanges`.
- Elección de misión (`showQuestDialogue` + `showMissionChoiceMenu`):
  - Muestra `introLines` de la misión y luego opciones iniciales definidas en `conversationRoutes`.
  - Regla clave: si una opción tiene `subOptions`, no se aplican sus `questChanges` hasta elegir la sub‑opción. Evita aceptar misiones al “preguntar”.


## Estado Actual y Pendientes (VnScene)

- Contenido narrativo: base funcional lista; faltan diálogos, historia y rutas significativas.
- Misiones reales: existen definiciones en `quest_definitions.json` y un ejemplo conectado (`poisoned_princesses` con Baldric). Faltan más NPCs conectados a pasos 2..N, condiciones y consecuencias.
- Progresión: hoy es lineal por pasos; añadir gating por escenario/NPC y requisitos (ítems, afinidad, oro, etc.).
- Persistencia: no hay guardado. Pendiente:
  - Guardar/cargar `player` y `player.quests` (LocalStorage/IndexedDB) y última escena/escenario.
- Afinidad: existe campo `npc.affinity`; definir cómo sube/baja y qué desbloquea.
- Inventario/Tienda: UI presente; faltan interacciones/rangos/precios dinámicos y efectos al usar ítems.
- Accesibilidad/UX: teclas, indicadores visuales, cierre consistente de menús.
- Encoding: se observan mojibake en acentos/ñ en consola. Revisar fuentes/encoding si afecta a UI final y normalizar iconografía de botones (actualmente hay glifos corruptos).


## Recomendaciones para Añadir Misiones

1) Definir misión en `src/database/npc/quest_definitions.json` con `id`, `type` (main/secondary/side), `title`, `description`, `steps[]`, `rewards`.
2) Conectar a un NPC en `src/database/npc/npc_quests.json`:
   - Añadir ruta con `label`, `lines` y, si procede, `subOptions` con `questChanges` en la opción “Aceptar”. Evitar `questChanges` en la ruta si va a tener subopciones.
3) Asegurar que el NPC aparece en `npc_predefined.json` y que el escenario correspondiente lo incluye en `permanent_npc_ids`.
4) Verificar el flujo en VnScene: estado `offerable` → diálogo de intro → menú de elección → aceptar/rechazar.


## Referencias de Código Clave

- `scenes/VnScene.js:1`: orquesta VN, carga DBs, inicia UI y visita escenarios.
- `config/menus.js:267`: `showConversationMenu` (aplica `questChanges` solo sin `subOptions`).
- `config/menus.js:306`: `showMissionChoiceMenu` (mismo criterio para opciones con `subOptions`).
- `config/dialogs.js:1`: efecto “letra a letra”, paginado, finalización de diálogo y transición de menús.
- `src/questManager.js:1`: normalización, asignación y avance de misiones con `questDefs`.
- `src/database/npc/quest_definitions.json:1`: definición de misiones y pasos.
- `src/database/npc/npc_quests.json:1`: guiones por NPC, ej. `blacksmith_001` con “Princesas envenenadas”.
- `src/database/scenarios/scenario_db.json:1`: escenarios, fondos, NPCs permanentes y viajes.


## Próximos Pasos Sugeridos

- Añadir contenido real a `introLines` y `conversationRoutes` para las misiones principales.
- Conectar pasos de `poisoned_princesses` con NPCs/escenarios: Hermana Clarisa (paso 1), recolección de hierbas (paso 2), mazmorra (paso 3), audiencia (paso 4).
- Implementar persistencia (guardar/cargar): jugador, inventario, afinidad y misiones.
- Refinar inventario/tiendas (precios, cantidades, afinidad/bonos, uso de ítems).
- Revisar y limpiar textos con caracteres especiales (UTF‑8) para evitar mojibake en consola y unificar iconos de botones (usar texto o emojis estándar).


## Notas Varias

- El pipeline de texto en `dialogs.js` aplica color a palabras clave definidas en `CONFIG.KEYWORDS`.
- `visitScenario` inyecta NPCs permanentes y genera efímeros hasta `npc_count`.
- `getQuestIcon` muestra iconos diferentes según estado (ofrecible, en progreso, completada) para mejorar la UX.

## Glosario

- Gating: establecimiento de requisitos o condiciones que bloquean o desbloquean contenido (misiones, zonas, diálogos) hasta cumplirlos.
- Mojibake: texto con caracteres corruptos por problemas de codificación (p. ej., acentos/ñ mal renderizados).
- HUD: capa de interfaz con información del jugador (vida, maná, nivel, etc.).
- VN (Visual Novel): género centrado en narrativa y elecciones, presentado en forma de diálogos y escenas estáticas.
- NPC: personaje no jugable (controlado por el juego).
- Quest/Quest log: misión y su registro de progreso visible para el jugador.
- Generación procedural: creación de contenido mediante algoritmos aleatorios controlados (escenarios, mazmorras, eventos).
- Seed (semilla): valor inicial para hacer reproducible la aleatoriedad (no implementado aún en el generador).
- Afinidad: métrica de relación con NPCs que puede desbloquear opciones o modificar precios y recompensas.
- DOM overlay: técnica de construir UI con elementos HTML superpuestos al canvas de Phaser.
- CDN: red de distribución de contenidos; aquí se usa para cargar Phaser.
- LocalStorage: almacenamiento clave‑valor del navegador para persistencia básica.
- Fog of war (niebla de guerra): ocultar partes del mapa hasta ser exploradas (DcScene marca visitados/resueltos).
- Tween: interpolación de propiedades en el tiempo; se usa para transiciones de fondo.
- Sprite: imagen 2D representando personajes/objetos en pantalla.
- Hitbox: área de colisión de un objeto; relevante para juegos de acción (no usado en VN actual).
- Cooldown: tiempo de reutilización de habilidades/acciones (previsto para combate en fase 2).
- Event loop: ciclo de procesamiento de eventos del juego/DOM.
- Asset: recurso gráfico/sonoro (imágenes, fuentes, CSS, JSON de datos, etc.).