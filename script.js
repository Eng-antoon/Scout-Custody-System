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

// Initialize secondary app for user creation (to avoid logging out admin)
const secondaryApp = firebase.initializeApp(firebaseConfig, "secondary");

// Get Firebase services references
const auth = firebase.auth();
const db = firebase.firestore();
const secondaryAuth = secondaryApp.auth();

// Log successful initialization
console.log('Firebase apps initialized:');
console.log('- Main app:', firebase.app().name);
console.log('- Secondary app:', secondaryApp.name);
console.log('- Secondary auth available:', !!secondaryAuth);

// Add connectivity check function
async function checkFirestoreConnectivity() {
    try {
        // Try to read from a simple collection
        await db.collection('_connectivity_test').limit(1).get();
        console.log('Firestore connectivity: OK');
        return true;
    } catch (error) {
        console.warn('Firestore connectivity check failed:', error);
        if (error.code === 'unavailable') {
            showToast('تحذير: لا يمكن الاتصال بقاعدة البيانات. التطبيق يعمل في وضع محدود.', 'warning');
        }
        return false;
    }
}

// Enable offline persistence and specify database explicitly
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('Firestore persistence enabled');
    // Check connectivity after persistence is enabled
    setTimeout(checkFirestoreConnectivity, 2000);
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
    // Still check connectivity even if persistence fails
    setTimeout(checkFirestoreConnectivity, 2000);
  });

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

// Availability Check DOM Elements
const availabilityStartTime = document.getElementById('availability-start-time');
const availabilityEndTime = document.getElementById('availability-end-time');
const checkAvailabilityBtn = document.getElementById('check-availability-btn');
const availabilityStatus = document.getElementById('availability-status');

// Reservation Tables DOM Elements
const reservationsTableBody = document.getElementById('reservations-table-body');
const reservationsApprovalTableBody = document.getElementById('reservations-approval-table-body');

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
const goToDashboardBtn = document.getElementById('go-to-dashboard-btn');
const switchUserModeBtn = document.getElementById('switch-user-mode-btn');
const returnToAdminBtn = document.getElementById('return-to-admin-btn');

// Pagination Elements
const paginationControls = document.getElementById('pagination-controls');
const paginationInfo = document.getElementById('pagination-info');

// Shopping Cart DOM Elements
const currentRequestItemsDiv = document.getElementById('current-request-items');
const finalizeRequestForm = document.getElementById('finalize-request-form');
const requestRecipientName = document.getElementById('request-recipient-name');
const requestRecipientMobile = document.getElementById('request-recipient-mobile');
const requestUnit = document.getElementById('request-unit');
const requestStartTime = document.getElementById('request-start-time');
const requestEndTime = document.getElementById('request-end-time');
const completeRequestBtn = document.getElementById('complete-request-btn');

// Reservation Details Modal DOM Elements
const reservationDetailsModal = document.getElementById('reservation-details-modal');
const reservationDetailsContent = document.getElementById('reservation-details-content');

// Profile Modal DOM Elements
const viewProfileBtn = document.getElementById('view-profile-btn');
const viewProfileBtnUser = document.getElementById('view-profile-btn-user');
const profileModal = document.getElementById('profile-modal');
const profileViewSection = document.getElementById('profile-view-section');
const profileEditSection = document.getElementById('profile-edit-section');
const profileModalImage = document.getElementById('profile-modal-image');
const profileModalName = document.getElementById('profile-modal-name');
const profileModalEmail = document.getElementById('profile-modal-email');
const profileModalPhone = document.getElementById('profile-modal-phone');
const profileModalUnit = document.getElementById('profile-modal-unit');
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const editProfileImagePreview = document.getElementById('edit-profile-image-preview');
const editProfileImageInput = document.getElementById('edit-profile-image-input');
const editProfileName = document.getElementById('edit-profile-name');
const editProfilePhone = document.getElementById('edit-profile-phone');
const editProfileUnit = document.getElementById('edit-profile-unit');
const cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');

// Global variable to store current product ID being edited
let currentEditingProductId = null;

// Global variables for pagination and user management
let currentPage = 1;
let totalPages = 1;
let searchQuery = '';
let currentEditingUserId = null;
const PRODUCTS_PER_PAGE = 9;

// Shopping Cart Global Variables
let currentCart = []; // Array of objects: { productId, productName, quantity, stockAvailable }

// User Profile Global Variables
let currentUserProfileData = null; // Store current user's profile data
let selectedProfileImage = null; // Store selected image file for profile update

// Availability Check Global Variables
let selectedAvailabilityStart = null;
let selectedAvailabilityEnd = null;
let availabilityChecked = false;

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
 * Display modern toast notification to user
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Define icons and titles for each type
    const toastConfig = {
        success: {
            icon: '✓',
            title: 'نجح',
            ariaLive: 'polite'
        },
        error: {
            icon: '✕',
            title: 'خطأ',
            ariaLive: 'assertive'
        },
        warning: {
            icon: '⚠',
            title: 'تحذير',
            ariaLive: 'assertive'
        },
        info: {
            icon: 'ℹ',
            title: 'معلومات',
            ariaLive: 'polite'
        }
    };
    
    const config = toastConfig[type] || toastConfig.info;
    
    // Create toast HTML with modern structure
    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}" role="alert" aria-live="${config.ariaLive}" aria-atomic="true">
            <div class="toast-header">
                <div class="toast-icon">${config.icon}</div>
                <div class="toast-title">${config.title}</div>
                <button type="button" class="toast-close" aria-label="إغلاق">
                    ×
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const progressBar = toastElement.querySelector('.toast-progress-bar');
    const closeButton = toastElement.querySelector('.toast-close');
    
    // Show toast with animation
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    // Set up progress bar animation
    if (progressBar) {
        progressBar.style.animationDuration = `${duration}ms`;
    }
    
    // Auto-hide functionality
    let hideTimeout = setTimeout(() => {
        hideToast(toastElement);
    }, duration);
    
    // Pause on hover
    toastElement.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
    });
    
    // Resume on mouse leave
    toastElement.addEventListener('mouseleave', () => {
        const remainingTime = getRemainingTime(progressBar, duration);
        if (remainingTime > 0) {
            hideTimeout = setTimeout(() => {
                hideToast(toastElement);
            }, remainingTime);
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
        }
    });
    
    // Close button functionality
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearTimeout(hideTimeout);
        hideToast(toastElement);
    });
    
    // Keyboard accessibility
    toastElement.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearTimeout(hideTimeout);
            hideToast(toastElement);
        }
    });
    
    // Make toast focusable for accessibility
    toastElement.setAttribute('tabindex', '0');
    
    return toastId;
}

/**
 * Hide toast with animation
 * @param {HTMLElement} toastElement - Toast element to hide
 */
function hideToast(toastElement) {
    if (!toastElement || toastElement.classList.contains('hiding')) return;
    
    toastElement.classList.add('hiding');
    toastElement.classList.remove('show');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (toastElement && toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
        }
    }, 300);
}

/**
 * Get remaining time for progress bar animation
 * @param {HTMLElement} progressBar - Progress bar element
 * @param {number} totalDuration - Total duration in milliseconds
 * @returns {number} Remaining time in milliseconds
 */
function getRemainingTime(progressBar, totalDuration) {
    if (!progressBar) return 0;
    
    const computedStyle = window.getComputedStyle(progressBar);
    const transform = computedStyle.transform;
    
    if (transform === 'none') return totalDuration;
    
    // Extract scale value from transform matrix
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (!matrix) return totalDuration;
    
    const values = matrix[1].split(',');
    const scaleX = parseFloat(values[0]);
    
    // Calculate remaining time based on scale
    return Math.max(0, totalDuration * scaleX);
}

/**
 * Clear all toasts
 */
function clearAllToasts() {
    const toastContainer = document.getElementById('toast-container');
    const toasts = toastContainer.querySelectorAll('.toast');
    
    toasts.forEach(toast => {
        hideToast(toast);
    });
}

/**
 * Show toast with custom duration
 * @param {string} message - Message to display
 * @param {string} type - Type of toast
 * @param {number} duration - Duration in milliseconds
 */
function showToastWithDuration(message, type = 'info', duration = 5000) {
    return showToast(message, type, duration);
}

/**
 * Show persistent toast (doesn't auto-hide)
 * @param {string} message - Message to display
 * @param {string} type - Type of toast
 */
function showPersistentToast(message, type = 'info') {
    return showToast(message, type, Infinity);
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
    // Load all reservations for approval
    loadAllReservationsForApproval();
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
    // Clear cart when switching to user section
    currentCart = [];
    // Reset availability check
    availabilityChecked = false;
    selectedAvailabilityStart = null;
    selectedAvailabilityEnd = null;
    // Load user products when section is shown (without availability data initially)
    loadUserProducts();
    // Load user reservations
    loadUserReservations();
    // Initialize cart display
    renderCurrentCart();
    // Show return to admin button if user is admin/superadmin
    checkAndShowReturnButton();
    // Initialize availability interface
    initializeAvailabilityInterface();
}

