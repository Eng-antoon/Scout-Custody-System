// Firebase Configuration (same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyC9lbdaSNyp5enknVnWtecvZ2_ceXgmxqk",
    authDomain: "scout-custody-system.firebaseapp.com",
    projectId: "scout-custody-system",
    storageBucket: "scout-custody-system.firebasestorage.app",
    messagingSenderId: "770239691256",
    appId: "1:770239691256:web:7f0df640f157470fa27e0d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const SNAPSHOT_DOC_PATH = 'system_snapshots/current_snapshot';
const AUTO_REFRESH_HOURS = 12;

// DOM Elements
const authCheckSection = document.getElementById('auth-check-section');
const dashboardContent = document.getElementById('dashboard-content');
const lastUpdatedTimestampEl = document.getElementById('last-updated-timestamp');
const snapshotVersionDisplayEl = document.getElementById('snapshot-version-display');
const refreshSnapshotBtn = document.getElementById('refresh-snapshot-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const logoutDashboardBtn = document.getElementById('logout-dashboard-btn');

// Summary Card Elements
const totalProductsValueEl = document.getElementById('total-products-value');
const totalPhysicalStockValueEl = document.getElementById('total-physical-stock-value');
const activeApprovedReservationsValueEl = document.getElementById('active-approved-reservations-value');
const completedReservationsValueEl = document.getElementById('completed-reservations-value');

// Table Body Elements
const productSummaryTableBodyEl = document.getElementById('product-summary-table-body');
const upcomingReservationsListEl = document.getElementById('upcoming-reservations-list');
const endedReservationsTableBodyEl = document.getElementById('ended-reservations-table-body');
const allReservationsRawDataEl = document.getElementById('all-reservations-raw-data');
const calculationDateEl = document.getElementById('calculation-date');

// Enhanced Reservations Table Elements
const reservationsTableBodyEl = document.getElementById('reservations-table-body');
const reservationsTableSearchInput = document.getElementById('reservations-table-search');
const statusFilterSelect = document.getElementById('status-filter');
const userFilterSelect = document.getElementById('user-filter');
const unitFilterSelect = document.getElementById('unit-filter');
const dateFilterSelect = document.getElementById('date-filter');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const reservationsTableEmptyEl = document.getElementById('reservations-table-empty');
const reservationsCountInfoEl = document.getElementById('reservations-count-info');
const pageInfoEl = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');

// Search Inputs
const productSummarySearchInput = document.getElementById('product-summary-search');

// Modal Elements
const reservationDetailsModal = document.getElementById('reservation-details-modal');
const reservationModalTitle = document.getElementById('reservation-modal-title');
const reservationModalContent = document.getElementById('reservation-modal-content');
const dailyReservationsModal = document.getElementById('daily-reservations-modal');
const dailyModalTitle = document.getElementById('daily-modal-title');
const dailyModalContent = document.getElementById('daily-modal-content');

// Data Visualization Elements
const filteredTotalReservationsEl = document.getElementById('filtered-total-reservations');
const filteredTotalItemsEl = document.getElementById('filtered-total-items');
const filteredUniqueUsersEl = document.getElementById('filtered-unique-users');
const filteredDateRangeEl = document.getElementById('filtered-date-range');
const itemsBreakdownTableEl = document.getElementById('items-breakdown-table');
const dateBreakdownTableEl = document.getElementById('date-breakdown-table');

let currentSnapshotData = null; // To store loaded snapshot

// Pagination variables
let currentPage = 1;
let itemsPerPage = 20;
let filteredReservations = [];
let allReservationsData = [];

// Chart variables
let timelineChart = null;
let statusChart = null;
let topItemsChart = null;
let topUsersChart = null;

// --- Authentication & Authorization ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && (userDoc.data().role === 'admin' || userDoc.data().role === 'superadmin')) {
                authCheckSection.classList.add('hidden');
                dashboardContent.classList.remove('hidden');
                console.log('Admin user authenticated for dashboard.');
                loadSnapshotAndDisplay();
            } else {
                redirectToLogin("ليس لديك صلاحية الوصول لهذه الصفحة.");
            }
        } catch (error) {
            console.error("Error checking user role:", error);
            redirectToLogin("خطأ في التحقق من صلاحيات الدخول.");
        }
    } else {
        redirectToLogin("يرجى تسجيل الدخول للوصول إلى لوحة التحكم.");
    }
});

function redirectToLogin(message) {
    alert(message + " سيتم تحويلك لصفحة الدخول الرئيسية.");
    window.location.href = 'index.html'; // Redirect to main login page
}

if (logoutDashboardBtn) {
    logoutDashboardBtn.addEventListener('click', async () => {
        await auth.signOut();
        // Redirect handled by onAuthStateChanged
    });
}

