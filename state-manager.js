// API Key Management
function getApiKeyFromHash() {
    try {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const params = new URLSearchParams(atob(hash));
            return params.get('apiKey');
        }
    } catch (error) {
        console.error('Error getting API key from hash:', error);
    }
    return null;
}

function setApiKeyInHash(apiKey) {
    try {
        const currentHash = window.location.hash.slice(1);
        let params;
        if (currentHash) {
            params = new URLSearchParams(atob(currentHash));
        } else {
            params = new URLSearchParams();
        }
        params.set('apiKey', apiKey);
        const newHash = btoa(params.toString());
        window.location.hash = newHash;
    } catch (error) {
        console.error('Error setting API key in hash:', error);
    }
}

function getApiKeyFromStorage() {
    return localStorage.getItem('rapidApiKey');
}

function setApiKeyInStorage(apiKey) {
    localStorage.setItem('rapidApiKey', apiKey);
}

function initializeApiKey() {
    const hashKey = getApiKeyFromHash();
    const storageKey = getApiKeyFromStorage();
    const apiKeyInput = document.querySelector('input[type="password"]');
    
    if (apiKeyInput) {
        if (hashKey) {
            apiKeyInput.value = hashKey;
            setApiKeyInStorage(hashKey);
        } else if (storageKey) {
            apiKeyInput.value = storageKey;
            setApiKeyInHash(storageKey);
        }
    }
}

// State object to hold all form inputs and API responses
const state = {
    inputs: {
        symptoms: [],
        age: '',
        gender: '',
        height: '',
        weight: '',
        medicalHistory: [],
        currentMedications: [],
        allergies: [],
        smoking: '',
        alcohol: '',
        exercise: '',
        diet: '',
        activityLevel: '',
        sleepHours: '',
        stressLevel: '',
        exerciseFrequency: '',
        familyHistory: {
            diabetes: false,
            heartDisease: false,
            cancer: false
        },
        vitals: {
            bloodPressure: '',
            heartRate: '',
            bloodSugar: ''
        },
        healthGoals: {
            weightManagement: false,
            stressReduction: false,
            improveBloodPressure: false,
            preventDiabetes: false,
            increaseFitness: false
        },
        language: 'English',
        medicalInfoInput: '',
        medicalInfoSearch: '',
        conditionInput: '',
        healthRecommendations: {
            age: '',
            gender: '',
            weight: '',
            height: '',
            activityLevel: '',
            dietaryPreferences: '',
            healthConcerns: [],
            currentMedications: [],
            allergies: [],
            sleepPattern: '',
            stressLevel: '',
            goals: [],
            sleepHours: '',
            exerciseFrequency: '',
            familyHistory: {
                diabetes: false,
                heartDisease: false,
                cancer: false
            },
            vitals: {
                bloodPressure: '',
                heartRate: '',
                bloodSugar: ''
            },
            healthGoals: {
                weightManagement: false,
                stressReduction: false,
                improveBloodPressure: false,
                preventDiabetes: false,
                increaseFitness: false
            }
        }
    },
    responses: {
        diagnosis: null,
        medicalInfo: null,
        recommendations: null,
        analysisResults: null,
        healthRecommendationsResponse: null
    },
    ui: {
        activeTab: 'symptom-analysis' // Default tab
    }
};

// Function to update state and URL
function updateState(category, field, value) {
    if (category === 'inputs') {
        if (typeof field === 'string' && field.includes('.')) {
            const [parent, child] = field.split('.');
            state.inputs[parent][child] = value;
        } else {
            state.inputs[field] = value;
        }
    } else if (category === 'responses') {
        state.responses[field] = value;
        // Show the results when response is updated
        if (field === 'diagnosis' && value) {
            displayResults(value);
            document.getElementById('results').style.display = 'block';
        } else if (field === 'medicalInfo' && value) {
            document.getElementById('medical-info-results').innerHTML = generateMedicalInfoHTML(value);
        } else if (field === 'recommendations' && value) {
            document.getElementById('recommendations-results').innerHTML = generateRecommendationsHTML(value);
        } else if (field === 'analysisResults' && value) {
            displayResults(value);
            document.getElementById('results').style.display = 'block';
        } else if (field === 'healthRecommendationsResponse' && value) {
            document.getElementById('health-recommendations-results').innerHTML = generateHealthRecommendationsHTML(value);
        }
    } else if (category === 'ui') {
        state.ui[field] = value;
        if (field === 'activeTab') {
            updateTabUI(value);
        }
    }
    updateURL();
}