// Authentication State Change Listener
auth.onAuthStateChanged(async (user) => {
    try {
        console.log('Auth state changed. User:', user ? user.email : 'null');
        
        if (user) {
            console.log('User signed in:', user.email);
            console.log('User UID:', user.uid);
            
            // Query Firestore for user document with retry logic
            console.log('Looking for document at path: users/' + user.uid);
            
            try {
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
            } catch (firestoreError) {
                console.error('Firestore connection error:', firestoreError);
                
                // Check if it's an offline error
                if (firestoreError.code === 'unavailable' || firestoreError.message.includes('offline')) {
                    console.warn('Firestore is offline, but user is authenticated. Showing UI anyway.');
                    showToast('تحذير: لا يمكن الاتصال بقاعدة البيانات. بعض الميزات قد لا تعمل.', 'warning');
                    
                    // Show admin section as fallback (you can adjust this logic)
                    showAdminSection();
                    isAuthStateInitialized = true;
                    isAuthReady = true;
                } else {
                    // Other Firestore errors
                    showToast('خطأ في الاتصال بقاعدة البيانات: ' + firestoreError.message, 'error');
                    showSection(authSection, adminSection, userSection);
                    isAuthStateInitialized = true;
                    isAuthReady = true;
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

// Finalize Request Form Event Listener
if (finalizeRequestForm) {
    finalizeRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get shared details from form
        const recipientName = requestRecipientName.value.trim();
        const recipientMobile = requestRecipientMobile.value.trim();
        const unit = requestUnit.value;
        const startTime = requestStartTime.value;
        const endTime = requestEndTime.value;
        
        // Validate shared details
        if (!recipientName || !recipientMobile || !unit || !startTime || !endTime) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }
        
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        if (endDate <= startDate) {
            showToast('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية', 'warning');
            return;
        }
        
        // Validate cart is not empty
        if (currentCart.length === 0) {
            showToast('يرجى إضافة منتجات للطلب أولاً', 'warning');
            return;
        }
        
        try {
            // Disable submit button to prevent double submission
            completeRequestBtn.disabled = true;
            completeRequestBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>جاري المعالجة...';
            
            const requestedStartTime = new Date(startTime);
            const requestedEndTime = new Date(endTime);
            
            // STEP 1: Query existing overlapping reservations OUTSIDE the transaction
            console.log('🔍 Checking for overlapping reservations...');
            const overlappingReservationsQuery = db.collection('reservations')
                .where('status', 'in', ['Active', 'Approved']);
            
            const existingReservationsSnap = await overlappingReservationsQuery.get();
            
            // Pre-calculate concurrent reservations for each product
            const productConcurrentReservations = {};
            
            existingReservationsSnap.forEach(resDoc => {
                const reservationData = resDoc.data();
                
                // Check if this reservation overlaps with our requested time period
                const existingStart = reservationData.reservation_start.toDate();
                const existingEnd = reservationData.reservation_end.toDate();
                
                // Check for overlap: (StartA < EndB) and (EndA > StartB)
                const hasTimeOverlap = existingStart < requestedEndTime && existingEnd > requestedStartTime;
                
                if (hasTimeOverlap) {
                    // Handle both old and new reservation formats
                    if (reservationData.items && Array.isArray(reservationData.items)) {
                        // New multi-item format
                        reservationData.items.forEach(item => {
                            if (!productConcurrentReservations[item.productId]) {
                                productConcurrentReservations[item.productId] = 0;
                            }
                            productConcurrentReservations[item.productId] += item.quantity;
                        });
                    } else if (reservationData.product_id) {
                        // Old single-item format (backward compatibility)
                        if (!productConcurrentReservations[reservationData.product_id]) {
                            productConcurrentReservations[reservationData.product_id] = 0;
                        }
                        productConcurrentReservations[reservationData.product_id] += reservationData.quantity;
                    }
                }
            });
            
            console.log('📊 Concurrent reservations by product:', productConcurrentReservations);
            
            // STEP 2: Create reservation using Firestore transaction with pre-calculated availability
            const requestRef = db.collection('reservations').doc();
            
            await db.runTransaction(async (transaction) => {
                const itemsForFirestore = [];

                // --- Time-Based Availability Check Logic (using pre-calculated data) ---
                for (const cartItem of currentCart) {
                    const productRef = db.collection('products').doc(cartItem.productId);
                    const productDoc = await transaction.get(productRef); // Get total physical stock

                    if (!productDoc.exists) {
                        throw new Error(`Product "${cartItem.productName}" not found!`);
                    }
                    const totalPhysicalStock = productDoc.data().stock_count;

                    if (cartItem.quantity > totalPhysicalStock) {
                        throw new Error(`Requested quantity for "${cartItem.productName}" (${cartItem.quantity}) exceeds total physical stock (${totalPhysicalStock}).`);
                    }

                    // Get concurrent reservations for this product (pre-calculated)
                    const concurrentReservationsForThisProduct = productConcurrentReservations[cartItem.productId] || 0;
                    const availableStockDuringPeriod = totalPhysicalStock - concurrentReservationsForThisProduct;

                    console.log(`📦 Product: ${cartItem.productName}`);
                    console.log(`   Total Physical Stock: ${totalPhysicalStock}`);
                    console.log(`   Concurrent Reservations: ${concurrentReservationsForThisProduct}`);
                    console.log(`   Available During Period: ${availableStockDuringPeriod}`);
                    console.log(`   Requested: ${cartItem.quantity}`);

                    if (cartItem.quantity > availableStockDuringPeriod) {
                        throw new Error(`Not enough stock for "${cartItem.productName}" during the requested period. Available: ${availableStockDuringPeriod}, Requested: ${cartItem.quantity}.`);
                    }

                    // NO direct decrement of product.stock_count HERE in this model.
                    // The `product.stock_count` remains the total physical items.
                    // Availability is determined by the absence of overlapping reservations up to the totalPhysicalStock.

                    itemsForFirestore.push({
                        productId: cartItem.productId,
                        productNameEn: cartItem.productNameEn,
                        productNameAr: cartItem.productName,
                        quantity: cartItem.quantity
                    });
                } // End of for...of currentCart loop

                // Now set the main reservation document (the "request")
                transaction.set(requestRef, {
                    user_id: auth.currentUser.uid,
                    user_email: auth.currentUser.email,
                    items: itemsForFirestore,
                    reservation_start: firebase.firestore.Timestamp.fromDate(requestedStartTime),
                    reservation_end: firebase.firestore.Timestamp.fromDate(requestedEndTime),
                    status: 'Active',
                    stock_restored_for_items: {}, // Initialize as empty
                    all_items_stock_restored: false,
                    recipient_name: recipientName,
                    recipient_mobile: recipientMobile,
                    unit: unit,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                    activity_history: [
                        {
                            action: 'created',
                            performed_by: auth.currentUser.email,
                            details: `تم إنشاء طلب حجز يحتوي على ${itemsForFirestore.length} منتج بإجمالي كمية ${itemsForFirestore.reduce((sum, item) => sum + item.quantity, 0)}`,
                            timestamp: firebase.firestore.Timestamp.now(),
                            metadata: {
                                items_count: itemsForFirestore.length,
                                total_quantity: itemsForFirestore.reduce((sum, item) => sum + item.quantity, 0),
                                items_summary: itemsForFirestore.map(item => `${item.productNameAr} (${item.quantity})`).join(', ')
                            }
                        }
                    ]
                });
            }); // End of db.runTransaction

            showToast('تم إنشاء طلب الحجز بنجاح (مع فحص التوافر).', 'success');
            finalizeRequestForm.reset();
            currentCart = []; // Clear the cart
            renderCurrentCart(); // Update UI
            
            // Refresh product listings and reservations
            loadUserProducts(searchQuery);
            loadUserReservations();
            
        } catch (error) {
            console.error('Error creating reservation:', error);
            let errorMessage = 'خطأ في إنشاء طلب الحجز';
            
            if (error.message.includes('Not enough stock for')) {
                errorMessage = 'عذراً، ' + error.message;
            } else if (error.message.includes('Requested quantity for')) {
                errorMessage = 'عذراً، ' + error.message;
            } else if (error.message.includes('not found!')) {
                errorMessage = 'أحد المنتجات غير موجود';
            } else {
                errorMessage = `خطأ: ${error.message}`;
            }
            
            showToast(errorMessage, 'error');
        } finally {
            // Re-enable submit button
            completeRequestBtn.disabled = false;
            completeRequestBtn.innerHTML = 'إتمام الطلب';
        }
    });
}

// Product Management Functions

/**
 * Load and display admin products in real-time
 */
function loadAdminProducts() {
    // Check if Firestore is available
    if (!db) {
        console.error('Firestore is not initialized');
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-warning">خطأ: قاعدة البيانات غير متاحة</td>
            </tr>
        `;
        return;
    }

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
            
            // Handle specific error types
            if (error.code === 'unavailable') {
                productsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-warning">
                            لا يمكن الاتصال بقاعدة البيانات حالياً. يرجى المحاولة لاحقاً.
                            <br><button class="btn btn-sm btn-primary mt-2" onclick="loadAdminProducts()">إعادة المحاولة</button>
                        </td>
                    </tr>
                `;
                showToast('لا يمكن الاتصال بقاعدة البيانات', 'warning');
            } else {
                productsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            خطأ في تحميل المنتجات: ${error.message}
                            <br><button class="btn btn-sm btn-primary mt-2" onclick="loadAdminProducts()">إعادة المحاولة</button>
                        </td>
                    </tr>
                `;
                showToast('خطأ في تحميل المنتجات: ' + error.message, 'error');
            }
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
        <td style="display: flex; justify-content: space-between; align-items: center;">
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
    showConfirmationToast(
        `هل أنت متأكد من حذف المنتج "${productName}"؟`,
        async () => {
            // User confirmed deletion
            try {
                await db.collection('products').doc(productId).delete();
                showSuccessToast('تم حذف المنتج بنجاح');
                loadAdminProducts(); // Reload the products table
            } catch (error) {
                console.error('Error deleting product:', error);
                showErrorToast('خطأ في حذف المنتج: ' + error.message);
            }
        },
        () => {
            // User cancelled deletion
            showInfoToast('تم إلغاء عملية الحذف');
        },
        'حذف',
        'إلغاء'
    );
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
 * Calculate available stock for products during a specific time period
 * @param {Date} startTime - Start time of the period
 * @param {Date} endTime - End time of the period
 * @returns {Promise<Object>} - Object with productId as key and availability info including reservation details
 */
async function calculateAvailableStock(startTime, endTime) {
    try {
        console.log('🔍 Calculating available stock for period:', startTime, 'to', endTime);
        
        // Query existing overlapping reservations
        const overlappingReservationsQuery = db.collection('reservations')
            .where('status', 'in', ['Active', 'Approved']);
        
        const existingReservationsSnap = await overlappingReservationsQuery.get();
        
        // Calculate concurrent reservations for each product with detailed reservation info
        const productConcurrentReservations = {};
        const productReservationDetails = {}; // New: Store detailed reservation info
        
        existingReservationsSnap.forEach(resDoc => {
            const reservationData = resDoc.data();
            const reservationId = resDoc.id;
            
            // Check if this reservation overlaps with our requested time period
            const existingStart = reservationData.reservation_start.toDate();
            const existingEnd = reservationData.reservation_end.toDate();
            
            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            const hasTimeOverlap = existingStart < endTime && existingEnd > startTime;
            
            if (hasTimeOverlap) {
                // Handle both old and new reservation formats
                if (reservationData.items && Array.isArray(reservationData.items)) {
                    // New multi-item format
                    reservationData.items.forEach(item => {
                        if (!productConcurrentReservations[item.productId]) {
                            productConcurrentReservations[item.productId] = 0;
                            productReservationDetails[item.productId] = [];
                        }
                        productConcurrentReservations[item.productId] += item.quantity;
                        
                        // Add detailed reservation info
                        productReservationDetails[item.productId].push({
                            reservationId: reservationId,
                            userEmail: reservationData.user_email,
                            recipientName: reservationData.recipient_name || 'غير محدد',
                            recipientMobile: reservationData.recipient_mobile || 'غير محدد',
                            unit: reservationData.unit || 'غير محدد',
                            startDate: existingStart,
                            endDate: existingEnd,
                            status: reservationData.status,
                            quantity: item.quantity,
                            productName: item.productNameAr || item.productNameEn || 'غير محدد',
                            createdAt: reservationData.created_at
                        });
                    });
                } else if (reservationData.product_id) {
                    // Old single-item format (backward compatibility)
                    if (!productConcurrentReservations[reservationData.product_id]) {
                        productConcurrentReservations[reservationData.product_id] = 0;
                        productReservationDetails[reservationData.product_id] = [];
                    }
                    productConcurrentReservations[reservationData.product_id] += reservationData.quantity;
                    
                    // Add detailed reservation info
                    productReservationDetails[reservationData.product_id].push({
                        reservationId: reservationId,
                        userEmail: reservationData.user_email,
                        recipientName: reservationData.recipient_name || 'غير محدد',
                        recipientMobile: reservationData.recipient_mobile || 'غير محدد',
                        unit: reservationData.unit || 'غير محدد',
                        startDate: existingStart,
                        endDate: existingEnd,
                        status: reservationData.status,
                        quantity: reservationData.quantity,
                        productName: reservationData.product_name_ar || reservationData.product_name_en || 'غير محدد',
                        createdAt: reservationData.created_at
                    });
                }
            }
        });
        
        // Get all products and calculate available stock
        const productsSnapshot = await db.collection('products').get();
        const availableStock = {};
        
        productsSnapshot.forEach(doc => {
            const productData = doc.data();
            const productId = doc.id;
            const totalStock = productData.stock_count;
            const reservedStock = productConcurrentReservations[productId] || 0;
            const availableQuantity = Math.max(0, totalStock - reservedStock);
            
            availableStock[productId] = {
                total: totalStock,
                reserved: reservedStock,
                available: availableQuantity,
                reservationDetails: productReservationDetails[productId] || [] // Include detailed reservation info
            };
        });
        
        console.log('📊 Available stock calculated:', availableStock);
        return availableStock;
        
    } catch (error) {
        console.error('Error calculating available stock:', error);
        throw error;
    }
}

/**
 * Load and display user products with optional search and availability check
 * @param {string} searchQuery - Optional search query
 * @param {Object} availableStock - Optional available stock data for specific period
 */
function loadUserProducts(searchQuery = '', availableStock = null) {
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
                    displayUserProduct(id, data, availableStock);
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
 * @param {Object} availableStock - Available stock data for specific period (optional)
 */
function displayUserProduct(productId, product, availableStock = null) {
    if (!userProductsDiv) return;
    
    // Determine stock status based on availability check or total stock
    let stockClass = 'stock-available';
    let stockText = '';
    let actualAvailableStock = product.stock_count;
    let showAvailabilityInfo = false;
    let reservationDetails = [];
    
    if (availableStock && availableStock[productId]) {
        // Use time-based availability
        const stockInfo = availableStock[productId];
        actualAvailableStock = stockInfo.available;
        showAvailabilityInfo = true;
        reservationDetails = stockInfo.reservationDetails || [];
        
        if (stockInfo.available === 0) {
            stockClass = 'stock-out';
            stockText = `غير متوفر خلال الفترة المحددة`;
        } else if (stockInfo.available <= 5) {
            stockClass = 'stock-low';
            stockText = `متوفر خلال الفترة: ${stockInfo.available}`;
        } else {
            stockClass = 'stock-available';
            stockText = `متوفر خلال الفترة: ${stockInfo.available}`;
        }
        
        // Add additional info about total and reserved
        if (stockInfo.reserved > 0) {
            stockText += ` (إجمالي: ${stockInfo.total}, محجوز: ${stockInfo.reserved})`;
        } else {
            stockText += ` (إجمالي: ${stockInfo.total})`;
        }
    } else {
        // Use total stock (default behavior when no availability check)
        if (product.stock_count === 0) {
            stockClass = 'stock-out';
            stockText = 'غير متوفر';
        } else if (product.stock_count <= 5) {
            stockClass = 'stock-low';
            stockText = `كمية قليلة: ${product.stock_count}`;
        } else {
            stockClass = 'stock-available';
            stockText = `متوفر: ${product.stock_count}`;
        }
    }
    
    // Determine if add to cart should be disabled
    const isOutOfStock = actualAvailableStock === 0;
    const needsAvailabilityCheck = !availabilityChecked && !availableStock;
    const disableAddToCart = isOutOfStock || needsAvailabilityCheck;
    
    // Check if there are reservations to show
    const hasReservations = reservationDetails.length > 0;
    
    const productCard = document.createElement('div');
    productCard.className = 'col-md-4 col-sm-6 mb-4';
    productCard.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.image_url}" class="card-img-top" alt="${product.name_ar}">
            <div class="card-body d-flex flex-column">
                <h5 class="product-title">${product.name_ar}</h5>
                <p class="text-muted small">${product.name_en}</p>
                <p class="product-stock ${stockClass}">${stockText}</p>
                ${needsAvailabilityCheck ? `
                    <div class="alert alert-warning small">
                        <i class="fas fa-exclamation-triangle"></i>
                        يرجى اختيار فترة الحجز أولاً لعرض المخزون المتاح
                    </div>
                ` : ''}
                ${hasReservations ? `
                    <div class="reservation-info-section mb-2">
                        <button type="button" class="btn btn-info btn-sm btn-block view-reservations-btn" 
                                data-product-id="${productId}" 
                                data-product-name="${product.name_ar}">
                            <i class="fas fa-eye"></i> عرض الحجوزات المتداخلة (${reservationDetails.length})
                        </button>
                    </div>
                ` : ''}
                <div class="mt-auto">
                    <!-- Add to Cart Section -->
                    <div class="add-to-cart-section">
                        <div class="quantity-input-group">
                            <label for="qty-${productId}">الكمية:</label>
                            <input type="number" class="form-control" id="qty-${productId}" 
                                   min="1" max="${actualAvailableStock}" value="1" 
                                   ${disableAddToCart ? 'disabled' : ''}>
                        </div>
                        <button type="button" class="btn btn-primary btn-block add-to-cart-btn" 
                                data-product-id="${productId}" 
                                ${disableAddToCart ? 'disabled' : ''}>
                            ${needsAvailabilityCheck ? 'اختر فترة الحجز أولاً' : 'إضافة للطلب'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    userProductsDiv.appendChild(productCard);
    
    // Add event listener for the "Add to Cart" button
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    if (addToCartBtn && !disableAddToCart) {
        addToCartBtn.addEventListener('click', () => {
            addProductToCart(productId, product, actualAvailableStock);
        });
    }
    
    // Add event listener for the "View Reservations" button
    const viewReservationsBtn = productCard.querySelector('.view-reservations-btn');
    if (viewReservationsBtn && hasReservations) {
        viewReservationsBtn.addEventListener('click', () => {
            showProductReservationsModal(productId, product.name_ar, reservationDetails);
        });
    }
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
        // Verify current admin is still signed in
        const currentAdmin = auth.currentUser;
        if (!currentAdmin) {
            throw new Error('No admin user is currently signed in');
        }
        
        const adminEmail = currentAdmin.email;
        console.log('Creating user with secondary app to preserve admin session...');
        console.log('Current admin:', adminEmail);
        
        // Create the new user using secondary app (this won't affect the main auth state)
        const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;
        
        console.log('New user created with UID:', newUser.uid);
        
        // Add user document to Firestore using the main app's db instance
        await db.collection('users').doc(newUser.uid).set({
            email: email,
            role: role,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('User document created in Firestore');
        
        // Sign out the newly created user from secondary app
        await secondaryAuth.signOut();
        
        console.log('New user signed out from secondary app');
        
        // Verify admin session is still active
        const stillAdmin = auth.currentUser;
        if (!stillAdmin || stillAdmin.email !== adminEmail) {
            console.error('Admin session was lost during user creation!');
            throw new Error('Admin session was compromised during user creation');
        }
        
        console.log('✅ Admin session preserved successfully:', stillAdmin.email);
        
        showToast('تم إنشاء المستخدم بنجاح! يمكنك الآن إضافة مستخدمين آخرين.', 'success');
        
        // Refresh the users list if the modal is open
        if (usersTableBody && !manageUsersModal.classList.contains('hidden')) {
            loadUsers();
        }
        
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
        // Load roles when modal opens to ensure dropdown is populated
        loadRoles();
        // Focus on email field for better UX
        setTimeout(() => {
            if (newUserEmail) {
                newUserEmail.focus();
            }
        }, 300);
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
            
            console.log('Starting user creation process...');
            const success = await createNewUser(email, password, role);
            
            if (success) {
                // Reset form and keep modal open for creating more users
                createUserForm.reset();
                
                // Show success message with option to close modal
                showToast('تم إنشاء المستخدم بنجاح! يمكنك إضافة مستخدم آخر أو إغلاق النافذة.', 'success', 6000);
                
                // Focus back on email field for quick addition of another user
                setTimeout(() => {
                    if (newUserEmail) {
                        newUserEmail.focus();
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('Error in create user form:', error);
            showToast('حدث خطأ غير متوقع أثناء إنشاء المستخدم', 'error');
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

// Go to Dashboard Button Event Listener
if (goToDashboardBtn) {
    goToDashboardBtn.addEventListener('click', () => {
        window.location.href = 'admin_dashboard.html';
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
        // Close reservation details modal
        if (reservationDetailsModal && !reservationDetailsModal.classList.contains('hidden')) {
            hideReservationDetailsModal();
        }
        // Close product reservations modal
        const productReservationsModal = document.getElementById('product-reservations-modal');
        if (productReservationsModal && !productReservationsModal.classList.contains('hidden')) {
            hideProductReservationsModal();
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
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.viewReservationDetails = viewReservationDetails;
window.approveReservation = approveReservation;
window.declineReservation = declineReservation;
window.cancelReservation = cancelReservation;
window.rejectSingleItem = rejectSingleItem;
window.showProductReservationsModal = showProductReservationsModal;
window.hideProductReservationsModal = hideProductReservationsModal;

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
    showConfirmationToast(
        `هل أنت متأكد من حذف المستخدم "${userEmail}"؟`,
        async () => {
            // User confirmed deletion
            try {
                await db.collection('users').doc(userId).delete();
                showSuccessToast('تم حذف المستخدم بنجاح');
                loadUsers(); // Reload the users table
            } catch (error) {
                console.error('Error deleting user:', error);
                showErrorToast('خطأ في حذف المستخدم: ' + error.message);
            }
        },
        () => {
            // User cancelled deletion
            showInfoToast('تم إلغاء عملية الحذف');
        },
        'حذف',
        'إلغاء'
    );
}

// Reservation Management Functions

/**
 * Load user reservations and display them in the table
 */
function loadUserReservations() {
    if (!reservationsTableBody || !auth.currentUser) return;
    
    // Clear existing content
    reservationsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">جاري التحميل...</td></tr>';
    
    // Set up real-time listener for user reservations
    const unsubscribe = db.collection('reservations')
        .where('user_id', '==', auth.currentUser.uid)
        .orderBy('created_at', 'desc')
        .onSnapshot((querySnapshot) => {
            reservationsTableBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                reservationsTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">لا توجد حجوزات سابقة</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const reservation = doc.data();
                const reservationRow = createUserReservationRow(doc.id, reservation);
                reservationsTableBody.appendChild(reservationRow);
            });
        }, (error) => {
            console.error('Error loading user reservations:', error);
            showToast('خطأ في تحميل الحجوزات: ' + error.message, 'error');
            reservationsTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">خطأ في التحميل</td></tr>';
        });
    
    // Store the unsubscribe function for cleanup if needed
    window.userReservationsUnsubscribe = unsubscribe;
}

/**
 * Create a table row for user reservation
 * @param {string} reservationId - Reservation document ID
 * @param {Object} reservationData - Reservation data
 * @returns {HTMLElement} - Table row element
 */
function createUserReservationRow(reservationId, reservationData) {
    const row = document.createElement('tr');
    
    // Format dates
    const formatDate = (timestamp) => {
        if (!timestamp) return 'غير محدد';
        try {
            let date;
            
            // Handle Firestore Timestamp objects
            if (timestamp && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            // Handle Firestore Timestamp objects with seconds/nanoseconds
            else if (timestamp && timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            }
            // Handle regular Date objects
            else if (timestamp instanceof Date) {
                date = timestamp;
            }
            // Handle timestamp numbers (milliseconds)
            else if (typeof timestamp === 'number') {
                date = new Date(timestamp);
            }
            // Handle timestamp strings
            else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            }
            // Handle objects with _seconds property (sometimes Firestore returns this)
            else if (timestamp && timestamp._seconds) {
                date = new Date(timestamp._seconds * 1000);
            }
            else {
                return 'غير محدد';
            }
            
            // Validate the date
            if (isNaN(date.getTime())) {
                return 'غير محدد';
            }
            
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting date:', e, timestamp);
            return 'غير محدد';
        }
    };
    
    // Status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return '<span class="badge badge-primary">نشط</span>';
            case 'Approved':
                return '<span class="badge badge-success">مقبول</span>';
            case 'Declined':
                return '<span class="badge badge-danger">مرفوض</span>';
            case 'Cancelled':
                return '<span class="badge badge-secondary">ملغي</span>';
            case 'Completed':
                return '<span class="badge badge-info">مكتمل</span>';
            default:
                return '<span class="badge badge-light">غير محدد</span>';
        }
    };
    
    // Handle both old single-item and new multi-item reservation formats
    let productDisplay = 'غير محدد';
    let quantityDisplay = '0';
    let actionsDisplay = '';
    
    if (reservationData.items && Array.isArray(reservationData.items)) {
        // New multi-item format
        const itemsSummary = reservationData.items.map(item => `${item.productNameEn || item.productNameAr || 'غير محدد'} (x${item.quantity || 0})`).join('<br>');
        const totalQuantity = reservationData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        productDisplay = itemsSummary;
        quantityDisplay = totalQuantity + " (إجمالي)";
        
        // Show cancel button only for Active reservations
        if (reservationData.status === 'Active') {
            actionsDisplay = `
                <button class="btn btn-sm btn-info btn-view-details mr-1" 
                        onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    عرض التفاصيل
                </button>
                <button class="btn btn-sm btn-warning" 
                        onclick="cancelReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    إلغاء الحجز
                </button>
            `;
        } else {
            actionsDisplay = `
                <button class="btn btn-sm btn-info btn-view-details mr-1" 
                        onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    عرض التفاصيل
                </button>
            `;
        }
    } else {
        // Old single-item format (backward compatibility)
        productDisplay = reservationData.product_name_en || 'غير محدد';
        quantityDisplay = reservationData.quantity || 0;
        
        // Show cancel button only for Active reservations
        if (reservationData.status === 'Active') {
            actionsDisplay = `
                <button class="btn btn-sm btn-info btn-view-details mr-1" 
                        onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    عرض التفاصيل
                </button>
                <button class="btn btn-sm btn-warning" 
                        onclick="cancelReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    إلغاء الحجز
                </button>
            `;
        } else {
            actionsDisplay = `
                <button class="btn btn-sm btn-info btn-view-details mr-1" 
                        onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    عرض التفاصيل
                </button>
            `;
        }
    }
    
    row.innerHTML = `
        <td>${reservationData.user_email || 'غير محدد'}</td>
        <td>${productDisplay}</td>
        <td>${quantityDisplay}</td>
        <td>${formatDate(reservationData.reservation_start)}</td>
        <td>${formatDate(reservationData.reservation_end)}</td>
        <td>${getStatusBadge(reservationData.status)}</td>
        <td>${actionsDisplay}</td>
    `;
    
    return row;
}

/**
 * Load all reservations for admin approval
 */
function loadAllReservationsForApproval() {
    if (!reservationsApprovalTableBody) return;
    
    // Clear existing content
    reservationsApprovalTableBody.innerHTML = '<tr><td colspan="7" class="text-center">جاري التحميل...</td></tr>';
    
    // Set up real-time listener for active reservations
    const unsubscribe = db.collection('reservations')
        .where('status', '==', 'Active')
        .orderBy('created_at', 'desc')
        .onSnapshot((querySnapshot) => {
            reservationsApprovalTableBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                reservationsApprovalTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد طلبات حجز نشطة</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const reservation = doc.data();
                const reservationRow = createAdminReservationRow(doc.id, reservation);
                reservationsApprovalTableBody.appendChild(reservationRow);
            });
        }, (error) => {
            console.error('Error loading reservations for approval:', error);
            showToast('خطأ في تحميل طلبات الحجز: ' + error.message, 'error');
            reservationsApprovalTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">خطأ في التحميل</td></tr>';
        });
    
    // Store the unsubscribe function for cleanup if needed
    window.adminReservationsUnsubscribe = unsubscribe;
}

/**
 * Create a table row for admin reservation approval
 * @param {string} reservationId - Reservation document ID
 * @param {Object} reservationData - Reservation data
 * @returns {HTMLElement} - Table row element
 */
function createAdminReservationRow(reservationId, reservationData) {
    const row = document.createElement('tr');
    
    // Format dates
    const formatDate = (timestamp) => {
        if (!timestamp) return 'غير محدد';
        try {
            let date;
            
            // Handle Firestore Timestamp objects
            if (timestamp && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            // Handle Firestore Timestamp objects with seconds/nanoseconds
            else if (timestamp && timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            }
            // Handle regular Date objects
            else if (timestamp instanceof Date) {
                date = timestamp;
            }
            // Handle timestamp numbers (milliseconds)
            else if (typeof timestamp === 'number') {
                date = new Date(timestamp);
            }
            // Handle timestamp strings
            else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            }
            // Handle objects with _seconds property (sometimes Firestore returns this)
            else if (timestamp && timestamp._seconds) {
                date = new Date(timestamp._seconds * 1000);
            }
            else {
                return 'غير محدد';
            }
            
            // Validate the date
            if (isNaN(date.getTime())) {
                return 'غير محدد';
            }
            
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting date:', e, timestamp);
            return 'غير محدد';
        }
    };
    
    // Status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return '<span class="badge badge-primary">نشط</span>';
            case 'Approved':
                return '<span class="badge badge-success">مقبول</span>';
            case 'Declined':
                return '<span class="badge badge-danger">مرفوض</span>';
            case 'Cancelled':
                return '<span class="badge badge-secondary">ملغي</span>';
            case 'Completed':
                return '<span class="badge badge-info">مكتمل</span>';
            default:
                return '<span class="badge badge-light">غير محدد</span>';
        }
    };
    
    // Handle both old single-item and new multi-item reservation formats
    let productDisplay = 'غير محدد';
    let quantityDisplay = '0';
    let actionsDisplay = '';
    
    if (reservationData.items && Array.isArray(reservationData.items)) {
        // New multi-item format
        const itemsSummary = reservationData.items.map(item => `${item.productNameEn || item.productNameAr || 'غير محدد'} (x${item.quantity || 0})`).join(', ');
        const totalQuantity = reservationData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        productDisplay = itemsSummary;
        quantityDisplay = totalQuantity + " (إجمالي)";
        
        actionsDisplay = `
            <button class="btn btn-sm btn-info btn-view-details mr-1" 
                    onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                عرض التفاصيل
            </button>
            <button class="btn btn-sm btn-success mr-1" 
                    onclick="approveReservation('${reservationId}')">
                قبول
            </button>
            <button class="btn btn-sm btn-danger" 
                    onclick="declineReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                رفض
            </button>
        `;
    } else {
        // Old single-item format (backward compatibility)
        productDisplay = reservationData.product_name_en || 'غير محدد';
        quantityDisplay = reservationData.quantity || 0;
        actionsDisplay = `
            <button class="btn btn-sm btn-info btn-view-details mr-1" 
                    onclick="viewReservationDetails('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                عرض التفاصيل
            </button>
            <button class="btn btn-sm btn-success mr-1" 
                    onclick="approveReservation('${reservationId}')">
                قبول
            </button>
            <button class="btn btn-sm btn-danger" 
                    onclick="declineReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                رفض
            </button>
        `;
    }
    
    row.innerHTML = `
        <td>${reservationData.user_email || 'غير محدد'}</td>
        <td>${productDisplay}</td>
        <td>${quantityDisplay}</td>
        <td>${formatDate(reservationData.reservation_start)}</td>
        <td>${formatDate(reservationData.reservation_end)}</td>
        <td>${getStatusBadge(reservationData.status)}</td>
        <td>${actionsDisplay}</td>
    `;
    
    return row;
}

/**
 * Add a product to the shopping cart
 * @param {string} productId - Product document ID
 * @param {Object} product - Product data
 * @param {number} actualAvailableStock - Available stock for the selected period
 */
function addProductToCart(productId, product, actualAvailableStock = null) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const selectedQuantity = parseInt(quantityInput.value);
    
    // Use provided available stock or fall back to total stock
    const availableStock = actualAvailableStock !== null ? actualAvailableStock : product.stock_count;
    
    // Validate quantity
    if (!selectedQuantity || selectedQuantity <= 0) {
        showToast('يرجى إدخال كمية صحيحة', 'warning');
        return;
    }
    
    if (selectedQuantity > availableStock) {
        const message = actualAvailableStock !== null ? 
            'الكمية المطلوبة أكبر من المخزون المتاح خلال الفترة المحددة' : 
            'الكمية المطلوبة أكبر من إجمالي المخزون المتاح';
        showToast(message, 'warning');
        return;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        // Update existing item
        const newQuantity = currentCart[existingItemIndex].quantity + selectedQuantity;
        if (newQuantity > availableStock) {
            const message = actualAvailableStock !== null ? 
                `لا يمكن إضافة هذه الكمية. الحد الأقصى المتاح خلال الفترة: ${availableStock}` :
                `لا يمكن إضافة هذه الكمية. الحد الأقصى للمخزون: ${availableStock}`;
            showToast(message, 'warning');
            return;
        }
        currentCart[existingItemIndex].quantity = newQuantity;
        currentCart[existingItemIndex].stockAvailable = availableStock; // Update available stock
        showToast('تم تحديث كمية المنتج في الطلب', 'success');
    } else {
        // Add new item
        currentCart.push({
            productId: productId,
            productName: product.name_ar,
            productNameEn: product.name_en,
            quantity: selectedQuantity,
            stockAvailable: availableStock
        });
        showToast('تمت إضافة المنتج للطلب', 'success');
    }
    
    // Reset quantity input
    quantityInput.value = 1;
    
    // Update cart display
    renderCurrentCart();
}

/**
 * Render the current cart items
 */
function renderCurrentCart() {
    if (!currentRequestItemsDiv) return;
    
    // Clear current display
    currentRequestItemsDiv.innerHTML = '';
    
    if (currentCart.length === 0) {
        currentRequestItemsDiv.innerHTML = '<p class="text-muted text-center cart-empty">لم تقم بإضافة أي منتجات للطلب بعد.</p>';
        
        // Hide finalize form and disable submit button
        if (finalizeRequestForm) {
            finalizeRequestForm.style.display = 'none';
        }
        if (completeRequestBtn) {
            completeRequestBtn.disabled = true;
        }
        
        // Clear form fields when cart is empty (Iteration 4.5)
        clearRequestForm();
        
        return;
    }
    
    // Show finalize form and enable submit button
    if (finalizeRequestForm) {
        finalizeRequestForm.style.display = 'block';
    }
    if (completeRequestBtn) {
        completeRequestBtn.disabled = false;
    }
    
    // Pre-fill form fields with user profile data (Iteration 4.5)
    preFillRequestForm();

    // Create cart summary
    const cartSummary = document.createElement('div');
    cartSummary.className = 'cart-summary';
    cartSummary.innerHTML = `
        <div class="cart-total-items">
            إجمالي المنتجات: ${currentCart.length} منتج | 
            إجمالي الكمية: ${currentCart.reduce((total, item) => total + item.quantity, 0)}
        </div>
    `;
    currentRequestItemsDiv.appendChild(cartSummary);
    
    // Create cart table
    const cartTable = document.createElement('table');
    cartTable.className = 'table cart-table';
    cartTable.innerHTML = `
        <thead>
            <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>الاختيارات</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = cartTable.querySelector('tbody');
    
    // Add cart items
    currentCart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${item.productName}</strong><br>
                <small class="text-muted">${item.productNameEn}</small>
            </td>
            <td>
                <div class="quantity-controls">
                    <button type="button" class="btn btn-sm btn-outline-secondary" 
                            onclick="updateCartItemQuantity(${index}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary" 
                            onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger" 
                        onclick="removeCartItem(${index})">إزالة</button>
        </td>
    `;
        tbody.appendChild(row);
    });
    
    currentRequestItemsDiv.appendChild(cartTable);
}

/**
 * Update cart item quantity
 * @param {number} itemIndex - Index of item in cart
 * @param {number} change - Change in quantity (+1 or -1)
 */
function updateCartItemQuantity(itemIndex, change) {
    if (itemIndex < 0 || itemIndex >= currentCart.length) return;
    
    const item = currentCart[itemIndex];
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeCartItem(itemIndex);
        return;
    }
    
    if (newQuantity > item.stockAvailable) {
        showToast(`لا يمكن زيادة الكمية. الحد الأقصى المتاح: ${item.stockAvailable}`, 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    renderCurrentCart();
}

/**
 * Remove item from cart
 * @param {number} itemIndex - Index of item to remove
 */
function removeCartItem(itemIndex) {
    if (itemIndex < 0 || itemIndex >= currentCart.length) return;
    
    const item = currentCart[itemIndex];
    currentCart.splice(itemIndex, 1);
    showToast(`تم إزالة ${item.productName} من الطلب`, 'info');
    renderCurrentCart();
}

/**
 * View detailed information about a reservation
 * @param {string} reservationId - Reservation document ID
 * @param {Object} reservationData - Reservation data
 */
function viewReservationDetails(reservationId, reservationData) {
    if (!reservationDetailsModal || !reservationDetailsContent) return;
    
    // Format dates
    const formatDate = (timestamp) => {
        if (!timestamp) return 'غير محدد';
        try {
            let date;
            
            // Handle Firestore Timestamp objects
            if (timestamp && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            }
            // Handle Firestore Timestamp objects with seconds/nanoseconds
            else if (timestamp && timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            }
            // Handle regular Date objects
            else if (timestamp instanceof Date) {
                date = timestamp;
            }
            // Handle timestamp numbers (milliseconds)
            else if (typeof timestamp === 'number') {
                date = new Date(timestamp);
            }
            // Handle timestamp strings
            else if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            }
            // Handle objects with _seconds property (sometimes Firestore returns this)
            else if (timestamp && timestamp._seconds) {
                date = new Date(timestamp._seconds * 1000);
            }
            else {
                return 'غير محدد';
            }
            
            // Validate the date
            if (isNaN(date.getTime())) {
                return 'غير محدد';
            }
            
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting date:', e, timestamp);
            return 'غير محدد';
        }
    };
    
    // Get status display
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'Active':
                return '<span class="badge badge-primary">نشط</span>';
            case 'Approved':
                return '<span class="badge badge-success">مقبول</span>';
            case 'Declined':
                return '<span class="badge badge-danger">مرفوض</span>';
            case 'Cancelled':
                return '<span class="badge badge-secondary">ملغي</span>';
            case 'Completed':
                return '<span class="badge badge-info">مكتمل</span>';
            default:
                return '<span class="badge badge-light">غير محدد</span>';
        }
    };
    
    // Check if current user is admin (for showing item actions)
    const isAdmin = auth.currentUser && (adminSection && !adminSection.classList.contains('hidden'));
    const isActiveReservation = reservationData.status === 'Active';
    
    // Build the content
    let contentHTML = `
        <div class="reservation-details-header">
            <h4>معلومات الطلب</h4>
            <div class="reservation-details-info">
                <div class="reservation-info-item">
                    <div class="reservation-info-label">رقم الطلب</div>
                    <div class="reservation-info-value">${reservationId}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">البريد الإلكتروني</div>
                    <div class="reservation-info-value">${reservationData.user_email || 'غير محدد'}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">الحالة</div>
                    <div class="reservation-info-value">${getStatusDisplay(reservationData.status)}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">تاريخ البداية</div>
                    <div class="reservation-info-value">${formatDate(reservationData.reservation_start)}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">تاريخ الانتهاء</div>
                    <div class="reservation-info-value">${formatDate(reservationData.reservation_end)}</div>
                </div>
    `;
    
    // Add recipient information if available (new format)
    if (reservationData.recipient_name) {
        contentHTML += `
                <div class="reservation-info-item">
                    <div class="reservation-info-label">اسم المستلم</div>
                    <div class="reservation-info-value">${reservationData.recipient_name}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">رقم موبايل المستلم</div>
                    <div class="reservation-info-value">${reservationData.recipient_mobile || 'غير محدد'}</div>
                </div>
                <div class="reservation-info-item">
                    <div class="reservation-info-label">الوحدة</div>
                    <div class="reservation-info-value">${reservationData.unit || 'غير محدد'}</div>
                </div>
        `;
    }
    
    contentHTML += `
            </div>
        </div>
    `;
    
    // Add items table
    const tableHeaders = ['اسم المنتج (العربي)', 'اسم المنتج (الإنجليزي)', 'الكمية'];
    if (isAdmin && isActiveReservation) {
        tableHeaders.push('الإجراءات');
    }
    
    contentHTML += `
        <div class="reservation-items-section">
            <h4>المنتجات المطلوبة</h4>
            <table class="table reservation-items-table">
                <thead>
                    <tr>
                        ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    let totalQuantity = 0;
    
    if (reservationData.items && Array.isArray(reservationData.items)) {
        // New multi-item format
        reservationData.items.forEach((item, index) => {
            const itemActions = isAdmin && isActiveReservation ? `
                <td data-label="الإجراءات">
                    <button class="btn btn-sm btn-danger" 
                            onclick="rejectSingleItem('${reservationId}', ${index}, '${item.productNameAr || item.productNameEn}')">
                        رفض هذا المنتج
                    </button>
                </td>
            ` : '';
            
            contentHTML += `
                <tr>
                    <td data-label="اسم المنتج (العربي)">${item.productNameAr || 'غير محدد'}</td>
                    <td data-label="اسم المنتج (الإنجليزي)">${item.productNameEn || 'غير محدد'}</td>
                    <td data-label="الكمية">${item.quantity || 0}</td>
                    ${itemActions}
                </tr>
            `;
            totalQuantity += item.quantity || 0;
        });
    } else {
        // Old single-item format (backward compatibility)
        const itemActions = isAdmin && isActiveReservation ? `
            <td data-label="الإجراءات">
                <button class="btn btn-sm btn-danger" 
                        onclick="declineReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                    رفض الطلب
                </button>
            </td>
        ` : '';
        
        contentHTML += `
            <tr>
                <td data-label="اسم المنتج (العربي)">${reservationData.product_name_ar || 'غير محدد'}</td>
                <td data-label="اسم المنتج (الإنجليزي)">${reservationData.product_name_en || 'غير محدد'}</td>
                <td data-label="الكمية">${reservationData.quantity || 0}</td>
                ${itemActions}
            </tr>
        `;
        totalQuantity = reservationData.quantity || 0;
    }
    
    // Add total row
    const totalColspan = isAdmin && isActiveReservation ? 3 : 2;
    contentHTML += `
                    <tr class="reservation-total-row">
                        <td colspan="${totalColspan}" data-label="إجمالي"><strong>إجمالي الكمية</strong></td>
                        <td data-label="الكمية الإجمالية"><strong>${totalQuantity}</strong></td>
                        ${isAdmin && isActiveReservation ? '<td data-label=""></td>' : ''}
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add bulk actions for admins
    if (isAdmin && isActiveReservation) {
        contentHTML += `
            <div class="reservation-bulk-actions mt-3">
                <h5>إجراءات الطلب</h5>
                <div class="btn-group">
                    <button class="btn btn-success" 
                            onclick="approveReservation('${reservationId}')">
                        <i class="fas fa-check"></i>
                        قبول الطلب كاملاً
                    </button>
                    <button class="btn btn-danger" 
                            onclick="declineReservation('${reservationId}', ${JSON.stringify(reservationData).replace(/"/g, '&quot;')})">
                        <i class="fas fa-times"></i>
                        رفض الطلب كاملاً
                    </button>
                </div>
            </div>
        `;
    }
    
    // Add creation date if available
    if (reservationData.created_at) {
        contentHTML += `
            <div class="mt-3 text-center">
                <small class="text-muted">
                    <i class="fas fa-calendar-plus"></i>
                    تاريخ إنشاء الطلب: ${formatDate(reservationData.created_at)}
                </small>
            </div>
        `;
    }
    
    // Add activity history section
    if (reservationData.activity_history && Array.isArray(reservationData.activity_history) && reservationData.activity_history.length > 0) {
        contentHTML += `
            <div class="reservation-activity-section mt-4">
                <h4>سجل الأنشطة</h4>
                <div class="activity-timeline">
        `;
        
        // Sort activities by timestamp (newest first)
        const sortedActivities = [...reservationData.activity_history].sort((a, b) => {
            if (!a.timestamp || !b.timestamp) return 0;
            try {
                const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return timeB - timeA;
            } catch (e) {
                return 0;
            }
        });
        
        sortedActivities.forEach((activity, index) => {
            const activityTime = activity.timestamp ? formatDate(activity.timestamp) : 'غير محدد';
            const activityIcon = getActivityIcon(activity.action);
            const activityClass = getActivityClass(activity.action);
            
            contentHTML += `
                <div class="activity-item ${activityClass}">
                    <div class="activity-content">
                        <div class="activity-header">
                            <span class="activity-action">
                                <i class="${activityIcon}"></i>
                                ${getActivityDisplayText(activity.action)}
                            </span>
                            <span class="activity-time">${activityTime}</span>
                        </div>
                        <div class="activity-details">${activity.details || 'لا توجد تفاصيل إضافية'}</div>
                        <div class="activity-performer">
                            <i class="fas fa-user"></i>
                            بواسطة: ${activity.performed_by || 'غير محدد'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        contentHTML += `
                </div>
            </div>
        `;
    }
    
    // Set the content
    reservationDetailsContent.innerHTML = contentHTML;
    
    // Show the modal
    reservationDetailsModal.classList.remove('hidden');
    // reservationDetailsModal.style.display = 'block';
}

/**
 * Hide reservation details modal
 */
function hideReservationDetailsModal() {
    if (reservationDetailsModal) {
        reservationDetailsModal.classList.add('hidden');
        reservationDetailsModal.style.display = 'none';
    }
}

// Reservation Details Modal Event Listeners
if (reservationDetailsModal) {
    const closeBtn = reservationDetailsModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideReservationDetailsModal();
        });
    }
    
    // Close modal when clicking outside of it
    reservationDetailsModal.addEventListener('click', (e) => {
        if (e.target === reservationDetailsModal) {
            hideReservationDetailsModal();
        }
    });
}

