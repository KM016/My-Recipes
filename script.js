// Recipe Manager App - JavaScript Functionality

// App State
let isLoggedIn = false;
let recipes = [];
let currentStepId = 0;

// Constants
const PASSWORD = 'bestchefoat6969'; // Simple password for demo purposes
const STORAGE_KEY = 'recipeManagerData';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const addRecipeModal = document.getElementById('addRecipeModal');
const recipeDetailModal = document.getElementById('recipeDetailModal');
const recipeGrid = document.getElementById('recipeGrid');
const noRecipes = document.getElementById('noRecipes');
const loginBtn = document.getElementById('loginBtn');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
    updateUI();
    setupEventListeners();
    displayRecipes(); // Move this here to ensure recipes are loaded first
});

// Event Listeners Setup
function setupEventListeners() {
    // Type button selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('type-btn')) {
            selectRecipeType(e.target);
        }
    });

    // Image preview
    const imageInput = document.getElementById('recipeImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

// Authentication Functions
function showLogin() {
    loginModal.style.display = 'block';
    document.getElementById('passwordInput').focus();
    // Clear any previous error messages
    document.getElementById('loginError').innerHTML = '';
}

function login() {
    const password = document.getElementById('passwordInput').value;
    const loginError = document.getElementById('loginError');
    
    if (password === PASSWORD) {
        isLoggedIn = true;
        loginModal.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        loginError.innerHTML = '';
        updateUI();
        saveToStorage();
        displayRecipes(); // Refresh recipe display to show edit/delete buttons
    } else {
        loginError.innerHTML = `
            <img src="freaksonic.gif" alt="Freak Sonic" style="width: 200px; height: 200px; border-radius: 12px; margin-bottom: 1rem;">
            <p style="font-size: 1.1rem; font-weight: 600; color: #ef4444; margin-bottom: 0.5rem;">Looks like you tried to enter my site without my permission...</p>
            <p style="font-size: 1rem; color: #dc2626;">Freak Sonic has now given you 10 days to live 👅</p>
        `;
        document.getElementById('passwordInput').value = '';
    }
}

function logout() {
    isLoggedIn = false;
    updateUI();
    saveToStorage();
    displayRecipes(); // Refresh recipe display to show rating system
}

// Recipe Management Functions
function showAddRecipe() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    
    addRecipeModal.style.display = 'block';
    resetRecipeForm();
    addInitialSteps();
}

function closeAddRecipe() {
    addRecipeModal.style.display = 'none';
    resetRecipeForm();
    
    // Reset editing state
    if (window.editingRecipe) {
        window.editingRecipe = null;
        
        // Reset modal title and button
        const modalTitle = document.querySelector('#addRecipeModal h2');
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add New Recipe';
        
        const submitBtn = document.querySelector('#recipeForm button[type="submit"]');
        submitBtn.textContent = 'Save Recipe';
    }
}

function selectRecipeType(button) {
    // Remove selection from all buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select clicked button
    button.classList.add('selected');
    document.getElementById('recipeType').value = button.dataset.type;
}

function addIngredientStep() {
    addStep('ingredient');
}

function addInstructionStep() {
    addStep('instruction');
}

function addStep(type) {
    const stepsContainer = document.getElementById('stepsContainer');
    const stepId = ++currentStepId;
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.dataset.stepId = stepId;
    
    const stepHeader = document.createElement('div');
    stepHeader.className = 'step-header';
    
    const stepType = document.createElement('span');
    stepType.className = 'step-type';
    stepType.textContent = type === 'ingredient' ? 'Ingredient' : 'Instruction';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-step';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => removeStep(stepId);
    
    stepHeader.appendChild(stepType);
    stepHeader.appendChild(removeBtn);
    
    const stepContent = document.createElement('div');
    stepContent.className = 'step-content';
    
    if (type === 'ingredient') {
        // Create two inputs for ingredients: ingredient name first, then amount
        const ingredientInput = document.createElement('input');
        ingredientInput.type = 'text';
        ingredientInput.placeholder = 'Ingredient name';
        ingredientInput.className = 'ingredient-input';
        ingredientInput.required = true;
        
        const amountInput = document.createElement('input');
        amountInput.type = 'text';
        amountInput.placeholder = 'Amount';
        amountInput.className = 'amount-input';
        amountInput.required = true;
        
        stepContent.appendChild(ingredientInput);
        stepContent.appendChild(amountInput);
    } else {
        // Single input for instructions
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter instruction step';
        input.required = true;
        
        stepContent.appendChild(input);
    }
    
    stepDiv.appendChild(stepHeader);
    stepDiv.appendChild(stepContent);
    stepsContainer.appendChild(stepDiv);
}