// Function to update URL with base64 encoded state
function updateURL() {
    try {
        const stateStr = JSON.stringify(state);
        const base64State = btoa(encodeURIComponent(stateStr));
        const newURL = window.location.pathname + '#' + base64State;
        window.history.replaceState(null, '', newURL);
    } catch (error) {
        console.error('Error updating URL:', error);
    }
}

// Function to load state from URL
function loadStateFromURL() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        try {
            const stateStr = decodeURIComponent(atob(hash));
            const loadedState = JSON.parse(stateStr);
            
            // Deep merge the loaded state
            Object.keys(loadedState).forEach(category => {
                if (category === 'inputs') {
                    // Special handling for tag arrays
                    const tagFields = ['symptoms', 'medicalHistory', 'currentMedications', 'allergies'];
                    tagFields.forEach(field => {
                        if (Array.isArray(loadedState.inputs[field])) {
                            state.inputs[field] = [...loadedState.inputs[field]];
                        }
                    });
                    
                    // Handle other input fields
                    Object.keys(loadedState.inputs).forEach(key => {
                        if (!tagFields.includes(key)) {
                            if (typeof loadedState.inputs[key] === 'object' && loadedState.inputs[key] !== null) {
                                state.inputs[key] = { ...state.inputs[key], ...loadedState.inputs[key] };
                            } else {
                                state.inputs[key] = loadedState.inputs[key];
                            }
                        }
                    });
                } else if (category === 'responses') {
                    // For responses, directly assign to preserve response structure
                    state[category] = loadedState[category];
                } else {
                    // For other objects, merge them
                    state[category] = {
                        ...state[category],
                        ...loadedState[category]
                    };
                }
            });

            // After loading state, ensure all form fields are populated
            populateFormFields();
            
            // Display any saved responses
            displaySavedResponses();
            
            return true;
        } catch (error) {
            console.error('Error loading state from URL:', error);
            return false;
        }
    }
    return false;
}