/**
 * Approve a reservation (Admin function)
 * @param {string} reservationId - Reservation document ID
 */
async function approveReservation(reservationId) {
    showConfirmationToast(
        'هل أنت متأكد من قبول هذا الطلب؟',
        async () => {
            // User confirmed approval
            try {
                const reservationRef = db.collection('reservations').doc(reservationId);
                const reservationDoc = await reservationRef.get();
                
                if (!reservationDoc.exists) {
                    showErrorToast('الطلب غير موجود');
                    return;
                }
                
                const reservationData = reservationDoc.data();
                
                // Create activity entry
                const activityEntry = createActivityEntry(
                    'approved',
                    auth.currentUser.email,
                    'تم قبول الطلب من قبل الإدارة'
                );
                
                // Update reservation status and add activity
                await reservationRef.update({
                    status: 'Approved',
                    approved_at: firebase.firestore.FieldValue.serverTimestamp(),
                    approved_by: auth.currentUser.email,
                    activity: firebase.firestore.FieldValue.arrayUnion(activityEntry)
                });
                
                showSuccessToast('تم قبول الطلب بنجاح');
            } catch (error) {
                console.error('Error approving reservation:', error);
                showErrorToast('خطأ في قبول الطلب: ' + error.message);
            }
        },
        () => {
            // User cancelled approval
            showInfoToast('تم إلغاء عملية القبول');
        },
        'قبول',
        'إلغاء'
    );
}

