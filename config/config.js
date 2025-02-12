const CONFIG = {
    // Diálogos
    // Configuración de Texto
    TEXT: {
        FONT: "Roboto Mono",
        SIZE: "28px",
        COLOR: "#ffffff",
        SPEED: 50, // (ms)
        FAST_MULTIPLIER: 0.2, // (acel)
    },

    // Configuración de Transiciones
    TRANSITIONS: {
        FADEIN_DURATION: 1400,
        FADEOUT_DURATION: 50,
    },

    // Configuración de Pantalla
    SCREEN: {
        WIDTH: 1920,
        HEIGHT: 1080,
        RATIO: 16 / 9,

    },

    // Palabras clave
    KEYWORDS: {
        "Northaven": "#44DDFF",
        "Kael’Tharok": "#FF2222",
        "Rhai": "#FFDD44",
        "Aldrinh": "#FF0000",
        "Fera\u00A0Grosella": "#7D1B48",
        "Orden\u00A0de\u00A0Aeralis": "#DC143C"
    },

    // Jugador
    // Colores:
    COLOR_MAP: {
            red:                        [210, 15, 15],  //barbarian
            deep_sky_blue4:             [0, 104, 139],  //wizard
            chartreuse4:                [49, 119, 0],   //archer

            royal_blue1:                [72, 118, 255], //rogue
            plum1:                      [142, 69, 133], //sorcerer
            medium_spring_green:        [0, 200, 120],  //cleric

            dark_goldenrod:             [160, 110, 10], //warrior
            sky_blue1:                  [75, 156, 175], //fighter
            orange1:                    [210, 145, 0],  //monk

            gold1:                      [185, 140, 0],  //bard
            dark_green:                 [0, 100, 0],    //ranger
            dark_red:                   [139, 0, 0],    //slayer



            // Subcolores (colores pastel)
            red_pastel:                 [255, 160, 160],
            deep_sky_blue4_pastel:      [148, 184, 209],
            chartreuse4_pastel:         [144, 190, 128],

            royal_blue1_pastel:         [160, 188, 255],
            plum1_pastel:               [210, 160, 205],
            medium_spring_green_pastel: [128, 220, 180],

            dark_goldenrod_pastel:      [244, 194, 110],
            sky_blue1_pastel:           [165, 206, 235], 
            orange1_pastel:             [255, 200, 140],

            gold1_pastel:               [255, 235, 150],
            dark_green_pastel:          [170, 190, 160],
            dark_red_pastel:            [190, 150, 150],
    }
}

export default CONFIG