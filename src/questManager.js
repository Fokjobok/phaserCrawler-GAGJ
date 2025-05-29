export function assignQuest(scene, player, questId) {
    // obtiene directamente la definición
    const def = scene.questDefs[questId]
    if (!def) {
        console.error(`❌ Quest '${questId}' no encontrada en questDefs`)
        return
    }

    player.quests.push({
        id: def.id,
        type: def.type,
        title: def.title,
        description: def.description,
        steps: def.steps,
        currentStep: 0,
        completed: false,
        rewards: def.rewards,
        def: def
    })
}

export function startQuest(scene, player, questId, step = 0) {
    const def = scene.questDB[questId]

    if (!def) throw new Error(`Quest ${questId} no existe`)

    player.quests.push({
        id:        def.id,
        step,
        completed: false,
        def        // referencia directa a la definición
    })
}

export function advanceQuest(scene, player, questId, newStep) {
    const q = player.quests.find(q => q.id === questId)
    if (!q) return console.warn(`No tienes la misión ${questId}`)

    q.step = newStep

    if (q.def.next === null || newStep >= (q.def.nextStep || Infinity)) {
        q.completed = true
    }
}

export function applyQuestChanges(scene, player, questChanges = []) {
  questChanges.forEach(({ questId, nextStep }) => {
    let q = player.quests.find(x => x.id === questId)

    if (!q) {
      // Si no existe, la asignamos
      assignQuest(scene, player, questId)
      q = player.quests[player.quests.length - 1]
    }
    if (typeof nextStep === "number") {
      q.currentStep = nextStep
      if (q.currentStep >= q.steps.length) {
        q.completed = true
        console.log(`Misión finalizada: ${q.title}`)
      }
    }
  })
}