document.addEventListener('DOMContentLoaded', function() {
    const calculator = new TalentCalculator();
    
    // Инициализация кнопок классов
    const classButtonsContainer = document.querySelector('.class-buttons');
    allClasses.forEach(classInfo => {
        const button = document.createElement('button');
        button.className = 'class-btn';
        button.innerHTML = `${classInfo.icon} ${classInfo.name}`;
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.class-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // Добавляем активный класс текущей кнопке
            button.classList.add('active');
            // Выбираем класс
            calculator.selectClass(classInfo.id);
        });
        classButtonsContainer.appendChild(button);
    });

    // Обработчики кнопок управления
    document.getElementById('reset-btn').addEventListener('click', () => {
        calculator.resetTalents();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
        const code = calculator.exportBuild();
        navigator.clipboard.writeText(code).then(() => {
            alert('Код билда скопирован в буфер обмена!');
        });
    });

    document.getElementById('import-btn').addEventListener('click', () => {
        const code = prompt('Введите код билда:');
        if (code) {
            if (calculator.importBuild(code)) {
                alert('Билд успешно импортирован!');
            } else {
                alert('Ошибка импорта билда!');
            }
        }
    });

    // Выбираем первый класс по умолчанию
    if (allClasses.length > 0) {
        document.querySelector('.class-btn').click();
    }
});
