// Quest Manager unificado
// - Usa scene.questDefs como fuente de verdad
// - Modelo de quest en player.quests:
//   { id, type, title, description, steps[], currentStep(0-based), completed, rewards }

function normalizeType(type) {
  if (type === 'side') return 'secondary'
  return type || 'secondary'
}

function getQuestDef(scene, questId) {
  const def = scene?.questDefs?.[questId]
  if (!def) {
    console.error(`Quest '${questId}' no encontrada en scene.questDefs`)
    return null
  }
  return def
}

function findPlayerQuest(player, questId) {
  return Array.isArray(player?.quests)
    ? player.quests.find(q => q.id === questId)
    : null
}

export function assignQuest(scene, player, questId) {
  const def = getQuestDef(scene, questId)
  if (!def) return

  // Evitar duplicados
  const existing = findPlayerQuest(player, questId)
  if (existing) {
    // Normaliza por si viniera de un esquema distinto
    existing.type        = normalizeType(existing.type || def.type)
    existing.title       = existing.title ?? def.title
    existing.description = existing.description ?? def.description
    existing.steps       = Array.isArray(existing.steps) ? existing.steps : (def.steps || [])
    existing.rewards     = existing.rewards ?? def.rewards
    existing.currentStep = typeof existing.currentStep === 'number' ? existing.currentStep : 0
    existing.completed   = !!existing.completed
    return existing
  }

  const questEntry = {
    id:           def.id,
    type:         normalizeType(def.type),
    title:        def.title,
    description:  def.description,
    steps:        def.steps || [],
    currentStep:  0,        // índice 0-based
    completed:    false,
    rewards:      def.rewards
  }
  player.quests = Array.isArray(player.quests) ? player.quests : []
  player.quests.push(questEntry)
  return questEntry
}

// newStep es 1-based (de los JSON de rutas). Se convierte a 0-based
export function advanceQuest(scene, player, questId, newStep) {
  const def = getQuestDef(scene, questId)
  if (!def) return

  const q = findPlayerQuest(player, questId) || assignQuest(scene, player, questId)
  if (!q) return

  if (typeof newStep !== 'number' || Number.isNaN(newStep)) {
    console.warn(`advanceQuest: newStep inválido para '${questId}':`, newStep)
    return
  }

  const stepsLen = Array.isArray(def.steps) ? def.steps.length : 0
  const index0   = Math.max(0, newStep - 1)

  q.currentStep = index0
  q.type        = normalizeType(q.type || def.type)
  q.title       = q.title ?? def.title
  q.description = q.description ?? def.description
  q.steps       = Array.isArray(q.steps) ? q.steps : (def.steps || [])
  q.rewards     = q.rewards ?? def.rewards

  if (stepsLen > 0) {
    q.completed = index0 >= (stepsLen - 1)
  } else {
    // Si no hay steps definidos, completar al primer avance
    q.completed = true
  }
}

export function applyQuestChanges(scene, player, questChanges = []) {
  if (!Array.isArray(questChanges)) return

  questChanges.forEach(({ questId, nextStep }) => {
    if (!questId) return
    assignQuest(scene, player, questId)

    if (typeof nextStep === 'number') {
      advanceQuest(scene, player, questId, nextStep)
      const q = findPlayerQuest(player, questId)
      if (q?.completed) {
        console.log(`Misión finalizada: ${q.title}`)
      }
    }
  })
}