/**
 * Decline a reservation (Admin function)
 * @param {string} reservationId - Reservation document ID
 * @param {Object} reservationData - Reservation data
 */
async function declineReservation(reservationId, reservationData) {
    showConfirmationToast(
        'هل أنت متأكد من رفض هذا الطلب؟ سيصبح متاحاً للحجوزات الأخرى.',
        async () => {
            // User confirmed decline
            try {
                const batch = db.batch();
                const reservationRef = db.collection('reservations').doc(reservationId);
                
                // Create activity entry
                const activityEntry = createActivityEntry(
                    'declined',
                    auth.currentUser.email,
                    'تم رفض الطلب من قبل الإدارة'
                );
                
                // Update reservation status
                batch.update(reservationRef, {
                    status: 'Declined',
                    declined_at: firebase.firestore.FieldValue.serverTimestamp(),
                    declined_by: auth.currentUser.email,
                    activity: firebase.firestore.FieldValue.arrayUnion(activityEntry)
                });
                
                // Restore stock for all items
                if (reservationData.items && Array.isArray(reservationData.items)) {
                    for (const item of reservationData.items) {
                        const productRef = db.collection('products').doc(item.productId);
                        batch.update(productRef, {
                            stock: firebase.firestore.FieldValue.increment(item.quantity)
                        });
                    }
                }
                
                await batch.commit();
                showSuccessToast('تم رفض الطلب. أصبحت العهدة متاحة للحجوزات الأخرى.');
            } catch (error) {
                console.error('Error declining reservation:', error);
                showErrorToast('خطأ في رفض الطلب: ' + error.message);
            }
        },
        () => {
            // User cancelled decline
            showInfoToast('تم إلغاء عملية الرفض');
        },
        'رفض',
        'إلغاء'
    );
}

