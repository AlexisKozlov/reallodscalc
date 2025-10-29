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
        
        // Активируем стартовые вехи
        if (milestonesData.classes[classId]) {
            milestonesData.classes[classId].forEach((milestone, index) => {
                this.selectedMilestones[`${classId}_${index}_4_4`] = true;
                this.milestonePoints++;
            });
        }
        
        // Обновляем UI
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderBranches();
        ui.updatePoints();
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
        
        classData.talents.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'talent-row';
            
            row.forEach(talent => {
                const talentDiv = document.createElement('div');
                talentDiv.className = 'talent';
                const currentLevel = this.selectedTalents[talent.id] || 0;
                const isLocked = talent.req.length > 0 && !talent.req.every(req => this.selectedTalents[req] > 0);
                
                if (currentLevel > 0) talentDiv.classList.add('active');
                if (isLocked) talentDiv.classList.add('locked');
                
                talentDiv.innerHTML = `
                    <div style="font-size: 16px; margin-bottom: 5px;">${talent.icon || '❓'}</div>
                    <div style="font-size: 9px; line-height: 1.1;">${talent.name}</div>
                    <div class="talent-level">${currentLevel}/${talent.max}</div>
                `;
                
                // Тултип
                const desc = talent.desc[Math.min(currentLevel, talent.desc.length - 1)];
                talentDiv.setAttribute('data-tooltip', `${talent.name}\n\n${desc}\n\nУровень: ${currentLevel}/${talent.max}`);
                
                talentDiv.addEventListener('mouseenter', ui.showTooltip.bind(ui));
                talentDiv.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
                talentDiv.addEventListener('click', () => this.toggleTalent(talent.id, talent.max, talent.req));
                
                rowDiv.appendChild(talentDiv);
            });
            
            talentBranch.appendChild(rowDiv);
        });
        
        container.appendChild(talentBranch);
        
        // Ветки вех
        milestoneData.forEach((milestone, milestoneIndex) => {
            const milestoneBranch = document.createElement('div');
            milestoneBranch.className = 'milestone-branch';
            milestoneBranch.innerHTML = `<h3>${milestone.name}</h3>`;
            
            milestoneBranch.setAttribute('data-tooltip', `${milestone.name}\n\n${milestone.desc}`);
            milestoneBranch.addEventListener('mouseenter', ui.showTooltip.bind(ui));
            milestoneBranch.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
            
            const grid = document.createElement('div');
            grid.className = 'milestone-grid';
            
            // Создаем сетку 9x9
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'milestone';
                    const cellId = `${this.currentClass}_${milestoneIndex}_${i}_${j}`;
                    const isStart = (i === 4 && j === 4);
                    const isDisabled = milestone.disabledCells.some(([x, y]) => x === i && y === j);
                    
                    if (isDisabled) {
                        cellDiv.classList.add('disabled');
                    } else if (isStart) {
                        cellDiv.classList.add('start');
                        cellDiv.classList.add('active');
                    } else if (this.selectedMilestones[cellId]) {
                        cellDiv.classList.add('active');
                    }
                    
                    const isLocked = !isStart && !isDisabled && !this.isMilestoneAvailable(milestoneIndex, i, j);
                    if (isLocked) cellDiv.classList.add('locked');
                    
                    cellDiv.setAttribute('data-tooltip', `Позиция: ${i+1},${j+1}\n\n${isStart ? 'Стартовая точка' : 'Веха'}`);
                    cellDiv.addEventListener('mouseenter', ui.showTooltip.bind(ui));
                    cellDiv.addEventListener('mouseleave', ui.hideTooltip.bind(ui));
                    
                    if (!isDisabled && !isLocked) {
                        cellDiv.addEventListener('click', () => this.toggleMilestone(cellId, i, j));
                    }
                    
                    grid.appendChild(cellDiv);
                }
            }
            
            milestoneBranch.appendChild(grid);
            container.appendChild(milestoneBranch);
        });
    },

    isMilestoneAvailable(milestoneIndex, row, col) {
        if (row === 4 && col === 4) return true;
        
        const neighbors = [
            [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ];
        
        return neighbors.some(([r, c]) => {
            return r >= 0 && r < 9 && c >= 0 && c < 9 && 
                   this.selectedMilestones[`${this.currentClass}_${milestoneIndex}_${r}_${c}`];
        });
    },

    toggleTalent(talentId, maxLevel, requirements) {
        if (this.talentPoints >= milestonesData.settings.maxTalentPoints) return;
        
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
    },

    toggleMilestone(milestoneId, row, col) {
        if (this.m
