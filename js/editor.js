// РЕДАКТОР ДАННЫХ В БРАУЗЕРЕ
const editor = {
    init() {
        this.loadAll();
        this.setupAutoSave();
    },

    // Загружает данные из файлов в редактор
    loadAll() {
        // Загружаем классы
        document.getElementById('classesEditor').value = JSON.stringify(classesData, null, 2);
        
        // Загружаем вехи
        document.getElementById('milestonesEditor').value = JSON.stringify(milestonesData, null, 2);
        
        // Загружаем настройки
        document.getElementById('settingsEditor').value = JSON.stringify(milestonesData.settings, null, 2);
        
        console.log('Данные загружены в редактор');
    },

    // Сохраняет изменения из редактора
    saveAll() {
        try {
            // Сохраняем классы
            const newClassesData = JSON.parse(document.getElementById('classesEditor').value);
            Object.assign(classesData, newClassesData);
            
            // Сохраняем вехи
            const newMilestonesData = JSON.parse(document.getElementById('milestonesEditor').value);
            Object.assign(milestonesData, newMilestonesData);
            
            // Сохраняем настройки
            const newSettings = JSON.parse(document.getElementById('settingsEditor').value);
            Object.assign(milestonesData.settings, newSettings);
            
            // Обновляем калькулятор
            calculator.createClassButtons();
            ui.updateMaxPoints();
            
            if (calculator.currentClass) {
                calculator.renderBranches();
            }
            
            // Сохраняем в localStorage
            this.saveToLocalStorage();
            
            alert('✅ Изменения сохранены!');
            
        } catch (error) {
            alert('❌ Ошибка в формате JSON: ' + error.message);
        }
    },

    // Сохраняет данные в localStorage браузера
    saveToLocalStorage() {
        const saveData = {
            classes: classesData,
            milestones: milestonesData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('allodsCalculatorData', JSON.stringify(saveData));
    },

    // Загружает данные из localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('allodsCalculatorData');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                Object.assign(classesData, saveData.classes);
                Object.assign(milestonesData, saveData.milestones);
                this.loadAll();
                console.log('Данные загружены из localStorage');
            } catch (error) {
                console.log('Ошибка загрузки из localStorage');
            }
        }
    },

    // Автосохранение при изменении
    setupAutoSave() {
        const editors = ['classesEditor', 'milestonesEditor', 'settingsEditor'];
        editors.forEach(editorId => {
            const editor = document.getElementById(editorId);
            editor.addEventListener('input', () => {
                // Можно добавить автосохранение здесь
            });
        });
    },

    // Сбрасывает к исходным данным (из файлов)
    resetToDefault() {
        if (confirm('Вернуть исходные данные? Это удалит все ваши изменения в редакторе.')) {
            // Перезагружаем страницу чтобы загрузить исходные данные из файлов
            location.reload();
        }
    },

    // Экспортирует данные как файл
    exportData() {
        const data = {
            classes: classesData,
            milestones: milestonesData,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'allods-calculator-data.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    // Импортирует данные из файла
    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    Object.assign(classesData, importedData.classes);
                    Object.assign(milestonesData, importedData.milestones);
                    this.loadAll();
                    this.saveToLocalStorage();
                    alert('✅ Данные успешно импортированы!');
                } catch (error) {
                    alert('❌ Ошибка импорта: неверный формат файла');
                }
            };
            reader.readAsText(file);
        }
    }
};