function removeStep(stepId) {
    const stepElement = document.querySelector(`[data-step-id="${stepId}"]`);
    if (stepElement) {
        stepElement.remove();
    }
}

function addInitialSteps() {
    // Add one ingredient and one instruction step by default
    addIngredientStep();
    addInstructionStep();
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        preview.innerHTML = '';
    }
}

function saveRecipe(event) {
    event.preventDefault();
    
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    
    // Get form data
    const name = document.getElementById('recipeName').value.trim();
    const cookingTime = document.getElementById('cookingTime').value;
    const type = document.getElementById('recipeType').value;
    const imageFile = document.getElementById('recipeImage').files[0];
    
    if (!name || !type) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Collect steps
    const steps = [];
    const stepElements = document.querySelectorAll('.step-item');
    
    stepElements.forEach(stepElement => {
        const stepType = stepElement.querySelector('.step-type').textContent.toLowerCase();
        
        if (stepType === 'ingredient') {
            // Handle ingredient steps with ingredient name first, then amount
            const ingredientInput = stepElement.querySelector('.ingredient-input');
            const amountInput = stepElement.querySelector('.amount-input');
            const ingredient = ingredientInput.value.trim();
            const amount = amountInput.value.trim();
            
            if (ingredient && amount) {
                steps.push({
                    type: stepType,
                    content: `${ingredient} ${amount}`,
                    ingredient: ingredient,
                    amount: amount
                });
            }
        } else {
            // Handle instruction steps with single input
            const stepInput = stepElement.querySelector('input');
            const stepContent = stepInput.value.trim();
            
            if (stepContent) {
                steps.push({
                    type: stepType,
                    content: stepContent
                });
            }
        }
    });
    
    if (steps.length === 0) {
        alert('Please add at least one ingredient or instruction step.');
        return;
    }
    
    // Check if we're editing an existing recipe
    if (window.editingRecipe) {
        // Update existing recipe
        const existingRecipe = window.editingRecipe;
        existingRecipe.name = name;
        existingRecipe.type = type;
        existingRecipe.cookingTime = cookingTime ? parseInt(cookingTime) : null;
        existingRecipe.steps = steps;
        existingRecipe.updatedAt = new Date().toISOString();
        
        // Handle image update
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                existingRecipe.image = e.target.result;
                updateRecipeInStorage(existingRecipe);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // Keep existing image if no new image selected
            updateRecipeInStorage(existingRecipe);
        }
    } else {
        // Create new recipe
        const recipe = {
            id: Date.now(),
            name: name,
            type: type,
            cookingTime: cookingTime ? parseInt(cookingTime) : null,
            steps: steps,
            image: null,
            createdAt: new Date().toISOString()
        };
        
        // Handle image
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                recipe.image = e.target.result;
                saveRecipeToStorage(recipe);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveRecipeToStorage(recipe);
        }
    }
}

function saveRecipeToStorage(recipe) {
    recipes.push(recipe);
    saveToStorage();
    closeAddRecipe();
    displayRecipes();
    updateUI();
}

function updateRecipeInStorage(updatedRecipe) {
    const index = recipes.findIndex(r => r.id === updatedRecipe.id);
    if (index > -1) {
        recipes[index] = updatedRecipe;
        saveToStorage();
        closeAddRecipe();
        displayRecipes();
        updateUI();
        
        // Clear editing state
        window.editingRecipe = null;
    }
}

