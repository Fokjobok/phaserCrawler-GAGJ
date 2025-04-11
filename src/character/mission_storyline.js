

export function assignMainMission(npc) {
    // Asigna una misión principal fija al NPC (ideal para personajes clave o permanentes)
    npc.mission = {
        type: 'main',
        title: "La Llamada del Destino",
        steps: [
            "Habla con el anciano en el pueblo",
            "Recoge el amuleto sagrado en las ruinas",
            "Derrota al guardián del templo",
            "Regresa con el amuleto para completar la misión"
        ],
        currentStep: 0,
        completed: false
    }
    return npc
}

export function assignSecondaryMission(npc, secondaryMissionsDoc) {
    // Asigna una misión secundaria aleatoria al NPC
    // secondaryMissionsDoc debe tener la estructura:
    // { missions: [ { id, type, title, description, reward }, ... ] }
    if (!secondaryMissionsDoc || !secondaryMissionsDoc.missions || secondaryMissionsDoc.missions.length === 0) {
        console.warn("Documento de misiones secundarias no proporcionado o vacío")
        return npc
    }
    const missions = secondaryMissionsDoc.missions
    const randomIndex = Math.floor(Math.random() * missions.length)
    const selectedMission = missions[randomIndex]
    npc.mission = {
        type: 'secondary',
        id: selectedMission.id,
        missionType: selectedMission.type,
        title: selectedMission.title,
        description: selectedMission.description,
        reward: selectedMission.reward,
        completed: false
    }
    return npc
}

/**
    Función para actualizar el progreso de la misión principal.
    Esta función debe ser llamada cuando se detecte un evento relevante (por ejemplo, interacción o acción cumplida)
    que pueda corresponder a la resolución del paso actual.
    
    Ejemplo de uso:
        Si el NPC tiene asignada la misión principal, al completar la acción del paso actual se llama:
            updateMissionProgress(npc, true)
    
    La función verifica la condición y actualiza el paso actual.
*/
export function updateMissionProgress(npc, conditionMet) {
    if (npc.mission && npc.mission.type === 'main' && !npc.mission.completed) {
        // Aquí se puede agregar una verificación más específica de la condición del paso
        if (conditionMet === true) {
            npc.mission.currentStep++
            if (npc.mission.currentStep >= npc.mission.steps.length) {
                npc.mission.completed = true
                console.log("Misión principal completada:", npc.mission.title)
            } else {
                console.log("Avance de misión:", npc.mission.steps[npc.mission.currentStep])
            }
        }
    }
    return npc
}