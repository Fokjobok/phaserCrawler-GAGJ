# Phaser Crawler — Hilo argumental y Capítulo 1

## Visión general

- Mundo: Northaven, ciudad fronteriza rodeada por bosques antiguos y ruinas prohibidas (Kael’Tharok). La diosa Rhai simboliza equilibrio y tiempo; su culto y mitos impregnan la región.
- Tono: fantasía oscura contenida, intriga urbana y misterio arqueológico.
- Fase activa: novela visual (VnScene). El avance se realiza conversando con NPCs persistentes, viajando entre localizaciones y aceptando misiones.
- Hilo conductor: el rumor de un tesoro asociado a Rhai en las ruinas de Kael’Tharok se entrelaza con un incidente político: las princesas del reino han sido envenenadas.

## Personajes persistentes (núcleo)

- Hesper (posadero, `innkeeper_001`): cordial, práctico, centro de rumores locales.
- Andreau (posadera, `innkeeper_002`): cocina y provisiones; tono firme pero amable.
- Baldric (herrero, `blacksmith_001`): directo, respetado; conecta con misiones principales.
- Szejsa (escribana, `librarian_001`): erudita, guardiana de textos; puente hacia el trasfondo de Rhai y las ruinas.
- Thimble (tejedor, `tailor_001`): artesano ingenioso; ligado a mejoras y algún favor menor.
- Guardias de la puerta (`guard_001`, `guard_002`): control de accesos; “gating” hacia zonas nobles/castillo.
- Caminante/Wanderer (`wanderman_001`): sembrador de rumores sobre Kael’Tharok.
- Bandido del callejón (`bandit_001`): amenaza urbana; anzuelo para misiones secundarias.

## Localizaciones disponibles

- La plaza principal: corazón social, distribuidor a Mercado, Posada, Biblioteca, Herrería y Puerta principal.
- El mercado: comerciantes, provisiones y rumores.
- La posada: centro de descanso y noticias (Hesper/Andreau).
- La herrería: mejoras de equipo y contacto con Baldric.
- La biblioteca: saberes y pistas antiguas (Szejsa).
- La puerta principal: control militar; acceso restringido hacia el castillo.
- El callejón oscuro: peligro urbano; evento de bandidos.

## Hilo argumental propuesto (estructura por actos)

- Acto I — Sombras en Northaven
  - Llegada a la muralla por el bosque. La ciudad está inquieta: corren rumores de que las princesas han sido envenenadas en el castillo.
  - Gating inicial en la Puerta principal: los guardias restringen el paso hacia el distrito noble.
  - En la Posada, Hesper orienta al protagonista; Baldric menciona la pista formal: “Habla con la Hermana Clarisa en la Catedral” (contenido a desbloquear) y cambia el estado de misión “Princesas Envenenadas”.
  - La Biblioteca ofrece trasfondo sobre Rhai, Northaven y menciones veladas de Kael’Tharok.

- Acto II — Ecos de Kael’Tharok
  - Siguiendo a Szejsa, se identifican mapas y claves de entrada a las ruinas. Se introducen los riesgos: trampas, guardianes y acertijos.
  - Tensiones con facciones locales (eruditos de Aeralis, mercenarios Fera Grosella) por el control de la información.

- Acto III — El precio del equilibrio
  - Conexión entre el envenenamiento y un artefacto de Rhai que altera flujos de tiempo/venenos.
  - Decisión moral: custodiar, destruir o usar el artefacto.
  - Desenlace condicionado por afinidades y progreso de misiones.

Notas de coherencia con datos actuales:
- La misión “Princesas Envenenadas” existe en `quest_definitions.json` y es disparada por Baldric en `npc_quests.json`.
- La Catedral y el Castillo funcionan como zonas “gated” desde la Puerta principal (guardias + autorización).
- El prólogo del juego ya presenta Northaven, Rhai y Kael’Tharok; aquí se integran como metatrama.

---

# Capítulo 1 — Al filo de la muralla

Formato: narración en tercera persona (Narrador) + diálogos del protagonista y NPCs. Los acompañantes del grupo están presentes pero no hablan.

Escena 1 — Bosque al atardecer (fondo: `forest`)

- Narrador: El sol se rendía tras los árboles de Northaven cuando el grupo emergió del sendero. El aire olía a resina y tierra húmeda, y, más allá, la piedra de una muralla recortaba el horizonte como un filo gris. Rumores habían traído al protagonista hasta aquí: las ruinas de Kael’Tharok, la diosa Rhai, y un susurro nuevo, inquietante: princesas envenenadas.
- Protagonista: “No hemos llegado para morir de sed ni de dudas. Sigamos. Northaven está a un paso.”

Escena 2 — Puerta principal (fondo: `main_door`)

