// Results display function
function displayResults(response) {
    const resultsDiv = document.getElementById('results');
    const resultsContent = resultsDiv.querySelector('.results-content');
    
    if (!resultsDiv || !resultsContent) return;
    
    resultsDiv.style.display = 'block';

    if (response && response.status === 'success' && response.result) {
        try {
            const { disclaimer, analysis, educationalResources, meta } = response.result;
            
            // Check if the response has the expected structure
            if (!analysis || !analysis.possibleConditions) {
                throw new Error('Invalid response structure');
            }

            let html = `
                <div class="space-y-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <i class="fa-solid fa-circle-info text-blue-600 mt-1"></i>
                            <p class="text-blue-800 text-sm">${disclaimer}</p>
                        </div>
                    </div>
                    
                    <!-- Possible Conditions Section -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold flex items-center gap-2">
                            <i class="fa-solid fa-stethoscope text-blue-600"></i>
                            Possible Conditions
                        </h3>
                        <div class="grid gap-4">
                            ${analysis.possibleConditions.map(condition => `
                                <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div class="flex items-center justify-between mb-3">
                                        <h4 class="text-lg font-medium">${condition.condition}</h4>
                                        <span class="px-3 py-1 rounded-full text-sm ${
                                            condition.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 
                                            condition.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-green-100 text-green-800'
                                        }">
                                            <i class="fa-solid ${
                                                condition.riskLevel === 'High' ? 'fa-triangle-exclamation' : 
                                                condition.riskLevel === 'Medium' ? 'fa-circle-exclamation' : 
                                                'fa-circle-check'
                                            } mr-1"></i>
                                            ${condition.riskLevel} Risk
                                        </span>
                                    </div>
                                    <p class="text-gray-600 mb-3">${condition.description}</p>
                                    <div class="space-y-3">
                                        ${condition.commonSymptoms ? `
                                            <div>
                                                <span class="font-medium text-gray-700">Common Symptoms:</span>
                                                <div class="flex flex-wrap gap-2 mt-2">
                                                    ${condition.commonSymptoms.map(symptom => `
                                                        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">${symptom}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${condition.matchingSymptoms ? `
                                            <div>
                                                <span class="font-medium text-gray-700">Matching Symptoms:</span>
                                                <div class="flex flex-wrap gap-2 mt-2">
                                                    ${condition.matchingSymptoms.map(symptom => `
                                                        <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                            <i class="fa-solid fa-check-circle mr-1"></i>${symptom}
                                                        </span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                        ${condition.additionalInfo ? `
                                            <div class="pt-2">
                                                <span class="font-medium text-gray-700">Additional Information:</span>
                                                <p class="text-gray-600 mt-1">${condition.additionalInfo}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- General Advice Section -->
                    ${analysis.generalAdvice ? `
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold flex items-center gap-2">
                                <i class="fa-solid fa-clipboard-list text-blue-600"></i>
                                General Advice
                            </h3>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 class="font-medium mb-3 flex items-center gap-2 text-blue-700">
                                        <i class="fa-solid fa-list-check"></i>
                                        Recommended Actions
                                    </h4>
                                    <ul class="space-y-2">
                                        ${analysis.generalAdvice.recommendedActions.map(action => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-circle-check text-green-500 mt-1"></i>
                                                <span class="text-gray-600">${action}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                    ${analysis.generalAdvice.lifestyleConsiderations ? `
                                        <div class="mt-4">
                                            <h5 class="font-medium text-blue-700 mb-2">Lifestyle Considerations</h5>
                                            <ul class="space-y-2">
                                                ${analysis.generalAdvice.lifestyleConsiderations.map(consideration => `
                                                    <li class="flex items-start gap-2">
                                                        <i class="fa-solid fa-heart text-pink-500 mt-1"></i>
                                                        <span class="text-gray-600">${consideration}</span>
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                                ${analysis.generalAdvice.whenToSeekMedicalAttention ? `
                                    <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 class="font-medium mb-3 flex items-center gap-2 text-yellow-700">
                                            <i class="fa-solid fa-triangle-exclamation"></i>
                                            When to Seek Medical Attention
                                        </h4>
                                        <ul class="space-y-2">
                                            ${analysis.generalAdvice.whenToSeekMedicalAttention.map(advice => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-exclamation-circle text-red-500 mt-1"></i>
                                                    <span class="text-gray-600">${advice}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Educational Resources -->
                    ${educationalResources ? `
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold flex items-center gap-2">
                                <i class="fa-solid fa-book-medical text-blue-600"></i>
                                Educational Resources
                            </h3>
                            <div class="grid md:grid-cols-2 gap-4">
                                ${educationalResources.medicalTerminology ? `
                                    <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 class="font-medium mb-3 text-blue-700">Medical Terminology</h4>
                                        <div class="space-y-3">
                                            ${Object.entries(educationalResources.medicalTerminology).map(([term, definition]) => `
                                                <div>
                                                    <span class="font-medium text-blue-700">${term}:</span>
                                                    <p class="text-gray-600 mt-1">${definition}</p>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${educationalResources.preventiveMeasures ? `
                                    <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 class="font-medium mb-3 text-blue-700">Preventive Measures</h4>
                                        <ul class="space-y-2">
                                            ${educationalResources.preventiveMeasures.map(measure => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-shield-heart text-green-500 mt-1"></i>
                                                    <span class="text-gray-600">${measure}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                        ${educationalResources.reliableSources ? `
                                            <div class="mt-4">
                                                <h5 class="font-medium text-blue-700 mb-2">Reliable Sources</h5>
                                                <ul class="space-y-2">
                                                    ${educationalResources.reliableSources.map(source => `
                                                        <li class="flex items-start gap-2">
                                                            <i class="fa-solid fa-link text-blue-500 mt-1"></i>
                                                            <span class="text-gray-600">${source}</span>
                                                        </li>
                                                    `).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Meta Information -->
                    ${meta ? `
                        <div class="bg-gray-50 border rounded-lg p-4">
                            <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                                ${meta.confidenceLevel ? `
                                    <div class="flex items-center gap-1">
                                        <i class="fa-solid fa-chart-bar text-blue-600"></i>
                                        <span>Confidence Level: ${meta.confidenceLevel}</span>
                                    </div>
                                ` : ''}
                                ${meta.analysisType ? `
                                    <div class="flex items-center gap-1">
                                        <i class="fa-solid fa-clock text-blue-600"></i>
                                        <span>Analysis Type: ${meta.analysisType}</span>
                                    </div>
                                ` : ''}
                            </div>
                            ${meta.limitations ? `
                                <div class="mt-2 text-sm text-gray-500">
                                    <span class="font-medium">Limitations:</span>
                                    <ul class="list-disc list-inside mt-1">
                                        ${meta.limitations.map(limitation => `
                                            <li>${limitation}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
            resultsContent.innerHTML = html;
        } catch (error) {
            console.error('Error displaying results:', error);
            displayError(error);
        }
    } else {
        displayError('Analysis failed. Please try again.');
    }
}

// Error display function
function displayError(error) {
    const resultsDiv = document.getElementById('results');
    const resultsContent = resultsDiv.querySelector('.results-content');
    
    if (!resultsDiv || !resultsContent) return;
    
    resultsDiv.style.display = 'block';
    resultsContent.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                <div>
                    <h3 class="font-medium text-red-800">Error</h3>
                    <p class="text-red-700 mt-1">${error.message || 'An error occurred while processing your request'}</p>
                </div>
            </div>
        </div>
    `;
}

function displayMedicalInfo(result) {
    const resultsDiv = document.getElementById('medical-info-results');
    resultsDiv.innerHTML = `
        <div class="space-y-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-blue-800">${result.disclaimer}</p>
            </div>
            
            <div class="space-y-6">
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">${result.conditionInfo.name}</h3>
                    <p class="text-gray-600 mb-4">${result.conditionInfo.overview}</p>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-medium mb-2">Causes</h4>
                            <ul class="space-y-1">
                                ${result.conditionInfo.details.causes.map(cause => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-circle-dot text-blue-500 mt-1"></i>
                                        <span class="text-gray-600">${cause}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-medium mb-2">Risk Factors</h4>
                            <ul class="space-y-1">
                                ${result.conditionInfo.details.riskFactors.map(factor => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                        <span class="text-gray-600">${factor}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white border rounded-lg p-6 shadow-sm">
                        <h4 class="font-medium mb-3">Symptoms</h4>
                        <ul class="space-y-2">
                            ${result.conditionInfo.details.symptoms.map(symptom => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-circle-check text-green-500 mt-1"></i>
                                    <span class="text-gray-600">${symptom}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="bg-white border rounded-lg p-6 shadow-sm">
                        <h4 class="font-medium mb-3">Common Treatments</h4>
                        <ul class="space-y-2">
                            ${result.conditionInfo.details.commonTreatments.map(treatment => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-pills text-blue-500 mt-1"></i>
                                    <span class="text-gray-600">${treatment}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 class="font-medium mb-3">Educational Content</h4>
                    <div class="space-y-4">
                        <div>
                            <h5 class="font-medium text-sm text-gray-500 mb-2">Key Terms</h5>
                            ${Object.entries(result.educationalContent.keyTerms).map(([term, definition]) => `
                                <div class="mb-2">
                                    <span class="font-medium text-blue-700">${term}:</span>
                                    <span class="text-gray-600">${definition}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div>
                            <h5 class="font-medium text-sm text-gray-500 mb-2">Common Misconceptions</h5>
                            <ul class="space-y-1">
                                ${result.educationalContent.commonMisconceptions.map(misconception => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-ban text-red-500 mt-1"></i>
                                        <span class="text-gray-600">${misconception}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayHealthRecommendations(result) {
    const resultsDiv = document.getElementById('recommendations-results');
    resultsDiv.innerHTML = `
        <div class="space-y-6 mt-8">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-blue-800">${result.disclaimer}</p>
            </div>

            <div class="bg-white border rounded-lg p-6 shadow-sm">
                <h3 class="text-lg font-semibold mb-4">Health Assessment</h3>
                <p class="text-gray-600 mb-4">${result.healthAssessment.overview}</p>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-medium mb-2">Key Areas</h4>
                        <ul class="space-y-1">
                            ${result.healthAssessment.keyAreas.map(area => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-circle-dot text-blue-500 mt-1"></i>
                                    <span class="text-gray-600">${area}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-medium mb-2">Risk Factors</h4>
                        <ul class="space-y-1">
                            ${result.healthAssessment.riskFactors.map(factor => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                    <span class="text-gray-600">${factor}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 class="font-medium mb-3">Lifestyle Recommendations</h4>
                    <div class="space-y-4">
                        ${Object.entries(result.recommendations.lifestyle).map(([category, items]) => `
                            <div>
                                <h5 class="font-medium text-sm text-gray-500 mb-2">${category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                                <ul class="space-y-2">
                                    ${items.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-check text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 class="font-medium mb-3">Preventive Care</h4>
                    <div class="space-y-4">
                        ${Object.entries(result.recommendations.preventiveCare).map(([category, items]) => `
                            <div>
                                <h5 class="font-medium text-sm text-gray-500 mb-2">${category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                                <ul class="space-y-2">
                                    ${items.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-shield-heart text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="bg-white border rounded-lg p-6 shadow-sm">
                <h4 class="font-medium mb-3">Progress Tracking</h4>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h5 class="font-medium text-sm text-gray-500 mb-2">Short Term Goals</h5>
                        <ul class="space-y-2">
                            ${result.progressTracking.shortTermGoals.map(goal => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-flag text-green-500 mt-1"></i>
                                    <span class="text-gray-600">${goal}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div>
                        <h5 class="font-medium text-sm text-gray-500 mb-2">Long Term Goals</h5>
                        <ul class="space-y-2">
                            ${result.progressTracking.longTermGoals.map(goal => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-bullseye text-blue-500 mt-1"></i>
                                    <span class="text-gray-600">${goal}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateMedicalInfoHTML(result) {
    if (!result || !result.result) return '';

    const data = result.result;
    
    return `
        <div class="space-y-6">
            ${data.disclaimer ? `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-blue-800">${data.disclaimer}</p>
                </div>
            ` : ''}
            
            <div class="space-y-6">
                ${data.conditionInfo ? `
                    <div class="bg-white border rounded-lg p-6 shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">${data.conditionInfo.name || 'Medical Information'}</h3>
                        ${data.conditionInfo.overview ? `
                            <p class="text-gray-600 mb-4">${data.conditionInfo.overview}</p>
                        ` : ''}
                        
                        ${data.conditionInfo.details ? `
                            <div class="grid md:grid-cols-2 gap-6">
                                ${data.conditionInfo.details.causes ? `
                                    <div>
                                        <h4 class="font-medium mb-2">Causes</h4>
                                        <ul class="space-y-1">
                                            ${data.conditionInfo.details.causes.map(cause => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-circle-dot text-blue-500 mt-1"></i>
                                                    <span class="text-gray-600">${cause}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                
                                ${data.conditionInfo.details.riskFactors ? `
                                    <div>
                                        <h4 class="font-medium mb-2">Risk Factors</h4>
                                        <ul class="space-y-1">
                                            ${data.conditionInfo.details.riskFactors.map(factor => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                                    <span class="text-gray-600">${factor}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${data.conditionInfo && data.conditionInfo.details ? `
                    <div class="grid md:grid-cols-2 gap-6">
                        ${data.conditionInfo.details.symptoms ? `
                            <div class="bg-white border rounded-lg p-6 shadow-sm">
                                <h4 class="font-medium mb-3">Symptoms</h4>
                                <ul class="space-y-2">
                                    ${data.conditionInfo.details.symptoms.map(symptom => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-circle-check text-green-500 mt-1"></i>
                                            <span class="text-gray-600">${symptom}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${data.conditionInfo.details.commonTreatments ? `
                            <div class="bg-white border rounded-lg p-6 shadow-sm">
                                <h4 class="font-medium mb-3">Common Treatments</h4>
                                <ul class="space-y-2">
                                    ${data.conditionInfo.details.commonTreatments.map(treatment => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-pills text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${treatment}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${data.educationalContent ? `
                    <div class="bg-white border rounded-lg p-6 shadow-sm">
                        <h4 class="font-medium mb-3">Educational Content</h4>
                        <div class="space-y-4">
                            ${data.educationalContent.keyTerms ? `
                                <div>
                                    <h5 class="font-medium text-sm text-gray-500 mb-2">Key Terms</h5>
                                    ${Object.entries(data.educationalContent.keyTerms).map(([term, definition]) => `
                                        <div class="mb-2">
                                            <span class="font-medium text-blue-700">${term}:</span>
                                            <span class="text-gray-600">${definition}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${data.educationalContent.commonMisconceptions ? `
                                <div>
                                    <h5 class="font-medium text-sm text-gray-500 mb-2">Common Misconceptions</h5>
                                    <ul class="space-y-1">
                                        ${data.educationalContent.commonMisconceptions.map(misconception => `
                                            <li class="flex items-start gap-2">
                                                <i class="fa-solid fa-ban text-red-500 mt-1"></i>
                                                <span class="text-gray-600">${misconception}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateRecommendationsHTML(response) {
    if (!response || !response.result) return '';

    const data = response.result;
    
    return `
        <div class="space-y-6">
            ${data.disclaimer ? `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-blue-800">${data.disclaimer}</p>
                </div>
            ` : ''}

            ${data.healthAssessment ? `
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">Sağlık Değerlendirmesi</h3>
                    ${data.healthAssessment.overview ? `
                        <p class="text-gray-600 mb-4">${data.healthAssessment.overview}</p>
                    ` : ''}
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        ${data.healthAssessment.keyAreas ? `
                            <div>
                                <h4 class="font-medium mb-2">Önemli Alanlar</h4>
                                <ul class="space-y-1">
                                    ${data.healthAssessment.keyAreas.map(area => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-circle-dot text-blue-500 mt-1"></i>
                                            <span class="text-gray-600">${area}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${data.healthAssessment.riskFactors ? `
                            <div>
                                <h4 class="font-medium mb-2">Risk Faktörleri</h4>
                                <ul class="space-y-1">
                                    ${data.healthAssessment.riskFactors.map(factor => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-1"></i>
                                            <span class="text-gray-600">${factor}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${data.recommendations ? `
                <div class="grid md:grid-cols-2 gap-6">
                    ${data.recommendations.lifestyle ? `
                        <div class="bg-white border rounded-lg p-6 shadow-sm">
                            <h4 class="font-medium mb-4">Yaşam Tarzı Önerileri</h4>
                            <div class="space-y-4">
                                ${Object.entries(data.recommendations.lifestyle).map(([category, items]) => `
                                    <div>
                                        <h5 class="font-medium text-blue-700 mb-2">${
                                            category === 'diet' ? 'Beslenme' :
                                            category === 'exercise' ? 'Egzersiz' :
                                            category === 'sleep' ? 'Uyku' :
                                            category === 'stressManagement' ? 'Stres Yönetimi' : 
                                            category
                                        }</h5>
                                        <ul class="space-y-2">
                                            ${items.map(item => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-check text-green-500 mt-1"></i>
                                                    <span class="text-gray-600">${item}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${data.recommendations.preventiveCare ? `
                        <div class="bg-white border rounded-lg p-6 shadow-sm">
                            <h4 class="font-medium mb-4">Koruyucu Bakım</h4>
                            <div class="space-y-4">
                                ${Object.entries(data.recommendations.preventiveCare).map(([category, items]) => `
                                    <div>
                                        <h5 class="font-medium text-blue-700 mb-2">${
                                            category === 'screenings' ? 'Taramalar' :
                                            category === 'vaccinations' ? 'Aşılar' :
                                            category === 'regularCheckups' ? 'Düzenli Kontroller' :
                                            category
                                        }</h5>
                                        <ul class="space-y-2">
                                            ${items.map(item => `
                                                <li class="flex items-start gap-2">
                                                    <i class="fa-solid fa-shield-heart text-blue-500 mt-1"></i>
                                                    <span class="text-gray-600">${item}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${data.educationalResources ? `
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 class="font-medium mb-4">Eğitim Kaynakları</h4>
                    <div class="grid md:grid-cols-2 gap-6">
                        ${Object.entries(data.educationalResources).map(([category, items]) => `
                            <div>
                                <h5 class="font-medium text-blue-700 mb-2">${
                                    category === 'articles' ? 'Makaleler' :
                                    category === 'healthyLivingTips' ? 'Sağlıklı Yaşam İpuçları' :
                                    category === 'communityResources' ? 'Topluluk Kaynakları' :
                                    category
                                }</h5>
                                <ul class="space-y-2">
                                    ${items.map(item => `
                                        <li class="flex items-start gap-2">
                                            <i class="fa-solid fa-book text-purple-500 mt-1"></i>
                                            <span class="text-gray-600">${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${data.progressTracking ? `
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <h4 class="font-medium mb-4">İlerleme Takibi</h4>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-medium text-blue-700 mb-2">Kısa Vadeli Hedefler</h5>
                            <ul class="space-y-2">
                                ${data.progressTracking.shortTermGoals.map(goal => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-flag text-green-500 mt-1"></i>
                                        <span class="text-gray-600">${goal}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-medium text-blue-700 mb-2">Uzun Vadeli Hedefler</h5>
                            <ul class="space-y-2">
                                ${data.progressTracking.longTermGoals.map(goal => `
                                    <li class="flex items-start gap-2">
                                        <i class="fa-solid fa-bullseye text-blue-500 mt-1"></i>
                                        <span class="text-gray-600">${goal}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
} 