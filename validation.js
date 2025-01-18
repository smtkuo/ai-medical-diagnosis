// Form Validation and UI Feedback
function validateForm() {
    const requiredFields = {
        'symptoms-input': { 
            message: 'Please enter at least one symptom', 
            type: 'tags', 
            validate: () => window.tagHelpers.getSymptoms().length > 0 
        },
        'age-input': { 
            message: 'Please enter your age', 
            type: 'number', 
            min: 0, 
            max: 120 
        },
        'gender-input': { 
            message: 'Please select your gender', 
            type: 'select' 
        },
        'height-input': { 
            message: 'Please enter your height', 
            type: 'number', 
            min: 0, 
            max: 300 
        },
        'weight-input': { 
            message: 'Please enter your weight', 
            type: 'number', 
            min: 0, 
            max: 500 
        }
    };

    let isValid = true;
    let errors = [];

    for (const [fieldId, validation] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;

        let isFieldValid = true;
        let errorMessage = validation.message;

        switch (validation.type) {
            case 'tags':
                isFieldValid = validation.validate();
                break;
            case 'number':
                const value = parseInt(field.value);
                isFieldValid = !isNaN(value) && value >= validation.min && value <= validation.max;
                if (!isFieldValid && !isNaN(value)) {
                    errorMessage = `Please enter a value between ${validation.min} and ${validation.max}`;
                }
                break;
            case 'select':
                isFieldValid = field.value !== '';
                break;
            default:
                isFieldValid = field.value.trim() !== '';
        }

        if (!isFieldValid) {
            isValid = false;
            errors.push(errorMessage);
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
    }

    // Show all validation errors in a single notification
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
    }

    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    field.classList.add('border-red-500');

    // Remove error styling after 3 seconds
    setTimeout(() => {
        clearFieldError(field);
    }, 3000);
}

function clearFieldError(field) {
    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('border-red-500');
}

// Form submission handler
async function handleFormSubmit() {
    if (!validateForm()) {
        return;
    }

    const apiKey = localStorage.getItem('rapidApiKey');
    if (!apiKey) {
        showNotification('Please enter and save your API key first', 'error');
        document.querySelector('input[type="password"]')?.focus();
        return;
    }

    const selectedLanguage = document.getElementById('language-selector').value;
    const data = {
        symptoms: window.tagHelpers.getSymptoms(),
        patientInfo: {
            age: parseInt(document.getElementById('age-input').value),
            gender: document.getElementById('gender-input').value,
            height: parseInt(document.getElementById('height-input').value),
            weight: parseInt(document.getElementById('weight-input').value),
            medicalHistory: window.tagHelpers.getMedicalHistory(),
            currentMedications: window.tagHelpers.getMedications(),
            allergies: window.tagHelpers.getAllergies(),
            lifestyle: {
                smoking: document.getElementById('smoking-input').value === 'true',
                alcohol: document.getElementById('alcohol-input').value,
                exercise: document.getElementById('exercise-input').value,
                diet: document.getElementById('diet-input').value
            }
        },
        lang: selectedLanguage
    };

    try {
        setLoading(true, 'analyze-button');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}?noqueue=1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'ai-medical-diagnosis-api-symptoms-to-results.p.rapidapi.com'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            // Save analysis results to state
            updateState('responses', 'analysisResults', result);
            displayResults(result);
            showNotification('Analysis completed successfully', 'success');
        } else {
            throw new Error(result.message || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
        displayError(error);
    } finally {
        setLoading(false, 'analyze-button');
    }
} 