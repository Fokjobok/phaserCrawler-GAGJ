export const questManager = {
    mainQuests: {
        main_quest001: {
            id: 'mainquest001',
            title: '¿Quién me ha robado en el callejón?',
            description: 'Viaja hacia la zona conflictiva, donde la verdad se oculta entre las conversaciones ajenas. Escucha, observa y sigue el rastro del rumor hasta desvelar si las sospechas de la señora Veigh son fruto de su intuición... o del miedo.',
            finished: 'Vuelve con la señora Veigh y cuéntale la situación.',
            type: 'main',
            prerequisites: [],
            next: 'mainquest002',
            rewards: { gold: 500, exp: 1000 },
        },
        main_quest002: {
            id: 'mainquest002',
            title: 'Búsqueda de información',
            description: 'Consigue información sobre los criminales conocidos.',
            finished: 'Vuelve con la señora Veigh y háblale sobre tu negociación con Szejsa la escribana.',
            type: 'main',
            prerequisites: ['mainquest001'],
            next: 'mainquest003',
            rewards: { gold: 1000, exp: 1500 },
        },
        main_quest003: {
            id: 'mainquest003',
            title: 'Negociaciones con Szejsa',
            description: 'Szejsa la escribana te ha pedido dirigirte a las ruinas de Kael’tarok para encontrar una antigua biblioteca que yace oculta en algún lugar de la mazmorra. En ella deberíamos encontrar unas antiguas escrituras de su difunto abuelo, de cuando el mundo aún no había sido invadido por criaturas del infierno. Es el primer paso para que Szejsa te ayude.',
            finished: 'Vuelve con Szejsa y entrégale el manuscrito de su abuelo.',
            type: 'main',
            prerequisites: ['mainquest002'],
            next: 'mainquest003',
            rewards: { gold: 1000, exp: 1500 },
        },
        main_quest004: {
            id: 'mainquest004',
            title: 'Negociaciones con Szejsa parte 2',
            description: 'Szejsa la escribana no ha quedado conforme debido a que el manuscrito es falso. Para, según ella, estar en paz, necesitas volver a las ruinas de Kael’tarok para encontrar 5 pergaminos mágicos para su siguiente experimento.',
            finished: 'Vuelve con Szejsa y entrégale los 5 pergaminos mágicos',
            type: 'main',
            prerequisites: ['mainquest003'],
            next: 'mainquest004',
            rewards: { gold: 750, exp: 1000 },
        },
        main_quest005: {
            id: 'mainquest005',
            title: 'Visita al barrio marginal',
            description: '',
            type: 'main',
            prerequisites: ['mainquest004'],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest006: {
            id: 'mainquest006',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest007: {
            id: 'mainquest007',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest008: {
            id: 'mainquest008',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest009: {
            id: 'mainquest009',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest010: {
            id: 'mainquest010',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest011: {
            id: 'mainquest011',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest012: {
            id: 'mainquest012',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest013: {
            id: 'mainquest013',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest014: {
            id: 'mainquest014',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest015: {
            id: 'mainquest015',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest016: {
            id: 'mainquest016',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest017: {
            id: 'mainquest017',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        main_quest018: {
            id: 'mainquest018',
            title: '',
            description: '',
            type: 'main',
            prerequisites: [''],
            next: null,
            rewards: { gold: 0, exp: 0, /* item: '' */},
        },
        secondary_quest001: {
            id: 'secquest001',
            title: 'Recolectar Hierbas',
            description: 'Recolecta 10 hierbas medicinales en el bosque',
            type: 'secondary',
            prerequisites: [],
            next: null,
            rewards: { gold: 50, item: 'poción de curación' },
        }
    },
    completeQuest (questId, player) {
        const quest = player.quests.find(q => q.id === questId)
        if (quest) {
            quest.completed = true
            console.log(`Quest ${quest.title} completed by ${player.name}`)
        }
    }
}

function showQuestDetail (scene, player, quest) {
    const detailContainer = document.createElement('div')
    detailContainer.id = 'questDetailContainer'
    
    const header = document.createElement('div')
    header.id = 'inventoryHeader'
    header.textContent = quest.title
    detailContainer.appendChild(header)
    
    const contentArea = document.createElement('div')
    contentArea.id = 'inventoryContent'
    contentArea.innerHTML = `
        <p>${quest.description}</p>
        <p><strong>Recompensas:</strong> ${quest.rewards ? JSON.stringify(quest.rewards) : ''}</p>
        <p><strong>Estado:</strong> ${quest.completed ? 'Completada' : 'En progreso'}</p>
    `
    detailContainer.appendChild(contentArea)
    
    if (!quest.completed) {
        const completeBtn = document.createElement('button')
        completeBtn.textContent = 'Marcar como Completada'
        completeBtn.onclick = () => {
            questManager.completeQuest(quest.id, player)
            detailContainer.remove()
            showQuestLog(scene, player)
        }
        detailContainer.appendChild(completeBtn)
    }
    
    const footer = document.createElement('div')
    footer.id = 'inventoryFooter'
    const detailsBackBtn = document.createElement('button')
    detailsBackBtn.textContent = 'Volver'
    detailsBackBtn.onclick = () => {
        detailContainer.remove()
        const questLog = document.getElementById('questLogContainer')
        if (questLog) {
            questLog.style.display = 'block'
        }
        else {
            showQuestLog(scene, player)
        }
    }
    footer.appendChild(detailsBackBtn)
    detailContainer.appendChild(footer)
    
    document.body.appendChild(detailContainer)
}
