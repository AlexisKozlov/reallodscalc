// ЛОГИКА КАЛЬКУЛЯТОРА
const calculator = {
    currentClass: null,
    talentPoints: 0,
    milestonePoints: 0,
    selectedTalents: {},
    selectedMilestones: {},

    init() {
        this.createClassButtons();
        ui.updateMaxPoints();
    },

    createClassButtons() {
        const container = document.getElementById('classButtons');
        container.innerHTML = '';
        
        for (const classId in classesData) {
            const btn = document.createElement('button');
            btn.className = 'class-btn';
            btn.textContent = classesData[classId].name;
            btn.addEventListener('click', () => this.selectClass(classId));
            container.appendChild(btn);
        }
    },

    selectClass(classId) {
        this.currentClass = classId;
        this.talentPoints = 0;
        this.milestonePoints = 0;
        
        // Очищаем выбранные таланты и вехи
        this.selectedTalents = {};
        this.selectedMilestones = {};
        
        // Активируем стартовые вехи (те, у которых req: [])
        if (milestonesData.classes[classId]) {
            milestonesData.classes[classId].forEach((branch) => {
                branch.milestones.forEach(milestone => {
                    if (milestone.req.length === 0) {
                        this.selectedMilestones[milestone.id] = true;
                        this.milestonePoints++;
                    }
                });
            });
        }
        
        // Обновляем UI
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderBranches();
        ui.updatePoints();
        this.updateBuildCode();
    },

    renderBranches() {
        if (!this.currentClass) return;
        
        const container = document.getElementById('branchesContainer');
        container.innerHTML = '';
        
        const classData = classesData[this.currentClass];
        const milestoneData = milestonesData.classes[this.currentClass] || [];

        // Ветка талантов
        const talentBranch = document.createElement('div');
        talentBranch.className = 'talent-branch';
        talentBranch.innerHTML = '<h3>🎯 Таланты</h3>';
        
        classData.talents.forEach((rowData, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'talent-row';
            
            rowData.talents.forEach(talent => {
                const talentDiv = document.createElement('div');
                talentDiv.className = 'talent';
                const currentLevel = this.selectedTalents[talent.id] || 0;
                
                // Проверяем доступность строки
                const isRowLocked = !this.isRowAvailable(rowIndex);
                
                // Проверяем требования таланта
                const isTalentLocked = talent.req.length > 0 && !talent.req.every(req => this.selectedTalents[req] > 0);
                
                if (currentLevel > 0) talentDiv.classList.add('active');
                if (isRowLocked || isTalentLocked) talentDiv.classList.add('locked');
                
                talentDiv.innerHTML = `
                    <div style="font-size: 16px; margin-bottom: 5px;">${talent.icon || '❓'}</div>
                    <div style="font-size: 9px; line-height: 1.1;">${talent.name}</div>
                    <div class="talent-level">${currentLevel}/${talent.max}</div>
                `;
                
                // Тултип
                const desc = talent.desc[Math.min(currentLevel, talent.desc.length - 1)];
                let tooltipText = `${talent.name}\n\n${desc}\n\nУровень: ${currentLevel}/${talent.max}`;
                
                if (isRowLocked) {
                    tooltipText += `\n\n🔒 Требуется ${rowData.requiredPoints} очков в предыдущих строках`;
                }
                if (isTalentLocked) {
                    tooltipText += `\n\n🔒 Не выполнены требования таланта`;
                }
                
                talentDiv.setAttribute('data-tooltip', tooltipText);
                
                talentDiv.addEventListener('mouseenter', ui.showTooltip.bind(ui));
                talentDiv.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
                
                if (!isRowLocked && !isTalentLocked) {
                    talentDiv.addEventListener('click', () => this.toggleTalent(talent.id, talent.max, talent.req, rowIndex));
                }
                
                rowDiv.appendChild(talentDiv);
            });
            
            talentBranch.appendChild(rowDiv);
        });
        
        container.appendChild(talentBranch);
        
        // Ветки вех
        milestoneData.forEach((milestoneBranch, branchIndex) => {
            const milestoneBranchDiv = document.createElement('div');
            milestoneBranchDiv.className = 'milestone-branch';
            milestoneBranchDiv.innerHTML = `<h3>${milestoneBranch.name}</h3>`;
            
            milestoneBranchDiv.setAttribute('data-tooltip', `${milestoneBranch.name}\n\n${milestoneBranch.desc}`);
            milestoneBranchDiv.addEventListener('mouseenter', ui.showTooltip.bind(ui));
            milestoneBranchDiv.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
            
            const grid = document.createElement('div');
            grid.className = 'milestone-grid';
            
            // Создаем сетку 9x9
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'milestone';
                    cellDiv.dataset.position = `${i},${j}`;
                    
                    // Ищем веху для этой позиции
                    const milestone = milestoneBranch.milestones.find(m => 
                        m.position[0] === i && m.position[1] === j
                    );
                    
                    if (milestone) {
                        const isActive = this.selectedMilestones[milestone.id];
                        const isAvailable = this.isMilestoneAvailable(milestone.id, milestone.req);
                        
                        if (isActive) {
                            cellDiv.classList.add('active');
                            cellDiv.innerHTML = milestone.icon || '✓';
                        } else if (isAvailable) {
                            cellDiv.classList.add('available');
                            cellDiv.innerHTML = milestone.icon || '?';
                        } else {
                            cellDiv.classList.add('locked');
                            cellDiv.innerHTML = '🔒';
                        }
                        
                        // Тултип
                        let tooltip = `${milestone.name}\n\n${milestone.desc}`;
                        if (!isAvailable && milestone.req.length > 0) {
                            const reqNames = milestone.req.map(req => this.getMilestoneName(req)).join(', ');
                            tooltip += `\n\n🔒 Требуется: ${reqNames}`;
                        }
                        cellDiv.setAttribute('data-tooltip', tooltip);
                        
                        if (isAvailable && !isActive) {
                            cellDiv.addEventListener('click', () => this.toggleMilestone(milestone.id));
                        }
                    } else {
                        // Пустая клетка (нет вехи)
                        cellDiv.classList.add('empty');
                        cellDiv.innerHTML = '·';
                        cellDiv.setAttribute('data-tooltip', `Пустая клетка [${i},${j}]\n\nЗдесь нет вехи`);
                    }
                    
                    cellDiv.addEventListener('mouseenter', ui.showTooltip.bind(ui));
                    cellDiv.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
                    
                    grid.appendChild(cellDiv);
                }
            }
            
            milestoneBranchDiv.appendChild(grid);
            container.appendChild(milestoneBranchDiv);
        });
    },

    isRowAvailable(rowIndex) {
        if (rowIndex === 0) return true; // Первая строка всегда доступна
        
        const classData = classesData[this.currentClass];
        const rowData = classData.talents[rowIndex];
        
        if (!rowData.requiredPoints) return true;
        
        // Считаем очки в предыдущих строках
        let pointsInPreviousRows = 0;
        for (let i = 0; i < rowIndex; i++) {
            const previousRow = classData.talents[i];
            previousRow.talents.forEach(talent => {
                pointsInPreviousRows += this.selectedTalents[talent.id] || 0;
            });
        }
        
        return pointsInPreviousRows >= rowData.requiredPoints;
    },

    isMilestoneAvailable(milestoneId, requirements) {
        // Если веха уже активна, она доступна для отображения
        if (this.selectedMilestones[milestoneId]) return true;
        
        // Стартовые вехи (без требований) всегда доступны
        if (requirements.length === 0) return true;
        
        // Проверяем требования
        return requirements.every(reqId => this.selectedMilestones[reqId]);
    },

    toggleTalent(talentId, maxLevel, requirements, rowIndex) {
        if (this.talentPoints >= milestonesData.settings.maxTalentPoints && !this.selectedTalents[talentId]) {
            alert(`Достигнут лимит очков талантов: ${milestonesData.settings.maxTalentPoints}`);
            return;
        }
        
        // Проверяем доступность строки
        if (!this.isRowAvailable(rowIndex)) {
            const classData = classesData[this.currentClass];
            const rowData = classData.talents[rowIndex];
            alert(`Для изучения талантов этой строки требуется ${rowData.requiredPoints} очков в предыдущих строках!`);
            return;
        }
        
        const currentLevel = this.selectedTalents[talentId] || 0;
        const isLocked = requirements.length > 0 && !requirements.every(req => this.selectedTalents[req] > 0);
        
        if (isLocked) {
            alert('Не выполнены требования для изучения этого таланта!');
            return;
        }
        
        if (currentLevel < maxLevel) {
            this.selectedTalents[talentId] = currentLevel + 1;
            this.talentPoints++;
        } else {
            delete this.selectedTalents[talentId];
            this.talentPoints--;
        }
        
        ui.updatePoints();
        this.renderBranches();
        this.updateBuildCode();
    },

    toggleMilestone(milestoneId) {
        if (this.milestonePoints >= milestonesData.settings.maxMilestonePoints && !this.selectedMilestones[milestoneId]) {
            alert(`Достигнут лимит очков вех: ${milestonesData.settings.maxMilestonePoints}`);
            return;
        }

        if (this.selectedMilestones[milestoneId]) {
            // Проверяем, можно ли удалить веху (нет зависимых вех)
            if (this.canRemoveMilestone(milestoneId)) {
                delete this.selectedMilestones[milestoneId];
                this.milestonePoints--;
            } else {
                alert('Нельзя удалить веху! Есть зависимые вехи.');
                return;
            }
        } else {
            // Добавляем веху
            this.selectedMilestones[milestoneId] = true;
            this.milestonePoints++;
        }

        ui.updatePoints();
        this.renderBranches();
        this.updateBuildCode();
    },

    canRemoveMilestone(milestoneId) {
        // Собираем все вехи текущего класса
        const allMilestones = [];
        if (milestonesData.classes[this.currentClass]) {
            milestonesData.classes[this.currentClass].forEach(branch => {
                allMilestones.push(...branch.milestones);
            });
        }
        
        // Ищем вехи, которые требуют эту веху
        const dependentMilestones = allMilestones.filter(m => 
            m.req.includes(milestoneId) && this.selectedMilestones[m.id]
        );
        
        return dependentMilestones.length === 0;
    },

    getMilestoneName(milestoneId) {
        // Собираем все вехи текущего класса
        const allMilestones = [];
        if (milestonesData.classes[this.currentClass]) {
            milestonesData.classes[this.currentClass].forEach(branch => {
                allMilestones.push(...branch.milestones);
            });
        }
        
        const milestone = allMilestones.find(m => m.id === milestoneId);
        return milestone ? milestone.name : milestoneId;
    },

    // Сброс всех выбранных талантов и вех
    resetAll() {
        if (confirm('Сбросить все выбранные таланты и вехи?')) {
            this.talentPoints = 0;
            this.milestonePoints = 0;
            this.selectedTalents = {};
            this.selectedMilestones = {};
            
            // Восстанавливаем стартовые вехи
            if (this.currentClass && milestonesData.classes[this.currentClass]) {
                milestonesData.classes[this.currentClass].forEach((branch) => {
                    branch.milestones.forEach(milestone => {
                        if (milestone.req.length === 0) {
                            this.selectedMilestones[milestone.id] = true;
                            this.milestonePoints++;
                        }
                    });
                });
            }
            
            ui.updatePoints();
            this.renderBranches();
            this.updateBuildCode();
        }
    },

    // Экспорт билда в строку
    exportBuild() {
        if (!this.currentClass) {
            alert('Сначала выберите класс!');
            return;
        }

        const buildData = {
            class: this.currentClass,
            talents: this.selectedTalents,
            milestones: Object.keys(this.selectedMilestones).filter(id => id.startsWith(this.currentClass)),
            version: '1.0',
            timestamp: new Date().toISOString()
        };

        const buildString = btoa(JSON.stringify(buildData));
        document.getElementById('buildCode').value = buildString;
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(buildString).then(() => {
            alert('✅ Билд скопирован в буфер обмена!');
        }).catch(() => {
            alert('✅ Билд готов! Скопируйте код вручную.');
        });
    },

    // Импорт билда из строки
    importBuild() {
        const buildString = prompt('Введите код билда:');
        if (!buildString) return;

        try {
            const buildData = JSON.parse(atob(buildString));
            
            // Проверяем версию и класс
            if (!buildData.class || !buildData.talents || !buildData.milestones) {
                throw new Error('Неверный формат билда');
            }

            // Выбираем класс если нужно
            if (this.currentClass !== buildData.class) {
                this.selectClass(buildData.class);
            }

            // Применяем таланты
            this.talentPoints = 0;
            this.selectedTalents = {};
            for (const [talentId, level] of Object.entries(buildData.talents)) {
                this.selectedTalents[talentId] = level;
                this.talentPoints += level;
            }

            // Применяем вехи
            this.milestonePoints = 0;
            this.selectedMilestones = {};
            buildData.milestones.forEach(milestoneId => {
                this.selectedMilestones[milestoneId] = true;
                this.milestonePoints++;
            });

            // Обновляем UI
            ui.updatePoints();
            this.renderBranches();
            this.updateBuildCode();
            
            alert('✅ Билд успешно загружен!');
            
        } catch (error) {
            alert('❌ Ошибка загрузки билда: ' + error.message);
        }
    },

    // Обновление кода билда
    updateBuildCode() {
        if (!this.currentClass) return;

        const buildData = {
            class: this.currentClass,
            talents: this.selectedTalents,
            milestones: Object.keys(this.selectedMilestones).filter(id => id.startsWith(this.currentClass)),
            talentPoints: this.talentPoints,
            milestonePoints: this.milestonePoints,
            stats: this.getBuildStats()
        };

        document.getElementById('buildCode').value = JSON.stringify(buildData, null, 2);
    },

    // Получение статистики билда
    getBuildStats() {
        const stats = {
            totalTalentPoints: this.talentPoints,
            totalMilestonePoints: this.milestonePoints,
            talentCount: Object.keys(this.selectedTalents).length,
            milestoneCount: Object.keys(this.selectedMilestones).length,
            maxTalentPoints: milestonesData.settings.maxTalentPoints,
            maxMilestonePoints: milestonesData.settings.maxMilestonePoints
        };

        return stats;
    },

    // Проверка валидности билда
    validateBuild() {
        const errors = [];
        const stats = this.getBuildStats();

        if (stats.totalTalentPoints > stats.maxTalentPoints) {
            errors.push(`Слишком много очков талантов: ${stats.totalTalentPoints}/${stats.maxTalentPoints}`);
        }

        if (stats.totalMilestonePoints > stats.maxMilestonePoints) {
            errors.push(`Слишком много очков вех: ${stats.totalMilestonePoints}/${stats.maxMilestonePoints}`);
        }

        // Проверяем требования талантов
        for (const [talentId, level] of Object.entries(this.selectedTalents)) {
            const talent = this.findTalentById(talentId);
            if (talent) {
                if (level > talent.max) {
                    errors.push(`Талант "${talent.name}" превышает максимальный уровень`);
                }
                
                if (!this.areTalentRequirementsMet(talentId)) {
                    errors.push(`Не выполнены требования для таланта "${talent.name}"`);
                }
            }
        }

        // Проверяем требования вех
        for (const milestoneId of Object.keys(this.selectedMilestones)) {
            if (!this.areMilestoneRequirementsMet(milestoneId)) {
                const milestone = this.findMilestoneById(milestoneId);
                if (milestone) {
                    errors.push(`Не выполнены требования для вехи "${milestone.name}"`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: errors.length === 0 ? ['✅ Билд валиден!'] : []
        };
    },

    findTalentById(talentId) {
        if (!this.currentClass) return null;
        
        const classData = classesData[this.currentClass];
        for (const rowData of classData.talents) {
            for (const talent of rowData.talents) {
                if (talent.id === talentId) {
                    return talent;
                }
            }
        }
        return null;
    },

    findMilestoneById(milestoneId) {
        if (!this.currentClass || !milestonesData.classes[this.currentClass]) return null;
        
        for (const branch of milestonesData.classes[this.currentClass]) {
            for (const milestone of branch.milestones) {
                if (milestone.id === milestoneId) {
                    return milestone;
                }
            }
        }
        return null;
    },

    areTalentRequirementsMet(talentId) {
        const talent = this.findTalentById(talentId);
        if (!talent || !talent.req) return true;
        
        return talent.req.every(reqId => this.selectedTalents[reqId] > 0);
    },

    areMilestoneRequirementsMet(milestoneId) {
        const milestone = this.findMilestoneById(milestoneId);
        if (!milestone || !milestone.req) return true;
        
        return milestone.req.every(reqId => this.selectedMilestones[reqId]);
    }
};