// Function to populate form fields from state
function populateFormFields() {
    // Populate tag fields from state
    const tagFields = [
        { containerId: 'selected-symptoms', stateKey: 'symptoms', inputId: 'symptoms-input' },
        { containerId: 'selected-medical-history', stateKey: 'medicalHistory', inputId: 'medical-history-input' },
        { containerId: 'selected-medications', stateKey: 'currentMedications', inputId: 'medications-input' },
        { containerId: 'selected-allergies', stateKey: 'allergies', inputId: 'allergies-input' }
    ];

    tagFields.forEach(({ containerId, stateKey, inputId }) => {
        const container = document.getElementById(containerId);
        const tags = state.inputs[stateKey];
        const input = document.getElementById(inputId);
        
        if (container && Array.isArray(tags) && tags.length > 0) {
            // Clear existing tags first
            container.innerHTML = '';
            
            // Add each tag from state
            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800';
                tagElement.innerHTML = `
                    <span class="tag-text">${tag}</span>
                    <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
                `;
                
                // Add remove event listener
                const removeButton = tagElement.querySelector('.remove-tag');
                removeButton.addEventListener('click', () => {
                    const tagText = tagElement.querySelector('.tag-text').textContent;
                    const updatedTags = state.inputs[stateKey].filter(t => t !== tagText);
                    updateState('inputs', stateKey, updatedTags);
                    tagElement.remove();
                });
                
                container.appendChild(tagElement);
            });
        }
        
        // Set up input event listener if not already set
        if (input && !input._hasTagListener) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    const value = input.value.trim();
                    const currentTags = state.inputs[stateKey] || [];
                    
                    if (!currentTags.includes(value)) {
                        const updatedTags = [...currentTags, value];
                        updateState('inputs', stateKey, updatedTags);
                        
                        const tagElement = document.createElement('span');
                        tagElement.className = 'tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800';
                        tagElement.innerHTML = `
                            <span class="tag-text">${value}</span>
                            <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
                        `;
                        
                        const removeButton = tagElement.querySelector('.remove-tag');
                        removeButton.addEventListener('click', () => {
                            const tagText = tagElement.querySelector('.tag-text').textContent;
                            const filteredTags = state.inputs[stateKey].filter(t => t !== tagText);
                            updateState('inputs', stateKey, filteredTags);
                            tagElement.remove();
                        });
                        
                        container.appendChild(tagElement);
                    }
                    input.value = '';
                }
            });
            input._hasTagListener = true;
        }
    });

    // Simple inputs
    const simpleInputs = {
        'age-input': 'age',
        'gender-input': 'gender',
        'height-input': 'height',
        'weight-input': 'weight',
        'smoking-input': 'smoking',
        'alcohol-input': 'alcohol',
        'exercise-input': 'exercise',
        'diet-input': 'diet',
        'activity-level': 'activityLevel',
        'sleep-hours': 'sleepHours',
        'stress-level': 'stressLevel',
        'exercise-frequency': 'exerciseFrequency',
        'blood-pressure': 'vitals.bloodPressure',
        'heart-rate': 'vitals.heartRate',
        'blood-sugar': 'vitals.bloodSugar',
        'language-selector': 'language',
        'medical-info-input': 'medicalInfoInput',
        'medical-info-search': 'medicalInfoSearch',
        'condition-input': 'conditionInput',
        // Health Recommendations inputs
        'hr-age-input': 'healthRecommendations.age',
        'hr-gender-input': 'healthRecommendations.gender',
        'hr-weight-input': 'healthRecommendations.weight',
        'hr-height-input': 'healthRecommendations.height',
        'hr-activity-level': 'healthRecommendations.activityLevel',
        'hr-dietary-preferences': 'healthRecommendations.dietaryPreferences',
        'hr-sleep-pattern': 'healthRecommendations.sleepPattern',
        'hr-stress-level': 'healthRecommendations.stressLevel',
        'hr-sleep-hours': 'healthRecommendations.sleepHours',
        'hr-exercise-frequency': 'healthRecommendations.exerciseFrequency',
        'hr-blood-pressure': 'healthRecommendations.vitals.bloodPressure',
        'hr-heart-rate': 'healthRecommendations.vitals.heartRate',
        'hr-blood-sugar': 'healthRecommendations.vitals.bloodSugar'
    };

    Object.entries(simpleInputs).forEach(([id, path]) => {
        const element = document.getElementById(id);
        if (element) {
            let value;
            if (path.includes('.')) {
                const [parent, child] = path.split('.');
                value = state.inputs[parent][child];
            } else {
                value = state.inputs[path];
            }
            if (value !== undefined && value !== null) {
                element.value = value;
            }
        }
    });

    // Event listeners for inputs
    const setupInputListener = (elementId, stateField) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = state.inputs[stateField];
            element.addEventListener('input', (e) => {
                updateState('inputs', stateField, e.target.value);
            });
        }
    };

    // Set up event listeners
    setupInputListener('language-selector', 'language');
    setupInputListener('medical-info-input', 'medicalInfoInput');
    setupInputListener('medical-info-search', 'medicalInfoSearch');
    setupInputListener('condition-input', 'conditionInput');

    // Checkboxes
    const checkboxes = {
        'family-diabetes': 'familyHistory.diabetes',
        'family-heart-disease': 'familyHistory.heartDisease',
        'family-cancer': 'familyHistory.cancer',
        'goal-weight': 'healthGoals.weightManagement',
        'goal-stress': 'healthGoals.stressReduction',
        'goal-bp': 'healthGoals.improveBloodPressure',
        'goal-diabetes': 'healthGoals.preventDiabetes',
        'goal-fitness': 'healthGoals.increaseFitness'
    };

    Object.entries(checkboxes).forEach(([id, path]) => {
        const element = document.getElementById(id);
        if (element) {
            const [parent, child] = path.split('.');
            element.checked = state.inputs[parent][child];
        }
    });

    // Health Recommendations arrays
    const healthConcernsContainer = document.getElementById('selected-health-concerns');
    if (healthConcernsContainer && state.inputs.healthRecommendations.healthConcerns.length > 0) {
        healthConcernsContainer.innerHTML = state.inputs.healthRecommendations.healthConcerns.map(concern => `
            <span class="tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <span class="tag-text">${concern}</span>
                <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
            </span>
        `).join('');
        setupTagRemovals();
    }

    const hrMedicationsContainer = document.getElementById('hr-selected-medications');
    if (hrMedicationsContainer && state.inputs.healthRecommendations.currentMedications.length > 0) {
        hrMedicationsContainer.innerHTML = state.inputs.healthRecommendations.currentMedications.map(med => `
            <span class="tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <span class="tag-text">${med}</span>
                <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
            </span>
        `).join('');
        setupTagRemovals();
    }

    const hrAllergiesContainer = document.getElementById('hr-selected-allergies');
    if (hrAllergiesContainer && state.inputs.healthRecommendations.allergies.length > 0) {
        hrAllergiesContainer.innerHTML = state.inputs.healthRecommendations.allergies.map(allergy => `
            <span class="tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <span class="tag-text">${allergy}</span>
                <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
            </span>
        `).join('');
        setupTagRemovals();
    }

    const goalsContainer = document.getElementById('selected-goals');
    if (goalsContainer && state.inputs.healthRecommendations.goals.length > 0) {
        goalsContainer.innerHTML = state.inputs.healthRecommendations.goals.map(goal => `
            <span class="tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <span class="tag-text">${goal}</span>
                <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
            </span>
        `).join('');
        setupTagRemovals();
    }

    // Health Recommendations checkboxes
    const hrCheckboxes = {
        'hr-family-diabetes': 'healthRecommendations.familyHistory.diabetes',
        'hr-family-heart-disease': 'healthRecommendations.familyHistory.heartDisease',
        'hr-family-cancer': 'healthRecommendations.familyHistory.cancer',
        'hr-goal-weight': 'healthRecommendations.healthGoals.weightManagement',
        'hr-goal-stress': 'healthRecommendations.healthGoals.stressReduction',
        'hr-goal-bp': 'healthRecommendations.healthGoals.improveBloodPressure',
        'hr-goal-diabetes': 'healthRecommendations.healthGoals.preventDiabetes',
        'hr-goal-fitness': 'healthRecommendations.healthGoals.increaseFitness'
    };

    // Set up checkbox event listeners
    Object.entries(hrCheckboxes).forEach(([id, path]) => {
        const element = document.getElementById(id);
        if (element) {
            const [parent, child, subChild] = path.split('.');
            const value = state.inputs[parent][child][subChild];
            element.checked = value;

            element.addEventListener('change', (e) => {
                updateState('inputs', path, e.target.checked);
            });
        }
    });

    // Set up input event listeners
    Object.entries(simpleInputs).forEach(([id, path]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                updateState('inputs', path, e.target.value);
            });
        }
    });

    // Display saved responses
    displaySavedResponses();

    // Set active tab
    if (state.ui.activeTab) {
        updateTabUI(state.ui.activeTab);
    }
}

