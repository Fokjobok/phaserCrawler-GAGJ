export const mainQuestChain = {
    id: "main_chain_001",
    type: "main",
    title: "La Llamada del Destino",
    // La secuencia define el orden de los NPC en la misión
    npcSequence: [
        {
            npcId: "innkeeper_001",
            // Se puede incluir una breve sugerencia o descripción si se desea
            shortPrompt: "Hesper te recibe con una mirada enigmática",
            nextNpcId: "librarian_001"
        },
        {
            npcId: "librarian_001",
            shortPrompt: "Szejsa te entrega un pergamino antiguo",
            nextNpcId: "tailor_001"
        },
        {
            npcId: "tailor_001",
            shortPrompt: "Thimble te sugiere buscar respuestas en la forja",
            nextNpcId: "blacksmith_001"
        },
        {
            npcId: "blacksmith_001",
            shortPrompt: "Baldric te indica que regreses al mesón",
            nextNpcId: "innkeeper_001"
        }
    ],
    currentStep: 0,
    completed: false
}