// --- Snapshot Management ---
async function loadSnapshotAndDisplay() {
    showLoading(true, "جاري تحميل بيانات اللوحة...");
    try {
        const snapshotDoc = await db.doc(SNAPSHOT_DOC_PATH).get();
        if (snapshotDoc.exists) {
            currentSnapshotData = snapshotDoc.data();
            displaySnapshotData(currentSnapshotData);

            // Check if auto-refresh is needed
            const lastUpdated = currentSnapshotData.last_updated.toDate();
            const now = new Date();
            const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
            if (hoursDiff > AUTO_REFRESH_HOURS) {
                console.log(`Snapshot is older than ${AUTO_REFRESH_HOURS} hours. Auto-refreshing...`);
                alert(`البيانات المعروضة قديمة (أكثر من ${AUTO_REFRESH_HOURS} ساعة). سيتم تحديثها تلقائياً الآن.`);
                await refreshAndStoreSnapshot(); // This will re-load and re-display
            }
        } else {
            console.log('No snapshot found. Triggering initial creation.');
            lastUpdatedTimestampEl.textContent = 'لم يتم الإنشاء بعد';
            snapshotVersionDisplayEl.textContent = 'إصدار: -';
            alert("لم يتم العثور على لقطة بيانات للنظام. سيتم محاولة إنشائها الآن. قد تستغرق هذه العملية بعض الوقت.");
            await refreshAndStoreSnapshot();
        }
    } catch (error) {
        console.error("Error loading snapshot:", error);
        alert("خطأ أثناء تحميل بيانات اللوحة: " + error.message);
        lastUpdatedTimestampEl.textContent = 'خطأ في التحميل';
    } finally {
        showLoading(false);
    }
}

async function refreshAndStoreSnapshot() {
    showLoading(true, "جاري تحديث لقطة بيانات النظام بالكامل. هذه العملية قد تستغرق عدة دقائق...");
    refreshSnapshotBtn.disabled = true;

    try {
        // 1. Fetch all products
        const productsSnapshot = await db.collection('products').get();
        const allProducts = [];
        let totalPhysicalStockAllProducts = 0;
        productsSnapshot.forEach(doc => {
            const productData = doc.data();
            allProducts.push({ id: doc.id, ...productData });
            totalPhysicalStockAllProducts += (productData.stock_count || 0);
        });

        // 2. Fetch all reservations
        const reservationsSnapshot = await db.collection('reservations').get();
        const allReservations = [];
        reservationsSnapshot.forEach(doc => {
            allReservations.push({ id: doc.id, ...doc.data() });
        });

        // 3. Perform Calculations
        let activeReservationsCount = 0;
        let approvedReservationsCount = 0;
        let completedReservationsCount = 0;
        const productCommitments = {}; // { productId: committedQuantity }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison

        allReservations.forEach(res => {
            if (res.status === 'Active') activeReservationsCount++;
            if (res.status === 'Approved') approvedReservationsCount++;
            if (res.status === 'Completed') completedReservationsCount++;

            // Only count reservations that are currently ongoing (today falls within their period)
            if ((res.status === 'Active' || res.status === 'Approved') && res.reservation_start && res.reservation_end) {
                const startDate = res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start);
                const endDate = res.reservation_end.toDate ? res.reservation_end.toDate() : new Date(res.reservation_end);
                
                // Set hours to 0 for date comparison
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                
                // Check if today falls within the reservation period (inclusive)
                if (today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime()) {
                    res.items.forEach(item => {
                        productCommitments[item.productId] = (productCommitments[item.productId] || 0) + item.quantity;
                    });
                }
            }
        });

        const productSummary = allProducts.map(p => {
            const committed = productCommitments[p.id] || 0;
            return {
                productId: p.id,
                name_ar: p.name_ar,
                name_en: p.name_en,
                total_physical_stock: p.stock_count,
                currently_committed_today: committed, // Only reservations active today
                effectively_available_now: p.stock_count - committed
            };
        });
        
        // Debug information
        console.log('=== STOCK CALCULATION DEBUG ===');
        console.log('Today:', today.toISOString().split('T')[0]);
        console.log('Product Commitments (only active today):', productCommitments);
        console.log('Product Summary:', productSummary);
        console.log('================================');

        // Upcoming reservations summary (e.g., next 7 days)
        const upcomingReservationsSummary = calculateUpcomingReservations(allReservations, 7);


        // 4. Prepare snapshot data
        const newSnapshotVersion = (currentSnapshotData && currentSnapshotData.snapshot_version) ? currentSnapshotData.snapshot_version + 1 : 1;
        const snapshotData = {
            last_updated: firebase.firestore.FieldValue.serverTimestamp(),
            snapshot_version: newSnapshotVersion,
            total_products: allProducts.length,
            total_physical_stock_all_products: totalPhysicalStockAllProducts,
            active_reservations_count: activeReservationsCount,
            approved_reservations_count: approvedReservationsCount,
            completed_reservations_count: completedReservationsCount,
            upcoming_reservations_summary: upcomingReservationsSummary,
            product_summary: productSummary,
            // Storing all raw data - be very careful with 1MiB limit!
            all_products_snapshot: allProducts,
            all_reservations_snapshot: allReservations
        };

        // 5. Store snapshot (overwrite existing)
        // Use a transaction for the final write if you want to ensure atomicity or check version.
        // For simplicity now, direct set.
        await db.doc(SNAPSHOT_DOC_PATH).set(snapshotData);

        // Re-fetch the document to get the resolved server timestamp
        const updatedSnapshotDoc = await db.doc(SNAPSHOT_DOC_PATH).get();
        if (updatedSnapshotDoc.exists) {
            currentSnapshotData = updatedSnapshotDoc.data();
            displaySnapshotData(currentSnapshotData);
        } else {
            // Fallback: use local data with current time
            currentSnapshotData = { ...snapshotData, last_updated: new Date() };
            displaySnapshotData(currentSnapshotData);
        }
        
        alert("تم تحديث بيانات اللوحة بنجاح!");

    } catch (error) {
        console.error("Error refreshing snapshot:", error);
        alert("فشل تحديث بيانات اللوحة: " + error.message + "\nقد يكون حجم البيانات كبيراً جداً. راجع وحدة التحكم.");
    } finally {
        showLoading(false);
        refreshSnapshotBtn.disabled = false;
    }
}

