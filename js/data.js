// Пример данных для классов (тебе нужно будет заполнить реальными данными)
const classesData = {
    warrior: {
        name: "Воин",
        trees: [
            {
                name: "Оружие",
                talents: [
                    {
                        id: "warrior_weapon_1",
                        name: "Усиленный удар",
                        description: "Увеличивает урон следующей атаки на 10%",
                        maxLevel: 5,
                        requiredLevel: 1,
                        dependencies: [],
                        icon: "⚔️"
                    },
                    {
                        id: "warrior_weapon_2", 
                        name: "Критический удар",
                        description: "Шанс критического удара увеличен на 2%",
                        maxLevel: 3,
                        requiredLevel: 5,
                        dependencies: ["warrior_weapon_1"],
                        icon: "💥"
                    }
                    // Добавь остальные таланты...
                ]
            },
            {
                name: "Защита", 
                talents: [
                    {
                        id: "warrior_protection_1",
                        name: "Укрепленная броня",
                        description: "Увеличивает защиту на 5%",
                        maxLevel: 5,
                        requiredLevel: 1,
                        dependencies: [],
                        icon: "🛡️"
                    }
                    // Добавь остальные таланты...
                ]
            },
            {
                name: "Ярость",
                talents: [
                    // Добавь таланты...
                ]
            }
        ]
    },
    paladin: {
        name: "Паладин",
        trees: [
            // Структура аналогична воину
        ]
    },
    // Добавь остальные классы...
};

// Список всех классов
const allClasses = [
    { id: "warrior", name: "Воин", icon: "⚔️" },
    { id: "paladin", name: "Паладин", icon: "✝️" },
    { id: "archer", name: "Лучник", icon: "🏹" },
    { id: "rogue", name: "Разбойник", icon: "🗡️" },
    { id: "mage", name: "Маг", icon: "🔮" },
    { id: "priest", name: "Жрец", icon: "🙏" },
    { id: "summoner", name: "Призыватель", icon: "👁️" },
    { id: "bard", name: "Бард", icon: "🎵" }
];

