// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9lbdaSNyp5enknVnWtecvZ2_ceXgmxqk",
  authDomain: "scout-custody-system.firebaseapp.com",
  projectId: "scout-custody-system",
  storageBucket: "scout-custody-system.firebasestorage.app",
  messagingSenderId: "770239691256",
  appId: "1:770239691256:web:7f0df640f157470fa27e0d",
  measurementId: "G-JQESV1TPV0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Set Firebase Auth persistence to LOCAL to maintain login state across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log('Auth persistence set to LOCAL');
    
    // Check if auth is ready
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('Initial auth state:', user ? user.email : 'No user');
        unsubscribe(); // Unsubscribe from this initial check
        resolve(user);
      });
    });
  })
  .then((user) => {
    console.log('Auth is ready, user:', user ? user.email : 'No user');
    isAuthReady = true;
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
    isAuthReady = true; // Set to true anyway to prevent infinite loading
  });

// DOM Element References
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const adminSection = document.getElementById('admin-section');
const userSection = document.getElementById('user-section');
const logoutAdminBtn = document.getElementById('logout-admin');
const logoutUserBtn = document.getElementById('logout-user');

// Product Management DOM Elements
const productForm = document.getElementById('product-form');
const productsTableBody = document.getElementById('products-table-body');
const editProductModal = document.getElementById('edit-product-modal');
const editProductForm = document.getElementById('edit-product-form');
const editProductNameEn = document.getElementById('edit-product-name-en');
const editProductNameAr = document.getElementById('edit-product-name-ar');
const editProductCounter = document.getElementById('edit-product-counter');
const editProductImage = document.getElementById('edit-product-image');

// User Section DOM Elements
const searchInput = document.getElementById('search-input');
const resetSearchBtn = document.getElementById('reset-search-btn');
const userProductsDiv = document.getElementById('user-products');

// Admin User/Role Management DOM Elements
const createUserBtn = document.getElementById('create-user-btn');
const createUserModal = document.getElementById('create-user-modal');
const createUserForm = document.getElementById('create-user-form');
const newUserEmail = document.getElementById('new-user-email');
const newUserPassword = document.getElementById('new-user-password');
const newUserRole = document.getElementById('new-user-role');
const manageUsersBtn = document.getElementById('manage-users-btn');
const manageUsersModal = document.getElementById('manage-users-modal');
const usersTableBody = document.getElementById('users-table-body');
const refreshUsersBtn = document.getElementById('refresh-users-btn');
const editUserModal = document.getElementById('edit-user-modal');
const editUserForm = document.getElementById('edit-user-form');
const editUserEmail = document.getElementById('edit-user-email');
const editUserRole = document.getElementById('edit-user-role');
const switchUserModeBtn = document.getElementById('switch-user-mode-btn');
const returnToAdminBtn = document.getElementById('return-to-admin-btn');

// Pagination Elements
const paginationControls = document.getElementById('pagination-controls');
const paginationInfo = document.getElementById('pagination-info');

// Global variable to store current product ID being edited
let currentEditingProductId = null;

// Global variables for pagination and user management
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let currentEditingUserId = null;
const PRODUCTS_PER_PAGE = 9;

// Auth state tracking
let isAuthStateInitialized = false;
let isAuthReady = false;

// Initially hide all sections until auth state is determined
document.addEventListener('DOMContentLoaded', () => {
    console.log('Scout Custody System initialized');
    console.log('Auth persistence should be:', firebase.auth.Auth.Persistence.LOCAL);
    
    // Hide all sections initially and show loading
    if (authSection) authSection.classList.add('hidden');
    if (adminSection) adminSection.classList.add('hidden');
    if (userSection) userSection.classList.add('hidden');
    
    // Show loading state
    showLoadingState();
    
    // Don't show welcome toast immediately - wait for auth state
    // showToast('مرحباً بك في نظام عهدة الكشافة', 'info');
    
    // Wait a bit for auth to initialize, then check current user
    setTimeout(() => {
        console.log('Current user after timeout:', auth.currentUser ? auth.currentUser.email : 'No user');
        if (auth.currentUser) {
            console.log('User is already signed in on page load');
        } else {
            console.log('No user signed in on page load');
            // If no user after timeout and auth state hasn't been initialized, show login
            if (!isAuthReady) {
                console.log('Auth not ready after timeout, showing login form');
                showSection(authSection, adminSection, userSection);
                showToast('مرحباً بك في نظام عهدة الكشافة', 'info');
            }
        }
    }, 2000); // Increased timeout to give Firebase more time
});