/**
 * Cancel a reservation (User function)
 * @param {string} reservationId - Reservation document ID
 * @param {Object} reservationData - Reservation data
 */
async function cancelReservation(reservationId, reservationData) {
    showConfirmationToast(
        'هل أنت متأكد من إلغاء هذا الطلب؟ ستصبح العهدة متاحة للحجوزات الأخرى.',
        async () => {
            // User confirmed cancellation
            try {
                const batch = db.batch();
                const reservationRef = db.collection('reservations').doc(reservationId);
                
                // Create activity entry
                const activityEntry = createActivityEntry(
                    'cancelled',
                    auth.currentUser.email,
                    'تم إلغاء الطلب من قبل المستخدم'
                );
                
                // Update reservation status
                batch.update(reservationRef, {
                    status: 'Cancelled',
                    cancelled_at: firebase.firestore.FieldValue.serverTimestamp(),
                    cancelled_by: auth.currentUser.email,
                    activity: firebase.firestore.FieldValue.arrayUnion(activityEntry)
                });
                
                // Restore stock for all items
                if (reservationData.items && Array.isArray(reservationData.items)) {
                    for (const item of reservationData.items) {
                        const productRef = db.collection('products').doc(item.productId);
                        batch.update(productRef, {
                            stock: firebase.firestore.FieldValue.increment(item.quantity)
                        });
                    }
                }
                
                await batch.commit();
                showSuccessToast('تم إلغاء الطلب. أصبحت العهدة متاحة للحجوزات الأخرى.');
            } catch (error) {
                console.error('Error cancelling reservation:', error);
                showErrorToast('خطأ في إلغاء الطلب: ' + error.message);
            }
        },
        () => {
            // User cancelled the cancellation
            showInfoToast('تم إلغاء عملية الإلغاء');
        },
        'إلغاء الطلب',
        'تراجع'
    );
}