if (refreshSnapshotBtn) {
    refreshSnapshotBtn.addEventListener('click', refreshAndStoreSnapshot);
}

// --- Display Functions ---
function displaySnapshotData(data) {
    if (!data) return;

    // Handle last_updated timestamp properly
    let lastUpdatedText = 'غير متوفر';
    if (data.last_updated) {
        if (typeof data.last_updated.toDate === 'function') {
            // It's a Firestore Timestamp
            lastUpdatedText = formatDate(data.last_updated.toDate());
        } else if (data.last_updated instanceof Date) {
            // It's already a JavaScript Date
            lastUpdatedText = formatDate(data.last_updated);
        } else {
            // It might be a FieldValue that hasn't been resolved yet
            lastUpdatedText = 'جاري التحديث...';
        }
    }
    
    lastUpdatedTimestampEl.textContent = lastUpdatedText;
    snapshotVersionDisplayEl.textContent = `إصدار: ${data.snapshot_version || '-'}`;

    // Show calculation date
    if (calculationDateEl) {
        const today = new Date();
        calculationDateEl.textContent = `محسوب لتاريخ: ${formatDate(today, false)}`;
    }

    totalProductsValueEl.textContent = data.total_products || '0';
    totalPhysicalStockValueEl.textContent = data.total_physical_stock_all_products || '0';
    activeApprovedReservationsValueEl.textContent = (data.active_reservations_count || 0) + (data.approved_reservations_count || 0);
    completedReservationsValueEl.textContent = data.completed_reservations_count || '0';

    displayProductSummary(data.product_summary || []);
    displayUpcomingReservations(data.upcoming_reservations_summary || []);
    displayEndedReservations(data.all_reservations_snapshot || []);
    displayAllReservationsRaw(data.all_reservations_snapshot || []);
}

function displayProductSummary(summary) {
    productSummaryTableBodyEl.innerHTML = '';
    if (!summary || summary.length === 0) {
        productSummaryTableBodyEl.innerHTML = '<tr><td colspan="5" class="text-center text-muted">لا توجد بيانات ملخص للمنتجات.</td></tr>';
        return;
    }
    summary.forEach(p => {
        const row = productSummaryTableBodyEl.insertRow();
        row.innerHTML = `
            <td>${p.name_ar}</td>
            <td>${p.name_en}</td>
            <td>${p.total_physical_stock}</td>
            <td>${p.currently_committed_today}</td>
            <td class="${p.effectively_available_now <= 0 ? 'text-danger font-weight-bold' : p.effectively_available_now <= 5 ? 'text-warning font-weight-bold' : 'text-success'}">
                ${p.effectively_available_now}
            </td>
        `;
    });
}

function displayUpcomingReservations(summary) {
    upcomingReservationsListEl.innerHTML = '';
    if (!summary || summary.length === 0) {
        upcomingReservationsListEl.innerHTML = '<div class="text-muted text-center p-3">لا توجد حجوزات قادمة مجدولة.</div>';
        return;
    }
    
    summary.forEach(day => {
        const dayCard = document.createElement('div');
        const hasReservations = day.count > 0;
        dayCard.className = `upcoming-day-card ${hasReservations ? '' : 'no-reservations'}`;
        
        // Get day name in Arabic
        const dayDate = new Date(day.date);
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const dayName = dayNames[dayDate.getDay()];
        
        dayCard.innerHTML = `
            <div class="day-header">
                <div>
                    <div class="day-date">${formatDate(dayDate, false)}</div>
                    <div class="day-weekday">${dayName}</div>
                </div>
                <div class="reservation-stats">
                    <div class="stat-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>${day.count} حجز</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-boxes"></i>
                        <span>${day.total_items_reserved} عهدة</span>
                    </div>
                </div>
            </div>
        `;
        
        if (hasReservations) {
            dayCard.style.cursor = 'pointer';
            dayCard.addEventListener('click', () => {
                showDailyReservations(day.date);
            });
        }
        
        upcomingReservationsListEl.appendChild(dayCard);
    });
}

