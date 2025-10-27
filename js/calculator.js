class TalentCalculator {
    constructor() {
        this.currentClass = null;
        this.selectedTalents = new Map(); // Map: talentId -> level
        this.maxPoints = 71;
        this.currentPoints = 0;
    }

    selectClass(className) {
        this.currentClass = className;
        this.selectedTalents.clear();
        this.currentPoints = 0;
        this.renderTalentTrees();
        this.updateUI();
    }

    toggleTalent(talentId, treeIndex, talentIndex) {
        if (!this.currentClass) return;

        const talent = classesData[this.currentClass].trees[treeIndex].talents[talentIndex];
        const currentLevel = this.selectedTalents.get(talentId) || 0;

        // Проверка зависимостей
        if (!this.checkDependencies(talent)) {
            alert("Не выполнены требования для изучения этого таланта!");
            return;
        }

        // Проверка очков
        if (currentLevel < talent.maxLevel && this.currentPoints < this.maxPoints) {
            this.selectedTalents.set(talentId, currentLevel + 1);
            this.currentPoints++;
        } else if (currentLevel > 0) {
            this.selectedTalents.set(talentId, currentLevel - 1);
            this.currentPoints--;
            
            // Проверяем зависимости других талантов
            this.checkDependentTalents();
        }

        this.updateUI();
    }

    checkDependencies(talent) {
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

    checkDependentTalents() {
        // Упрощенная проверка зависимостей
        // В реальной реализации нужно рекурсивно проверять все зависимости
    }

    resetTalents() {
        this.selectedTalents.clear();
        this.currentPoints = 0;
        this.updateUI();
    }

    exportBuild() {
        const build = {
            class: this.currentClass,
            talents: Object.fromEntries(this.selectedTalents),
            points: this.currentPoints
        };
        return btoa(JSON.stringify(build));
    }

    importBuild(code) {
        try {
            const build = JSON.parse(atob(code));
            if (build.class && build.talents) {
                this.currentClass = build.class;
                this.selectedTalents = new Map(Object.entries(build.talents));
                this.currentPoints = build.points || 0;
                this.renderTalentTrees();
                this.updateUI();
                return true;
            }
        } catch (e) {
            console.error("Ошибка импорта билда:", e);
        }
        return false;
    }

    renderTalentTrees() {
        const container = document.querySelector('.talent-trees');
        container.innerHTML = '';

        if (!this.currentClass) return;

        const classData = classesData[this.currentClass];
        
        classData.trees.forEach((tree, treeIndex) => {
            const treeElement = document.createElement('div');
            treeElement.className = 'talent-tree';
            treeElement.innerHTML = `
                <div class="talent-tree-header">
                    <h2>${tree.name}</h2>
                </div>
                <div class="talents-grid" id="tree-${treeIndex}">
                    <!-- Таланты будут добавлены через JS -->
                </div>
            `;

            const talentsGrid = treeElement.querySelector('.talents-grid');
            
            tree.talents.forEach((talent, talentIndex) => {
                const talentElement = document.createElement('div');
                const currentLevel = this.selectedTalents.get(talent.id) || 0;
                const isActive = currentLevel > 0;
                const isLocked = !this.checkDependencies(talent);

                talentElement.className = `talent ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
                talentElement.innerHTML = `
                    <span class="talent-icon">${talent.icon}</span>
                    <div class="talent-level">${currentLevel}/${talent.maxLevel}</div>
                `;
                talentElement.title = `${talent.name}\n${talent.description}\nТребуемый уровень: ${talent.requiredLevel}`;
                
                talentElement.addEventListener('click', () => {
                    if (!isLocked) {
                        this.toggleTalent(talent.id, treeIndex, talentIndex);
                    }
                });

                talentsGrid.appendChild(talentElement);
            });

            container.appendChild(treeElement);
        });
    }

    updateUI() {
        // Обновляем счетчик очков
        document.getElementById('current-points').textContent = this.currentPoints;
        
        // Обновляем код билда
        if (this.currentClass) {
            document.getElementById('build-code').value = this.exportBuild();
        }
        
        // Перерисовываем деревья талантов для обновления уровней
        this.renderTalentTrees();
    }
}
