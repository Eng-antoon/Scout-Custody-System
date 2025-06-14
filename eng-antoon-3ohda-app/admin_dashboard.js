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

// Search Inputs
const productSummarySearchInput = document.getElementById('product-summary-search');
const allReservationsSearchInput = document.getElementById('all-reservations-search');

let currentSnapshotData = null; // To store loaded snapshot

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

        allReservations.forEach(res => {
            if (res.status === 'Active') activeReservationsCount++;
            if (res.status === 'Approved') approvedReservationsCount++;
            if (res.status === 'Completed') completedReservationsCount++;

            if (res.status === 'Active' || res.status === 'Approved') {
                res.items.forEach(item => {
                    productCommitments[item.productId] = (productCommitments[item.productId] || 0) + item.quantity;
                });
            }
        });

        const productSummary = allProducts.map(p => {
            const committed = productCommitments[p.id] || 0;
            return {
                productId: p.id,
                name_ar: p.name_ar,
                name_en: p.name_en,
                total_physical_stock: p.stock_count,
                currently_committed_active_approved: committed,
                effectively_available_now: p.stock_count - committed
            };
        });
        
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
            <td>${p.currently_committed_active_approved}</td>
            <td class="${p.effectively_available_now <= 0 ? 'text-danger font-weight-bold' : p.effectively_available_now <= 5 ? 'text-warning font-weight-bold' : 'text-success'}">
                ${p.effectively_available_now}
            </td>
        `;
    });
}

function displayUpcomingReservations(summary) {
    upcomingReservationsListEl.innerHTML = '';
     if (!summary || summary.length === 0) {
        upcomingReservationsListEl.innerHTML = '<li class="list-group-item text-muted">لا توجد حجوزات قادمة مجدولة.</li>';
        return;
    }
    summary.forEach(day => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${formatDate(new Date(day.date), false)}</span>
            <span class="badge badge-primary badge-pill">${day.count} حجوزات</span>
            <span class="badge badge-info badge-pill">${day.total_items_reserved} عهدة</span>
        `;
        upcomingReservationsListEl.appendChild(li);
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
        row.innerHTML = `
            <td><small>${r.user_email}</small></td>
            <td><small>${itemsSummary.substring(0,30)}...</small></td>
            <td><small>${formatDate(endDate)}</small></td>
        `;
    });
}

function displayAllReservationsRaw(allReservations) {
    if (!allReservations || allReservations.length === 0) {
         allReservationsRawDataEl.innerHTML = '<p class="text-muted">لا توجد بيانات حجوزات في اللقطة الحالية.</p>';
        return;
    }
    // For display, convert Timestamps to strings
    const displayableReservations = allReservations.map(res => {
        return {
            ...res,
            created_at: res.created_at ? (res.created_at.toDate ? res.created_at.toDate().toISOString() : new Date(res.created_at).toISOString()) : null,
            updated_at: res.updated_at ? (res.updated_at.toDate ? res.updated_at.toDate().toISOString() : new Date(res.updated_at).toISOString()) : null,
            reservation_start: res.reservation_start ? (res.reservation_start.toDate ? res.reservation_start.toDate().toISOString() : new Date(res.reservation_start).toISOString()) : null,
            reservation_end: res.reservation_end ? (res.reservation_end.toDate ? res.reservation_end.toDate().toISOString() : new Date(res.reservation_end).toISOString()) : null,
        };
    });
    allReservationsRawDataEl.textContent = JSON.stringify(displayableReservations, null, 2);
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
            if ((res.status === 'Active' || res.status === 'Approved') && res.reservation_start) {
                const resStartDate = res.reservation_start.toDate ? res.reservation_start.toDate() : new Date(res.reservation_start);
                resStartDate.setHours(0,0,0,0);
                if (resStartDate.getTime() === targetDate.getTime()) {
                    count++;
                    totalItems += res.items.reduce((sum, item) => sum + item.quantity, 0);
                }
            }
        });
        summary.push({ date: dateString, count: count, total_items_reserved: totalItems });
    }
    return summary;
}


// --- Search/Filter for Tables ---
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

if (allReservationsSearchInput) {
    allReservationsSearchInput.addEventListener('input', () => {
        const filter = allReservationsSearchInput.value.toLowerCase();
        // This search is on the raw JSON. A more advanced UI would parse and filter the JSON objects.
        // For now, it's a simple text search on the displayed JSON string.
        const currentText = allReservationsRawDataEl.textContent;
        // This simple filter won't work well on JSON. A proper filter needs to re-filter the array and re-render.
        // For a quick visual, we can just highlight or indicate no results if filter is too broad.
        if (filter && currentSnapshotData && currentSnapshotData.all_reservations_snapshot) {
            const filteredReservations = currentSnapshotData.all_reservations_snapshot.filter(r => {
                const emailMatch = r.user_email && r.user_email.toLowerCase().includes(filter);
                const itemMatch = r.items.some(item => 
                    (item.productNameAr && item.productNameAr.toLowerCase().includes(filter)) ||
                    (item.productNameEn && item.productNameEn.toLowerCase().includes(filter))
                );
                return emailMatch || itemMatch;
            }).map(res => { // Convert timestamps for display
                 return {
                    ...res,
                    created_at: res.created_at ? (res.created_at.toDate ? res.created_at.toDate().toISOString() : new Date(res.created_at).toISOString()) : null,
                    updated_at: res.updated_at ? (res.updated_at.toDate ? res.updated_at.toDate().toISOString() : new Date(res.updated_at).toISOString()) : null,
                    reservation_start: res.reservation_start ? (res.reservation_start.toDate ? res.reservation_start.toDate().toISOString() : new Date(res.reservation_start).toISOString()) : null,
                    reservation_end: res.reservation_end ? (res.reservation_end.toDate ? res.reservation_end.toDate().toISOString() : new Date(res.reservation_end).toISOString()) : null,
                };
            });
            allReservationsRawDataEl.textContent = JSON.stringify(filteredReservations, null, 2);
            if (filteredReservations.length === 0) {
                 allReservationsRawDataEl.textContent = "لا توجد حجوزات تطابق بحثك في اللقطة الحالية.";
            }
        } else if (!filter && currentSnapshotData && currentSnapshotData.all_reservations_snapshot) {
            // Reset to full list if filter is cleared
            displayAllReservationsRaw(currentSnapshotData.all_reservations_snapshot);
        }
    });
} 