function displayEndedReservations(allReservations) {
    endedReservationsTableBodyEl.innerHTML = '';
    const now = new Date();
    const ended = allReservations
        .filter(r => {
            if (r.status === 'Completed' && r.reservation_end) {
                const endDate = r.reservation_end.toDate ? r.reservation_end.toDate() : new Date(r.reservation_end);
                return endDate < now;
            }
            return false;
        })
        .sort((a, b) => {
            const aDate = a.reservation_end.toDate ? a.reservation_end.toDate() : new Date(a.reservation_end);
            const bDate = b.reservation_end.toDate ? b.reservation_end.toDate() : new Date(b.reservation_end);
            return bDate - aDate; // Newest ended first
        })
        .slice(0, 10); // Last 10

    if (ended.length === 0) {
        endedReservationsTableBodyEl.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد حجوزات مكتملة مؤخراً.</td></tr>';
        return;
    }
    ended.forEach(r => {
        const itemsSummary = r.items.map(item => item.productNameAr || item.productNameEn).join(', ');
        const endDate = r.reservation_end.toDate ? r.reservation_end.toDate() : new Date(r.reservation_end);
        const row = endedReservationsTableBodyEl.insertRow();
        row.className = 'clickable-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td><small>${r.user_email}</small></td>
            <td><small>${itemsSummary.substring(0,30)}...</small></td>
            <td><small>${formatDate(endDate)}</small></td>
        `;
        
        // Add click event to show reservation details
        row.addEventListener('click', () => {
            showReservationDetails(r);
        });
    });
}

function displayAllReservationsRaw(allReservations) {
    if (!allReservations || allReservations.length === 0) {
        allReservationsData = [];
        displayReservationsTable();
        updateDataVisualization();
        return;
    }
    
    // Store the data globally for filtering and pagination
    allReservationsData = allReservations.map(res => {
        return {
            ...res,
            created_at_date: res.created_at ? (res.created_at.toDate ? res.created_at.toDate() : new Date(res.created_at)) : null,
            updated_at_date: res.updated_at ? (res.updated_at.toDate ? res.updated_at.toDate() : new Date(res.updated_at)) : null,
            reservation_start_date: res.reservation_start ? (res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start)) : null,
            reservation_end_date: res.reservation_end ? (res.reservation_end.toDate ? res.reservation_end.toDate() : new Date(res.reservation_end)) : null,
        };
    });
    
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Reset to first page and apply filters
    currentPage = 1;
    applyFiltersAndDisplay();
}

function populateFilterDropdowns() {
    // Populate user filter
    const uniqueUsers = [...new Set(allReservationsData.map(res => res.user_email))].sort();
    if (userFilterSelect) {
        userFilterSelect.innerHTML = '<option value="">جميع المستخدمين</option>';
        uniqueUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userFilterSelect.appendChild(option);
        });
    }
    
    // Populate unit filter (extract from email domain or user_unit field if available)
    const uniqueUnits = [...new Set(allReservationsData.map(res => {
        // Try to extract unit from user_unit field first, then from email domain
        if (res.user_unit) return res.user_unit;
        if (res.user_email && res.user_email.includes('@')) {
            return res.user_email.split('@')[1];
        }
        return 'غير محدد';
    }))].sort();
    
    if (unitFilterSelect) {
        unitFilterSelect.innerHTML = '<option value="">جميع الوحدات</option>';
        uniqueUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            unitFilterSelect.appendChild(option);
        });
    }
}

function displayReservationsTable() {
    if (!reservationsTableBodyEl) return;
    
    reservationsTableBodyEl.innerHTML = '';
    
    if (filteredReservations.length === 0) {
        reservationsTableEmptyEl.classList.remove('hidden');
        updatePaginationInfo(0, 0, 0);
        return;
    }
    
    reservationsTableEmptyEl.classList.add('hidden');
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredReservations.length);
    const pageReservations = filteredReservations.slice(startIndex, endIndex);
    
    // Display reservations
    pageReservations.forEach(res => {
        const row = reservationsTableBodyEl.insertRow();
        row.className = 'reservation-row';
        
        // Calculate total items
        const totalItems = res.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Get status class
        const statusClass = res.status.toLowerCase();
        
        // Format dates
        const startDate = res.reservation_start_date ? formatDate(res.reservation_start_date, false) : '-';
        const endDate = res.reservation_end_date ? formatDate(res.reservation_end_date, false) : '-';
        const createdDate = res.created_at_date ? formatDate(res.created_at_date) : '-';
        
        row.innerHTML = `
            <td><small><strong>${res.id}</strong></small></td>
            <td><small>${res.user_email}</small></td>
            <td><span class="status-badge ${statusClass}">${getStatusInArabic(res.status)}</span></td>
            <td><small>${startDate}</small></td>
            <td><small>${endDate}</small></td>
            <td><span class="items-count-badge">${totalItems}</span></td>
            <td><small>${createdDate}</small></td>
            <td>
                <button class="btn btn-sm btn-outline-primary action-btn view-details-btn">
                    <i class="fas fa-eye"></i> عرض
                </button>
            </td>
        `;
        
        // Add click event to the view button
        const viewBtn = row.querySelector('.view-details-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showReservationDetails(res);
            });
        }
        
        // Add click event to row (excluding the action button)
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                showReservationDetails(res);
            }
        });
    });
    
    updatePaginationInfo(startIndex + 1, endIndex, filteredReservations.length);
}

function applyFiltersAndDisplay() {
    if (!allReservationsData) return;
    
    let filtered = [...allReservationsData];
    
    // Apply search filter
    const searchTerm = reservationsTableSearchInput ? reservationsTableSearchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(res => {
            const emailMatch = res.user_email && res.user_email.toLowerCase().includes(searchTerm);
            const idMatch = res.id && res.id.toLowerCase().includes(searchTerm);
            const itemsMatch = res.items.some(item => 
                (item.productNameAr && item.productNameAr.toLowerCase().includes(searchTerm)) ||
                (item.productNameEn && item.productNameEn.toLowerCase().includes(searchTerm))
            );
            const notesMatch = res.notes && res.notes.toLowerCase().includes(searchTerm);
            return emailMatch || idMatch || itemsMatch || notesMatch;
        });
    }
    
    // Apply status filter
    const statusFilter = statusFilterSelect ? statusFilterSelect.value : '';
    if (statusFilter) {
        filtered = filtered.filter(res => res.status === statusFilter);
    }
    
    // Apply user filter
    const userFilter = userFilterSelect ? userFilterSelect.value : '';
    if (userFilter) {
        filtered = filtered.filter(res => res.user_email === userFilter);
    }
    
    // Apply unit filter
    const unitFilter = unitFilterSelect ? unitFilterSelect.value : '';
    if (unitFilter) {
        filtered = filtered.filter(res => {
            const userUnit = res.user_unit || (res.user_email && res.user_email.includes('@') ? res.user_email.split('@')[1] : 'غير محدد');
            return userUnit === unitFilter;
        });
    }
    
    // Apply date filter
    const dateFilter = dateFilterSelect ? dateFilterSelect.value : '';
    if (dateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(res => {
            if (!res.reservation_start_date) return false;
            
            const startDate = new Date(res.reservation_start_date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = res.reservation_end_date ? new Date(res.reservation_end_date) : startDate;
            endDate.setHours(0, 0, 0, 0);
            
            switch (dateFilter) {
                case 'today':
                    return today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime();
                case 'this-week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return startDate <= weekEnd && endDate >= weekStart;
                case 'this-month':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return startDate <= monthEnd && endDate >= monthStart;
                case 'past':
                    return endDate < today;
                case 'future':
                    return startDate > today;
                default:
                    return true;
            }
        });
    }
    
    filteredReservations = filtered;
    currentPage = 1; // Reset to first page when filters change
    displayReservationsTable();
    updateDataVisualization();
}

function updatePaginationInfo(start, end, total) {
    if (reservationsCountInfoEl) {
        reservationsCountInfoEl.textContent = `عرض ${start}-${end} من ${total} حجز`;
    }
    
    const totalPages = Math.ceil(total / itemsPerPage);
    if (pageInfoEl) {
        pageInfoEl.textContent = totalPages > 0 ? `صفحة ${currentPage} من ${totalPages}` : '';
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

// --- Data Visualization Functions ---
function updateDataVisualization() {
    if (!filteredReservations || filteredReservations.length === 0) {
        // Clear all visualizations
        if (filteredTotalReservationsEl) filteredTotalReservationsEl.textContent = '0';
        if (filteredTotalItemsEl) filteredTotalItemsEl.textContent = '0';
        if (filteredUniqueUsersEl) filteredUniqueUsersEl.textContent = '0';
        if (filteredDateRangeEl) filteredDateRangeEl.textContent = '-';
        if (itemsBreakdownTableEl) itemsBreakdownTableEl.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات</td></tr>';
        if (dateBreakdownTableEl) dateBreakdownTableEl.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات</td></tr>';
        
        // Destroy existing charts
        destroyCharts();
        return;
    }
    
    // Calculate statistics
    const stats = calculateFilteredStatistics();
    
    // Update summary cards
    updateSummaryCards(stats);
    
    // Update breakdown tables
    updateBreakdownTables(stats);
    
    // Update charts
    updateCharts(stats);
}

function calculateFilteredStatistics() {
    const totalReservations = filteredReservations.length;
    let totalItems = 0;
    const uniqueUsers = new Set();
    const itemsBreakdown = {};
    const dateBreakdown = {};
    const statusBreakdown = {};
    const userBreakdown = {};
    let earliestDate = null;
    let latestDate = null;
    
    filteredReservations.forEach(res => {
        // Count unique users
        uniqueUsers.add(res.user_email);
        
        // Count items
        res.items.forEach(item => {
            totalItems += item.quantity;
            const itemName = item.productNameAr || item.productNameEn || 'غير محدد';
            if (!itemsBreakdown[itemName]) {
                itemsBreakdown[itemName] = { totalQuantity: 0, reservationCount: 0 };
            }
            itemsBreakdown[itemName].totalQuantity += item.quantity;
            itemsBreakdown[itemName].reservationCount++;
        });
        
        // Count by status
        statusBreakdown[res.status] = (statusBreakdown[res.status] || 0) + 1;
        
        // Count by user
        userBreakdown[res.user_email] = (userBreakdown[res.user_email] || 0) + 1;
        
        // Track date range
        if (res.reservation_start_date) {
            const startDate = new Date(res.reservation_start_date);
            if (!earliestDate || startDate < earliestDate) earliestDate = startDate;
            if (!latestDate || startDate > latestDate) latestDate = startDate;
            
            // Group by date for timeline
            const dateKey = startDate.toISOString().split('T')[0];
            if (!dateBreakdown[dateKey]) {
                dateBreakdown[dateKey] = { reservationCount: 0, totalItems: 0 };
            }
            dateBreakdown[dateKey].reservationCount++;
            dateBreakdown[dateKey].totalItems += res.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    });
    
    return {
        totalReservations,
        totalItems,
        uniqueUsersCount: uniqueUsers.size,
        dateRange: earliestDate && latestDate ? `${formatDate(earliestDate, false)} - ${formatDate(latestDate, false)}` : '-',
        itemsBreakdown,
        dateBreakdown,
        statusBreakdown,
        userBreakdown,
        earliestDate,
        latestDate
    };
}

function updateSummaryCards(stats) {
    if (filteredTotalReservationsEl) filteredTotalReservationsEl.textContent = stats.totalReservations.toLocaleString();
    if (filteredTotalItemsEl) filteredTotalItemsEl.textContent = stats.totalItems.toLocaleString();
    if (filteredUniqueUsersEl) filteredUniqueUsersEl.textContent = stats.uniqueUsersCount.toLocaleString();
    if (filteredDateRangeEl) filteredDateRangeEl.textContent = stats.dateRange;
}

function updateBreakdownTables(stats) {
    // Update items breakdown table
    if (itemsBreakdownTableEl) {
        itemsBreakdownTableEl.innerHTML = '';
        const sortedItems = Object.entries(stats.itemsBreakdown)
            .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
            .slice(0, 10); // Top 10 items
        
        if (sortedItems.length === 0) {
            itemsBreakdownTableEl.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات</td></tr>';
        } else {
            sortedItems.forEach(([itemName, data]) => {
                const row = itemsBreakdownTableEl.insertRow();
                row.innerHTML = `
                    <td><strong>${itemName}</strong></td>
                    <td><span class="badge badge-primary">${data.totalQuantity}</span></td>
                    <td><span class="badge badge-secondary">${data.reservationCount}</span></td>
                `;
            });
        }
    }
    
    // Update date breakdown table
    if (dateBreakdownTableEl) {
        dateBreakdownTableEl.innerHTML = '';
        const sortedDates = Object.entries(stats.dateBreakdown)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .slice(0, 10); // Last 10 dates
        
        if (sortedDates.length === 0) {
            dateBreakdownTableEl.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات</td></tr>';
        } else {
            sortedDates.forEach(([dateKey, data]) => {
                const row = dateBreakdownTableEl.insertRow();
                const date = new Date(dateKey);
                row.innerHTML = `
                    <td><strong>${formatDate(date, false)}</strong></td>
                    <td><span class="badge badge-info">${data.reservationCount}</span></td>
                    <td><span class="badge badge-success">${data.totalItems}</span></td>
                `;
            });
        }
    }
}

function updateCharts(stats) {
    // Destroy existing charts
    destroyCharts();
    
    // Create timeline chart
    createTimelineChart(stats.dateBreakdown);
    
    // Create status distribution chart
    createStatusChart(stats.statusBreakdown);
    
    // Create top items chart
    createTopItemsChart(stats.itemsBreakdown);
    
    // Create top users chart
    createTopUsersChart(stats.userBreakdown);
}

function createTimelineChart(dateBreakdown) {
    const ctx = document.getElementById('reservations-timeline-chart');
    if (!ctx) return;
    
    const sortedDates = Object.entries(dateBreakdown).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const labels = sortedDates.map(([date]) => formatDate(new Date(date), false));
    const reservationData = sortedDates.map(([, data]) => data.reservationCount);
    const itemsData = sortedDates.map(([, data]) => data.totalItems);
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الحجوزات',
                data: reservationData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                yAxisID: 'y'
            }, {
                label: 'عدد العهد',
                data: itemsData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'التاريخ'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'عدد الحجوزات'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'عدد العهد'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function createStatusChart(statusBreakdown) {
    const ctx = document.getElementById('status-distribution-chart');
    if (!ctx) return;
    
    const labels = Object.keys(statusBreakdown).map(status => getStatusInArabic(status));
    const data = Object.values(statusBreakdown);
    const colors = [
        '#28a745', // Active - Green
        '#007bff', // Approved - Blue  
        '#6c757d', // Completed - Gray
        '#dc3545', // Declined - Red
        '#ffc107'  // Pending - Yellow
    ];
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function createTopItemsChart(itemsBreakdown) {
    const ctx = document.getElementById('top-items-chart');
    if (!ctx) return;
    
    const sortedItems = Object.entries(itemsBreakdown)
        .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
        .slice(0, 8); // Top 8 items
    
    const labels = sortedItems.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name);
    const data = sortedItems.map(([, itemData]) => itemData.totalQuantity);
    
    topItemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'العدد المحجوز',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'العدد المحجوز'
                    }
                }
            }
        }
    });
}

function createTopUsersChart(userBreakdown) {
    const ctx = document.getElementById('top-users-chart');
    if (!ctx) return;
    
    const sortedUsers = Object.entries(userBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Top 8 users
    
    const labels = sortedUsers.map(([email]) => email.split('@')[0]); // Show only username part
    const data = sortedUsers.map(([, count]) => count);
    
    topUsersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الحجوزات',
                data: data,
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'عدد الحجوزات'
                    }
                }
            }
        }
    });
}

function destroyCharts() {
    if (timelineChart) {
        timelineChart.destroy();
        timelineChart = null;
    }
    if (statusChart) {
        statusChart.destroy();
        statusChart = null;
    }
    if (topItemsChart) {
        topItemsChart.destroy();
        topItemsChart = null;
    }
    if (topUsersChart) {
        topUsersChart.destroy();
        topUsersChart = null;
    }
}

// --- Helper Functions ---
function showLoading(isLoading, message = "جاري التحميل...") {
    if (isLoading) {
        loadingSpinner.classList.remove('hidden');
        if (loadingSpinner.querySelector('p')) {
            loadingSpinner.querySelector('p').textContent = message;
        }
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function formatDate(date, includeTime = true) {
    if (!date) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleDateString('ar-EG', options);
}

function calculateUpcomingReservations(allReservations, daysAhead) {
    const summary = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < daysAhead; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

        let count = 0;
        let totalItems = 0;

        allReservations.forEach(res => {
            if ((res.status === 'Active' || res.status === 'Approved') && res.reservation_start && res.reservation_end) {
                const resStartDate = res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start);
                const resEndDate = res.reservation_end.toDate ? res.reservation_end.toDate() : new Date(res.reservation_end);
                
                // Set hours to 0 for date comparison
                resStartDate.setHours(0,0,0,0);
                resEndDate.setHours(0,0,0,0);
                targetDate.setHours(0,0,0,0);
                
                // Check if the target date falls within the reservation period (inclusive)
                if (targetDate.getTime() >= resStartDate.getTime() && targetDate.getTime() <= resEndDate.getTime()) {
                    count++;
                    totalItems += res.items.reduce((sum, item) => sum + item.quantity, 0);
                }
            }
        });
        summary.push({ date: dateString, count: count, total_items_reserved: totalItems });
    }
    return summary;
}

// Modal functionality
function showModal(modal, onTop = false) {
    if (onTop) {
        modal.classList.add('modal-on-top');
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('modal-on-top');
    
    // Check if there are other open modals
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    if (openModals.length === 0) {
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking on close button or outside modal
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close')) {
        hideModal(e.target.closest('.modal'));
    }
    if (e.target.classList.contains('modal')) {
        hideModal(e.target);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close the topmost modal first (the one with modal-on-top class)
        const topModal = document.querySelector('.modal.modal-on-top:not(.hidden)');
        if (topModal) {
            hideModal(topModal);
        } else {
            const openModals = document.querySelectorAll('.modal:not(.hidden)');
            if (openModals.length > 0) {
                hideModal(openModals[openModals.length - 1]);
            }
        }
    }
});

// --- Modal Display Functions ---
function showReservationDetails(reservation) {
    reservationModalTitle.textContent = `تفاصيل الحجز - ${reservation.user_email}`;
    
    const startDate = reservation.reservation_start ? 
        (reservation.reservation_start.toDate ? reservation.reservation_start.toDate() : new Date(reservation.reservation_start)) : null;
    const endDate = reservation.reservation_end ? 
        (reservation.reservation_end.toDate ? reservation.reservation_end.toDate() : new Date(reservation.reservation_end)) : null;
    const createdDate = reservation.created_at ? 
        (reservation.created_at.toDate ? reservation.created_at.toDate() : new Date(reservation.created_at)) : null;
    
    let statusClass = '';
    switch(reservation.status) {
        case 'Active': statusClass = 'status-active'; break;
        case 'Approved': statusClass = 'status-approved'; break;
        case 'Completed': statusClass = 'status-completed'; break;
        case 'Declined': statusClass = 'status-declined'; break;
        default: statusClass = 'status-active';
    }
    
    const totalItems = reservation.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Add reservation period information
    let periodInfo = '';
    if (startDate && endDate) {
        const startDateStr = formatDate(startDate, false);
        const endDateStr = formatDate(endDate, false);
        if (startDateStr === endDateStr) {
            periodInfo = `<p><strong><i class="fas fa-calendar"></i> تاريخ الحجز:</strong><br>${startDateStr}</p>`;
        } else {
            periodInfo = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong><i class="fas fa-calendar-alt"></i> تاريخ البداية:</strong><br>${startDateStr}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong><i class="fas fa-calendar-times"></i> تاريخ النهاية:</strong><br>${endDateStr}</p>
                    </div>
                </div>
            `;
        }
    }
    
    reservationModalContent.innerHTML = `
        <div class="reservation-detail-card">
            <div class="reservation-header">
                <div>
                    <h5><i class="fas fa-user"></i> ${reservation.user_email}</h5>
                    <p class="mb-1"><strong>رقم الحجز:</strong> ${reservation.id}</p>
                </div>
                <span class="reservation-status ${statusClass}">${getStatusInArabic(reservation.status)}</span>
            </div>
            
            ${periodInfo}
            
            <div class="row">
                <div class="col-md-6">
                    <p><strong><i class="fas fa-clock"></i> تاريخ الإنشاء:</strong><br>
                    ${createdDate ? formatDate(createdDate) : 'غير متوفر'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong><i class="fas fa-boxes"></i> إجمالي العهد:</strong><br>
                    ${totalItems} قطعة</p>
                </div>
            </div>
            
            ${reservation.notes ? `
                <div class="mt-3">
                    <p><strong><i class="fas fa-sticky-note"></i> ملاحظات:</strong></p>
                    <p class="text-muted">${reservation.notes}</p>
                </div>
            ` : ''}
            
            <div class="reservation-items">
                <h6><i class="fas fa-list"></i> العهد المحجوزة:</h6>
                ${reservation.items.map(item => `
                    <div class="item-row">
                        <div class="item-name">
                            <strong>${item.productNameAr || item.productNameEn}</strong>
                            ${item.productNameEn && item.productNameAr ? `<br><small class="text-muted">${item.productNameEn}</small>` : ''}
                        </div>
                        <span class="item-quantity">${item.quantity}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Check if another modal is already open (daily reservations modal)
    const isDailyModalOpen = !dailyReservationsModal.classList.contains('hidden');
    showModal(reservationDetailsModal, isDailyModalOpen);
}

