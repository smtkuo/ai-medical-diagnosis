// Global helper functions for tag management
window.tagHelpers = {
    getSymptoms: () => {
        const container = document.getElementById('selected-symptoms');
        return Array.from(container.querySelectorAll('.tag-text')).map(span => span.textContent.trim());
    },
    getMedicalHistory: () => {
        const container = document.getElementById('selected-medical-history');
        return Array.from(container.querySelectorAll('.tag-text')).map(span => span.textContent.trim());
    },
    getMedications: () => {
        const container = document.getElementById('selected-medications');
        return Array.from(container.querySelectorAll('.tag-text')).map(span => span.textContent.trim());
    },
    getAllergies: () => {
        const container = document.getElementById('selected-allergies');
        return Array.from(container.querySelectorAll('.tag-text')).map(span => span.textContent.trim());
    },
    // Add update functions for each tag type
    updateTagState: (type, tags) => {
        const stateMapping = {
            'symptoms': 'symptoms',
            'medical-history': 'medicalHistory',
            'medications': 'currentMedications',
            'allergies': 'allergies'
        };
        const stateKey = stateMapping[type];
        if (stateKey) {
            StateManager.updateState('inputs', stateKey, tags);
        }
    }
};

// Tag Input Enhancement
function createTagInput(inputId, containerId, placeholder) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return null;

    const tags = new Set();
    const type = containerId.replace('selected-', '');

    // Initialize tags from state only (no default tags)
    const state = StateManager.getState();
    const stateMapping = {
        'symptoms': state.inputs.symptoms,
        'medical-history': state.inputs.medicalHistory,
        'medications': state.inputs.currentMedications,
        'allergies': state.inputs.allergies
    };

    const stateTags = stateMapping[type] || [];
    if (Array.isArray(stateTags)) {
        stateTags.forEach(tag => {
            if (tag) {
                tags.add(tag);
                addTagElement(tag, container, tags, type);
            }
        });
    }

    // Handle input events
    input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ',') && !e.isComposing) {
            e.preventDefault();
            const value = input.value.trim().toLowerCase();
            if (value && !tags.has(value)) {
                addTag(value, container, tags, type);
                input.value = '';
            }
        }
    });

    // Make container clickable to focus input
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            input.focus();
        }
    });

    return {
        getTags: () => Array.from(tags),
        addTag: (value) => addTag(value, container, tags, type),
        clear: () => {
            tags.clear();
            container.innerHTML = '';
            input.value = '';
            window.tagHelpers.updateTagState(type, []);
        }
    };
}

function addTag(value, container, tags, type) {
    if (!value || !container || !tags) return;

    tags.add(value);
    addTagElement(value, container, tags, type);
    
    // Update state
    window.tagHelpers.updateTagState(type, Array.from(tags));
}

function addTagElement(value, container, tags, type) {
    const tag = document.createElement('span');
    tag.className = 'tag inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800';
    
    const tagText = document.createElement('span');
    tagText.className = 'tag-text';
    tagText.textContent = value;
    
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-tag text-blue-600 hover:text-blue-800 transition-colors ml-1';
    removeButton.innerHTML = '&times;';
    
    // Add click handler for remove button
    removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        tags.delete(value);
        tag.remove();
        // Update state when tag is removed
        window.tagHelpers.updateTagState(type, Array.from(tags));
    });

    tag.appendChild(tagText);
    tag.appendChild(removeButton);
    container.appendChild(tag);
}

// Initialize tag inputs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tagContainers = ['selected-symptoms', 'selected-medical-history', 'selected-medications', 'selected-allergies'];
    
    tagContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            // Clear any existing tags first
            container.innerHTML = '';
            
            const type = containerId.replace('selected-', '');
            const inputId = `${type}-input`;
            createTagInput(inputId, containerId);
        }
    });
}); 