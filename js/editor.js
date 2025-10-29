// РЕДАКТОР ДАННЫХ В БРАУЗЕРЕ
const editor = {
    isEditingMilestones: false,
    currentEditingClass: null,
    currentEditingBranch: null,

    init() {
        this.loadAll();
        this.setupAutoSave();
        this.setupMilestoneEditor();
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
            
            // Обновляем редактор вех если он активен
            if (this.isEditingMilestones) {
                this.renderMilestoneEditor();
            }
            
            // Сохраняем в localStorage
            this.saveToLocalStorage();
            
            alert('✅ Изменения сохранены!');
            
        } catch (error) {
            alert('❌ Ошибка в формате JSON: ' + error.message);
        }
    },

    // Настройка редактора вех
    setupMilestoneEditor() {
        // Добавляем кнопку редактирования вех в интерфейс
        const editorControls = document.querySelector('.editor-controls');
        const editMilestonesBtn = document.createElement('button');
        editMilestonesBtn.className = 'editor-btn';
        editMilestonesBtn.textContent = '🎯 Редактор вех';
        editMilestonesBtn.onclick = () => this.toggleMilestoneEditor();
        editorControls.appendChild(editMilestonesBtn);
    },

    // Переключение режима редактирования вех
    toggleMilestoneEditor() {
        this.isEditingMilestones = !this.isEditingMilestones;
        
        if (this.isEditingMilestones) {
            this.showMilestoneEditor();
        } else {
            this.hideMilestoneEditor();
        }
    },

    // Показать редактор вех
    showMilestoneEditor() {
        // Создаем модальное окно для редактора вех
        const modal = document.createElement('div');
        modal.id = 'milestoneEditorModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            padding: 20px;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: white;">🎯 Редактор вех</h2>
                <button onclick="editor.hideMilestoneEditor()" style="
                    background: #f72585;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">✕ Закрыть</button>
            </div>

            <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px; flex: 1;">
                <!-- Панель выбора -->
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                    <h3 style="color: #4cc9f0; margin-bottom: 15px;">Выберите ветку</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: white; display: block; margin-bottom: 5px;">Класс:</label>
                        <select id="editorClassSelect" style="width: 100%; padding: 10px; border-radius: 5px; background: #2d3748; color: white; border: 1px solid #4a5568;">
                            ${Object.keys(milestonesData.classes).map(cls => `
                                <option value="${cls}">${classesData[cls]?.name || cls}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: white; display: block; margin-bottom: 5px;">Ветка вех:</label>
                        <select id="editorBranchSelect" style="width: 100%; padding: 10px; border-radius: 5px; background: #2d3748; color: white; border: 1px solid #4a5568;">
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: white; display: block; margin-bottom: 5px;">Название ветки:</label>
                        <input type="text" id="editorBranchName" style="width: 100%; padding: 10px; border-radius: 5px; background: #2d3748; color: white; border: 1px solid #4a5568;">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: white; display: block; margin-bottom: 5px;">Описание:</label>
                        <textarea id="editorBranchDesc" style="width: 100%; height: 80px; padding: 10px; border-radius: 5px; background: #2d3748; color: white; border: 1px solid #4a5568; resize: vertical;"></textarea>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <button onclick="editor.addNewBranch()" style="width: 100%; padding: 12px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 10px;">
                            ➕ Добавить новую ветку
                        </button>
                        <button onclick="editor.deleteCurrentBranch()" style="width: 100%; padding: 12px; background: #f72585; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            🗑️ Удалить текущую ветку
                        </button>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px;">
                        <h4 style="color: #4cc9f0; margin-bottom: 10px;">Инструкция:</h4>
                        <p style="color: white; font-size: 12px; line-height: 1.4;">
                            • <strong>Клик</strong> - заблокировать/разблокировать клетку<br>
                            • <strong>Заблокированные клетки</strong> - серые, недоступны для выбора<br>
                            • <strong>Центральная клетка [4,4]</strong> - стартовая (нельзя изменить)<br>
                            • Изменения сохраняются автоматически
                        </p>
                    </div>
                </div>

                <!-- Сетка для редактирования -->
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; display: flex; flex-direction: column; align-items: center;">
                    <h3 id="editorGridTitle" style="color: white; margin-bottom: 20px;">Выберите ветку для редактирования</h3>
                    <div id="milestoneEditorGrid" style="display: grid; grid-template-columns: repeat(9, 40px); grid-template-rows: repeat(9, 40px); gap: 2px; margin-bottom: 20px;">
                        <!-- Сетка будет создана динамически -->
                    </div>
                    <div style="color: white; font-size: 14px;">
                        Заблокированных клеток: <span id="disabledCount">0</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Настраиваем события
        document.getElementById('editorClassSelect').addEventListener('change', () => this.updateBranchSelect());
        document.getElementById('editorBranchSelect').addEventListener('change', () => this.renderMilestoneEditor());
        document.getElementById('editorBranchName').addEventListener('input', () => this.updateBranchData());
        document.getElementById('editorBranchDesc').addEventListener('input', () => this.updateBranchData());
        
        this.updateBranchSelect();
        this.renderMilestoneEditor();
    },

    // Скрыть редактор вех
    hideMilestoneEditor() {
        const modal = document.getElementById('milestoneEditorModal');
        if (modal) {
            modal.remove();
        }
        this.isEditingMilestones = false;
    },

    // Обновить выбор веток
    updateBranchSelect() {
        const classSelect = document.getElementById('editorClassSelect');
        const branchSelect = document.getElementById('editorBranchSelect');
        const selectedClass = classSelect.value;
        
        branchSelect.innerHTML = '';
        
        if (milestonesData.classes[selectedClass]) {
            milestonesData.classes[selectedClass].forEach((branch, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${branch.name} (${branch.disabledCells.length} заблокированных)`;
                branchSelect.appendChild(option);
            });
        }
        
        this.currentEditingClass = selectedClass;
        this.currentEditingBranch = branchSelect.value;
    },

    // Отрисовать редактор сетки
    renderMilestoneEditor() {
        const classId = document.getElementById('editorClassSelect').value;
        const branchIndex = document.getElementById('editorBranchSelect').value;
        const grid = document.getElementById('milestoneEditorGrid');
        const title = document.getElementById('editorGridTitle');
        
        if (!classId || branchIndex === '') {
            grid.innerHTML = '<div style="color: white; text-align: center;">Выберите ветку для редактирования</div>';
            return;
        }
        
        const branch = milestonesData.classes[classId][branchIndex];
        this.currentEditingClass = classId;
        this.currentEditingBranch = parseInt(branchIndex);
        
        // Обновляем поля ввода
        document.getElementById('editorBranchName').value = branch.name;
        document.getElementById('editorBranchDesc').value = branch.desc;
        
        title.textContent = `Редактирование: ${branch.name}`;
        
        // Создаем сетку
        grid.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.style.cssText = `
                    width: 40px;
                    height: 40px;
                    background: #4a5568;
                    border: 2px solid #718096;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    transition: all 0.2s;
                `;
                
                const isStart = (i === 4 && j === 4);
                const isDisabled = branch.disabledCells.some(([x, y]) => x === i && y === j);
                
                if (isStart) {
                    cell.style.background = '#4cc9f0';
                    cell.style.borderColor = '#4cc9f0';
                    cell.textContent = '🎯';
                } else if (isDisabled) {
                    cell.style.background = '#2d3748';
                    cell.style.borderColor = '#718096';
                    cell.style.opacity = '0.4';
                    cell.textContent = '❌';
                } else {
                    cell.textContent = '✓';
                    cell.style.color = '#90ee90';
                }
                
                if (!isStart) {
                    cell.addEventListener('click', () => this.toggleCell(i, j));
                }
                
                cell.setAttribute('data-tooltip', `Позиция: [${i},${j}]${isStart ? ' (Старт)' : ''}${isDisabled ? ' (Заблокирована)' : ''}`);
                cell.addEventListener('mouseenter', ui.showTooltip.bind(ui));
                cell.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
                
                grid.appendChild(cell);
            }
        }
        
        this.updateDisabledCount();
    },

    // Переключить состояние клетки
    toggleCell(row, col) {
        if (this.currentEditingClass === null || this.currentEditingBranch === null) return;
        
        const branch = milestonesData.classes[this.currentEditingClass][this.currentEditingBranch];
        const cellIndex = branch.disabledCells.findIndex(([x, y]) => x === row && y === col);
        
        if (cellIndex === -1) {
            // Добавляем в заблокированные
            branch.disabledCells.push([row, col]);
        } else {
            // Удаляем из заблокированных
            branch.disabledCells.splice(cellIndex, 1);
        }
        
        this.renderMilestoneEditor();
        this.saveToLocalStorage();
        this.updateBranchSelect(); // Обновляем список веток
    },

    // Обновить счетчик заблокированных клеток
    updateDisabledCount() {
        if (this.currentEditingClass === null || this.currentEditingBranch === null) return;
        
        const branch = milestonesData.classes[this.currentEditingClass][this.currentEditingBranch];
        document.getElementById('disabledCount').textContent = branch.disabledCells.length;
    },

    // Обновить данные ветки
    updateBranchData() {
        if (this.currentEditingClass === null || this.currentEditingBranch === null) return;
        
        const branch = milestonesData.classes[this.currentEditingClass][this.currentEditingBranch];
        branch.name = document.getElementById('editorBranchName').value;
        branch.desc = document.getElementById('editorBranchDesc').value;
        
        this.saveToLocalStorage();
        this.updateBranchSelect(); // Обновляем список веток
    },

    // Добавить новую ветку
    addNewBranch() {
        const classId = document.getElementById('editorClassSelect').value;
        
        if (!milestonesData.classes[classId]) {
            milestonesData.classes[classId] = [];
        }
        
        const newBranch = {
            name: "Новая ветка",
            desc: "Описание новой ветки",
            disabledCells: []
        };
        
        milestonesData.classes[classId].push(newBranch);
        
        this.saveToLocalStorage();
        this.updateBranchSelect();
        
        // Выбираем новую ветку
        const branchSelect = document.getElementById('editorBranchSelect');
        branchSelect.value = milestonesData.classes[classId].length - 1;
        this.renderMilestoneEditor();
    },

    // Удалить текущую ветку
    deleteCurrentBranch() {
        const classId = document.getElementById('editorClassSelect').value;
        const branchIndex = document.getElementById('editorBranchSelect').value;
        
        if (milestonesData.classes[classId] && milestonesData.classes[classId][branchIndex]) {
            if (confirm(`Удалить ветку "${milestonesData.classes[classId][branchIndex].name}"?`)) {
                milestonesData.classes[classId].splice(branchIndex, 1);
                
                this.saveToLocalStorage();
                this.updateBranchSelect();
                this.renderMilestoneEditor();
            }
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