function showDailyReservations(dateString) {
    const targetDate = new Date(dateString);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = dayNames[targetDate.getDay()];
    
    dailyModalTitle.textContent = `حجوزات ${dayName} - ${formatDate(targetDate, false)}`;
    
    if (!currentSnapshotData || !currentSnapshotData.all_reservations_snapshot) {
        dailyModalContent.innerHTML = '<p class="text-muted">لا توجد بيانات حجوزات متاحة.</p>';
        showModal(dailyReservationsModal);
        return;
    }
    
    // Filter reservations for this specific date
    const dayReservations = currentSnapshotData.all_reservations_snapshot.filter(res => {
        if ((res.status === 'Active' || res.status === 'Approved') && res.reservation_start && res.reservation_end) {
            const resStartDate = res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start);
            const resEndDate = res.reservation_end.toDate ? res.reservation_end.toDate() : new Date(res.reservation_end);
            
            // Set hours to 0 for date comparison
            resStartDate.setHours(0,0,0,0);
            resEndDate.setHours(0,0,0,0);
            targetDate.setHours(0,0,0,0);
            
            // Check if the target date falls within the reservation period (inclusive)
            return targetDate.getTime() >= resStartDate.getTime() && targetDate.getTime() <= resEndDate.getTime();
        }
        return false;
    });
    
    if (dayReservations.length === 0) {
        dailyModalContent.innerHTML = '<p class="text-muted text-center">لا توجد حجوزات في هذا اليوم.</p>';
        showModal(dailyReservationsModal);
        return;
    }
    
    const totalItems = dayReservations.reduce((sum, res) => 
        sum + res.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    dailyModalContent.innerHTML = `
        <div class="mb-3">
            <div class="row">
                <div class="col-md-6">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5><i class="fas fa-calendar-check"></i> ${dayReservations.length}</h5>
                            <p class="mb-0">إجمالي الحجوزات</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h5><i class="fas fa-boxes"></i> ${totalItems}</h5>
                            <p class="mb-0">إجمالي العهد</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="reservations-list">
            ${dayReservations.map((res, index) => {
                const itemsSummary = res.items.map(item => `${item.productNameAr || item.productNameEn} (${item.quantity})`).join(', ');
                let statusClass = '';
                switch(res.status) {
                    case 'Active': statusClass = 'status-active'; break;
                    case 'Approved': statusClass = 'status-approved'; break;
                    case 'Completed': statusClass = 'status-completed'; break;
                    case 'Declined': statusClass = 'status-declined'; break;
                    default: statusClass = 'status-active';
                }
                
                // Determine the reservation's relationship to this date
                const resStartDate = res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start);
                const resEndDate = res.reservation_end.toDate ? res.reservation_end.toDate() : new Date(res.reservation_end);
                resStartDate.setHours(0,0,0,0);
                resEndDate.setHours(0,0,0,0);
                
                let dateRelation = '';
                if (resStartDate.getTime() === targetDate.getTime() && resEndDate.getTime() === targetDate.getTime()) {
                    dateRelation = '<span class="badge badge-success">يوم واحد</span>';
                } else if (resStartDate.getTime() === targetDate.getTime()) {
                    dateRelation = '<span class="badge badge-primary">يبدأ اليوم</span>';
                } else if (resEndDate.getTime() === targetDate.getTime()) {
                    dateRelation = '<span class="badge badge-warning">ينتهي اليوم</span>';
                } else {
                    dateRelation = '<span class="badge badge-info">مستمر</span>';
                }
                
                return `
                    <div class="reservation-detail-card clickable-row daily-reservation-item" data-reservation-index="${index}" style="cursor: pointer;">
                        <div class="reservation-header">
                            <div>
                                <h6><i class="fas fa-user"></i> ${res.user_email}</h6>
                                <p class="mb-1 text-muted"><small>رقم الحجز: ${res.id}</small></p>
                            </div>
                            <div>
                                ${dateRelation}
                                <span class="reservation-status ${statusClass}">${getStatusInArabic(res.status)}</span>
                            </div>
                        </div>
                        <p class="mb-0"><strong>العهد:</strong> ${itemsSummary}</p>
                        <small class="text-muted">
                            ${formatDate(resStartDate, false)} - ${formatDate(resEndDate, false)} | 
                            انقر لعرض التفاصيل الكاملة
                        </small>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add event listeners to the reservation items
    setTimeout(() => {
        const reservationItems = dailyModalContent.querySelectorAll('.daily-reservation-item');
        reservationItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                showReservationDetails(dayReservations[index]);
            });
        });
    }, 100);
    
    showModal(dailyReservationsModal);
}