function showRatingMessage() {
    // Create and show the rating message modal
    const ratingModal = document.createElement('div');
    ratingModal.className = 'rating-modal modal';
    ratingModal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content rating-modal-content';
    
    const message = document.createElement('div');
    message.className = 'rating-message';
    message.innerHTML = `
        <div class="rating-icon">👨‍🍳</div>
        <h3>Chef's Response</h3>
        <p>Regardless of what you rated this dish, It's a 5/5 cuz i made it.</p>
        <p class="rating-sassy">If you rated it anything other than this sybau 😊</p>
        <button class="btn btn-primary close-rating-btn">Got it, Chef! 👨‍🍳</button>
    `;
    
    modalContent.appendChild(message);
    ratingModal.appendChild(modalContent);
    document.body.appendChild(ratingModal);
    
    // Close modal when clicking the button
    const closeBtn = ratingModal.querySelector('.close-rating-btn');
    closeBtn.onclick = () => {
        ratingModal.remove();
    };
    
    // Close modal when clicking outside
    ratingModal.onclick = (e) => {
        if (e.target === ratingModal) {
            ratingModal.remove();
        }
    };
}

function displayRecipes() {
    console.log('Displaying recipes:', recipes.length); // Debug log
    
    if (recipes.length === 0) {
        recipeGrid.style.display = 'none';
        noRecipes.style.display = 'block';
        return;
    }
    
    recipeGrid.style.display = 'grid';
    noRecipes.style.display = 'none';
    
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const image = document.createElement('div');
    image.className = 'recipe-image';
    image.onclick = () => showRecipeDetail(recipe);
    
    if (recipe.image) {
        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        image.appendChild(img);
    } else {
        image.innerHTML = '<i class="fas fa-utensils"></i>';
    }
    
    const info = document.createElement('div');
    info.className = 'recipe-info';
    
    const name = document.createElement('h3');
    name.className = 'recipe-name';
    name.textContent = recipe.name;
    name.onclick = () => showRecipeDetail(recipe);
    
    const meta = document.createElement('div');
    meta.className = 'recipe-meta';
    
    const tag = document.createElement('span');
    tag.className = `recipe-tag ${recipe.type}`;
    tag.textContent = recipe.type;
    
    const time = document.createElement('span');
    time.className = 'cooking-time';
    if (recipe.cookingTime) {
        time.innerHTML = `<i class="fas fa-clock"></i> ${recipe.cookingTime} min`;
    }
    
    meta.appendChild(tag);
    meta.appendChild(time);
    
    info.appendChild(name);
    info.appendChild(meta);
    
    // Add action buttons when logged in, rating system when not logged in
    if (isLoggedIn) {
        const actions = document.createElement('div');
        actions.className = 'recipe-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Recipe';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editRecipe(recipe);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete Recipe';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteRecipe(recipe);
        };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        info.appendChild(actions);
    } else {
        // Rating system for non-logged in users
        const ratingSection = document.createElement('div');
        ratingSection.className = 'recipe-rating';
        
        const ratingLabel = document.createElement('span');
        ratingLabel.className = 'rating-label';
        ratingLabel.textContent = 'Rate:';
        
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        
        // Create 5 interactive stars
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.innerHTML = '★';
            star.dataset.rating = i;
            star.onclick = (e) => {
                e.stopPropagation();
                showRatingMessage();
            };
            starsContainer.appendChild(star);
        }
        
        ratingSection.appendChild(ratingLabel);
        ratingSection.appendChild(starsContainer);
        info.appendChild(ratingSection);
    }
    
    card.appendChild(image);
    card.appendChild(info);
    
    return card;
}