// Utility Functions

/**
 * Display toast notification to user
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'toast_' + Date.now();
    
    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
            <div class="toast-header">
                <strong class="mr-auto">
                    ${type === 'success' ? 'نجح' : type === 'error' ? 'خطأ' : type === 'warning' ? 'تحذير' : 'معلومات'}
                </strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Show the toast using Bootstrap's toast method
    $(`#${toastId}`).toast('show');
    
    // Remove toast from DOM after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function () {
        this.remove();
    });
}

/**
 * Show loading state while determining authentication
 */
function showLoadingState() {
    const container = document.querySelector('.container');
    let loadingDiv = document.getElementById('loading-state');
    
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-state';
        loadingDiv.innerHTML = `
            <div class="text-center mt-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">جاري التحميل...</span>
                </div>
                <p class="mt-3">جاري تحميل النظام...</p>
            </div>
        `;
        container.appendChild(loadingDiv);
    }
    
    loadingDiv.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingDiv = document.getElementById('loading-state');
    if (loadingDiv) {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Utility function to show one section and hide others
 * @param {HTMLElement} show - Element to show
 * @param {HTMLElement} hide1 - First element to hide
 * @param {HTMLElement} hide2 - Second element to hide
 */
function showSection(show, hide1, hide2) {
    // Hide loading state first
    hideLoadingState();
    
    show.classList.remove('hidden');
    hide1.classList.add('hidden');
    hide2.classList.add('hidden');
}

/**
 * Show admin section and hide others
 */
function showAdminSection() {
    showSection(adminSection, authSection, userSection);
    showToast('مرحباً بك في لوحة التحكم', 'success');
    // Load admin products when section is shown
    loadAdminProducts();
    // Hide return to admin button
    if (returnToAdminBtn) returnToAdminBtn.classList.add('hidden');
}

/**
 * Show user section and hide others
 */
function showUserSection() {
    showSection(userSection, authSection, adminSection);
    showToast('مرحباً بك في نظام الطلبات', 'success');
    // Reset pagination
    currentPage = 1;
    searchQuery = '';
    // Load user products when section is shown
    loadUserProducts();
    // Show return to admin button if user is admin/superadmin
    checkAndShowReturnButton();
}

// Authentication State Change Listener
auth.onAuthStateChanged(async (user) => {
    try {
        console.log('Auth state changed. User:', user ? user.email : 'null');
        
        if (user) {
            console.log('User signed in:', user.email);
            console.log('User UID:', user.uid);
            
            // Query Firestore for user document
            console.log('Looking for document at path: users/' + user.uid);
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('User data found:', userData);
                
                // Check user role and show appropriate section
                if (userData.role === 'superadmin' || userData.role === 'admin') {
                    showAdminSection();
                } else {
                    // Assume 'user' role or any other role
                    showUserSection();
                }
                
                // Mark auth state as initialized and ready
                isAuthStateInitialized = true;
                isAuthReady = true;
            } else {
                console.error('User document not found in Firestore');
                console.error('Expected document path: users/' + user.uid);
                console.error('Make sure the Firestore document ID exactly matches the user UID above');
                
                // Show detailed error with UID
                showToast(`خطأ: بيانات المستخدم غير موجودة في قاعدة البيانات. المطلوب إنشاء مستند بالمعرف: ${user.uid}`, 'error');
                
                // Show auth section for login
                showSection(authSection, adminSection, userSection);
                
                // Don't sign out immediately if this is the first auth state check
                if (isAuthStateInitialized) {
                    setTimeout(async () => {
                        await auth.signOut();
                    }, 3000);
                } else {
                    // On first load, give user time to see the error
                    setTimeout(async () => {
                        await auth.signOut();
                        isAuthStateInitialized = true;
                        isAuthReady = true;
                    }, 5000);
                }
            }
        } else {
            console.log('User signed out or not authenticated');
            showSection(authSection, adminSection, userSection);
            isAuthStateInitialized = true;
            isAuthReady = true;
        }
    } catch (error) {
        console.error('Error in auth state change:', error);
        showToast('خطأ في التحقق من صحة المستخدم: ' + error.message, 'error');
        
        // Show auth section on error
        showSection(authSection, adminSection, userSection);
        
        // Only sign out on repeated errors, not on first load
        if (isAuthStateInitialized) {
            setTimeout(async () => {
                try {
                    await auth.signOut();
                } catch (signOutError) {
                    console.error('Error signing out:', signOutError);
                }
            }, 2000);
        } else {
            isAuthStateInitialized = true;
            isAuthReady = true;
        }
    }
});

