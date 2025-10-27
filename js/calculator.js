class TalentCalculator {
    constructor() {
        this.currentClass = null;
        this.selectedTalents = new Map();
        this.selectedMilestones = new Set();
        this.maxPoints = 71;
        this.currentPoints = 0;
    }

    selectClass(className) {
        this.currentClass = className;
        this.selectedTalents.clear();
        this.selectedMilestones.clear();
        this.currentPoints = 0;
        this.renderBranches();
        this.updateUI();
    }

    // Обработка талантов
    toggleTalent(talentId, branchKey, rowIndex, talentIndex) {
        if (!this.currentClass) return;

        const talent = classesData[this.currentClass].branches[branchKey].rows[rowIndex].talents[talentIndex];
        const currentLevel = this.selectedTalents.get(talentId) || 0;

        if (!this.checkTalentDependencies(talent)) {
            alert("Не выполнены требования для изучения этого таланта!");
            return;
        }

        if (currentLevel < talent.maxLevel && this.currentPoints < this.maxPoints) {
            this.selectedTalents.set(talentId, currentLevel + 1);
            this.currentPoints++;
        } else if (currentLevel > 0) {
            this.selectedTalents.set(talentId, currentLevel - 1);
            this.currentPoints--;
        }

        this.updateUI();
    }

    // Обработка вех
    toggleMilestone(milestoneId, branchKey, row, col) {
        if (!this.currentClass) return;

        const milestone = classesData[this.currentClass].branches[branchKey].grid[row][col];
        
        if (!this.checkMilestoneDependencies(milestone)) {
            alert("Не выполнены требования для активации этой вехи!");
            return;
        }

        if (this.selectedMilestones.has(milestoneId) && this.currentPoints > 0) {
            this.selectedMilestones.delete(milestoneId);
            this.currentPoints--;
        } else if (!this.selectedMilestones.has(milestoneId) && this.currentPoints < this.maxPoints) {
            this.selectedMilestones.add(milestoneId);
            this.currentPoints++;
        }

        this.updateUI();
    }

    checkTalentDependencies(talent) {
        if (!talent.dependencies || talent.dependencies.length === 0) {
            return true;
        }

        for (const depId of talent.dependencies) {
            const depLevel = this.selectedTalents.get(depId) || 0;
            if (depLevel === 0) {
                return false;
            }
        }
        return true;
    }

    checkMilestoneDependencies(milestone) {
        if (!milestone.dependencies || milestone.dependencies.length === 0) {
            return true;
        }

        for (const depId of milestone.dependencies) {
            if (!this.selectedMilestones.has(depId)) {
                return false;
            }
        }
        return true;
    }

    resetTalents() {
        this.selectedTalents.clear();
        this.selectedMilestones.clear();
        this.currentPoints = 0;
        this.updateUI();
    }

    exportBuild() {
        const build = {
            class: this.currentClass,
            talents: Object.fromEntries(this.selectedTalents),
            milestones: Array.from(this.selectedMilestones),
            points: this.currentPoints
        };
        return btoa(JSON.stringify(build));
    }

    importBuild(code) {
        try {
            const build = JSON.parse(atob(code));
            if (build.class) {
                this.currentClass = build.class;
                this.selectedTalents = new Map(Object.entries(build.talents || {}));
                this.selectedMilestones = new Set(build.milestones || []);
                this.currentPoints = build.points || 0;
                this.renderBranches();
                this.updateUI();
                return true;
            }
        } catch (e) {
            console.error("Ошибка импорта:", e);
        }
        return false;
    }

    renderBranches() {
        const container = document.querySelector('.talent-trees');
        container.innerHTML = '';

        if (!this.currentClass) return;

        const classData = classesData[this.currentClass];
        
        // Рендерим все 4 ветки
        Object.entries(classData.branches).forEach(([branchKey, branch]) => {
            const branchElement = document.createElement('div');
            branchElement.className = 'talent-branch';
            branchElement.innerHTML = `<h3>${branch.name}</h3>`;
            
            if (branch.type === 'talents') {
                branchElement.appendChild(this.renderTalentBranch(branch, branchKey));
            } else if (branch.type === 'milestone') {
                branchElement.appendChild(this.renderMilestoneBranch(branch, branchKey));
            }
            
            container.appendChild(branchElement);
        });
    }

    renderTalentBranch(branch, branchKey) {
        const container = document.createElement('div');
        container.className = 'talent-branch-container';

        branch.rows.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'talent-row';

            row.talents.forEach((talent, talentIndex) => {
                const talentElement = document.createElement('div');
                const currentLevel = this.selectedTalents.get(talent.id) || 0;
                const isActive = currentLevel > 0;
                const isLocked = !this.checkTalentDependencies(talent);

                talentElement.className = `talent-node ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
                talentElement.innerHTML = `
                    <div class="talent-icon">${talent.icon}</div>
                    <div class="talent-name">${talent.name}</div>
                    <div class="talent-level">${currentLevel}/${talent.maxLevel}</div>
                `;
                talentElement.title = `${talent.name}\n${talent.description}\nУровень: ${currentLevel}/${talent.maxLevel}`;
                
                talentElement.addEventListener('click', () => {
                    if (!isLocked) {
                        this.toggleTalent(talent.id, branchKey, rowIndex, talentIndex);
                    }
                });

                rowElement.appendChild(talentElement);
            });

            container.appendChild(rowElement);
        });

        return container;
    }

    renderMilestoneBranch(branch, branchKey) {
        const container = document.createElement('div');
        container.className = 'milestone-branch';

        branch.grid.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'milestone-row';

            row.forEach((milestone, colIndex) => {
                const cellElement = document.createElement('div');
                const isActive = this.selectedMilestones.has(milestone.id);
                const isLocked = !this.checkMilestoneDependencies(milestone);

                cellElement.className = `milestone-cell ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
                cellElement.title = `${milestone.name}\n${milestone.description}`;
                
                cellElement.addEventListener('click', () => {
                    if (!isLocked) {
                        this.toggleMilestone(milestone.id, branchKey, rowIndex, colIndex);
                    }
                });

                rowElement.appendChild(cellElement);
            });

            container.appendChild(rowElement);
        });

        return container;
    }

    updateUI() {
        document.getElementById('current-points').textContent = this.currentPoints;
        
        if (this.currentClass) {
            document.getElementById('build-code').value = this.exportBuild();
        }
        
        this.renderBranches();
    }
}
