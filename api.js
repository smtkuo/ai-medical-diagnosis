// API Configuration
const API_CONFIG = {
    baseUrl: 'https://ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com',
    endpoints: {
        analyze: '/analyzeSymptomsAndDiagnose',
        medicalInfo: '/getMedicalInformation',
        recommendations: '/getHealthRecommendations'
    }
};

// API Request Function
function makeApiRequest(data) {
    return new Promise((resolve, reject) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            reject(new Error('API key not found. Please enter and save your API key.'));
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener('readystatechange', function () {
            if (this.readyState === this.DONE) {
                try {
                    const response = JSON.parse(this.responseText);
                    if (response.status === 'success') {
                        StateManager.updateState('responses', 'diagnosis', response);
                        displayResults(response);
                    }
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            }
        });

        // Update state with current form values before making request
        const formData = {
            symptoms: data.symptoms,
            age: data.age,
            gender: data.gender,
            height: data.height,
            weight: data.weight,
            medicalHistory: data.medicalHistory,
            currentMedications: data.currentMedications,
            allergies: data.allergies,
            smoking: data.smoking,
            alcohol: data.alcohol,
            exercise: data.exercise,
            diet: data.diet,
            language: data.language
        };

        Object.entries(formData).forEach(([key, value]) => {
            StateManager.updateState('inputs', key, value);
        });

        xhr.addEventListener('error', function (error) {
            reject(error);
        });

        xhr.open('POST', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}?noqueue=1`);
        xhr.setRequestHeader('x-rapidapi-key', apiKey);
        xhr.setRequestHeader('x-rapidapi-host', 'ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send(JSON.stringify(data));
    });
}

// Save API key
function saveApiKey() {
    const apiKeyInput = document.querySelector('input[type="password"]');
    if (!apiKeyInput) return;
    
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        // Update both localStorage and state
        localStorage.setItem('rapidApiKey', apiKey);
        StateManager.updateState('inputs', 'apiKey', apiKey);
        showNotification('API key saved successfully', 'success');
    } else {
        showNotification('Please enter a valid API key', 'error');
    }
}

// Get API key - helper function to get the current API key
function getApiKey() {
    // Try to get from state first (URL hash), then localStorage
    return StateManager.getState().inputs.apiKey || localStorage.getItem('rapidApiKey');
}

// API Functions
async function searchMedicalInfo() {
    const apiKey = getApiKey();
    if (!apiKey) {
        showNotification('Please enter and save your API key first', 'error');
        return;
    }

    const condition = document.getElementById('condition-input').value.trim();
    const selectedLanguage = document.getElementById('language-selector').value;
    
    if (!condition) {
        showNotification('Please enter a medical condition', 'error');
        return;
    }

    document.getElementById('medical-info-results').innerHTML = `
        <div class="flex justify-center items-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    `;

    try {
        setLoading(true, 'medical-info-results');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.medicalInfo}?noqueue=1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com'
            },
            body: JSON.stringify({
                condition,
                lang: selectedLanguage
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'An error occurred while fetching medical information');
        }
        
        if (result.status === 'success' && result.result) {
            StateManager.updateState('responses', 'medicalInfo', result);
            const html = `
                <div class="space-y-6">
                    <!-- Disclaimer -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <i class="fa-solid fa-circle-info text-blue-600 mt-1"></i>
                            <p class="text-blue-800 text-sm">${result.result.disclaimer}</p>
                        </div>
                    </div>

                    <!-- Condition Information -->
                    <div class="bg-white border rounded-lg p-6 space-y-4">
                        <h3 class="text-xl font-semibold flex items-center gap-2">
                            <i class="fa-solid fa-stethoscope text-blue-600"></i>
                            ${result.result.conditionInfo.name}
                        </h3>
                        <p class="text-gray-700">${result.result.conditionInfo.overview}</p>
                        
                        <!-- Medical Classification -->
                        <div class="grid md:grid-cols-3 gap-4 pt-4">
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <span class="text-sm font-medium text-gray-600">Category:</span>
                                <p class="text-gray-800">${result.result.conditionInfo.medicalClassification.category}</p>
                            </div>
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <span class="text-sm font-medium text-gray-600">Type:</span>
                                <p class="text-gray-800">${result.result.conditionInfo.medicalClassification.type}</p>
                            </div>
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <span class="text-sm font-medium text-gray-600">System:</span>
                                <p class="text-gray-800">${result.result.conditionInfo.medicalClassification.system}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Information -->
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="bg-white border rounded-lg p-6 space-y-4">
                            <h4 class="font-medium text-gray-900">Causes & Risk Factors</h4>
                            <div class="space-y-4">
                                <div>
                                    <h5 class="text-blue-700 font-medium mb-2">Causes:</h5>
                                    <ul class="space-y-2">
                                        ${result.result.conditionInfo.details.causes.map(cause => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-circle-dot text-blue-500 mt-1"></i>
                                                <span class="text-gray-600">${cause}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div>
                                    <h5 class="text-blue-700 font-medium mb-2">Risk Factors:</h5>
                                    <ul class="space-y-2">
                                        ${result.result.conditionInfo.details.riskFactors.map(factor => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                                <span class="text-gray-600">${factor}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white border rounded-lg p-6 space-y-4">
                            <h4 class="font-medium text-gray-900">Symptoms & Treatments</h4>
                            <div class="space-y-4">
                                <div>
                                    <h5 class="text-blue-700 font-medium mb-2">Common Symptoms:</h5>
                                    <ul class="space-y-2">
                                        ${result.result.conditionInfo.details.symptoms.map(symptom => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-notes-medical text-red-500 mt-1"></i>
                                                <span class="text-gray-600">${symptom}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div>
                                    <h5 class="text-blue-700 font-medium mb-2">Common Treatments:</h5>
                                    <ul class="space-y-2">
                                        ${result.result.conditionInfo.details.commonTreatments.map(treatment => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-pills text-green-500 mt-1"></i>
                                                <span class="text-gray-600">${treatment}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Educational Content -->
                    <div class="bg-white border rounded-lg p-6 space-y-4">
                        <h4 class="font-medium text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-book-medical text-blue-600"></i>
                            Educational Content
                        </h4>
                        
                        <!-- Key Terms -->
                        <div class="space-y-3">
                            <h5 class="text-blue-700 font-medium">Key Terms:</h5>
                            ${Object.entries(result.result.educationalContent.keyTerms).map(([term, definition]) => `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <span class="font-medium text-gray-800">${term}:</span>
                                    <p class="text-gray-600 mt-1">${definition}</p>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Common Misconceptions -->
                        <div class="space-y-2">
                            <h5 class="text-blue-700 font-medium">Common Misconceptions:</h5>
                            <ul class="space-y-2">
                                ${result.result.educationalContent.commonMisconceptions.map(misconception => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-ban text-red-500 mt-1"></i>
                                        <span class="text-gray-600">${misconception}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Latest Research -->
                        <div class="space-y-2">
                            <h5 class="text-blue-700 font-medium">Latest Research:</h5>
                            <ul class="space-y-2">
                                ${result.result.educationalContent.latestResearch.map(research => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-microscope text-purple-500 mt-1"></i>
                                        <span class="text-gray-600">${research}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <!-- References -->
                    <div class="bg-gray-50 border rounded-lg p-6 space-y-4">
                        <h4 class="font-medium text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-bookmark text-blue-600"></i>
                            References
                        </h4>
                        <div class="grid md:grid-cols-3 gap-6">
                            <div>
                                <h5 class="text-blue-700 font-medium mb-2">Medical Journals:</h5>
                                <ul class="space-y-2">
                                    ${result.result.references.medicalJournals.map(journal => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-file-medical text-gray-500 mt-1"></i>
                                            <span class="text-gray-600">${journal}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-blue-700 font-medium mb-2">Health Organizations:</h5>
                                <ul class="space-y-2">
                                    ${result.result.references.healthOrganizations.map(org => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-hospital text-gray-500 mt-1"></i>
                                            <span class="text-gray-600">${org}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div>
                                <h5 class="text-blue-700 font-medium mb-2">Further Reading:</h5>
                                <ul class="space-y-2">
                                    ${result.result.references.furtherReading.map(reading => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-book text-gray-500 mt-1"></i>
                                            <span class="text-gray-600">${reading}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('medical-info-results').innerHTML = html;
            showNotification('Medical information retrieved successfully', 'success');
        } else if (result.status === 'processing') {
            throw new Error('Please wait, your request is being processed...');
        } else {
            throw new Error(result.message || 'Failed to get medical information');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
        document.getElementById('medical-info-results').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <i class="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                    <div>
                        <h3 class="font-medium text-red-800">Error</h3>
                        <p class="text-red-700 mt-1">${error.message}</p>
                        ${error.message.includes('processing') ? '<p class="text-gray-600 mt-2">The system is processing your request. Please try again in a few moments.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
    } finally {
        setLoading(false, 'medical-info-results');
    }
}

async function getHealthRecommendations() {
    const apiKey = getApiKey();
    if (!apiKey) {
        showNotification('Please enter and save your API key first', 'error');
        return;
    }

    const selectedLanguage = document.getElementById('language-selector').value;
    const data = {
        activityLevel: document.getElementById('activity-level').value,
        sleepHours: parseInt(document.getElementById('sleep-hours').value),
        stressLevel: document.getElementById('stress-level').value,
        exerciseFrequency: document.getElementById('exercise-frequency').value,
        familyHistory: {
            diabetes: document.getElementById('family-diabetes').checked,
            heartDisease: document.getElementById('family-heart-disease').checked,
            cancer: document.getElementById('family-cancer').checked
        },
        vitals: {
            bloodPressure: document.getElementById('blood-pressure').value,
            heartRate: parseInt(document.getElementById('heart-rate').value),
            bloodSugar: parseInt(document.getElementById('blood-sugar').value)
        },
        healthGoals: {
            weightManagement: document.getElementById('goal-weight').checked,
            stressReduction: document.getElementById('goal-stress').checked,
            improveBloodPressure: document.getElementById('goal-bp').checked,
            preventDiabetes: document.getElementById('goal-diabetes').checked,
            increaseFitness: document.getElementById('goal-fitness').checked
        },
        lang: selectedLanguage
    };

    // Update state with current form values
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                StateManager.updateState('inputs', `${key}.${subKey}`, subValue);
            });
        } else {
            StateManager.updateState('inputs', key, value);
        }
    });

    document.getElementById('recommendations-results').innerHTML = `
        <div class="flex justify-center items-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    `;

    try {
        setLoading(true, 'recommendations-results');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recommendations}?noqueue=1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'An error occurred while fetching recommendations');
        }

        if (result.status === 'success' && result.result) {
            StateManager.updateState('responses', 'recommendations', result);
            const html = `
                <div class="space-y-6">
                    <!-- Disclaimer -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <i class="fa-solid fa-circle-info text-blue-600 mt-1"></i>
                            <p class="text-blue-800 text-sm">${result.result.disclaimer}</p>
                        </div>
                    </div>

                    <!-- Health Assessment -->
                    <div class="bg-white border rounded-lg p-6 space-y-4">
                        <h3 class="text-xl font-semibold flex items-center gap-2">
                            <i class="fa-solid fa-heart-pulse text-blue-600"></i>
                            Health Assessment
                        </h3>
                        <p class="text-gray-700">${result.result.healthAssessment.overview}</p>

                        <!-- Key Areas -->
                        <div class="space-y-2">
                            <h4 class="font-medium text-gray-700">Key Areas:</h4>
                            <div class="flex flex-wrap gap-2">
                                ${result.result.healthAssessment.keyAreas.map(area => `
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        ${area}
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Risk Factors -->
                        <div class="space-y-2">
                            <h4 class="font-medium text-gray-700">Risk Factors:</h4>
                            <ul class="space-y-2">
                                ${result.result.healthAssessment.riskFactors.map(risk => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                        <span class="text-gray-600">${risk}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Lifestyle Recommendations -->
                        <div class="bg-white border rounded-lg p-6 space-y-4">
                            <h4 class="font-medium text-gray-900">Lifestyle Recommendations</h4>
                            
                            <!-- Diet -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Diet</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.lifestyle.diet.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-utensils text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Exercise -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Exercise</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.lifestyle.exercise.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-dumbbell text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Sleep -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Sleep</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.lifestyle.sleep.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-moon text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Stress Management -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Stress Management</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.lifestyle.stressManagement.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-spa text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>

                        <!-- Preventive Care -->
                        <div class="bg-white border rounded-lg p-6 space-y-4">
                            <h4 class="font-medium text-gray-900">Preventive Care</h4>

                            <!-- Screenings -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Recommended Screenings</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.preventiveCare.screenings.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-microscope text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Vaccinations -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Vaccinations</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.preventiveCare.vaccinations.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-syringe text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Regular Checkups -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium mb-2">Regular Checkups</h5>
                                <ul class="space-y-2">
                                    ${result.result.recommendations.preventiveCare.regularCheckups.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-calendar-check text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Educational Resources -->
                    <div class="bg-white border rounded-lg p-6 space-y-4">
                        <h4 class="font-medium text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-book-medical text-blue-600"></i>
                            Educational Resources
                        </h4>

                        <div class="grid md:grid-cols-3 gap-6">
                            <!-- Articles -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Recommended Articles</h5>
                                <ul class="space-y-2">
                                    ${result.result.educationalResources.articles.map(article => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-file-lines text-gray-500 mt-1"></i>
                                            <span class="text-gray-600">${article}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Healthy Living Tips -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Healthy Living Tips</h5>
                                <ul class="space-y-2">
                                    ${result.result.educationalResources.healthyLivingTips.map(tip => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-lightbulb text-yellow-500 mt-1"></i>
                                            <span class="text-gray-600">${tip}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Community Resources -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Community Resources</h5>
                                <ul class="space-y-2">
                                    ${result.result.educationalResources.communityResources.map(resource => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-users text-purple-500 mt-1"></i>
                                            <span class="text-gray-600">${resource}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Tracking -->
                    <div class="bg-white border rounded-lg p-6 space-y-4">
                        <h4 class="font-medium text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-chart-line text-blue-600"></i>
                            Progress Tracking
                        </h4>

                        <div class="grid md:grid-cols-3 gap-6">
                            <!-- Short Term Goals -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Short Term Goals</h5>
                                <ul class="space-y-2">
                                    ${result.result.progressTracking.shortTermGoals.map(goal => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-flag text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${goal}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Long Term Goals -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Long Term Goals</h5>
                                <ul class="space-y-2">
                                    ${result.result.progressTracking.longTermGoals.map(goal => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-bullseye text-red-500 mt-1"></i>
                                            <span class="text-gray-600">${goal}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <!-- Monitoring Metrics -->
                            <div class="space-y-2">
                                <h5 class="text-blue-700 font-medium">Monitoring Metrics</h5>
                                <ul class="space-y-2">
                                    ${result.result.progressTracking.monitoringMetrics.map(metric => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-gauge text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${metric}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('recommendations-results').innerHTML = html;
            showNotification('Health recommendations retrieved successfully', 'success');
        } else if (result.status === 'processing') {
            throw new Error('Please wait, your request is being processed...');
        } else {
            throw new Error(result.message || 'Failed to get recommendations');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
        document.getElementById('recommendations-results').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <i class="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                    <div>
                        <h3 class="font-medium text-red-800">Error</h3>
                        <p class="text-red-700 mt-1">${error.message}</p>
                        ${error.message.includes('processing') ? '<p class="text-gray-600 mt-2">The system is processing your request. Please try again in a few moments.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
    } finally {
        setLoading(false, 'recommendations-results');
    }
}

// Helper Functions
function calculateBMI() {
    const weight = parseInt(document.getElementById('weight-input').value);
    const height = parseInt(document.getElementById('height-input').value);
    if (weight && height) {
        return ((weight / (height * height)) * 10000).toFixed(1);
    }
    return null;
} 