// Function to display saved responses
function displaySavedResponses() {
    // Display diagnosis results
    if (state.responses.diagnosis) {
        displayResults(state.responses.diagnosis);
        document.getElementById('results').style.display = 'block';
    }
    
    // Display medical info results
    if (state.responses.medicalInfo) {
        const medicalInfoResults = document.getElementById('medical-info-results');
        if (medicalInfoResults) {
            medicalInfoResults.innerHTML = generateMedicalInfoHTML(state.responses.medicalInfo);
            medicalInfoResults.style.display = 'block';
        }
    }
    
    // Display recommendations results
    if (state.responses.recommendations) {
        const recommendationsResults = document.getElementById('recommendations-results');
        if (recommendationsResults) {
            recommendationsResults.innerHTML = generateRecommendationsHTML(state.responses.recommendations);
            recommendationsResults.style.display = 'block';
        }
    }
    
    // Display analysis results
    if (state.responses.analysisResults) {
        displayResults(state.responses.analysisResults);
        document.getElementById('results').style.display = 'block';
    }
    
    // Display health recommendations results
    if (state.responses.healthRecommendationsResponse) {
        const healthRecommendationsResults = document.getElementById('health-recommendations-results');
        if (healthRecommendationsResults) {
            healthRecommendationsResults.innerHTML = generateHealthRecommendationsHTML(state.responses.healthRecommendationsResponse);
            healthRecommendationsResults.style.display = 'block';
        }
    }
}

