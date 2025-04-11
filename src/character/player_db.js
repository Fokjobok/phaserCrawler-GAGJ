import CONFIG from '../../config/config.js'


export function getColor(name, alpha = 128) {
    const rgb = COLOR_MAP[name] || [200, 200, 200] // Color gris por defecto
    return [...rgb, alpha]
}


export const job_stats = {
    barbarian: {
        id: 1,
        color: 'red',
        stats: { str: 25, vit: 20, agi: 8, dex: 12, wis: 8, sou: 15 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "barbarian",
        battle_image: "barbarian_idle",
        description: {
            class: 'La definición perfecta de fuerza bruta.\nProveniente del norte profundo. Probablemente una figura que no pasa desapercibida.\n',
            card: ''
        },
        gear: {
            weapon: 'axe',
            armor: 'leather_tunic',
            shield: 'round_shield',
            accessory: ''
        },
        default_skills: ['war_cry'],
        bio: {
            new: 'Nacido en las tierras indómitas más allá de los bosques de Northaven, \ntu vida ha sido una constante lucha contra los elementos y las bestias que acechan en la naturaleza. \nForjado por batallas sin fin y una supervivencia implacable, cada cicatriz en tu piel cuenta una historia de desafíos superados. \nAl escuchar los rumores sobre las ruinas de Kael’Tharok y el tesoro que podría cambiar el destino del mundo, \nsientes un llamado irresistible. Con tu poderosa hacha al hombro y una determinación inquebrantable, \nte diriges a Northaven en busca de gloria y desafíos dignos de tu fuerza.\n\n'
        }
    },
    wizard: {
        id: 2,
        color: 'deep_sky_blue4',
        stats: { str: 5, vit: 10, agi: 14, dex: 13, wis: 25, sou: 19 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "wizard",
        battle_image: "wizard_idle",
        description: {
            class: 'Su insuperable potencia mágica con un posicionamiento estratégico les brinda a los grupos de aventureros la posibilidad de gestionar situaciones de peligro normalmente inviables.\n',
            card: ''
        },
        gear: {
            weapon: 'wand',
            armor: 'simple_tunic',
            shield: 'guard',
            accessory: ''
        },
        default_skills: ['magic_amplify'],
        bio: {
            new: 'Desde tu juventud en las altas torres de Eldoria, has dedicado tu vida al estudio de las artes arcanas. \nLos tomos antiguos y los hechizos olvidados han sido tus compañeros constantes. \nSin embargo, la sed de conocimiento te lleva más allá de las bibliotecas y los laboratorios. \nLas leyendas de Kael’Tharok, un lugar donde las reglas del mundo no aplican, han encendido tu curiosidad. \nCrees que en sus profundidades encontrarás secretos que ningún erudito ha desentrañado. \nCon tu bastón y tus conocimientos, llegas a Northhaven dispuesto a explorar lo desconocido.\n\n'
        }
    },
    archer: {
        id: 3,
        color: 'chartreuse4',
        stats: { str: 10, vit: 12, agi: 20, dex: 25, wis: 11, sou: 11 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "archer",
        battle_image: "archer_idle",
        description: {
            class: 'Combina su gran maestría, destreza, artilugios como trampas y su alto conocimiento del terreno con una gran capacidad de supervivencia.\n',
            card: ''
        },
        gear: {
            weapon: 'composite_bow',
            armor: 'archer_suit',
            shield: '',
            accessory: ''
        },
        default_skills: ['concentration'],
            bio: {
        new: 'Criado en los límites del bosque que rodea Northhaven, conoces cada sendero oculto y cada sonido de la naturaleza. \nTu arco es una extensión de ti mismo, y tu puntería es legendaria entre los tuyos. \nLas historias sobre Kael’Tharok y las criaturas que lo custodian han despertado tu interés. No solo por el tesoro, sino \npor el desafío de navegar y sobrevivir en un lugar que ha vuelto locos a otros. \nCon tu agilidad y destreza, te adentras en esta aventura, listo para demostrar que ningún objetivo es imposible de alcanzar.\n\n'
        }
    },
    rogue: {
        id: 4,
        color: 'royal_blue1',
        stats: { str: 9, vit: 11, agi: 23, dex: 21, wis: 16, sou: 13 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "rogue",
        battle_image: "_idle",
        description: {
            class: 'Maestro de las sombras, especialista en venenos, agilidad y sigilo.\nSus rápidos movimientos y ataques críticos lo convierten en un peligro constante para sus enemigos.\n',
            card: ''
        },
        gear: {
            weapon: 'rondel_dagger',
            armor: 'jacket',
            shield: '',
            accessory: ''
        },
        default_skills: ['rupture'],
        bio: {
            new: 'Las calles laberínticas de Luminaris fueron tu escuela y tu patio de recreo. Maestro del sigilo y el engaño, has pasado desapercibido donde otros hubieran caído. Los susurros sobre el clan Sombra de Ébano y su interés en Kael’Tharok han llegado a tus oídos. Ves una oportunidad no solo de obtener riquezas, sino de elevar tu nombre entre los más habilidosos. Deslizándote entre las sombras, llegas a Northhaven con la intención de adelantarte a los demás y tomar el tesoro que tantos desean.'
        }
    },
    sorcerer: {
        id: 5,
        color: 'plum1',
        stats: { str: 8, vit: 16, agi: 11, dex: 11, wis: 18, sou: 25 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "sorcerer",
        battle_image: "_idle",
        description: {
            class: 'Canaliza su espíritu para desatar poderosos conjuros defensivos.\nEs capaz de manejar energía espiritual para ataque o defensa.\n',
            card: ''
        },
        gear: {
            weapon: 'staff',
            armor: 'mage_coat',
            shield: '',
            accessory: ''
        },
        default_skills: ['ice_barrier'],
        bio: {
            new: 'Un poder antiguo corre por tus venas, uno que no proviene de libros ni maestros. Desde temprana edad, las energías espirituales han respondido a tu llamado, a veces de manera incontrolable. Buscando comprender y dominar este don, te han guiado visiones hacia Kael’Tharok. Crees que en sus profundidades encontrarás respuestas sobre tu origen y tu conexión con fuerzas más allá de este mundo. Con confianza en tu espíritu y la magia que fluye en ti, te presentas en Northhaven listo para enfrentar tu destino.'
        }
    },
    cleric: {
        id: 6,
        color: 'medium_spring_green',
        stats: { str: 10, vit: 25, agi: 9, dex: 10, wis: 15, sou: 16 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "cleric",
        battle_image: "_idle",
        description: {
            class: 'El mejor y más robusto pilar de apoyo y supervivencia.\nPosee habilidades curativas y una gran vitalidad que lo convierten en el protector ideal de cualquier grupo.\n',
            card: ''
        },
        gear: {
            weapon: 'flanged_mace',
            armor: 'saint_robe',
            shield: 'buckler',
            accessory: ''
        },
        default_skills: ['sanctuary'],
        bio: {
            new: 'Como fiel servidor de la Orden_de_Aeralis, has dedicado tu vida a sanar y proteger a los necesitados. Las señales y profecías indican que una gran oscuridad podría emerger de Kael’Tharok si nadie interviene. Convencido de que es tu deber sagrado prevenir una catástrofe, emprendes el viaje hacia Northhaven. Armado con tu maza y tus oraciones, estás dispuesto a enfrentarte a cualquier mal que aceche en las sombras, ofreciendo luz y esperanza donde más se necesita.'
        }
    },
    warrior: {
        id: 7,
        color: 'dark_goldenrod',
        stats: { str: 21, vit: 22, agi: 10, dex: 12, wis: 7, sou: 13 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "warrior",
        battle_image: "_idle",
        description: {
            class: 'Fuerza bruta y fortaleza en partes iguales.\nMaestro con hachas arrojadizas y ataques furtivos.\n',
            card: ''
        },
        gear: {
            weapon: 'club',
            armor: 'breastplate',
            shield: 'buckler',
            accessory: ''
        },
        default_skills: ['stun_bash'],
        bio: {
            new: 'Veterano de las guerras que han asolado Valoria, has visto la gloria y el horror del combate. Cansado de luchar por causas ajenas y líderes corruptos, buscas un propósito más noble. Las historias sobre el tesoro de Kael’Tharok te ofrecen una oportunidad para forjar tu propio destino. Con habilidades pulidas en innumerables batallas y una fuerza inigualable, llegas a Northhaven decidido a conquistar los desafíos que otros temen enfrentar.'
        }
    },
    fighter: {
        id: 8,
        color: 'sky_blue1',
        stats: { str: 15, vit: 15, agi: 15, dex: 15, wis: 15, sou: 15 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "fighter",
        battle_image: "_idle",
        description: {
            class: 'Luchador nacido en el fragor de incontables guerras. Versátil y eficiente.\nSu capacidad de adaptación le ha permitido sobrevivir en campos de batalla interminables.\n',
            card: ''
        },
        gear: {
            weapon: 'armin_sword',
            armor: 'regal_gambeson',
            shield: 'buckler',
            accessory: ''
        },
        default_skills: ['riposte'],
        bio: {
            new: 'Tu vida ha sido una constante adaptación. Sin lealtad a ningún reino, has vagado de un lugar a otro, perfeccionando tus habilidades en diversas artes de combate. Eres conocido por encontrar soluciones donde otros solo ven obstáculos. Al enterarte de los enigmas y peligros de Kael’Tharok, ves el desafío definitivo. Equipado con tu espada y una mente estratégica, te unes a la convergencia de aventureros en Northhaven, listo para cualquier cosa que el destino te depare.'
        }
    },
    monk: {
        id: 9,
        color: 'orange1',
        stats: { str: 18, vit: 13, agi: 16, dex: 14, wis: 12, sou: 15 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "monk",
        battle_image: "_idle",
        description: {
            class: 'Combina una poderosa fuerza física y espiritual.\nCanaliza y dirige el Ki para endurecer su cuerpo como el acero.\nEs versátil, con habilidadades para desempeñar cualquier rol.\n',
            card: ''
        },
        gear: {
            weapon: 'staff',
            armor: 'coat',
            shield: 'buckler',
            accessory: 'glasses'
        },
        default_skills: ['steel_body'],
        bio: {
            new: 'Desde los monasterios ocultos en las montañas, has buscado la armonía entre el cuerpo y el espíritu. Las perturbaciones en el flujo natural de las energías del mundo te han llevado a preocuparte. Kael’Tharok parece ser el epicentro de un desequilibrio que no puedes ignorar. Con serenidad y determinación, emprendes el viaje hacia Northhaven. Tus puños y tu alma están alineados para enfrentar y restaurar el equilibrio que amenaza con romperse.'
        }
    },
    bard: {
        id: 10,
        color: 'gold1',
        stats: { str: 12, vit: 12, agi: 14, dex: 21, wis: 15, sou: 11 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "bard",
        battle_image: "bard_idle",
        description: {
            class: 'Inspira a sus aliados con canciones y cuentos heróicos.\nEs una clase de soporte con alta destreza y utilidad táctica en combate.\n',
            card: ''
        },
        gear: {
            weapon: 'rapier',
            armor: 'simple_tunic',
            shield: '',
            accessory: ''
        },
        default_skills: ['crescendo'],
        bio: {
            new: 'Narrador de historias y cantante de canciones, has viajado por todo el continente en busca de las leyendas más emocionantes. Sin embargo, ninguna ha capturado tu imaginación como la de Kael’Tharok. Decides que esta vez no solo contarás la historia, sino que serás parte de ella. Con tu laúd, tu ingenio y una espada por si acaso, te diriges a Northhaven. Buscas vivir una aventura que inspirará canciones y relatos que perdurarán por generaciones.'
        }
    },
    ranger: {
        id: 11,
        color: 'dark_green',
        stats: { str: 11, vit: 13, agi: 20, dex: 20, wis: 9, sou: 12 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "ranger",
        battle_image: "ranger_idle",
        description: {
            class: 'Domina el terreno con su velocidad y habilidad.\nExperto en supervivencia y maestro con ballestas.\n',
            card: ''
        },
            gear: {
            weapon: 'long_bow',
            armor: 'archer_suit',
            shield: '',
            accessory: ''
        },
        default_skills: ['pilgrim_whistle'],
        bio: {
            new: 'Los vastos bosques y montañas son tu hogar. Has pasado años aprendiendo los secretos de la naturaleza y protegiendo sus tesoros. Las anomalías y criaturas extrañas que ahora emergen cerca de Kael’Tharok han alterado el equilibrio que tanto aprecias. Sientes la responsabilidad de investigar y, si es necesario, eliminar la fuente de esta perturbación. Con arco en mano y sentidos agudizados, llegas a Northhaven preparado para rastrear y enfrentar cualquier amenaza.'
        }
    },
    slayer: {
        id: 12,
        color: 'dark_red',
        stats: { str: 18, vit: 10, agi: 17, dex: 18, wis: 12, sou: 11 },
        role_stats: { cha: '', per: '', ins: '', kno: '' },
        job_image: "slayer",
        battle_image: "slayer_idle",
        description: {
            class: 'Combina la versatilidad de un luchador con una velocidad y astucia implacables.\nEspecialista en armas duales.',
            card: ''
        },
        gear: {
            weapon: 'falchion',
            armor: 'simple_tunic',
            shield: '',
            accessory: ''
        },
        default_skills: ['bloodlust'],
        bio: {
            new: 'Las sombras son tu refugio y el silencio, tu aliado. Has dedicado tu vida a eliminar amenazas que otros no pueden manejar. Los rumores sobre los guardianes inmortales de Kael’Tharok han despertado tu interés profesional. No es solo el desafío lo que te atrae, sino la posibilidad de enfrentar enemigos dignos de tus habilidades. Con una mezcla letal de fuerza, agilidad y astucia, te presentas en Northhaven listo para cazar lo que sea que habite en las profundidades del castillo.'
        }
    }
}