// Login Form Event Listener
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('يرجى إدخال البريد الإلكتروني وكلمة السر', 'warning');
        return;
    }
    
    try {
        console.log('Attempting to sign in with:', email);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Sign in successful:', userCredential.user.email);
        console.log('User UID from authentication:', userCredential.user.uid);
        
        // Clear the form
        loginForm.reset();
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'خطأ في تسجيل الدخول';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'المستخدم غير موجود';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة السر غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صحيح';
                break;
            case 'auth/user-disabled':
                errorMessage = 'تم تعطيل هذا الحساب';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'محاولات كثيرة، يرجى المحاولة لاحقاً';
                break;
            default:
                errorMessage = `خطأ: ${error.message}`;
        }
        
        showToast(errorMessage, 'error');
    }
});

// Logout Buttons Event Listeners
logoutAdminBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showToast('تم تسجيل الخروج بنجاح', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('خطأ في تسجيل الخروج', 'error');
    }
});

logoutUserBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showToast('تم تسجيل الخروج بنجاح', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('خطأ في تسجيل الخروج', 'error');
    }
});

// Product Management Functions

/**
 * Load and display admin products in real-time
 */
function loadAdminProducts() {
    db.collection('products')
        .orderBy('created_at', 'desc')
        .onSnapshot((querySnapshot) => {
            // Clear existing table content
            productsTableBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                productsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted">لا توجد منتجات حالياً</td>
                    </tr>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productRow = createProductRow(doc.id, product);
                productsTableBody.appendChild(productRow);
            });
        }, (error) => {
            console.error('Error loading products:', error);
            showToast('خطأ في تحميل المنتجات: ' + error.message, 'error');
        });
}

/**
 * Create a table row for a product
 * @param {string} productId - Product document ID
 * @param {Object} productData - Product data
 * @returns {HTMLElement} - Table row element
 */
function createProductRow(productId, productData) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <img src="${productData.image_url}" alt="${productData.name_ar}" class="product-image" 
                 onclick="viewImage('${productData.image_url}', '${productData.name_ar}')" 
                 style="cursor: pointer;" 
                 title="انقر لعرض الصورة بالحجم الكامل">
        </td>
        <td>${productData.name_en}</td>
        <td>${productData.name_ar}</td>
        <td>${productData.stock_count}</td>
        <td>
            <button class="btn btn-warning btn-sm mr-2" onclick="openEditProductModal('${productId}', ${JSON.stringify(productData).replace(/"/g, '&quot;')})">
                تعديل
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${productId}', '${productData.name_ar}')">
                حذف
            </button>
        </td>
    `;
    return row;
}

/**
 * View image in full size modal
 * @param {string} imageUrl - URL of the image to display
 * @param {string} imageName - Name/title for the image
 */
function viewImage(imageUrl, imageName) {
    // Create modal if it doesn't exist
    let imageModal = document.getElementById('image-view-modal');
    if (!imageModal) {
        const modalHTML = `
            <div id="image-view-modal" class="modal hidden" style="z-index: 2000;">
                <div class="modal-content" style="max-width: 90%; max-height: 90%; overflow: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #dee2e6;">
                        <h4 id="image-modal-title">عرض الصورة</h4>
                        <span class="close" onclick="hideImageModal()" style="font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                    </div>
                    <div class="modal-body" style="padding: 1rem; text-align: center;">
                        <img id="modal-image" src="" alt="" style="max-width: 100%; max-height: 70vh; object-fit: contain;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        imageModal = document.getElementById('image-view-modal');
        
        // Add click outside to close functionality
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                hideImageModal();
            }
        });
    }
    
    // Set image source and title
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('image-modal-title');
    
    modalImage.src = imageUrl;
    modalImage.alt = imageName;
    modalTitle.textContent = imageName;
    
    // Show modal
    imageModal.classList.remove('hidden');
    imageModal.style.display = 'block';
}