/**
 * Reject a single item from a multi-item reservation (Admin function)
 * @param {string} reservationId - Reservation document ID
 * @param {number} itemIndex - Index of the item to reject
 * @param {string} itemName - Name of the item for confirmation
 */
async function rejectSingleItem(reservationId, itemIndex, itemName) {
    showConfirmationToast(
        `هل أنت متأكد من رفض المنتج "${itemName}" من هذا الطلب؟ سيصبح متاحاً للحجوزات الأخرى.`,
        async () => {
            // User confirmed rejection
            try {
                const reservationRef = db.collection('reservations').doc(reservationId);
                const reservationDoc = await reservationRef.get();
                
                if (!reservationDoc.exists) {
                    showErrorToast('الطلب غير موجود');
                    return;
                }
                
                const reservationData = reservationDoc.data();
                
                if (!reservationData.items || !Array.isArray(reservationData.items) || itemIndex >= reservationData.items.length) {
                    showErrorToast('المنتج غير موجود في الطلب');
                    return;
                }
                
                const rejectedItem = reservationData.items[itemIndex];
                const updatedItems = [...reservationData.items];
                updatedItems.splice(itemIndex, 1);
                
                const batch = db.batch();
                
                // Create activity entry
                const activityEntry = createActivityEntry(
                    'item_rejected',
                    auth.currentUser.email,
                    `تم رفض المنتج: ${itemName}`
                );
                
                // Check if this was the last item
                const wasLastItem = updatedItems.length === 0;
                
                if (wasLastItem) {
                    // If no items left, mark reservation as declined
                    batch.update(reservationRef, {
                        status: 'Declined',
                        items: updatedItems,
                        declined_at: firebase.firestore.FieldValue.serverTimestamp(),
                        declined_by: auth.currentUser.email,
                        activity: firebase.firestore.FieldValue.arrayUnion(activityEntry)
                    });
                } else {
                    // Otherwise, just remove the item
                    batch.update(reservationRef, {
                        items: updatedItems,
                        activity: firebase.firestore.FieldValue.arrayUnion(activityEntry)
                    });
                }
                
                // Restore stock for the rejected item
                const productRef = db.collection('products').doc(rejectedItem.productId);
                batch.update(productRef, {
                    stock: firebase.firestore.FieldValue.increment(rejectedItem.quantity)
                });
                
                await batch.commit();
                
                if (wasLastItem) {
                    showSuccessToast('تم رفض آخر منتج وإلغاء الطلب بالكامل. أصبحت العهدة متاحة للحجوزات الأخرى.');
                } else {
                    showSuccessToast('تم رفض المنتج من الطلب. أصبح متاحاً للحجوزات الأخرى.');
                }
            } catch (error) {
                console.error('Error rejecting single item:', error);
                showErrorToast('خطأ في رفض المنتج: ' + error.message);
            }
        },
        () => {
            // User cancelled rejection
            showInfoToast('تم إلغاء عملية الرفض');
        },
        'رفض المنتج',
        'إلغاء'
    );
}

/**
 * Create an activity history entry
 * @param {string} action - The action performed (created, approved, declined, cancelled, item_rejected)
 * @param {string} performedBy - Email of the user who performed the action
 * @param {string} details - Additional details about the action
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Object} - Activity history entry
 */
function createActivityEntry(action, performedBy, details, metadata = {}) {
    return {
        action: action,
        performed_by: performedBy,
        details: details,
        timestamp: firebase.firestore.Timestamp.now(),
        metadata: metadata
    };
}

/**
 * Add activity entry to reservation
 * @param {string} reservationId - Reservation document ID
 * @param {Object} activityEntry - Activity entry to add
 */
async function addActivityToReservation(reservationId, activityEntry) {
    try {
        const reservationRef = db.collection('reservations').doc(reservationId);
        await reservationRef.update({
            activity_history: firebase.firestore.FieldValue.arrayUnion(activityEntry),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding activity to reservation:', error);
    }
}

/**
 * Get activity display text in Arabic
 * @param {string} action - The action type
 * @returns {string} - Arabic display text
 */
function getActivityDisplayText(action) {
    switch (action) {
        case 'created':
            return 'تم إنشاء الطلب';
        case 'approved':
            return 'تم قبول الطلب';
        case 'declined':
            return 'تم رفض الطلب';
        case 'cancelled':
            return 'تم إلغاء الطلب';
        case 'item_rejected':
            return 'تم رفض منتج من الطلب';
        case 'stock_restored':
            return 'تم استعادة المخزون';
        default:
            return 'إجراء غير معروف';
    }
}

/**
 * Get activity icon class
 * @param {string} action - The action type
 * @returns {string} - Icon class
 */
function getActivityIcon(action) {
    switch (action) {
        case 'created':
            return 'fas fa-plus-circle';
        case 'approved':
            return 'fas fa-check-circle';
        case 'declined':
            return 'fas fa-times-circle';
        case 'cancelled':
            return 'fas fa-ban';
        case 'item_rejected':
            return 'fas fa-minus-circle';
        case 'stock_restored':
            return 'fas fa-undo';
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * Get activity CSS class
 * @param {string} action - The action type
 * @returns {string} - CSS class
 */
function getActivityClass(action) {
    switch (action) {
        case 'created':
            return 'activity-created';
        case 'approved':
            return 'activity-approved';
        case 'declined':
            return 'activity-declined';
        case 'cancelled':
            return 'activity-cancelled';
        case 'item_rejected':
            return 'activity-item-rejected';
        case 'stock_restored':
            return 'activity-stock-restored';
        default:
            return 'activity-default';
    }
}

// ============================================================================
// AUTOMATIC RESERVATION COMPLETION SYSTEM
// ============================================================================

/**
 * Automatic Stock Restoration Function
 * Checks for expired reservations and marks them as completed
 * Runs client-side when users visit the app
 * @param {boolean} silent - If true, won't show admin notifications (for background/interactive calls)
 * @returns {Promise<Object>} - Returns information about processed reservations
 */
async function automaticStockRestoration(silent = false) {
    console.log('Starting automatic reservation completion check...');
    
    try {
        const now = firebase.firestore.Timestamp.now();
        
        // Query for reservations that need status update to completed
        const reservationsToCompleteQuery = db.collection('reservations')
            .where('reservation_end', '<=', now)
            .where('all_items_stock_restored', '==', false)
            .where('status', 'in', ['Active', 'Approved']);
        
        const snapshot = await reservationsToCompleteQuery.get();
        
        if (snapshot.empty) {
            console.log('No reservations found needing completion at this time.');
            return { processedCount: 0, message: 'No expired reservations found' };
        }
        
        console.log(`Found ${snapshot.docs.length} reservation(s) to process for completion.`);
        
        // Process each reservation
        const batch = db.batch();
        let successfullyProcessedCount = 0;
        
        snapshot.forEach(doc => {
            const reservation = doc.data();
            const reservationId = doc.id;
            console.log(`Processing reservation ID: ${reservationId}`);
            
            // Ensure items array exists and is not empty
            if (!reservation.items || reservation.items.length === 0) {
                console.warn(`Reservation ID: ${reservationId} has no items. Skipping.`);
                return; // Skip to next reservation document
            }
            
            const stockRestoredUpdatePayload = {}; // To build updates for stock_restored_for_items
            
            // Process each item in the reservation (mark as restored but don't increment stock)
            for (const item of reservation.items) {
                if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    console.error(`Reservation ID: ${reservationId}, Item has invalid data:`, item);
                    continue; // Skip this malformed item
                }
                
                // NO LONGER INCREMENTING product.stock_count here
                // The stock becomes "available" again because the reservation will no longer be 'Active'/'Approved'
                
                // Mark this item's stock as restored
                stockRestoredUpdatePayload[`stock_restored_for_items.${item.productId}`] = true;
                console.log(`  - Marked item ${item.productId} as completed (quantity: ${item.quantity})`);
            }
            
            // Create activity entry for completion
            const activityEntry = createActivityEntry(
                'stock_restored',
                'system',
                'تم إكمال الحجز تلقائياً بعد انتهاء فترة الحجز',
                { 
                    auto_completed: true,
                    completion_time: firebase.firestore.Timestamp.now(),
                    items_count: reservation.items.length,
                    triggered_by: silent ? 'user_interaction' : 'scheduled_check'
                }
            );
            
            // Update the reservation document
            batch.update(doc.ref, {
                ...stockRestoredUpdatePayload, // Spread the item-specific restoration flags
                all_items_stock_restored: true,
                status: 'Completed',
                updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                activity_history: firebase.firestore.FieldValue.arrayUnion(activityEntry)
            });
            
            successfullyProcessedCount++;
            console.log(`  - Queued status update for reservation ID: ${reservationId} to 'Completed'.`);
        });
        
        // Commit all changes in a single batch
        if (successfullyProcessedCount > 0) {
            await batch.commit();
            console.log(`✅ Successfully completed ${successfullyProcessedCount} expired reservation(s).`);
            
            // Show notification to admins only if not silent and user is admin
            if (!silent && auth.currentUser) {
                const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin' || userData.role === 'superadmin') {
                        showToast(`تم إكمال ${successfullyProcessedCount} طلب منتهي الصلاحية تلقائياً`, 'info');
                    }
                }
            }
            
            return { 
                processedCount: successfullyProcessedCount, 
                message: `Successfully completed ${successfullyProcessedCount} expired reservations` 
            };
        } else {
            console.log('No reservations were eligible for completion after validation.');
            return { processedCount: 0, message: 'No eligible reservations found after validation' };
        }
        
    } catch (error) {
        console.error('❌ Error in automatic reservation completion:', error);
        // Don't show error toast to users as this runs in background
        return { processedCount: 0, message: `Error: ${error.message}`, error: true };
    }
}

/**
 * Initialize automatic reservation completion
 * Sets up the system to run when app loads and periodically
 */
function initializeAutomaticStockRestoration() {
    console.log('Initializing automatic reservation completion system...');
    
    // Run immediately when app loads (after a short delay to ensure Firebase is ready)
    setTimeout(() => {
        automaticStockRestoration();
    }, 5000); // 5 second delay
    
    // Run every 10 minutes (600,000 milliseconds)
    // This ensures expired reservations are marked as completed promptly
    setInterval(automaticStockRestoration, 10 * 60 * 1000);
    
    console.log('✅ Automatic reservation completion system initialized - will run every 10 minutes');
}

// Initialize the automatic reservation completion when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be ready before starting automatic reservation completion
    setTimeout(() => {
        initializeAutomaticStockRestoration();
    }, 3000); // 3 second delay to ensure Firebase is initialized
});

// Return to Admin Button Event Listener
if (returnToAdminBtn) {
    returnToAdminBtn.addEventListener('click', () => {
        showAdminSection();
    });
}

