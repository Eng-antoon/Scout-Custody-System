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
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

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
            downloadPdfBtn.disabled = false;
            
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
        
        // Status Chart
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
                        '#74b9ff', '#00b894', '#2d3436', '#e17055', '#fdcb6e'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        rtl: true,
                        textDirection: 'rtl'
                    }
                }
            }
        });
        
        // Top Items Chart
        const itemsCtx = document.getElementById('top-items-chart').getContext('2d');
        const topItems = Object.entries(stats.itemsBreakdown)
            .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5);
        
        const itemLabels = topItems.map(([, item]) => item.nameAr);
        const itemData = topItems.map(([, item]) => item.totalQuantity);
        
        topItemsChart = new Chart(itemsCtx, {
            type: 'bar',
            data: {
                labels: itemLabels,
                datasets: [{
                    label: 'الكمية',
                    data: itemData,
                    backgroundColor: '#74b9ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function showNoDataMessage() {
        reportPreviewArea.classList.add('hidden');
        noDataMessage.classList.remove('hidden');
        downloadPdfBtn.disabled = true;
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
    downloadPdfBtn.addEventListener('click', generatePDFReport);

    async function generatePDFReport() {
        if (!reportData) {
            alert('يرجى إنشاء معاينة التقرير أولاً');
            return;
        }
        
        showLoading(true, 'جاري إنشاء ملف PDF...');
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Set font for Arabic support (if available)
            doc.setFont('arial', 'normal');
            
            let yPosition = 20;
            
            // Title
            doc.setFontSize(18);
            doc.text('Scout Custody System - Activity Report', 105, yPosition, { align: 'center' });
            yPosition += 15;
            
            doc.setFontSize(14);
            doc.text(`Report Period: ${reportData.period}`, 105, yPosition, { align: 'center' });
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.text(`Generated on: ${formatDateArabic(new Date())}`, 105, yPosition, { align: 'center' });
            yPosition += 20;
            
            // Summary Statistics
            doc.setFontSize(14);
            doc.text('Summary Statistics', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.text(`Total Reservations: ${reportData.stats.totalReservations}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Unique Items: ${reportData.stats.uniqueItemsCount}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Total Quantity: ${reportData.stats.totalQuantity}`, 20, yPosition);
            yPosition += 6;
            doc.text(`Active Users: ${reportData.stats.uniqueUsersCount}`, 20, yPosition);
            yPosition += 15;
            
            // Reservations Table
            if (reportData.reservations.length > 0) {
                doc.autoTable({
                    head: [['ID', 'User', 'Recipient', 'Unit', 'Start Date', 'End Date', 'Status']],
                    body: reportData.reservations.map(reservation => [
                        reservation.id.substring(0, 8),
                        reservation.user_email || 'N/A',
                        reservation.recipient_name || 'N/A',
                        reservation.unit || 'N/A',
                        formatDateArabic(reservation.reservation_start?.toDate() || new Date()),
                        formatDateArabic(reservation.reservation_end?.toDate() || new Date()),
                        getStatusInArabic(reservation.status)
                    ]),
                    startY: yPosition,
                    theme: 'grid',
                    headStyles: { fillColor: [116, 185, 255] },
                    margin: { top: yPosition },
                    styles: { fontSize: 8 }
                });
                
                yPosition = doc.lastAutoTable.finalY + 15;
            }
            
            // Items Breakdown
            if (Object.keys(reportData.stats.itemsBreakdown).length > 0) {
                const sortedItems = Object.entries(reportData.stats.itemsBreakdown)
                    .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity);
                
                doc.autoTable({
                    head: [['Item Name (AR)', 'Item Name (EN)', 'Total Quantity', 'Reservation Count']],
                    body: sortedItems.map(([, item]) => [
                        item.nameAr,
                        item.nameEn,
                        item.totalQuantity.toString(),
                        item.reservationCount.toString()
                    ]),
                    startY: yPosition,
                    theme: 'grid',
                    headStyles: { fillColor: [0, 206, 201] },
                    styles: { fontSize: 8 }
                });
                
                yPosition = doc.lastAutoTable.finalY + 15;
            }
            
            // Users Activity
            if (Object.keys(reportData.stats.usersActivity).length > 0) {
                const sortedUsers = Object.entries(reportData.stats.usersActivity)
                    .sort(([,a], [,b]) => b.reservationCount - a.reservationCount);
                
                doc.autoTable({
                    head: [['Email', 'Full Name', 'Scout Group', 'Reservations', 'Total Quantity']],
                    body: sortedUsers.map(([, user]) => [
                        user.email,
                        user.fullName,
                        user.scoutGroup,
                        user.reservationCount.toString(),
                        user.totalQuantity.toString()
                    ]),
                    startY: yPosition,
                    theme: 'grid',
                    headStyles: { fillColor: [0, 184, 148] },
                    styles: { fontSize: 8 }
                });
            }
            
            // Save the PDF
            const fileName = `Scout_Report_${startDateInput.value}_to_${endDateInput.value}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('حدث خطأ في إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
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