- Narrador: La puerta se alzaba imponente. Dos guardias, con tabardos impecables, observaban a los recién llegados con la mezcla habitual de cansancio y prudencia.
- Guardia: “Alto. Northaven recibe a los viajeros, pero el distrito noble está cerrado. Órdenes por… circunstancias extraordinarias.”
- Protagonista: “Busco posada y un herrero. También noticias. Pago por ambas.”
- Guardia: “La plaza principal te guiará a todo eso. Mantén la espada envainada y los oídos abiertos. Las noticias vuelan… y algunas pican.”
- Narrador: La hoja de la puerta se abrió lo justo. El bullicio de la ciudad se filtró en ráfagas: voces, ruedas de carretas, y el perfume del mercado.

Escena 3 — La plaza principal (fondo: `plaza`)

- Narrador: La plaza vivía un crepúsculo animado. Fuentes, flores y piedra vieja. Vendedores plegaban toldos mientras otros encendían linternas que dibujaban halos en el polvo.
- Caminante (Wanderman): “Dicen que en Kael’Tharok el tiempo no anda derecho. Dicen que lo guarda la mano de una diosa.”
- Protagonista: “¿Y quién dice que el tiempo camine derecho fuera de las ruinas? Gracias por el aviso.”
- Narrador: El caminante sonrió, sin mostrar todos los dientes, y se perdió entre la gente. Al fondo, el letrero de una posada se mecía con el viento.

Escena 4 — La posada (fondo: `inn`)

- Narrador: El olor a pan y aguamiel dio la bienvenida. El fuego crepitaba en la chimenea. Tras la barra, un hombre corpulento levantó la vista.
- Hesper: “¡Bienvenido, viajero! Soy Hesper. Si buscas cama, comida o una jarra que quite el polvo del camino, has llegado al sitio.”
- Protagonista: “Una jarra, un plato caliente… y noticias frescas. He oído que las princesas…”
- Hesper: “Shh. Los rumores pesan más que el plomo esta semana. Se dice eso, sí. Si necesitas algo más… el herrero Baldric escucha y habla cuando debe. La forja nunca duerme.”
- Protagonista: “Entonces, beberé rápido.”
- Narrador: El metal de la jarra enfrió la garganta y templó la paciencia. El grupo ocupó una mesa junto a la pared. Ninguno habló; no hacía falta. Afuera, el turno de noche se apropiaba de la ciudad.

Escena 5 — La herrería (fondo: `blacksmith`)

- Narrador: El martillo marcaba el pulso del barrio. Chispas como luciérnagas anaranjadas saltaban del yunque. Baldric, brazos de roble, levantó la vista con la naturalidad del que mide a la gente en medio segundo.
- Baldric: “Si buscas filo, lo tengo. Si buscas verdad, pesa más y cuesta más.”
- Protagonista: “Busco ambas. Dicen que el castillo sangra en silencio.”
- Baldric: “Se rumorea. No soy amigo de reyes, pero no deseo mal a nadie. Si te interesa dejar de mascar rumores, ve a la Catedral y pregunta por la Hermana Clarisa. Yo no puedo abrirte la puerta del castillo… todavía.”
- Protagonista: “Acepto el encargo. ¿Algo más?”
- Baldric: “Sí. La ciudad cambiará contigo o contra ti. Y una cosa más: no mires las ruinas como un atajo. A veces, te devuelven diferente.”
- Narrador: El calor del horno secó el sudor y las dudas. Afuera, la noche ya era dueña de los tejados.

Escena 6 — Regreso a la plaza (fondo: `plaza`)

- Narrador: Las linternas dibujaban círculos de luz sobre la piedra. El murmullo de la ciudad se había vuelto más hondo, más secreto.
- Protagonista: “Catedral primero. Luego veremos si el castillo cierra la mano o la abre.”
- Narrador: El grupo asintió sin palabras. Por encima de las torres, una nube ocultó la luna. Por un instante, pareció que la ciudad contuviera la respiración.

Cierre del capítulo

- Narrador: La noche guardó silencio para los que escuchan, y la ciudad, como un animal viejo, decidió tolerar a los recién llegados una jornada más. La historia ya había empezado antes de que pisaran Northaven; ahora, sencillamente, los había alcanzado.

---

## Integración con el juego (sugerencias prácticas)

- Gating: mantener “la puerta hacia el castillo” cerrada hasta al menos el paso 2 de “Princesas Envenenadas”.
- Disparadores:
  - Primer visita a Posada → diálogo forzado de Hesper de bienvenida.
  - Visita a Herrería con opción “Preguntar por las princesas envenenadas” → aplica `questChanges` (paso 1-2) según `npc_quests.json`.
- Biblioteca: añadir líneas de Szejsa que referencien Rhai y Kael’Tharok para acto II.
- Callejón oscuro: semilla de misión secundaria (bandidos) si el jugador deambula de noche.

---

## Próximo capítulo (avance)

- Visita a la Catedral: presentación de Hermana Clarisa, obtención de permiso temporal de investigación.
- Recolección de hierbas para análisis de toxinas (bosque cercano) y primer roce con facción rival.
- Nueva restricción en Puerta principal: un guardia solicita documento sellado; apertura condicionada a progreso.