/**
 * Hide image view modal
 */
function hideImageModal() {
    const imageModal = document.getElementById('image-view-modal');
    if (imageModal) {
        imageModal.classList.add('hidden');
        imageModal.style.display = 'none';
    }
}

/**
 * Open edit product modal with product data
 * @param {string} productId - Product document ID
 * @param {Object} productData - Product data
 */
function openEditProductModal(productId, productData) {
    currentEditingProductId = productId;
    
    // Populate form fields
    editProductNameEn.value = productData.name_en;
    editProductNameAr.value = productData.name_ar;
    editProductCounter.value = productData.stock_count;
    
    // Clear image input
    editProductImage.value = '';
    
    // Show modal
    editProductModal.classList.remove('hidden');
    editProductModal.style.display = 'block';
}

/**
 * Delete a product after confirmation
 * @param {string} productId - Product document ID
 * @param {string} productName - Product name for confirmation
 */
function deleteProduct(productId, productName) {
    if (confirm(`هل أنت متأكد من حذف المنتج "${productName}"؟`)) {
        db.collection('products').doc(productId).delete()
            .then(() => {
                showToast('تم حذف المنتج بنجاح', 'success');
            })
            .catch((error) => {
                console.error('Error deleting product:', error);
                showToast('خطأ في حذف المنتج: ' + error.message, 'error');
            });
    }
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {boolean} - Whether file is valid
 */
function validateImageFile(file) {
    if (!file) return true; // Allow no file (optional)
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showToast('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'warning');
        return false;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('نوع الملف غير مدعوم. يرجى استخدام صور JPG, PNG, GIF, أو WebP', 'warning');
        return false;
    }
    
    return true;
}

/**
 * Upload image to Cloudinary
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<string>} - Image URL from Cloudinary
 */
async function uploadImageToCloudinary(imageFile) {
    const cloudName = 'dsgrl4zf8';
    const uploadPreset = 'Scout Custody System'; // Original preset name
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', uploadPreset);
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('فشل في رفع الصورة: ' + error.message);
    }
}

/**
 * Upload image to Firebase Storage (keeping as fallback)
 * @param {File} imageFile - Image file to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} - Download URL
 */
async function uploadImage(imageFile, path) {
    const storageRef = storage.ref(path);
    const snapshot = await storageRef.put(imageFile);
    return await snapshot.ref.getDownloadURL();
}

// Event Listeners for Product Management