// Availability Check Event Listeners
if (checkAvailabilityBtn) {
    checkAvailabilityBtn.addEventListener('click', async () => {
        const startTime = availabilityStartTime.value;
        const endTime = availabilityEndTime.value;
        
        // Validate dates
        if (!startTime || !endTime) {
            showToast('يرجى اختيار تاريخ البداية والنهاية', 'warning');
            return;
        }
        
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        if (endDate <= startDate) {
            showToast('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية', 'warning');
            return;
        }
        
        // Check if dates are in the past
        const now = new Date();
        if (startDate < now) {
            showToast('لا يمكن اختيار تاريخ في الماضي', 'warning');
            return;
        }
        
        try {
            // Show loading state
            checkAvailabilityBtn.disabled = true;
            checkAvailabilityBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>جاري فحص التوافر...';
            
            // Calculate available stock for the selected period
            const availableStock = await calculateAvailableStock(startDate, endDate);
            
            // Update global variables
            selectedAvailabilityStart = startDate;
            selectedAvailabilityEnd = endDate;
            availabilityChecked = true;
            
            // Update status message
            if (availabilityStatus) {
                availabilityStatus.innerHTML = `
                    <small><strong>✅ تم فحص التوافر:</strong> من ${startDate.toLocaleString('ar-EG')} إلى ${endDate.toLocaleString('ar-EG')}</small>
                `;
                availabilityStatus.style.display = 'block';
                availabilityStatus.className = 'alert alert-success';
            }
            
            // Auto-fill the finalize form dates
            if (requestStartTime && requestEndTime) {
                requestStartTime.value = startTime;
                requestEndTime.value = endTime;
            }
            
            // Reload products with availability data
            loadUserProducts(searchQuery, availableStock);
            
            showToast('تم فحص التوافر بنجاح. يمكنك الآن إضافة المنتجات للطلب', 'success');
            
        } catch (error) {
            console.error('Error checking availability:', error);
            showToast('خطأ في فحص التوافر: ' + error.message, 'error');
        } finally {
            // Reset button state
            checkAvailabilityBtn.disabled = false;
            checkAvailabilityBtn.innerHTML = 'فحص التوافر';
        }
    });
}

/**
 * Initialize availability interface
 */
function initializeAvailabilityInterface() {
    // Set minimum date to current date/time
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16); // Format for datetime-local input
    
    if (availabilityStartTime) {
        availabilityStartTime.min = currentDateTime;
        availabilityStartTime.value = '';
    }
    
    if (availabilityEndTime) {
        availabilityEndTime.min = currentDateTime;
        availabilityEndTime.value = '';
    }
    
    // Add event listeners for date validation
    if (availabilityStartTime) {
        availabilityStartTime.addEventListener('change', () => {
            if (availabilityEndTime && availabilityStartTime.value) {
                // Set minimum end time to be after start time
                availabilityEndTime.min = availabilityStartTime.value;
                
                // Clear end time if it's before the new start time
                if (availabilityEndTime.value && new Date(availabilityEndTime.value) <= new Date(availabilityStartTime.value)) {
                    availabilityEndTime.value = '';
                }
            }
            
            // Reset availability check when dates change
            resetAvailabilityCheck();
        });
    }
    
    if (availabilityEndTime) {
        availabilityEndTime.addEventListener('change', () => {
            // Reset availability check when dates change
            resetAvailabilityCheck();
        });
    }
    
    // Show initial status
    if (availabilityStatus) {
        availabilityStatus.innerHTML = `
            <small><strong>تنبيه:</strong> يرجى اختيار فترة الحجز لعرض المخزون المتاح خلال هذه الفترة</small>
        `;
        availabilityStatus.style.display = 'block';
        availabilityStatus.className = 'alert alert-info';
    }
}

/**
 * Reset availability check state
 */
function resetAvailabilityCheck() {
    availabilityChecked = false;
    selectedAvailabilityStart = null;
    selectedAvailabilityEnd = null;
    
    // Update status message
    if (availabilityStatus) {
        availabilityStatus.innerHTML = `
            <small><strong>تنبيه:</strong> يرجى اختيار فترة الحجز لعرض المخزون المتاح خلال هذه الفترة</small>
        `;
        availabilityStatus.className = 'alert alert-info';
    }
    
    // Reload products without availability data
    loadUserProducts(searchQuery);
}

/**
 * Show modal with detailed reservation information for a specific product
 * @param {string} productId - Product document ID
 * @param {string} productName - Product name
 * @param {Array} reservationDetails - Array of reservation details
 */
function showProductReservationsModal(productId, productName, reservationDetails) {
    // Create modal if it doesn't exist
    let reservationsModal = document.getElementById('product-reservations-modal');
    if (!reservationsModal) {
        const modalHTML = `
            <div id="product-reservations-modal" class="modal hidden" style="z-index: 2000;">
                <div class="modal-content" style="max-width: 95%; max-height: 90%; overflow: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #dee2e6;">
                        <h4 id="product-reservations-title">الحجوزات المتداخلة</h4>
                        <span class="close" onclick="hideProductReservationsModal()" style="font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                    </div>
                    <div class="modal-body" style="padding: 1rem;">
                        <div id="product-reservations-content">
                            <!-- Dynamic content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        reservationsModal = document.getElementById('product-reservations-modal');
        
        // Add click outside to close functionality
        reservationsModal.addEventListener('click', (e) => {
            if (e.target === reservationsModal) {
                hideProductReservationsModal();
            }
        });
    }
    
    // Set modal title
    const modalTitle = document.getElementById('product-reservations-title');
    modalTitle.textContent = `الحجوزات المتداخلة - ${productName}`;
    
    // Build content
    const contentDiv = document.getElementById('product-reservations-content');
    
    // Format dates
    const formatDate = (date) => {
        if (!date) return 'غير محدد';
        try {
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'غير محدد';
        }
    };
    
    // Get status display
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'Active':
                return '<span class="badge badge-primary">نشط</span>';
            case 'Approved':
                return '<span class="badge badge-success">مقبول</span>';
            default:
                return '<span class="badge badge-light">غير محدد</span>';
        }
    };
    
    // Calculate total reserved quantity
    const totalReserved = reservationDetails.reduce((sum, res) => sum + (res.quantity || 0), 0);
    
    let contentHTML = `
        <div class="product-reservations-summary">
            <div class="alert alert-info">
                <h5><i class="fas fa-info-circle"></i> ملخص الحجوزات</h5>
                <p><strong>المنتج:</strong> ${productName}</p>
                <p><strong>عدد الحجوزات المتداخلة:</strong> ${reservationDetails.length}</p>
                <p><strong>إجمالي الكمية المحجوزة:</strong> ${totalReserved}</p>
            </div>
        </div>
        
        <div class="product-reservations-table-container">
            <h5>تفاصيل الحجوزات</h5>
            <div class="table-responsive">
                <table class="table table-striped product-reservations-table">
                    <thead>
                        <tr>
                            <th>رقم الحجز</th>
                            <th>البريد الإلكتروني</th>
                            <th>اسم المستلم</th>
                            <th>رقم الموبايل</th>
                            <th>الوحدة</th>
                            <th>الكمية</th>
                            <th>من تاريخ</th>
                            <th>إلى تاريخ</th>
                            <th>الحالة</th>
                            <th>تاريخ الإنشاء</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Sort reservations by start date
    const sortedReservations = [...reservationDetails].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
    });
    
    sortedReservations.forEach((reservation, index) => {
        const createdDate = reservation.createdAt ? formatDate(reservation.createdAt.toDate ? reservation.createdAt.toDate() : new Date(reservation.createdAt)) : 'غير محدد';
        
        contentHTML += `
            <tr>
                <td>
                    <small class="text-muted">${reservation.reservationId.substring(0, 8)}...</small>
                </td>
                <td>${reservation.userEmail || 'غير محدد'}</td>
                <td>${reservation.recipientName}</td>
                <td>
                    <a href="tel:${reservation.recipientMobile}" class="text-decoration-none">
                        ${reservation.recipientMobile}
                    </a>
                </td>
                <td>${reservation.unit}</td>
                <td>
                    <span class="badge badge-secondary">${reservation.quantity}</span>
                </td>
                <td>
                    <small>${formatDate(reservation.startDate)}</small>
                </td>
                <td>
                    <small>${formatDate(reservation.endDate)}</small>
                </td>
                <td>${getStatusDisplay(reservation.status)}</td>
                <td>
                    <small class="text-muted">${createdDate}</small>
                </td>
            </tr>
        `;
    });
    
    contentHTML += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="product-reservations-actions mt-3">
            <button type="button" class="btn btn-secondary" onclick="hideProductReservationsModal()">
                إغلاق
            </button>
        </div>
    `;
    
    contentDiv.innerHTML = contentHTML;
    
    // Show modal
    reservationsModal.classList.remove('hidden');
    reservationsModal.style.display = 'block';
}

/**
 * Hide product reservations modal
 */
function hideProductReservationsModal() {
    const reservationsModal = document.getElementById('product-reservations-modal');
    if (reservationsModal) {
        reservationsModal.classList.add('hidden');
        reservationsModal.style.display = 'none';
    }
}

// Profile Management Functions

/**
 * Ensure user profile data is loaded
 */
async function ensureUserProfileDataLoaded() {
    if (!auth.currentUser) {
        console.error('No authenticated user');
        return null;
    }

    if (currentUserProfileData) {
        return currentUserProfileData;
    }

    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
            currentUserProfileData = userDoc.data();
            return currentUserProfileData;
        } else {
            // Create a basic profile if it doesn't exist
            currentUserProfileData = {
                displayName: auth.currentUser.displayName || '',
                email: auth.currentUser.email,
                phoneNumber: '',
                unit: '',
                photoURL: auth.currentUser.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Save the basic profile
            await db.collection('users').doc(auth.currentUser.uid).set(currentUserProfileData, { merge: true });
            return currentUserProfileData;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showToast('خطأ في تحميل بيانات الملف الشخصي', 'error');
        return null;
    }
}

/**
 * Open profile modal and load user data
 */
async function openProfileModal() {
    if (!profileModal) return;

    try {
        // Load user profile data
        const profileData = await ensureUserProfileDataLoaded();
        if (!profileData) return;

        // Populate view mode
        populateProfileViewMode(profileData);
        
        // Show modal in view mode
        showProfileViewMode();
        showModal(profileModal);
        
    } catch (error) {
        console.error('Error opening profile modal:', error);
        showToast('خطأ في فتح الملف الشخصي', 'error');
    }
}

/**
 * Populate profile view mode with user data
 */
function populateProfileViewMode(profileData) {
    if (profileModalImage) {
        profileModalImage.src = profileData.photoURL || '';
    }
    
    if (profileModalName) {
        profileModalName.textContent = profileData.displayName || '-';
    }
    
    if (profileModalEmail) {
        profileModalEmail.textContent = profileData.email || auth.currentUser?.email || '-';
    }
    
    if (profileModalPhone) {
        profileModalPhone.textContent = profileData.phoneNumber || '-';
    }
    
    if (profileModalUnit) {
        profileModalUnit.textContent = profileData.unit || '-';
    }
}

/**
 * Show profile view mode and hide edit mode
 */
function showProfileViewMode() {
    if (profileViewSection) {
        profileViewSection.style.display = 'block';
    }
    if (profileEditSection) {
        profileEditSection.style.display = 'none';
    }
}

/**
 * Show profile edit mode and hide view mode
 */
function showProfileEditMode() {
    if (!currentUserProfileData) return;

    // Populate edit form
    populateProfileEditMode(currentUserProfileData);
    
    // Show edit mode
    if (profileEditSection) {
        profileEditSection.style.display = 'block';
    }
    if (profileViewSection) {
        profileViewSection.style.display = 'none';
    }
    
    // Set up image click event listener after the edit section is shown
    setupProfileImageClickListener();
}

/**
 * Set up profile image click listener
 */
function setupProfileImageClickListener() {
    console.log('Setting up profile image click listener...');
    
    // Use a small delay to ensure DOM is ready
    setTimeout(() => {
        const editProfileImagePreview = document.getElementById('edit-profile-image-preview');
        const editProfileImageInput = document.getElementById('edit-profile-image-input');
        const imageContainer = document.querySelector('.profile-edit-image-container');
        const imageOverlay = document.querySelector('.profile-edit-image-overlay');
        
        console.log('Profile image elements found:', {
            preview: !!editProfileImagePreview,
            input: !!editProfileImageInput,
            container: !!imageContainer,
            overlay: !!imageOverlay,
            inputType: editProfileImageInput ? editProfileImageInput.type : 'N/A',
            inputAccept: editProfileImageInput ? editProfileImageInput.accept : 'N/A',
            inputStyle: editProfileImageInput ? editProfileImageInput.style.display : 'N/A',
            previewVisible: editProfileImagePreview ? getComputedStyle(editProfileImagePreview).display !== 'none' : false
        });
        
        if (editProfileImagePreview && editProfileImageInput) {
            // Remove any existing click event listeners by cloning the elements
            const newPreview = editProfileImagePreview.cloneNode(true);
            editProfileImagePreview.parentNode.replaceChild(newPreview, editProfileImagePreview);
            
            // Flag to prevent double execution
            let isProcessingClick = false;
            
            // Function to handle the file input click
            const handleImageClick = (e, source) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (isProcessingClick) {
                    console.log('Click already being processed, ignoring...');
                    return;
                }
                
                isProcessingClick = true;
                console.log(`Profile image clicked from ${source}! Triggering file input...`);
                
                try {
                    editProfileImageInput.click();
                    console.log('File input click triggered successfully');
                } catch (error) {
                    console.error('Error clicking file input:', error);
                }
                
                // Reset flag after a short delay
                setTimeout(() => {
                    isProcessingClick = false;
                }, 500);
            };
            
            // Add click event listener to the image
            newPreview.addEventListener('click', (e) => handleImageClick(e, 'image'));
            
            // Add click event listener to the overlay (this was missing!)
            if (imageOverlay) {
                imageOverlay.addEventListener('click', (e) => handleImageClick(e, 'overlay'));
            }
            
            // Add click event listener to the container as backup
            if (imageContainer) {
                imageContainer.addEventListener('click', (e) => {
                    // Only trigger if the click wasn't already handled by image or overlay
                    if (e.target === imageContainer) {
                        handleImageClick(e, 'container');
                    }
                });
            }
            
            // Add visual feedback
            newPreview.style.cursor = 'pointer';
            newPreview.title = 'انقر لتغيير الصورة';
            
            if (imageOverlay) {
                imageOverlay.style.cursor = 'pointer';
                imageOverlay.title = 'انقر لتغيير الصورة';
            }
            
            if (imageContainer) {
                imageContainer.style.cursor = 'pointer';
                imageContainer.title = 'انقر لتغيير الصورة';
            }
            
            console.log('Profile image click listeners set up successfully for image, overlay, and container');
        } else {
            console.error('Profile image elements not found:', {
                preview: !!editProfileImagePreview,
                input: !!editProfileImageInput
            });
        }
    }, 200);
}

/**
 * Populate profile edit mode with user data
 */
function populateProfileEditMode(profileData) {
    if (editProfileImagePreview) {
        editProfileImagePreview.src = profileData.photoURL || '';
    }
    
    if (editProfileName) {
        editProfileName.value = profileData.displayName || '';
    }
    
    if (editProfilePhone) {
        editProfilePhone.value = profileData.phoneNumber || '';
    }
    
    if (editProfileUnit) {
        editProfileUnit.value = profileData.unit || '';
    }
    
    // Reset selected image
    selectedProfileImage = null;
}

/**
 * Handle profile image selection
 */
function handleProfileImageSelection(file) {
    if (!file) return;

    console.log('Handling profile image selection:', file.name, file.size, file.type);

    // Validate image file
    if (!validateImageFile(file)) {
        return;
    }

    selectedProfileImage = file;
    console.log('Profile image selected and validated successfully');

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const editProfileImagePreview = document.getElementById('edit-profile-image-preview');
        if (editProfileImagePreview) {
            editProfileImagePreview.src = e.target.result;
            console.log('Profile image preview updated');
            showToast('تم اختيار الصورة بنجاح', 'success', 3000);
        } else {
            console.error('Profile image preview element not found');
        }
    };
    
    reader.onerror = function(e) {
        console.error('Error reading file:', e);
        showToast('خطأ في قراءة الصورة', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Save profile changes
 */
async function saveProfileChanges(formData) {
    if (!auth.currentUser) {
        showToast('خطأ: لم يتم العثور على المستخدم', 'error');
        return false;
    }

    try {
        const updateData = {
            displayName: formData.get('displayName').trim(),
            phoneNumber: formData.get('phoneNumber').trim(),
            unit: formData.get('unit'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Upload new image if selected
        if (selectedProfileImage) {
            try {
                const imageUrl = await uploadImageToCloudinary(selectedProfileImage);
                updateData.photoURL = imageUrl;
            } catch (imageError) {
                console.error('Error uploading profile image:', imageError);
                showToast('خطأ في رفع الصورة، سيتم حفظ باقي البيانات', 'warning');
            }
        }

        // Update user document in Firestore
        await db.collection('users').doc(auth.currentUser.uid).update(updateData);

        // Update cached profile data
        currentUserProfileData = { ...currentUserProfileData, ...updateData };

        // Update view mode with new data
        populateProfileViewMode(currentUserProfileData);

        // Switch back to view mode
        showProfileViewMode();

        showToast('تم حفظ التغييرات بنجاح', 'success');
        return true;

    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('خطأ في حفظ التغييرات: ' + error.message, 'error');
        return false;
    }
}

/**
 * Hide profile modal
 */
function hideProfileModal() {
    hideModal(profileModal);
    showProfileViewMode(); // Reset to view mode
    selectedProfileImage = null; // Reset selected image
}

/**
 * Pre-fill request form with user profile data (Iteration 4.5)
 */
async function preFillRequestForm() {
    try {
        // Ensure user profile data is loaded
        const profileData = await ensureUserProfileDataLoaded();
        if (!profileData) return;

        // Pre-fill form fields
        if (requestRecipientName && profileData.displayName) {
            requestRecipientName.value = profileData.displayName;
        }
        
        if (requestRecipientMobile && profileData.phoneNumber) {
            requestRecipientMobile.value = profileData.phoneNumber;
        }
        
        if (requestUnit && profileData.unit) {
            requestUnit.value = profileData.unit;
        }
    } catch (error) {
        console.error('Error pre-filling request form:', error);
        // Don't show error toast as this is not critical
    }
}

/**
 * Clear request form fields
 */
function clearRequestForm() {
    if (requestRecipientName) {
        requestRecipientName.value = '';
    }
    if (requestRecipientMobile) {
        requestRecipientMobile.value = '';
    }
    if (requestUnit) {
        requestUnit.value = '';
    }
}

// Profile Modal Event Listeners
if (viewProfileBtn) {
    viewProfileBtn.addEventListener('click', () => {
        openProfileModal();
    });
}

if (viewProfileBtnUser) {
    viewProfileBtnUser.addEventListener('click', () => {
        openProfileModal();
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        showProfileEditMode();
    });
}

if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener('click', () => {
        showProfileViewMode();
    });
}

if (editProfileImagePreview) {
    editProfileImagePreview.addEventListener('click', () => {
        if (editProfileImageInput) {
            editProfileImageInput.click();
        }
    });
}

if (editProfileImageInput) {
    editProfileImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file ? file.name : 'No file');
        if (file) {
            handleProfileImageSelection(file);
        }
    });
}

if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        formData.set('displayName', editProfileName.value);
        formData.set('phoneNumber', editProfilePhone.value);
        formData.set('unit', editProfileUnit.value);
        
        // Get submit button and store original text
        const submitBtn = profileEditForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm ml-2"></span>جاري الحفظ...';
            
            await saveProfileChanges(formData);
            
        } catch (error) {
            console.error('Error in profile edit form:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

if (profileModal) {
    const closeBtn = profileModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideProfileModal();
        });
    }
    
    // Close modal when clicking outside of it
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            hideProfileModal();
        }
    });
}

// Add keyboard event listener for Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (profileModal && !profileModal.classList.contains('hidden')) {
            hideProfileModal();
        }
    }
});

/**
 * Show persistent toast (doesn't auto-hide)
 * @param {string} message - Message to display
 * @param {string} type - Type of toast
 */
function showPersistentToast(message, type = 'info') {
    return showToast(message, type, Infinity);
}

/**
 * Show loading toast with spinner
 * @param {string} message - Loading message
 * @returns {string} Toast ID for later removal
 */
function showLoadingToast(message = 'جاري التحميل...') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'loading_toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const toastHTML = `
        <div id="${toastId}" class="toast toast-info" role="alert" aria-live="polite" aria-atomic="true">
            <div class="toast-header">
                <div class="toast-icon">
                    <div class="spinner-border spinner-border-sm" role="status" style="width: 16px; height: 16px; border-width: 2px;">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="toast-title">جاري المعالجة</div>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    return toastId;
}

