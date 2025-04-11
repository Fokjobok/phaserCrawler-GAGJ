export const npcConversation = {
    id: "conv_001",
    // Array de diálogos entre NPCs
    dialogs: [
        {
            speakerName: "Hesper",
            image: "assets/npcs/innkeeper.png",
            text: ["Buenas noches, Andreau. ¿Has oído la noticia?"],
        },
        {
            speakerName: "Andreau",
            image: "assets/npcs/innkeeper2.png",
            text: ["Claro que sí, Hesper. Los rumores sobre el castillo en ruinas son inquietantes."],
        },
        {
            speakerName: "Hesper",
            image: "assets/npcs/innkeeper.png",
            text: ["Debemos estar atentos, la situación se agrava cada día."],
        },
        {
            speakerName: "Andreau",
            image: "assets/npcs/innkeeper2.png",
            text: ["Estoy de acuerdo. También debemos informar a Thimble, él sabrá qué hacer."],
        }
    ],
    currentIndex: 0,
    completed: false
}