function showRecipeDetail(recipe) {
    const modal = document.getElementById('recipeDetailModal');
    const nameElement = document.getElementById('detailRecipeName');
    const contentElement = document.getElementById('recipeDetailContent');
    
    nameElement.textContent = recipe.name;
    
    // Separate ingredients and instructions
    const ingredients = recipe.steps.filter(step => step.type === 'ingredient');
    const instructions = recipe.steps.filter(step => step.type === 'instruction');
    
    let content = `
        <div class="recipe-detail">
            <div class="recipe-detail-info">
                <div class="recipe-detail-meta">
                    <div><strong>Type:</strong> <span class="recipe-tag ${recipe.type}">${recipe.type}</span></div>
                    ${recipe.cookingTime ? `<div><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</div>` : ''}
                    <div><strong>Created:</strong> ${new Date(recipe.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div class="recipe-ingredients">
                    <h3>Ingredients</h3>
                    <ol class="ingredient-list">
    `;
    
    ingredients.forEach((ingredient, index) => {
        content += `<li class="ingredient-step">${ingredient.content}</li>`;
    });
    
    content += `
                    </ol>
                </div>
            </div>
            
            <div class="recipe-detail-image-container">
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-image">` : '<div class="recipe-detail-image"><i class="fas fa-utensils"></i></div>'}
            </div>
            
            <div class="recipe-steps">
                <h3>Recipe Steps</h3>
                <ol class="step-list">
    `;
    
    instructions.forEach((step, index) => {
        content += `<li class="instruction-step">${step.content}</li>`;
    });
    
    content += `
                    </ol>
                </div>
        </div>
    `;
    
    contentElement.innerHTML = content;
    modal.style.display = 'block';
}

function closeRecipeDetail() {
    recipeDetailModal.style.display = 'none';
}

function editRecipe(recipe) {
    // Security check - only allow editing when logged in
    if (!isLoggedIn) {
        alert('You must be logged in to edit recipes.');
        return;
    }
    
    // Store the recipe being edited
    window.editingRecipe = recipe;
    
    // Populate the form with existing data
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('cookingTime').value = recipe.cookingTime || '';
    
    // Select the recipe type
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.type === recipe.type) {
            btn.classList.add('selected');
        }
    });
    document.getElementById('recipeType').value = recipe.type;
    
    // Clear existing steps and add the recipe's steps
    document.getElementById('stepsContainer').innerHTML = '';
    currentStepId = 0;
    
    recipe.steps.forEach(step => {
        if (step.type === 'ingredient') {
            addIngredientStep();
            const stepElement = document.querySelector(`[data-step-id="${currentStepId}"]`);
            const ingredientInput = stepElement.querySelector('.ingredient-input');
            const amountInput = stepElement.querySelector('.amount-input');
            
            if (step.ingredient && step.amount) {
                ingredientInput.value = step.ingredient;
                amountInput.value = step.amount;
            } else {
                // Fallback for old format
                const parts = step.content.split(' ');
                if (parts.length >= 2) {
                    const amount = parts.slice(0, -1).join(' ');
                    const ingredient = parts[parts.length - 1];
                    ingredientInput.value = ingredient;
                    amountInput.value = amount;
                }
            }
        } else {
            addInstructionStep();
            const stepElement = document.querySelector(`[data-step-id="${currentStepId}"]`);
            const input = stepElement.querySelector('input');
            input.value = step.content;
        }
    });
    
    // Show image preview if exists
    if (recipe.image) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${recipe.image}" alt="Current recipe image">`;
        preview.style.display = 'block';
    }
    
    // Change modal title and button
    const modalTitle = document.querySelector('#addRecipeModal h2');
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Recipe';
    
    const submitBtn = document.querySelector('#recipeForm button[type="submit"]');
    submitBtn.textContent = 'Update Recipe';
    
    // Show the modal
    addRecipeModal.style.display = 'block';
}

function deleteRecipe(recipe) {
    // Security check - only allow deleting when logged in
    if (!isLoggedIn) {
        alert('You must be logged in to delete recipes.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`)) {
        const index = recipes.findIndex(r => r.id === recipe.id);
        if (index > -1) {
            recipes.splice(index, 1);
            saveToStorage();
            displayRecipes();
            updateUI();
        }
    }
}

function resetRecipeForm() {
    document.getElementById('recipeForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').innerHTML = '';
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('recipeType').value = '';
    document.getElementById('stepsContainer').innerHTML = '';
    currentStepId = 0;
    
    // Clear file input
    const imageInput = document.getElementById('recipeImage');
    if (imageInput) {
        imageInput.value = '';
    }
}

function updateUI() {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        addRecipeBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'inline-flex';
    } else {
        loginBtn.style.display = 'inline-flex';
        addRecipeBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Storage Functions
function saveToStorage() {
    const data = {
        isLoggedIn: isLoggedIn,
        recipes: recipes
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadRecipes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Loading recipes from storage:', stored ? 'found' : 'not found'); // Debug log
    
    if (stored) {
        try {
            const data = JSON.parse(stored);
            isLoggedIn = data.isLoggedIn || false;
            recipes = data.recipes || [];
            console.log('Loaded recipes:', recipes.length); // Debug log
        } catch (e) {
            console.error('Error loading stored data:', e);
            recipes = [];
        }
    } else {
        recipes = [];
        console.log('No stored data found, starting with empty recipes array'); // Debug log
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        loginModal.style.display = 'none';
        addRecipeModal.style.display = 'none';
        recipeDetailModal.style.display = 'none';
    }
});

// Initial display is now handled in DOMContentLoaded