/**
 * Hide loading toast by ID
 * @param {string} toastId - Toast ID to hide
 */
function hideLoadingToast(toastId) {
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
        hideToast(toastElement);
    }
}

/**
 * Show success toast with custom duration
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
function showSuccessToast(message, duration = 4000) {
    return showToast(message, 'success', duration);
}

/**
 * Show error toast with longer duration
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
function showErrorToast(message, duration = 7000) {
    return showToast(message, 'error', duration);
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
function showWarningToast(message, duration = 6000) {
    return showToast(message, 'warning', duration);
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
function showInfoToast(message, duration = 5000) {
    return showToast(message, 'info', duration);
}

/**
 * Show confirmation toast with action buttons
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action (optional)
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 */
function showConfirmationToast(message, onConfirm, onCancel = null, confirmText = 'تأكيد', cancelText = 'إلغاء') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'confirm_toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const toastHTML = `
        <div id="${toastId}" class="toast toast-warning" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <div class="toast-icon">❓</div>
                <div class="toast-title">تأكيد العملية</div>
            </div>
            <div class="toast-body">
                <div style="margin-bottom: 1rem;">${message}</div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-sm btn-success confirm-btn" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">
                        ${confirmText}
                    </button>
                    <button class="btn btn-sm btn-secondary cancel-btn" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">
                        ${cancelText}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const confirmBtn = toastElement.querySelector('.confirm-btn');
    const cancelBtn = toastElement.querySelector('.cancel-btn');
    
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    // Confirm button handler
    confirmBtn.addEventListener('click', () => {
        hideToast(toastElement);
        if (onConfirm) onConfirm();
    });
    
    // Cancel button handler
    cancelBtn.addEventListener('click', () => {
        hideToast(toastElement);
        if (onCancel) onCancel();
    });
    
    return toastId;
}

/**
 * Show toast with custom icon
 * @param {string} message - Message to display
 * @param {string} type - Type of toast
 * @param {string} icon - Custom icon (emoji or HTML)
 * @param {string} title - Custom title
 * @param {number} duration - Duration in milliseconds
 */
function showCustomToast(message, type = 'info', icon = 'ℹ', title = 'إشعار', duration = 5000) {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'custom_toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}" role="alert" aria-live="polite" aria-atomic="true">
            <div class="toast-header">
                <div class="toast-icon">${icon}</div>
                <div class="toast-title">${title}</div>
                <button type="button" class="toast-close" aria-label="إغلاق">
                    ×
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const progressBar = toastElement.querySelector('.toast-progress-bar');
    const closeButton = toastElement.querySelector('.toast-close');
    
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    if (progressBar && duration !== Infinity) {
        progressBar.style.animationDuration = `${duration}ms`;
    }
    
    let hideTimeout;
    if (duration !== Infinity) {
        hideTimeout = setTimeout(() => {
            hideToast(toastElement);
        }, duration);
    }
    
    // Close button functionality
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (hideTimeout) clearTimeout(hideTimeout);
        hideToast(toastElement);
    });
    
    return toastId;
}

/**
 * Test function to manually trigger file input (for debugging)
 */
function testProfileImageInput() {
    const editProfileImageInput = document.getElementById('edit-profile-image-input');
    if (editProfileImageInput) {
        console.log('Testing file input manually...');
        console.log('Input details:', {
            type: editProfileImageInput.type,
            accept: editProfileImageInput.accept,
            disabled: editProfileImageInput.disabled,
            style: editProfileImageInput.style.display,
            parentNode: editProfileImageInput.parentNode ? editProfileImageInput.parentNode.tagName : 'N/A'
        });
        
        try {
            editProfileImageInput.click();
            console.log('Manual file input click successful');
        } catch (error) {
            console.error('Manual file input click failed:', error);
        }
    } else {
        console.error('File input not found for manual test');
    }
}

// Make test function available globally for debugging
window.testProfileImageInput = testProfileImageInput;