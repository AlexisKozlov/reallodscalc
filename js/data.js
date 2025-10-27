// Структура данных для классов
const classesData = {
    warrior: {
        name: "Воин",
        branches: {
            talents: {
                name: "Таланты Воина",
                type: "talents",
                rows: [
                    {
                        talents: [
                            {
                                id: "war_tal_1_1",
                                name: "Сила оружия",
                                description: "Увеличивает силу атаки на 2%",
                                maxLevel: 5,
                                icon: "⚔️",
                                dependencies: []
                            },
                            {
                                id: "war_tal_1_2", 
                                name: "Твердая стойка",
                                description: "Увеличивает защиту на 3%",
                                maxLevel: 5,
                                icon: "🛡️",
                                dependencies: []
                            }
                        ]
                    },
                    {
                        talents: [
                            {
                                id: "war_tal_2_1",
                                name: "Ярость",
                                description: "Шанс критического удара увеличен на 2%",
                                maxLevel: 3,
                                icon: "💥",
                                dependencies: ["war_tal_1_1"]
                            },
                            {
                                id: "war_tal_2_2",
                                name: "Выносливость", 
                                description: "Увеличивает максимальное здоровье на 4%",
                                maxLevel: 3,
                                icon: "❤️",
                                dependencies: ["war_tal_1_2"]
                            }
                        ]
                    }
                    // Добавь остальные 8 строк...
                ]
            },
            milestone1: {
                name: "Веха: Сила",
                type: "milestone",
                grid: createMilestoneGrid() // 9x9 grid
            },
            milestone2: {
                name: "Веха: Защита", 
                type: "milestone",
                grid: createMilestoneGrid()
            },
            milestone3: {
                name: "Веха: Тактика",
                type: "milestone", 
                grid: createMilestoneGrid()
            }
        }
    },
    // Добавь остальные классы...
    paladin: {
        name: "Паладин",
        branches: {
            talents: {
                name: "Таланты Паладина",
                type: "talents",
                rows: [
                    // 10 строк с талантами...
                ]
            },
            milestone1: {
                name: "Веха: Свет",
                type: "milestone",
                grid: createMilestoneGrid()
            },
            milestone2: {
                name: "Веха: Щит",
                type: "milestone",
                grid: createMilestoneGrid()
            },
            milestone3: {
                name: "Веха: Вера",
                type: "milestone",
                grid: createMilestoneGrid()
            }
        }
    }
    // Добавь: bestnik, scout, mage, priest, summoner, bard...
};

// Функция для создания сетки вех 9x9 с началом в середине
function createMilestoneGrid() {
    const grid = [];
    for (let row = 0; row < 9; row++) {
        const gridRow = [];
        for (let col = 0; col < 9; col++) {
            const isStartCell = row === 4 && col === 4; // Центральная клетка
            
            gridRow.push({
                id: `milestone_${row}_${col}`,
                name: `Веха ${row+1}-${col+1}`,
                description: `Эффект вехи в позиции ${row+1},${col+1}`,
                dependencies: getMilestoneDependencies(row, col),
                active: false,
                isStart: isStartCell
            });
        }
        grid.push(gridRow);
    }
    return grid;
}
// Функция для определения зависимостей вех (начинаем из центра)
function getMilestoneDependencies(row, col) {
    const deps = [];
    const centerRow = 4;
    const centerCol = 4;
    
    // Если это стартовая клетка - нет зависимостей
    if (row === centerRow && col === centerCol) {
        return [];
    }
    
    // Зависимость от ближайшей клетки к центру
    if (row > centerRow) {
        deps.push(`milestone_${row-1}_${col}`);
    } else if (row < centerRow) {
        deps.push(`milestone_${row+1}_${col}`);
    }
    
    if (col > centerCol) {
        deps.push(`milestone_${row}_${col-1}`);
    } else if (col < centerCol) {
        deps.push(`milestone_${row}_${col+1}`);
    }
    
    return deps;
}

// Список классов
const allClasses = [
    { id: "warrior", name: "Воин", icon: "⚔️" },
    { id: "paladin", name: "Паладин", icon: "✝️" },
    { id: "scout", name: "Скаут", icon: "🏹" },
    { id: "bestnik", name: "Бестник", icon: "🗡️" },
    { id: "mage", name: "Маг", icon: "🔮" },
    { id: "priest", name: "Жрец", icon: "🙏" },
    { id: "summoner", name: "Призыватель", icon: "👁️" },
    { id: "bard", name: "Бард", icon: "🎵" }
];