// Helper function to convert kebab-case to camelCase
function camelCase(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

// Event listener for input changes
function setupStateListeners() {
    // Tag input fields
    const tagInputs = {
        'symptoms-input': { stateKey: 'symptoms', container: 'selected-symptoms' },
        'medical-history-input': { stateKey: 'medicalHistory', container: 'selected-medical-history' },
        'medications-input': { stateKey: 'currentMedications', container: 'selected-medications' },
        'allergies-input': { stateKey: 'allergies', container: 'selected-allergies' }
    };

    // Set up tag input listeners
    Object.entries(tagInputs).forEach(([inputId, { stateKey, container }]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    const value = input.value.trim();
                    const currentTags = state.inputs[stateKey] || [];
                    
                    if (!currentTags.includes(value)) {
                        const updatedTags = [...currentTags, value];
                        updateState('inputs', stateKey, updatedTags);
                        
                        // Update UI
                        const containerElement = document.getElementById(container);
                        if (containerElement) {
                            const tagElement = document.createElement('span');
                            tagElement.className = 'tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800';
                            tagElement.innerHTML = `
                                <span class="tag-text">${value}</span>
                                <button type="button" class="remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1">&times;</button>
                            `;
                            
                            // Add remove event listener
                            const removeButton = tagElement.querySelector('.remove-tag');
                            removeButton.addEventListener('click', () => {
                                const tagText = tagElement.querySelector('.tag-text').textContent;
                                const filteredTags = state.inputs[stateKey].filter(t => t !== tagText);
                                updateState('inputs', stateKey, filteredTags);
                                tagElement.remove();
                            });
                            
                            containerElement.appendChild(tagElement);
                        }
                    }
                    input.value = '';
                }
            });
        }
    });

    // Listen for simple input changes
    const simpleInputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    simpleInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.id;
            if (id.includes('blood-') || id.includes('heart-')) {
                updateState('inputs', `vitals.${camelCase(id)}`, e.target.value);
            } else {
                updateState('inputs', camelCase(id), e.target.value);
            }
        });
    });

    // Listen for checkbox changes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.id;
            if (id.startsWith('family-')) {
                updateState('inputs', `familyHistory.${camelCase(id.replace('family-', ''))}`, e.target.checked);
            } else if (id.startsWith('goal-')) {
                updateState('inputs', `healthGoals.${camelCase(id.replace('goal-', ''))}`, e.target.checked);
            }
        });
    });

    // Listen for tab clicks
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            updateState('ui', 'activeTab', tabId);
        });
    });
}

// Function to update tab UI
function updateTabUI(activeTab) {
    const tabs = document.querySelectorAll('[data-tab]');
    const contents = document.querySelectorAll('[data-tab-content]');
    
    // Update tab button styles
    tabs.forEach(tab => {
        const isActive = tab.dataset.tab === activeTab;
        tab.classList.toggle('text-blue-600', isActive);
        tab.classList.toggle('border-b-2', isActive);
        tab.classList.toggle('border-blue-600', isActive);
        tab.classList.toggle('text-gray-600', !isActive);
        tab.classList.toggle('hover:text-gray-800', !isActive);
    });
    
    // Show/hide tab contents and their inner divs
    contents.forEach(content => {
        const isActiveContent = content.dataset.tabContent === activeTab;
        content.classList.toggle('hidden', !isActiveContent);
        
        // Show the inner content div based on the active tab
        if (isActiveContent) {
            if (activeTab === 'medical-information') {
                const medicalInfoDiv = document.getElementById('medical-info');
                if (medicalInfoDiv) {
                    medicalInfoDiv.style.display = 'block';
                }
            } else if (activeTab === 'health-recommendations') {
                const healthRecsDiv = document.getElementById('health-recommendations');
                if (healthRecsDiv) {
                    healthRecsDiv.style.display = 'block';
                }
            }
        }
    });
}

// Initialize state management
function initializeStateManager() {
    initializeApiKey();
    if (loadStateFromURL()) {
        // State was loaded successfully
        console.log('State loaded from URL');
    } else {
        // No state in URL or error loading state
        console.log('No state found in URL');
    }
    
    // Always populate form fields
    populateFormFields();
    
    // Set up event listeners
    setupStateListeners();
    
    // Set up input listeners for specific fields
    const setupInputListener = (elementId, stateField) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = state.inputs[stateField];
            element.addEventListener('input', (e) => {
                updateState('inputs', stateField, e.target.value);
            });
        }
    };

    // Initialize input listeners
    setupInputListener('language-selector', 'language');
    setupInputListener('medical-info-input', 'medicalInfoInput');
    setupInputListener('medical-info-search', 'medicalInfoSearch');
    setupInputListener('condition-input', 'conditionInput');
    
    // Initialize active tab
    if (state.ui.activeTab) {
        updateTabUI(state.ui.activeTab);
    } else {
        // Set default tab if none is active
        updateState('ui', 'activeTab', 'symptom-analysis');
    }
    
    // Display any saved responses
    displaySavedResponses();
}

// Export functions for use in other files
window.StateManager = {
    updateState,
    loadStateFromURL,
    initializeStateManager,
    getState: () => ({ ...state })
}; 