// Add Product Form Event Listener
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameEn = document.getElementById('product-name-en').value.trim();
        const nameAr = document.getElementById('product-name-ar').value.trim();
        const stockCount = parseInt(document.getElementById('product-counter').value);
        const imageFile = document.getElementById('product-image').files[0];
        
        // Validation
        if (!nameEn || !nameAr || isNaN(stockCount) || stockCount < 0) {
            showToast('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'warning');
            return;
        }
        
        // Validate image file if provided
        if (imageFile && !validateImageFile(imageFile)) {
            return;
        }
        
        // Get submit button and store original text
        const submitBtn = productForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>جاري الإضافة...';
            
            let imageURL = '';
            
            // Upload image to Cloudinary if provided
            if (imageFile) {
                imageURL = await uploadImageToCloudinary(imageFile);
            } else {
                // Use a default placeholder image if no image is provided
                imageURL = 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=No+Image';
            }
            
            // Add product to Firestore
            await db.collection('products').add({
                name_en: nameEn,
                name_ar: nameAr,
                stock_count: stockCount,
                image_url: imageURL,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Reset form and show success
            productForm.reset();
            showToast('تم إضافة المنتج بنجاح', 'success');
            
        } catch (error) {
            console.error('Error adding product:', error);
            showToast('خطأ في إضافة المنتج: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Edit Product Form Event Listener
if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentEditingProductId) {
            showToast('خطأ: لم يتم تحديد المنتج للتعديل', 'error');
            return;
        }
        
        const nameEn = editProductNameEn.value.trim();
        const nameAr = editProductNameAr.value.trim();
        const stockCount = parseInt(editProductCounter.value);
        const newImageFile = editProductImage.files[0];
        
        // Validation
        if (!nameEn || !nameAr || isNaN(stockCount) || stockCount < 0) {
            showToast('يرجى ملء جميع الحقول بشكل صحيح', 'warning');
            return;
        }
        
        // Validate image file if provided
        if (newImageFile && !validateImageFile(newImageFile)) {
            return;
        }
        
        // Get submit button and store original text
        const submitBtn = editProductForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>جاري التحديث...';
            
            // Prepare update data
            const updateData = {
                name_en: nameEn,
                name_ar: nameAr,
                stock_count: stockCount,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Upload new image to Cloudinary if provided
            if (newImageFile) {
                const imageURL = await uploadImageToCloudinary(newImageFile);
                updateData.image_url = imageURL;
            }
            
            // Update product in Firestore
            await db.collection('products').doc(currentEditingProductId).update(updateData);
            
            // Reset form and hide modal
            editProductForm.reset();
            hideEditProductModal();
            showToast('تم تحديث المنتج بنجاح', 'success');
            
        } catch (error) {
            console.error('Error updating product:', error);
            showToast('خطأ في تحديث المنتج: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Modal Close Event Listeners
function hideEditProductModal() {
    editProductModal.classList.add('hidden');
    editProductModal.style.display = 'none';
    currentEditingProductId = null;
    editProductForm.reset();
}

// Close modal when clicking the X button
if (editProductModal) {
    const closeBtn = editProductModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideEditProductModal);
    }
    
    // Close modal when clicking outside of it
    editProductModal.addEventListener('click', (e) => {
        if (e.target === editProductModal) {
            hideEditProductModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close edit product modal
        if (editProductModal && !editProductModal.classList.contains('hidden')) {
            hideEditProductModal();
        }
    }
});

// User Product Management Functions

/**
 * Load and display user products with optional search
 * @param {string} searchQuery - Optional search query
 */
function loadUserProducts(searchQuery = '') {
    // Clear existing products
    if (userProductsDiv) {
        userProductsDiv.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">جاري التحميل...</p></div>';
    }
    
    // Update global search query
    window.searchQuery = searchQuery;
    
    let query = db.collection('products');
    
    // Apply search if provided
    if (searchQuery.trim()) {
        // For Arabic search, use array-contains or where clause
        // For English search, use >= and < for range query
        const searchLower = searchQuery.toLowerCase().trim();
        
        // Create compound query for English search using range
        query = query.where('name_en', '>=', searchLower)
                    .where('name_en', '<', searchLower + '\uf8ff');
    }
    
    // Apply ordering
    query = query.orderBy('name_en').orderBy('created_at', 'desc');
    
    // Get total count first for pagination
    query.get()
        .then((querySnapshot) => {
            const allResults = [];
            
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                
                // Additional client-side filtering for Arabic text and refined English search
                if (searchQuery.trim()) {
                    const nameEnLower = product.name_en.toLowerCase();
                    const nameAr = product.name_ar;
                    const searchLower = searchQuery.toLowerCase();
                    
                    if (nameEnLower.includes(searchLower) || nameAr.includes(searchQuery)) {
                        allResults.push({id: doc.id, data: product});
                    }
                } else {
                    allResults.push({id: doc.id, data: product});
                }
            });
            
            // Calculate pagination
            const totalProducts = allResults.length;
            totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
            
            // Get products for current page
            const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
            const endIndex = startIndex + PRODUCTS_PER_PAGE;
            const currentPageProducts = allResults.slice(startIndex, endIndex);
            
            // Clear products container
            userProductsDiv.innerHTML = '';
            
            if (currentPageProducts.length === 0) {
                const message = searchQuery ? 'لم يتم العثور على منتجات مطابقة لبحثك.' : 'لا توجد منتجات حالياً';
                userProductsDiv.innerHTML = `
                    <div class="col-12">
                        <div class="no-products-message">
                            ${message}
                        </div>
                    </div>
                `;
            } else {
                currentPageProducts.forEach(({id, data}) => {
                    displayUserProduct(id, data);
                });
            }
            
            // Update pagination controls
            updatePaginationControls(totalProducts);
        })
        .catch((error) => {
            console.error('Error loading user products:', error);
            showToast('خطأ في تحميل المنتجات: ' + error.message, 'error');
            if (userProductsDiv) {
                userProductsDiv.innerHTML = `
                    <div class="col-12">
                        <div class="no-products-message">
                            خطأ في تحميل المنتجات
                        </div>
                    </div>
                `;
            }
        });
}

/**
 * Display a single product card for users
 * @param {string} productId - Product document ID
 * @param {Object} product - Product data
 */
function displayUserProduct(productId, product) {
    if (!userProductsDiv) return;
    
    // Determine stock status
    let stockClass = 'stock-available';
    let stockText = `متوفر: ${product.stock_count}`;
    
    if (product.stock_count === 0) {
        stockClass = 'stock-out';
        stockText = 'غير متوفر';
    } else if (product.stock_count <= 5) {
        stockClass = 'stock-low';
        stockText = `كمية قليلة: ${product.stock_count}`;
    }
    
    const productCard = document.createElement('div');
    productCard.className = 'col-md-4 col-sm-6 mb-4';
    productCard.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.image_url}" class="card-img-top" alt="${product.name_ar}">
            <div class="card-body d-flex flex-column">
                <h5 class="product-title">${product.name_ar}</h5>
                <p class="text-muted small">${product.name_en}</p>
                <p class="product-stock ${stockClass}">${stockText}</p>
                <div class="mt-auto">
                    <!-- Reservation form placeholder for next iteration -->
                    <p class="text-muted small">نموذج الحجز سيتم إضافته في التكرار القادم</p>
                </div>
            </div>
        </div>
    `;
    
    userProductsDiv.appendChild(productCard);
}

/**
 * Update pagination controls
 * @param {number} totalProducts - Total number of products
 */
function updatePaginationControls(totalProducts) {
    if (!paginationControls || !paginationInfo) return;
    
    // Update pagination info
    const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);
    paginationInfo.textContent = `عرض ${startItem}-${endItem} من ${totalProducts} منتج`;
    
    // Clear existing pagination
    paginationControls.innerHTML = '';
    
    if (totalPages <= 1) {
        return; // No pagination needed
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    if (currentPage > 1) {
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage--;
            loadUserProducts(searchQuery);
        });
    }
    paginationControls.appendChild(prevLi);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        // First page
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = '<a class="page-link" href="#">1</a>';
        firstLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = 1;
            loadUserProducts(searchQuery);
        });
        paginationControls.appendChild(firstLi);
        
        if (startPage > 2) {
            // Ellipsis
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            paginationControls.appendChild(ellipsisLi);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        if (i !== currentPage) {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                loadUserProducts(searchQuery);
            });
        }
        paginationControls.appendChild(li);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            // Ellipsis
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            paginationControls.appendChild(ellipsisLi);
        }
        
        // Last page
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
        lastLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = totalPages;
            loadUserProducts(searchQuery);
        });
        paginationControls.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    if (currentPage < totalPages) {
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage++;
            loadUserProducts(searchQuery);
        });
    }
    paginationControls.appendChild(nextLi);
}

/**
 * Check user role and show return to admin button if needed
 */
function checkAndShowReturnButton() {
    const currentUser = auth.currentUser;
    if (currentUser && returnToAdminBtn) {
        db.collection('users').doc(currentUser.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'admin' || userData.role === 'superadmin') {
                        returnToAdminBtn.classList.remove('hidden');
                    }
                }
            })
            .catch((error) => {
                console.error('Error checking user role:', error);
            });
    }
}

// Admin User/Role Management Functions

/**
 * Load roles from Firestore and populate the dropdown
 */
function loadRoles() {
    if (!newUserRole) return;
    
    db.collection('roles')
        .orderBy('created_at')
        .get()
        .then((querySnapshot) => {
            // Clear existing options except the default one
            newUserRole.innerHTML = '<option value="">اختر الدور</option>';
            
            querySnapshot.forEach((doc) => {
                const role = doc.data();
                const option = document.createElement('option');
                option.value = role.role_name;
                option.textContent = role.role_name;
                newUserRole.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error loading roles:', error);
            showToast('خطأ في تحميل الأدوار: ' + error.message, 'error');
        });
}

/**
 * Create a new user with email, password, and role
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role
 */
async function createNewUser(email, password, role) {
    try {
        // Store current admin info
        const currentAdmin = auth.currentUser;
        
        // Create the new user (this will temporarily sign out the admin)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;
        
        // Add user document to Firestore
        await db.collection('users').doc(newUser.uid).set({
            email: email,
            role: role,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Sign out the newly created user immediately
        await auth.signOut();
        
        showToast('تم إنشاء المستخدم بنجاح. سيتم إعادة تحميل الصفحة...', 'success');
        
        // Reload the page to restore admin session
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Error creating user:', error);
        
        let errorMessage = 'خطأ في إنشاء المستخدم';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صحيح';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة السر ضعيفة';
                break;
            default:
                errorMessage = `خطأ: ${error.message}`;
        }
        
        showToast(errorMessage, 'error');
        return false;
    }
}

/**
 * Create a new role
 * @param {string} roleName - Name of the new role
 */
async function createNewRole(roleName) {
    try {
        await db.collection('roles').add({
            role_name: roleName,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('تم إنشاء الدور بنجاح', 'success');
        return true;
    } catch (error) {
        console.error('Error creating role:', error);
        showToast('خطأ في إنشاء الدور: ' + error.message, 'error');
        return false;
    }
}

/**
 * Show modal
 * @param {HTMLElement} modal - Modal element to show
 */
function showModal(modal) {
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

/**
 * Hide modal
 * @param {HTMLElement} modal - Modal element to hide
 */
function hideModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// User Section Event Listeners

// Search Input Event Listener
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        currentPage = 1; // Reset to first page on new search
        loadUserProducts(query);
    });
}

// Reset Search Button Event Listener
if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
        }
        currentPage = 1; // Reset to first page
        searchQuery = '';
        loadUserProducts();
    });
}

// Return to Admin Button Event Listener
if (returnToAdminBtn) {
    returnToAdminBtn.addEventListener('click', () => {
        showAdminSection();
    });
}

// Admin User/Role Management Event Listeners

// Create User Button Event Listener
if (createUserBtn) {
    createUserBtn.addEventListener('click', () => {
        showModal(createUserModal);
    });
}

// Create User Form Event Listener
if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = newUserEmail.value.trim();
        const password = newUserPassword.value;
        const role = newUserRole.value;
        
        // Validation
        if (!email || !password || !role) {
            showToast('يرجى ملء جميع الحقول', 'warning');
            return;
        }
        
        if (password.length < 6) {
            showToast('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'warning');
            return;
        }
        
        // Get submit button and store original text
        const submitBtn = createUserForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm ml-2"></span>جاري الإنشاء...';
            
            const success = await createNewUser(email, password, role);
            
            if (success) {
                // Reset form and hide modal
                createUserForm.reset();
                hideModal(createUserModal);
            }
            
        } catch (error) {
            console.error('Error in create user form:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Create Role Button Event Listener
if (manageUsersBtn) {
    manageUsersBtn.addEventListener('click', () => {
        showModal(manageUsersModal);
        loadUsers(); // Load users when modal opens
    });
}

// Refresh Users Button Event Listener
if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', () => {
        loadUsers();
    });
}

// Edit User Form Event Listener
if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = editUserEmail.value.trim();
        const role = editUserRole.value;
        
        // Validation
        if (!email || !role) {
            showToast('يرجى ملء جميع الحقول', 'warning');
            return;
        }
        
        // Get submit button and store original text
        const submitBtn = editUserForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm ml-2"></span>جاري التحديث...';
            
            // Update user in Firestore
            await db.collection('users').doc(currentEditingUserId).update({
                role: role,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Reset form and hide modal
            editUserForm.reset();
            hideEditUserModal();
            showToast('تم تحديث بيانات المستخدم بنجاح', 'success');
            loadUsers(); // Refresh the users list
            
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('خطأ في تحديث بيانات المستخدم: ' + error.message, 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Switch to User Mode Button Event Listener
if (switchUserModeBtn) {
    switchUserModeBtn.addEventListener('click', () => {
        showUserSection();
        showToast('التبديل إلى وضع المستخدم.', 'info');
    });
}

// Modal Close Event Listeners for New Modals
if (createUserModal) {
    const closeBtn = createUserModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideModal(createUserModal);
            if (createUserForm) createUserForm.reset();
        });
    }
    
    // Close modal when clicking outside of it
    createUserModal.addEventListener('click', (e) => {
        if (e.target === createUserModal) {
            hideModal(createUserModal);
            if (createUserForm) createUserForm.reset();
        }
    });
}

if (manageUsersModal) {
    const closeBtn = manageUsersModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideModal(manageUsersModal);
        });
    }
    
    // Close modal when clicking outside of it
    manageUsersModal.addEventListener('click', (e) => {
        if (e.target === manageUsersModal) {
            hideModal(manageUsersModal);
        }
    });
}

if (editUserModal) {
    const closeBtn = editUserModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideEditUserModal();
        });
    }
    
    // Close modal when clicking outside of it
    editUserModal.addEventListener('click', (e) => {
        if (e.target === editUserModal) {
            hideEditUserModal();
        }
    });
}

// Enhanced Escape key handling for all modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close edit product modal
        if (editProductModal && !editProductModal.classList.contains('hidden')) {
            hideEditProductModal();
        }
        // Close create user modal
        if (createUserModal && !createUserModal.classList.contains('hidden')) {
            hideModal(createUserModal);
            if (createUserForm) createUserForm.reset();
        }
        // Close manage users modal
        if (manageUsersModal && !manageUsersModal.classList.contains('hidden')) {
            hideModal(manageUsersModal);
        }
        // Close edit user modal
        if (editUserModal && !editUserModal.classList.contains('hidden')) {
            hideEditUserModal();
        }
    }
});

// Make functions globally accessible for onclick attributes
window.openEditProductModal = openEditProductModal;
window.deleteProduct = deleteProduct;
window.viewImage = viewImage;
window.hideImageModal = hideImageModal;
window.openEditUserModal = openEditUserModal;
window.deleteUser = deleteUser;

/**
 * Load users for management
 */
function loadUsers() {
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center">جاري التحميل...</td></tr>';
    
    db.collection('users')
        .orderBy('created_at', 'desc')
        .get()
        .then((querySnapshot) => {
            usersTableBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا يوجد مستخدمون</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const userRow = createUserRow(doc.id, user);
                usersTableBody.appendChild(userRow);
            });
        })
        .catch((error) => {
            console.error('Error loading users:', error);
            showToast('خطأ في تحميل المستخدمين: ' + error.message, 'error');
            usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">خطأ في التحميل</td></tr>';
        });
}

/**
 * Create a table row for a user
 * @param {string} userId - User document ID  
 * @param {Object} userData - User data
 * @returns {HTMLElement} - Table row element
 */
function createUserRow(userId, userData) {
    const row = document.createElement('tr');
    
    // Format date
    let dateText = 'غير محدد';
    if (userData.created_at) {
        try {
            const date = userData.created_at.toDate();
            dateText = date.toLocaleDateString('ar-EG');
        } catch (e) {
            dateText = 'غير محدد';
        }
    }
    
    // Role display
    const roleText = userData.role === 'admin' ? 'مدير' : 
                    userData.role === 'superadmin' ? 'مدير عام' : 'مستخدم';
    
    row.innerHTML = `
        <td>${userData.email}</td>
        <td><span class="badge badge-${userData.role === 'superadmin' ? 'danger' : userData.role === 'admin' ? 'warning' : 'secondary'}">${roleText}</span></td>
        <td>${dateText}</td>
        <td>
            <button class="btn btn-sm btn-primary mr-1" onclick="openEditUserModal('${userId}', ${JSON.stringify(userData).replace(/"/g, '&quot;')})">
                تعديل
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser('${userId}', '${userData.email}')">
                حذف
            </button>
        </td>
    `;
    return row;
}

/**
 * Open edit user modal
 * @param {string} userId - User document ID
 * @param {Object} userData - User data
 */
function openEditUserModal(userId, userData) {
    currentEditingUserId = userId;
    
    if (editUserEmail) editUserEmail.value = userData.email;
    if (editUserRole) editUserRole.value = userData.role;
    
    showModal(editUserModal);
}

/**
 * Hide edit user modal
 */
function hideEditUserModal() {
    hideModal(editUserModal);
    currentEditingUserId = null;
    if (editUserForm) editUserForm.reset();
}

/**
 * Delete a user after confirmation
 * @param {string} userId - User document ID
 * @param {string} userEmail - User email for confirmation
 */
function deleteUser(userId, userEmail) {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${userEmail}"؟`)) {
        db.collection('users').doc(userId).delete()
            .then(() => {
                showToast('تم حذف المستخدم بنجاح', 'success');
                loadUsers(); // Refresh the list
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
                showToast('خطأ في حذف المستخدم: ' + error.message, 'error');
            });
    }
} 