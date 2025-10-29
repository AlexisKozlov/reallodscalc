// УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
const ui = {
    currentTooltip: null,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Переключение режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Переключение вкладок редактора
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchEditorTab(e.target.dataset.tab);
            });
        });
    },

    switchMode(mode) {
        // Обновляем кнопки
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        // Обновляем контент
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${mode}Mode`).classList.add('active');

        if (mode === 'calculator') {
            calculator.renderBranches();
        }
    },

    switchEditorTab(tab) {
        // Обновляем вкладки
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Обновляем контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');
    },

    showTooltip(event) {
        this.hideTooltip();
        
        const tooltipText = event.target.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = (rect.left + window.scrollX) + 'px';
        tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
        
        this.currentTooltip = tooltip;
    },

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    },

    updatePoints() {
        document.getElementById('talentPoints').textContent = calculator.talentPoints;
        document.getElementById('milestonePoints').textContent = calculator.milestonePoints;
    },

    updateMaxPoints() {
        document.getElementById('maxTalentPoints').textContent = milestonesData.settings.maxTalentPoints;
        document.getElementById('maxMilestonePoints').textContent = milestonesData.settings.maxMilestonePoints;
    }
};

// Глобальные функции для HTML атрибутов
function switchMode(mode) {
    ui.switchMode(mode);
}
