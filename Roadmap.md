A continuación se presenta una propuesta de hoja de ruta orientada al estilo de una empresa de desarrollo de videojuegos, estructurada en etapas típicas de producción. Cada sección incluye los objetivos principales y las tareas específicas.

---

## 1. Preproducción

### 1.1 Definición de la Visión y Alcance

- **Objetivo:** Determinar la ambientación, el estilo de arte, las mecánicas generales (fase 1 de ciudad y fase 2 de mazmorra), y definir los pilares del juego (historia, rejugabilidad y progresión).
- **Entregables Clave:**
    - **Prototipo de Juego:** Visión general, mecánicas esenciales, estilo narrativo, clases de personaje, tipo de mazmorra procedural.
    - **Hoja de ruta Inicial**: Versión preliminar de la planificación general.

### 1.2 Prototipado Inicial

- **Objetivo:** Probar las mecánicas centrales (movimiento, diálogos, comercio básico, generación de mazmorra).
- **Entregable Clave:** Prototipo jugable de la ciudad (fase 1) y la exploración de mazmorras (fase 2): 
    - Fase 1:
	    - Navegación por la ciudad, interacción básica con NPCs (charla, comercio, misión, etc.).
    - Fase 2:
	    - Generación procedural simple de escenario, desplazamiento, eventos básicos, sistema de batalla, mapa dinámico de la mazmorra.
	- Fluidez entre fases: Navegación entre la fase 1 de preparación y la fase 2 de exploración.

---

## 2. Producción

### 2.1 Desarrollo de la Fase de Ciudad

1. **Narrativa y misiones**
	- Redactar la línea argumental principal y misiones secundarias simples (asesinato, recolección, entrega).
	- Definir un árbol de progresión oculto y requisitos visibles de afinidad para el acceso a misiones y objetos.
	- Crear diálogos detallados y escenarios narrativos en la ciudad con la interacción de más de un NPC.

2. **NPCs permanentes y efímeros**
	- Añadir reclutamiento de NPCs efímeros específicos.
	- Implementar funcionalidad de aparición y desaparición de efímeros según el contador de días restantes.
	- Completar y profundizar en el sistema de comercio (compra/venta, inventario) y dinamizar tiendas efímeras.

3. **Gestión de fatiga y menú de 'Estado'**
	- Implementar pérdida de fatiga al moverse a través de la ciudad limitando la gestión.
	- Desarrollar el menú de 'Estado' detallando atributos, equipamiento y sus respectivos cálculos.
    
4. **Sistema de 'Equipamiento y Refinamiento'**
	- Crear la lógica de equipar, desequipar y consumir objetos.
	- Añadir el sistema de forja elemental, refinamiento y mejora de equipamiento a través de NPCs persistentes en la fase 1.
	- Introducir ranuras para cartas y piedras elementales.


### 2.2 Desarrollo de la 'Fase de Mazmorra'

5. **Sistema de batalla (3 vs 3) y HUD de combate**
	- Implementar combates por turnos con hasta 3 personajes y 3 enemigos.
	- Adaptar el HUD existente a la modalidad de combate.
	- Incorporar habilidades comunes y únicas con costes de maná.
	
6. **Cálculos de daño e IA de enemigos**
	- Definir fórmulas de ataques, defensas, críticos, resistencias, velocidad y esquiva.
	- Programar la IA de enemigos para seleccionar acciones en función de la situación.
	- **Sistema de elementos, resistencias y debilidades**: 
		- Desarrollar elementos ofensivos y defensivos para armas, armaduras y enemigos que impacten en el cálculo de daño final.

7. **Gestión de fatiga en mazmorra**
	- Añadir consumo de fatiga al investigar y recuperación parcial al descansar.
	- Limitar hogueras por partida para recuperar fatiga y vida/mana.

8. **Objetos, Recompensas y nuevos Biomas**
	- Integrar recompensas por derrotar enemigos (materiales, consumibles, cartas, piedras, equipamiento y misceláneo).

	- Expansión de la generación procedural a distintos biomas como bosque y cueva.


---

## 3. Control de Calidad (QA) y Optimización

### 3.1 Testing Interno

- **Objetivo:** Asegurar la estabilidad y jugabilidad de las fases principales (ciudad y mazmorra).
- **Actividades Clave:**
    - Pruebas unitarias de las mecánicas principales (combate, comercio, diálogos).
    - Pruebas de regresión tras cada integración de características.
	- Balancear la aleatoriedad de cada característica, como la obtención de los recursos con la línea de progresión principal y la economía general.

### 3.2 Ajustes y Pulido

- **Objetivo:** Corregir bugs, optimizar rendimiento y mejorar la experiencia de usuario.
- **Actividades Clave:**
    - **Optimización de Código:** Mejorar el uso de memoria, eliminar código redundante.
    - **Feedback visual y sonoro:** Pulir ilustraciones, efectos, y añadir sonidos de combate y entorno.
