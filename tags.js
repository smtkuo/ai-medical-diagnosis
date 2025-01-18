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
    }
};

// Tag Input Enhancement
function createTagInput(inputId, containerId, placeholder) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return null;

    const tags = new Set();

    // Initialize existing tags
    container.querySelectorAll('.tag').forEach(tagElement => {
        const tagText = tagElement.querySelector('.tag-text')?.textContent.trim() || '';
        if (tagText) {
            tags.add(tagText);
            setupTagRemoval(tagElement, tagText, tags);
        }
    });

    // Handle input events
    input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ',') && !e.isComposing) {
            e.preventDefault();
            const value = input.value.trim().toLowerCase();
            if (value && !tags.has(value)) {
                addTag(value, container, tags);
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
        addTag: (value) => addTag(value, container, tags),
        clear: () => {
            tags.clear();
            container.innerHTML = '';
            input.value = '';
        }
    };
}

function addTag(value, container, tags) {
    if (!value || !container || !tags) return;

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
    });

    tag.appendChild(tagText);
    tag.appendChild(removeButton);
    container.appendChild(tag);
    tags.add(value);
}

function setupTagRemoval(tagElement, value, tags) {
    const removeButton = tagElement.querySelector('button');
    if (removeButton) {
        // Remove existing event listeners
        const newButton = removeButton.cloneNode(true);
        removeButton.parentNode.replaceChild(newButton, removeButton);
        
        // Add new event listener
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (tags.has(value)) {
                tags.delete(value);
                tagElement.remove();
            }
        });
    }
}

// Initialize tag inputs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tag inputs and setup removal for existing tags
    const tagContainers = ['selected-symptoms', 'selected-medical-history', 'selected-medications', 'selected-allergies'];
    
    // Setup tag removal for existing tags
    tagContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            const tags = new Set();
            
            // Initialize existing tags
            container.querySelectorAll('.tag').forEach(tagElement => {
                const tagText = tagElement.querySelector('.tag-text')?.textContent.trim() || '';
                if (tagText) {
                    tags.add(tagText);
                    const removeButton = tagElement.querySelector('.remove-tag');
                    if (removeButton) {
                        removeButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            tags.delete(tagText);
                            tagElement.remove();
                        });
                    }
                }
            });

            // Setup input for new tags
            const inputId = containerId.replace('selected-', '') + '-input';
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ',') && !e.isComposing) {
                        e.preventDefault();
                        const value = input.value.trim().toLowerCase();
                        if (value && !tags.has(value)) {
                            addTag(value, container, tags);
                            input.value = '';
                        }
                    }
                });
            }
        }
    });
}); 