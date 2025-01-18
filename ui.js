// Tab Management
function initializeTabs() {
    const tabs = document.querySelectorAll('#main-tabs button[data-tab]');
    const contents = {
        'symptom-analysis': document.getElementById('symptoms-form'),
        'medical-information': document.getElementById('medical-info'),
        'health-recommendations': document.getElementById('health-recommendations')
    };

    let activeTab = 'symptom-analysis';

    function switchTab(tabId) {
        // Remove active state from all tabs
        tabs.forEach(t => {
            t.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
            t.classList.add('text-gray-600', 'hover:text-gray-800');
        });

        // Add active state to clicked tab
        const selectedTab = document.querySelector(`button[data-tab="${tabId}"]`);
        if (selectedTab) {
            selectedTab.classList.remove('text-gray-600', 'hover:text-gray-800');
            selectedTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        }

        // Hide all content
        Object.values(contents).forEach(content => {
            if (content) content.style.display = 'none';
        });

        // Show corresponding content
        if (contents[tabId]) {
            contents[tabId].style.display = 'block';
        }

        activeTab = tabId;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = tab.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
            }
        });
    });

    // Initialize with first tab
    switchTab(activeTab);
}

// Loading State Management
function setLoading(isLoading, buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const loadingStates = {
        'medical-info-search': {
            default: '<i class="fa-solid fa-search mr-2"></i>Search',
            loading: '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Searching...'
        },
        'get-recommendations': {
            default: '<i class="fa-solid fa-clipboard-list mr-2"></i>Get Recommendations',
            loading: '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Getting Recommendations...'
        },
        'analyze-button': {
            default: '<i class="fa-solid fa-microscope mr-2"></i>Analyze Symptoms',
            loading: '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Analyzing...'
        }
    };

    const state = loadingStates[buttonId];
    if (state) {
        button.disabled = isLoading;
        button.innerHTML = isLoading ? state.loading : state.default;
        button.className = `w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all font-medium ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`;
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all transform translate-x-full z-50 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    
    // Ensure all inputs are enabled
    document.querySelectorAll('input, select').forEach(element => {
        element.removeAttribute('disabled');
    });

    // Add input validation listeners
    ['age-input', 'height-input', 'weight-input', 'gender-input'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', validateForm);
            element.addEventListener('blur', validateForm);
        }
    });

    // Initialize form submission
    const analyzeButton = document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', handleFormSubmit);
    }

    const recommendationsButton = document.getElementById('get-recommendations');
    if (recommendationsButton) {
        recommendationsButton.addEventListener('click', getHealthRecommendations);
    }

    // Load saved API key
    const savedApiKey = localStorage.getItem('rapidApiKey');
    if (savedApiKey) {
        const apiKeyInput = document.querySelector('input[type="password"]');
        if (apiKeyInput) {
            apiKeyInput.value = savedApiKey;
        }
    }
}); 