// Wait for Firebase to be loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        document.getElementById('auth-check-section').innerHTML = `
            <div class="loading-content">
                <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                <p class="mt-3 text-danger">خطأ في تحميل Firebase. يرجى إعادة تحميل الصفحة.</p>
                <button class="btn btn-primary" onclick="location.reload()">إعادة تحميل</button>
            </div>
        `;
        return;
    }

    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        document.getElementById('auth-check-section').innerHTML = `
            <div class="loading-content">
                <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                <p class="mt-3 text-danger">خطأ في تهيئة النظام. يرجى إعادة تحميل الصفحة.</p>
                <button class="btn btn-primary" onclick="location.reload()">إعادة تحميل</button>
            </div>
        `;
    }
});

function initializeApp() {
    // Firebase Configuration (same as admin dashboard)
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

    // Continue with the rest of the initialization
    initializeDashboard(auth, db);
}

function initializeDashboard(auth, db) {
    // DOM Elements
    const authCheckSection = document.getElementById('auth-check-section');
    const reportContent = document.getElementById('report-content');
    const loadingSpinner = document.getElementById('loading-spinner');
    const reportPreviewArea = document.getElementById('report-preview-area');
    const noDataMessage = document.getElementById('no-data-message');

    // User Profile Elements
    const currentUserNameEl = document.getElementById('current-user-name');
    const currentUserRoleEl = document.getElementById('current-user-role');
    const dropdownUserNameEl = document.getElementById('dropdown-user-name');
    const dropdownUserEmailEl = document.getElementById('dropdown-user-email');
    const dropdownUserRoleEl = document.getElementById('dropdown-user-role');
    const logoutDashboardBtn = document.getElementById('logout-dashboard-btn');

    // Date Selection Elements
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const last7DaysBtn = document.getElementById('last-7-days-btn');
    const last30DaysBtn = document.getElementById('last-30-days-btn');
    const thisMonthBtn = document.getElementById('this-month-btn');
    const lastMonthBtn = document.getElementById('last-month-btn');

    // Action Buttons
    const generatePreviewBtn = document.getElementById('generate-preview-btn');
    const downloadImgBtn = document.getElementById('download-img-btn');

    // Report Elements
    const reportPeriodEl = document.getElementById('report-period');
    const totalReservationsStatEl = document.getElementById('total-reservations-stat');
    const uniqueItemsStatEl = document.getElementById('unique-items-stat');
    const totalQuantityStatEl = document.getElementById('total-quantity-stat');
    const uniqueUsersStatEl = document.getElementById('unique-users-stat');

    // Table Elements
    const reservationsTableBodyEl = document.getElementById('reservations-table-body');
    const itemsBreakdownBodyEl = document.getElementById('items-breakdown-body');
    const usersActivityBodyEl = document.getElementById('users-activity-body');

    // Chart Variables
    let statusChart = null;
    let topItemsChart = null;

    // Data Variables
    let currentUser = null;
    let reportData = null;

    // Authentication State Handler
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin' || userData.role === 'superadmin') {
                        currentUser = { ...user, ...userData };
                        updateUserProfile(user, userData);
                        showReportContent();
                    } else {
                        redirectToLogin('ليس لديك صلاحية للوصول لهذه الصفحة');
                    }
                } else {
                    redirectToLogin('بيانات المستخدم غير موجودة');
                }
            } catch (error) {
                console.error('Error checking user data:', error);
                redirectToLogin('حدث خطأ في التحقق من البيانات');
            }
        } else {
            redirectToLogin('يجب تسجيل الدخول أولاً');
        }
    });

    // User Profile Functions
    function updateUserProfile(user, userData) {
        if (currentUserNameEl) {
            currentUserNameEl.textContent = userData.displayName || userData.name || userData.fullName || 'المدير';
        }
        
        if (currentUserRoleEl) {
            const roleText = getRoleInArabic(userData.role);
            currentUserRoleEl.textContent = roleText;
        }
        
        if (dropdownUserNameEl) {
            dropdownUserNameEl.textContent = userData.displayName || userData.name || userData.fullName || 'المدير';
        }
        
        if (dropdownUserEmailEl) {
            dropdownUserEmailEl.textContent = user.email || 'admin@example.com';
        }
        
        if (dropdownUserRoleEl) {
            const roleText = getRoleInArabic(userData.role);
            dropdownUserRoleEl.textContent = roleText;
            dropdownUserRoleEl.className = `badge ${getRoleBadgeClass(userData.role)}`;
        }
    }

    function getRoleInArabic(role) {
        const roles = {
            'admin': 'مدير النظام',
            'superadmin': 'مدير عام',
            'user': 'مستخدم',
            'moderator': 'مشرف'
        };
        return roles[role] || 'مستخدم';
    }

    function getRoleBadgeClass(role) {
        const classes = {
            'admin': 'badge-primary',
            'superadmin': 'badge-danger',
            'user': 'badge-secondary',
            'moderator': 'badge-warning'
        };
        return classes[role] || 'badge-secondary';
    }

    function redirectToLogin(message) {
        alert(message);
        window.location.href = 'index.html';
    }

    function showReportContent() {
        authCheckSection.classList.add('hidden');
        reportContent.classList.remove('hidden');
    }

    // Date Range Functions
    function setDateRange(startDate, endDate) {
        startDateInput.value = formatDateForInput(startDate);
        endDateInput.value = formatDateForInput(endDate);
    }

    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Event Listeners for Date Range Buttons
    last7DaysBtn.addEventListener('click', () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        setDateRange(startDate, endDate);
    });

    last30DaysBtn.addEventListener('click', () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        setDateRange(startDate, endDate);
    });

    thisMonthBtn.addEventListener('click', () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setDateRange(startDate, endDate);
    });

    lastMonthBtn.addEventListener('click', () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        setDateRange(startDate, endDate);
    });

    // Generate Report Preview
    generatePreviewBtn.addEventListener('click', generateReportPreview);

    async function generateReportPreview() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!startDate || !endDate) {
            alert('يرجى اختيار تاريخ البداية والنهاية');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            return;
        }
        
        showLoading(true, 'جاري جلب البيانات وإنشاء التقرير...');
        
        try {
            // Fetch all necessary data
            const data = await fetchReportData(startDate, endDate);
            
            if (data.reservations.length === 0) {
                showNoDataMessage();
                return;
            }
            
            // Process and display the report
            reportData = processReportData(data, startDate, endDate);
            displayReportPreview(reportData);
            downloadImgBtn.disabled = false;
            
        } catch (error) {
            console.error('Error generating report:', error);
            alert('حدث خطأ في إنشاء التقرير. يرجى المحاولة مرة أخرى.');
        } finally {
            showLoading(false);
        }
    }

    async function fetchReportData(startDate, endDate) {
        const startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(startDate));
        const endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(endDate + 'T23:59:59'));
        
        try {
            // Due to Firebase limitation, we can't use inequality on both fields
            // So we'll fetch reservations that start before our end date and filter client-side
            const reservationsQuery = await db.collection('reservations')
                .where('reservation_start', '<=', endTimestamp)
                .get();
            
            // Fetch all products and users
            const [productsSnapshot, usersSnapshot] = await Promise.all([
                db.collection('products').get(),
                db.collection('users').get()
            ]);
            
            const reservations = [];
            reservationsQuery.forEach(doc => {
                const data = doc.data();
                
                // Client-side filtering for overlapping reservations
                const reservationStart = data.reservation_start?.toDate() || new Date(0);
                const reservationEnd = data.reservation_end?.toDate() || new Date(0);
                const reportStart = new Date(startDate);
                const reportEnd = new Date(endDate + 'T23:59:59');
                
                // Check if reservation overlaps with report period
                // Reservation overlaps if: reservation_start <= report_end AND reservation_end >= report_start
                if (reservationStart <= reportEnd && reservationEnd >= reportStart) {
                    reservations.push({ id: doc.id, ...data });
                }
            });
            
            const products = {};
            productsSnapshot.forEach(doc => {
                products[doc.id] = doc.data();
            });
            
            const users = {};
            usersSnapshot.forEach(doc => {
                users[doc.id] = doc.data();
            });
            
            return { reservations, products, users };
            
        } catch (error) {
            console.error('Error fetching report data:', error);
            throw error;
        }
    }

    function processReportData(data, startDate, endDate) {
        const { reservations, products, users } = data;
        
        // Initialize counters
        const stats = {
            totalReservations: reservations.length,
            uniqueItems: new Set(),
            totalQuantity: 0,
            uniqueUsers: new Set(),
            statusBreakdown: {},
            itemsBreakdown: {},
            usersActivity: {}
        };
        
        // Process each reservation
        reservations.forEach(reservation => {
            // Count unique users
            stats.uniqueUsers.add(reservation.user_id);
            
            // Count status breakdown
            const status = reservation.status || 'Unknown';
            stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
            
            // Process items
            if (reservation.items && Array.isArray(reservation.items)) {
                reservation.items.forEach(item => {
                    const productId = item.productId;
                    const quantity = parseInt(item.quantity) || 0;
                    
                    stats.uniqueItems.add(productId);
                    stats.totalQuantity += quantity;
                    
                    // Items breakdown
                    if (!stats.itemsBreakdown[productId]) {
                        stats.itemsBreakdown[productId] = {
                            nameAr: item.productNameAr || products[productId]?.name_ar || 'غير محدد',
                            nameEn: item.productNameEn || products[productId]?.name_en || 'Unknown',
                            totalQuantity: 0,
                            reservationCount: 0
                        };
                    }
                    stats.itemsBreakdown[productId].totalQuantity += quantity;
                    stats.itemsBreakdown[productId].reservationCount += 1;
                });
            }
            
            // Users activity
            const userId = reservation.user_id;
            if (!stats.usersActivity[userId]) {
                const userData = users[userId] || {};
                stats.usersActivity[userId] = {
                    email: reservation.user_email || userData.email || 'غير محدد',
                    fullName: userData.fullName || userData.name || userData.displayName || 'غير محدد',
                    scoutGroup: userData.scoutGroup || 'غير محدد',
                    reservationCount: 0,
                    totalQuantity: 0
                };
            }
            stats.usersActivity[userId].reservationCount += 1;
            
            if (reservation.items && Array.isArray(reservation.items)) {
                reservation.items.forEach(item => {
                    stats.usersActivity[userId].totalQuantity += parseInt(item.quantity) || 0;
                });
            }
        });
        
        // Convert sets to counts
        stats.uniqueItemsCount = stats.uniqueItems.size;
        stats.uniqueUsersCount = stats.uniqueUsers.size;
        
        return {
            period: `${formatDateArabic(startDate)} - ${formatDateArabic(endDate)}`,
            stats,
            reservations,
            products,
            users
        };
    }

    function displayReportPreview(data) {
        // Hide no data message and show preview area
        noDataMessage.classList.add('hidden');
        reportPreviewArea.classList.remove('hidden');
        
        // Update period
        reportPeriodEl.textContent = data.period;
        
        // Update statistics
        totalReservationsStatEl.textContent = data.stats.totalReservations;
        uniqueItemsStatEl.textContent = data.stats.uniqueItemsCount;
        totalQuantityStatEl.textContent = data.stats.totalQuantity;
        uniqueUsersStatEl.textContent = data.stats.uniqueUsersCount;
        
        // Display tables
        displayReservationsTable(data.reservations);
        displayItemsBreakdownTable(data.stats.itemsBreakdown);
        displayUsersActivityTable(data.stats.usersActivity);
        
        // Display charts
        displayCharts(data.stats);
    }

    function displayReservationsTable(reservations) {
        const tbody = reservationsTableBodyEl;
        tbody.innerHTML = '';
        
        reservations.forEach(reservation => {
            const row = tbody.insertRow();
            
            const itemsSummary = reservation.items && reservation.items.length > 0 
                ? reservation.items.map(item => `${item.productNameAr || 'غير محدد'} (${item.quantity})`).join(', ')
                : 'لا توجد أصناف';
            
            row.innerHTML = `
                <td>${reservation.id.substring(0, 8)}</td>
                <td>${reservation.user_email || 'غير محدد'}</td>
                <td>${reservation.recipient_name || 'غير محدد'}</td>
                <td>${reservation.unit || 'غير محدد'}</td>
                <td>${formatDateArabic(reservation.reservation_start?.toDate() || new Date())}</td>
                <td>${formatDateArabic(reservation.reservation_end?.toDate() || new Date())}</td>
                <td><span class="status-badge ${(reservation.status || 'unknown').toLowerCase()}">${getStatusInArabic(reservation.status)}</span></td>
                <td><small>${itemsSummary}</small></td>
            `;
        });
    }

    function displayItemsBreakdownTable(itemsBreakdown) {
        const tbody = itemsBreakdownBodyEl;
        tbody.innerHTML = '';
        
        const sortedItems = Object.entries(itemsBreakdown)
            .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity);
        
        sortedItems.forEach(([productId, item]) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.nameAr}</td>
                <td>${item.nameEn}</td>
                <td><strong>${item.totalQuantity}</strong></td>
                <td>${item.reservationCount}</td>
            `;
        });
    }

    function displayUsersActivityTable(usersActivity) {
        const tbody = usersActivityBodyEl;
        tbody.innerHTML = '';
        
        const sortedUsers = Object.entries(usersActivity)
            .sort(([,a], [,b]) => b.reservationCount - a.reservationCount);
        
        sortedUsers.forEach(([userId, user]) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.fullName}</td>
                <td>${user.scoutGroup}</td>
                <td><strong>${user.reservationCount}</strong></td>
                <td>${user.totalQuantity}</td>
            `;
        });
    }

    function displayCharts(stats) {
        // Destroy existing charts
        if (statusChart) {
            statusChart.destroy();
        }
        if (topItemsChart) {
            topItemsChart.destroy();
        }
        
        // Status Chart with more vibrant colors
        const statusCtx = document.getElementById('status-chart').getContext('2d');
        const statusLabels = Object.keys(stats.statusBreakdown).map(status => getStatusInArabic(status));
        const statusData = Object.values(stats.statusBreakdown);
        
        statusChart = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: [
                        '#007bff', // Blue
                        '#28a745', // Green
                        '#dc3545', // Red
                        '#ffc107', // Yellow
                        '#6c757d', // Gray
                        '#17a2b8', // Teal
                        '#fd7e14'  // Orange
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        textDirection: 'rtl',
                        labels: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#2c3e50',
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }
                }
            }
        });
        
        // Top Items Chart with enhanced styling
        const itemsCtx = document.getElementById('top-items-chart').getContext('2d');
        const topItems = Object.entries(stats.itemsBreakdown)
            .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5);
        
        const itemLabels = topItems.map(([, item]) => item.nameAr);
        const itemData = topItems.map(([, item]) => item.totalQuantity);
        
        // Generate different colors for each bar
        const barColors = [
            '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'
        ];
        
        topItemsChart = new Chart(itemsCtx, {
            type: 'bar',
            data: {
                labels: itemLabels,
                datasets: [{
                    label: 'الكمية',
                    data: itemData,
                    backgroundColor: barColors.slice(0, itemData.length),
                    borderColor: barColors.slice(0, itemData.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#2c3e50',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: '#e0e6ed',
                            borderColor: '#2c3e50'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#2c3e50',
                            font: {
                                weight: 'bold'
                            },
                            maxRotation: 45
                        },
                        grid: {
                            color: '#e0e6ed',
                            borderColor: '#2c3e50'
                        }
                    }
                }
            }
        });
    }

    function showNoDataMessage() {
        reportPreviewArea.classList.add('hidden');
        noDataMessage.classList.remove('hidden');
        downloadImgBtn.disabled = true;
    }

    function showLoading(isLoading, message = "جاري التحميل...") {
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            loadingSpinner.querySelector('p').textContent = message;
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }

    // PDF Generation
    downloadImgBtn.addEventListener('click', generateImgReport);

    async function generateImgReport() {
        if (!reportData) {
            alert('يرجى إنشاء معاينة التقرير أولاً');
            return;
        }
        
        showLoading(true, 'جاري إنشاء ملف صورة...');
        
        try {
            // Get the report element
            const reportElement = document.getElementById('report-preview-area');
            
            // Wait a bit for charts to fully render
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Configure html2canvas with optimal settings for color clarity
            const canvas = await html2canvas(reportElement, {
                scale: 3, // Higher scale for better resolution
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: reportElement.scrollWidth,
                height: reportElement.scrollHeight,
                foreignObjectRendering: false,
                ignoreElements: (element) => {
                    // Ignore any overlay elements or loading spinners
                    return element.classList?.contains('loading-overlay') || 
                           element.classList?.contains('hidden');
                },
                onclone: (clonedDoc) => {
                    // Enhance styles in the cloned document for better rendering
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        * {
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        .card {
                            border: 1px solid #e0e6ed !important;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                        }
                        .table th {
                            background-color: #f8f9fa !important;
                            color: #2c3e50 !important;
                            border-bottom: 2px solid #dee2e6 !important;
                        }
                        .table td {
                            color: #2c3e50 !important;
                            border-bottom: 1px solid #dee2e6 !important;
                        }
                        .stat-card {
                            border: 1px solid #e0e6ed !important;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                        }
                        .stat-icon.bg-primary { 
                            background: #007bff !important; 
                            color: white !important;
                        }
                        .stat-icon.bg-info { 
                            background: #17a2b8 !important; 
                            color: white !important;
                        }
                        .stat-icon.bg-warning { 
                            background: #ffc107 !important; 
                            color: #212529 !important;
                        }
                        .stat-icon.bg-success { 
                            background: #28a745 !important; 
                            color: white !important;
                        }
                        .status-badge.active { 
                            background: #007bff !important; 
                            color: white !important; 
                        }
                        .status-badge.approved { 
                            background: #28a745 !important; 
                            color: white !important; 
                        }
                        .status-badge.completed { 
                            background: #6c757d !important; 
                            color: white !important; 
                        }
                        .status-badge.declined { 
                            background: #dc3545 !important; 
                            color: white !important; 
                        }
                        .status-badge.pending { 
                            background: #ffc107 !important; 
                            color: #212529 !important; 
                        }
                        .badge-primary { 
                            background: #007bff !important; 
                            color: white !important;
                        }
                        .badge-success { 
                            background: #28a745 !important; 
                            color: white !important;
                        }
                        .badge-warning { 
                            background: #ffc107 !important; 
                            color: #212529 !important;
                        }
                        .badge-danger { 
                            background: #dc3545 !important; 
                            color: white !important;
                        }
                        .badge-info { 
                            background: #17a2b8 !important; 
                            color: white !important;
                        }
                        canvas {
                            image-rendering: -webkit-optimize-contrast !important;
                            image-rendering: crisp-edges !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                    
                    // Ensure all chart canvases are properly styled
                    const canvases = clonedDoc.querySelectorAll('canvas');
                    canvases.forEach(canvas => {
                        canvas.style.backgroundColor = '#ffffff';
                        canvas.style.border = '1px solid #e0e6ed';
                    });
                }
            });
            
            // Convert canvas to high-quality image data URL
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Create a download link and trigger download
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Scout_Report_${startDateInput.value}_to_${endDateInput.value}.jpeg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error generating image:', error);
            alert('حدث خطأ في إنشاء ملف الصورة. يرجى المحاولة مرة أخرى.');
        } finally {
            showLoading(false);
        }
    }

    // Utility Functions
    function formatDateArabic(date) {
        if (!date) return 'غير محدد';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'غير محدد';
        }
        
        // Use a more compatible approach without timezone specification
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    }

    function getStatusInArabic(status) {
        const statusMap = {
            'Active': 'نشط',
            'Approved': 'معتمد',
            'Completed': 'مكتمل',
            'Declined': 'مرفوض',
            'Pending': 'في الانتظار',
            'Unknown': 'غير محدد'
        };
        return statusMap[status] || statusMap['Unknown'];
    }

    // Logout functionality
    logoutDashboardBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('حدث خطأ في تسجيل الخروج');
        }
    });

    // Initialize default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    setDateRange(startDate, endDate);
} 