function getStatusInArabic(status) {
    const statusMap = {
        'Active': 'نشط',
        'Approved': 'معتمد', 
        'Completed': 'مكتمل',
        'Declined': 'مرفوض',
        'Pending': 'في الانتظار'
    };
    return statusMap[status] || status;
}

// --- Search/Filter Event Listeners ---

// Product Summary Search
if (productSummarySearchInput) {
    productSummarySearchInput.addEventListener('keyup', () => {
        const filter = productSummarySearchInput.value.toLowerCase();
        const rows = productSummaryTableBodyEl.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            let nameAr = rows[i].getElementsByTagName('td')[0];
            let nameEn = rows[i].getElementsByTagName('td')[1];
            if (nameAr || nameEn) {
                const textValue = (nameAr.textContent || nameAr.innerText) + " " + (nameEn.textContent || nameEn.innerText);
                if (textValue.toLowerCase().indexOf(filter) > -1) {
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            }
        }
    });
}

// Enhanced Reservations Table Event Listeners
if (reservationsTableSearchInput) {
    reservationsTableSearchInput.addEventListener('input', () => {
        applyFiltersAndDisplay();
    });
}

if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', () => {
        applyFiltersAndDisplay();
    });
}

if (dateFilterSelect) {
    dateFilterSelect.addEventListener('change', () => {
        applyFiltersAndDisplay();
    });
}

if (userFilterSelect) {
    userFilterSelect.addEventListener('change', () => {
        applyFiltersAndDisplay();
    });
}

if (unitFilterSelect) {
    unitFilterSelect.addEventListener('change', () => {
        applyFiltersAndDisplay();
    });
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        if (reservationsTableSearchInput) reservationsTableSearchInput.value = '';
        if (statusFilterSelect) statusFilterSelect.value = '';
        if (userFilterSelect) userFilterSelect.value = '';
        if (unitFilterSelect) unitFilterSelect.value = '';
        if (dateFilterSelect) dateFilterSelect.value = '';
        applyFiltersAndDisplay();
    });
}

// Pagination Event Listeners
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayReservationsTable();
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayReservationsTable();
        }
    });
} 