// Recipe Manager App - JavaScript Functionality with Supabase

// Supabase Configuration
const supabaseUrl = 'https://efjpbgxkcuhgssdkstop.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanBiZ3hrY3VoZ3NzZGtzdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTMwNTUsImV4cCI6MjA3MTM4OTA1NX0.EEsqXF2jgbCcsPk-tpjk4DoTrBgDUVnRr3Ih0j3msQc'

// Validate Supabase configuration
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key length:', supabaseAnonKey.length);

let supabase;

// App State
let isLoggedIn = false;
let recipes = [];
let currentStepId = 0;

// Constants
const PASSWORD = 'bestchefoat6969'; // Simple password for demo purposes

// DOM Elements - will be initialized after DOM loads
let loginModal, addRecipeModal, recipeDetailModal, recipeGrid, noRecipes, loginBtn, addRecipeBtn, logoutBtn;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    try {
        console.log('Window supabase object:', window.supabase);
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase client created successfully:', supabase);
        
        // Test the connection
        testSupabaseConnection();
    } catch (error) {
        console.error('Error creating Supabase client:', error);
    }
    
    // Initialize DOM elements
    loginModal = document.getElementById('loginModal');
    addRecipeModal = document.getElementById('addRecipeModal');
    recipeDetailModal = document.getElementById('recipeDetailModal');
    recipeGrid = document.getElementById('recipeGrid');
    noRecipes = document.getElementById('noRecipes');
    loginBtn = document.getElementById('loginBtn');
    addRecipeBtn = document.getElementById('addRecipeBtn');
    logoutBtn = document.getElementById('logoutBtn');
    
    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase not loaded!');
        alert('Error: Supabase library not loaded. Please refresh the page.');
        return;
    }
    
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
        existingRecipe.cooking_time = cookingTime ? parseInt(cookingTime) : null;
        existingRecipe.steps = steps;
        existingRecipe.updated_at = new Date().toISOString();
        
        // Handle image update
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                existingRecipe.image = e.target.result;
                updateRecipeInDatabase(existingRecipe);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // Keep existing image if no new image selected
            updateRecipeInDatabase(existingRecipe);
        }
    } else {
        // Create new recipe
        const recipe = {
            name: name,
            type: type,
            cooking_time: cookingTime ? parseInt(cookingTime) : null,
            steps: steps,
            image: null
        };
        
        // Handle image
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                recipe.image = e.target.result;
                saveRecipeToDatabase(recipe);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveRecipeToDatabase(recipe);
        }
    }
}

async function saveRecipeToDatabase(recipe) {
    try {
        console.log('Attempting to save recipe:', recipe);
        console.log('Supabase client:', supabase);
        
        const { data, error } = await supabase
            .from('recipes')
            .insert([recipe])
            .select()
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Recipe saved successfully:', data)
        closeAddRecipe()
        loadRecipes() // Refresh the display
        updateUI()
    } catch (error) {
        console.error('Error saving recipe:', error)
        alert('Error saving recipe. Please try again.')
    }
}

async function updateRecipeInDatabase(updatedRecipe) {
    try {
        const { data, error } = await supabase
            .from('recipes')
            .update(updatedRecipe)
            .eq('id', updatedRecipe.id)
            .select()
        
        if (error) throw error
        
        console.log('Recipe updated successfully:', data)
        closeAddRecipe()
        loadRecipes() // Refresh the display
        updateUI()
        
        // Clear editing state
        window.editingRecipe = null
    } catch (error) {
        console.error('Error updating recipe:', error)
        alert('Error updating recipe. Please try again.')
    }
}

async function deleteRecipeFromDatabase(recipeId) {
    try {
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', recipeId)
        
        if (error) throw error
        
        console.log('Recipe deleted successfully')
        loadRecipes() // Refresh the display
        updateUI()
    } catch (error) {
        console.error('Error deleting recipe:', error)
        alert('Error deleting recipe. Please try again.')
    }
}

async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test if we can reach any Supabase domain first
        console.log('Testing basic internet connectivity...');
        try {
            const testResponse = await fetch('https://supabase.com');
            console.log('Supabase.com reachable:', testResponse.ok);
        } catch (e) {
            console.error('Cannot reach supabase.com:', e);
        }
        
        // Test the specific project URL
        console.log('Testing project URL:', supabaseUrl);
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        
        console.log('HTTP response status:', response.status);
        console.log('HTTP response headers:', response.headers);
        
        if (response.ok) {
            console.log('Supabase project is reachable!');
            
            // Now test the recipes table
            const { data, error } = await supabase
                .from('recipes')
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('Table query failed:', error);
            } else {
                console.log('Recipes table accessible!');
            }
        } else {
            console.error('Project not reachable, status:', response.status);
        }
    } catch (error) {
        console.error('Connection test error:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        
        // Check if it's a DNS resolution error
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
            console.error('This appears to be a DNS resolution error. The project URL might be incorrect or the project might be paused.');
        }
    }
}

async function loadRecipes() {
    try {
        console.log('Attempting to load recipes from Supabase...');
        console.log('Supabase client:', supabase);
        console.log('URL:', supabaseUrl);
        
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
        
        recipes = data || []
        console.log('Recipes loaded successfully:', recipes.length)
        displayRecipes()
    } catch (error) {
        console.error('Error loading recipes:', error)
        console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        
        recipes = []
        displayRecipes()
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
        <div class="rating-icon">🤨</div>
        <h3>My Response</h3>
        <p>Regardless of what you rated this dish, It's a 5⭐️ cuz i made it.</p>
        <p class="rating-sassy">If you rated it anything other than this sybau 😊</p>
        <div class="rating-buttons">
            <button class="btn btn-primary close-rating-btn">Yes Zaddy 🫩</button>
            <button class="btn btn-secondary good-taste-btn">But I rated it 5⭐️...</button>
        </div>
    `;
    
    modalContent.appendChild(message);
    ratingModal.appendChild(modalContent);
    document.body.appendChild(ratingModal);
    
    // Close modal when clicking the first button
    const closeBtn = ratingModal.querySelector('.close-rating-btn');
    closeBtn.onclick = () => {
        ratingModal.remove();
    };
    
    // Change message when clicking the second button
    const goodTasteBtn = ratingModal.querySelector('.good-taste-btn');
    goodTasteBtn.onclick = () => {
        message.innerHTML = `
            <div class="rating-icon">😘</div>
            <h3>My Response</h3>
            <p>Then you clearly have good taste pookie 😘</p>
            <button class="btn btn-primary close-rating-btn">Fanks 🤭</button>
        `;
        
        // Update the close button functionality
        const newCloseBtn = ratingModal.querySelector('.close-rating-btn');
        newCloseBtn.onclick = () => {
            ratingModal.remove();
        };
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
    if (recipe.cooking_time) {
        time.innerHTML = `<i class="fas fa-clock"></i> ${recipe.cooking_time} min`;
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
                    ${recipe.cooking_time ? `<div><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</div>` : ''}
                    <div><strong>Created:</strong> ${new Date(recipe.created_at).toLocaleDateString()}</div>
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
    document.getElementById('cookingTime').value = recipe.cooking_time || '';
    
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
        deleteRecipeFromDatabase(recipe.id);
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
