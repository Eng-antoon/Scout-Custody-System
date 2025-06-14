# نظام عهدة الكشافة - Scout Custody System

A comprehensive custody and inventory management system for scout groups in Egypt, built with modern web technologies and Firebase.

## 🎯 Project Overview

The Scout Custody System (نظام عهدة الكشافة) is designed to manage custody items, requests, and administrative tasks for scout organizations. The system provides role-based access control and comprehensive tracking capabilities.

## 🏗️ Architecture

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **UI Framework**: Bootstrap 4.5.2 with RTL support
- **Backend**: Firebase Services
  - Authentication (Email/Password)
  - Firestore Database
  - Cloud Storage
  - Cloud Functions (Future implementation)
- **Language**: Arabic UI with English code comments

## 👥 User Roles & Permissions

### 🔴 Super Admin (`superadmin`)
- **Full system access and control**
- Manage all users and roles
- System configuration and settings
- Access to all administrative functions
- View comprehensive reports and analytics
- Manage organizational structure

### 🟡 Admin (`admin`)
- **Administrative access to custody management**
- Manage custody items and categories
- Approve/reject user requests
- Manage regular users
- Generate reports
- View system analytics
- Cannot modify super admin settings

### 🟢 User (`user`)
- **Standard user access for requests**
- Submit custody requests
- View personal request history
- Update personal profile
- View available items catalog
- Receive notifications about request status

## 📁 Project Structure

```
eng-antoon-3ohda-app/
├── index.html              # Main application entry point
├── script.js               # Core JavaScript functionality
├── styles.css              # Custom styling with RTL support
├── functions/              # Cloud Functions directory
│   └── index.js           # Cloud Functions implementation
└── README.md              # This file
```

## 🗄️ Database Structure

### Firestore Collections

#### `users/{userId}`
```javascript
{
  email: "user@example.com",
  role: "superadmin|admin|user",
  fullName: "اسم المستخدم الكامل",
  phoneNumber: "+201234567890",
  scoutGroup: "فرقة الكشافة",
  created_at: timestamp,
  updated_at: timestamp,
  isActive: true
}
```

#### `roles/{roleId}` (Future implementation)
```javascript
{
  role_name: "superadmin|admin|user",
  permissions: [],
  created_at: timestamp,
  description: "وصف الدور"
}
```

#### `custody_items/{itemId}` (Future implementation)
```javascript
{
  name: "اسم الصنف",
  category: "فئة الصنف",
  description: "وصف مفصل",
  quantity: 100,
  available_quantity: 85,
  unit: "قطعة",
  location: "مكان التخزين",
  responsible_admin: "userId",
  created_at: timestamp,
  updated_at: timestamp,
  isActive: true
}
```

#### `requests/{requestId}` (Future implementation)
```javascript
{
  user_id: "userId",
  items: [
    {
      item_id: "itemId",
      requested_quantity: 5,
      approved_quantity: 3,
      notes: "ملاحظات"
    }
  ],
  status: "pending|approved|rejected|returned",
  request_date: timestamp,
  approved_date: timestamp,
  return_date: timestamp,
  approved_by: "adminUserId",
  notes: "ملاحظات الطلب",
  priority: "low|medium|high"
}
```

## 🚀 Setup Instructions

### Prerequisites
- Modern web browser with JavaScript enabled
- Firebase project with enabled services
- Internet connection for CDN resources

### Firebase Configuration

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project: "scout-custody-system"

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider

3. **Setup Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see Security Rules section)

4. **Create Test Users**
   - Go to Authentication → Users
   - Add test users for each role

5. **Setup Firestore Data**
   ```javascript
   // Create in Firestore Console
   Collection: users
   Document ID: [User UID from Authentication]
   Data: {
     email: "admin@scout.com",
     role: "superadmin",
     fullName: "مدير النظام",
     created_at: [current timestamp]
   }
   ```

### Local Setup

1. **Clone/Download Project**
   ```bash
   # If using git
   git clone [repository-url]
   cd scout-custody-system/eng-antoon-3ohda-app
   
   # Or extract downloaded files
   ```

2. **Configure Firebase**
   - Update `script.js` with your Firebase configuration
   - Current config is set for the provided project

3. **Serve Files**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if http-server is installed)
   npx http-server
   
   # Or open index.html directly in browser
   ```

4. **Access Application**
   - Open browser to `http://localhost:8000`
   - Or open `index.html` directly

## 🔐 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all users
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Other collections (to be implemented)
    match /{document=**} {
      allow read, write: if false; // Deny all by default
    }
  }
}
```

## 🧪 Testing

### Test Accounts Setup

Create these test accounts in Firebase Authentication and corresponding Firestore documents:

1. **Super Admin**
   - Email: `superadmin@scout.com`
   - Password: `SuperAdmin123!`
   - Firestore document: `{ role: "superadmin", fullName: "مدير عام النظام" }`

2. **Admin**
   - Email: `admin@scout.com`
   - Password: `Admin123!`
   - Firestore document: `{ role: "admin", fullName: "مدير العهدة" }`

3. **User**
   - Email: `user@scout.com`
   - Password: `User123!`
   - Firestore document: `{ role: "user", fullName: "كشاف مستخدم" }`

### Testing Checklist

- [ ] Login with different role accounts
- [ ] Verify correct section display based on role
- [ ] Test logout functionality
- [ ] Verify toast notifications work
- [ ] Test responsive design on mobile
- [ ] Check Arabic text display and RTL layout

## 🔄 Development Iterations

### ✅ Iteration 1: Basic Setup & Authentication
- [x] Project structure setup
- [x] Firebase integration
- [x] User authentication
- [x] Role-based section display
- [x] Toast notifications
- [x] RTL Arabic interface

### 🚧 Future Iterations (Planned)
- **Iteration 2**: Admin user management
- **Iteration 3**: Custody items management
- **Iteration 4**: Request system
- **Iteration 5**: Reports and analytics
- **Iteration 6**: Cloud Functions integration

## 🎨 UI/UX Features

- **RTL Support**: Full right-to-left layout for Arabic
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Bootstrap**: Clean, professional interface
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Visual feedback during operations
- **Error Handling**: Comprehensive error messages in Arabic

## 🔧 Technical Details

### Dependencies
- Bootstrap 4.5.2
- jQuery 3.5.1
- Popper.js 1.16.1
- Firebase SDK 9.0.0 (compat)

### Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Performance Considerations
- CDN resources for fast loading
- Minimal custom CSS and JavaScript
- Lazy loading planned for future iterations

## 📞 Support & Contact

For technical issues or questions:
- Review this README thoroughly
- Check browser console for errors
- Verify Firebase configuration
- Ensure proper Firestore security rules

## 📄 License

This project is developed for scout organizations in Egypt. Please respect the intended use case and maintain the Arabic language support for the target audience.

---

**نظام عهدة الكشافة - Scout Custody System**  
*Built with ❤️ for the scout community in Egypt*

## Features Implemented

### Iteration 1: Authentication & Basic Structure ✅
- User authentication with email/password
- Role-based access control (admin/user)
- Admin and user section placeholders
- Toast notification system
- RTL support for Arabic interface

### Iteration 2: Admin - Product Management (CRUD) ✅
- **Add Products**: Admins can add new products with English/Arabic names, stock count, and images
- **View Products**: Real-time product listing with images in a responsive table
- **Edit Products**: Modal-based editing of product details with optional image update
- **Delete Products**: Confirmation-based product deletion
- **Image Storage**: Cloudinary integration for product images (Cloud Name: dsgrl4zf8, Preset: "Scout Custody System")
- **Real-time Updates**: Live synchronization using Firestore snapshots
- **Image Validation**: File type and size validation (max 5MB, JPG/PNG/GIF/WebP)

## Product Management Features

### Add Product Form
- **Name (EN)**: English name of the product
- **Name (AR)**: Arabic name of the product  
- **Stock Count**: Number of items in custody (minimum 0)
- **Image**: Product image (required, supports common image formats)

### Products Table
- Displays all products in chronological order (newest first)
- Shows product image, names in both languages, and stock count
- Action buttons for editing and deleting each product
- Responsive design for mobile devices

### Edit Product Modal
- Pre-populated form with existing product data
- Optional image update (leave empty to keep current image)
- Real-time validation
- Smooth modal interactions with ESC key and click-outside-to-close

### Firebase Integration
- **Firestore Collection**: `products/{productId}`
- **Image Storage**: Cloudinary (Cloud Name: dsgrl4zf8, Preset: "Scout Custody System")
- **Document Structure**:
  ```javascript
  {
    name_en: "Product Name",
    name_ar: "اسم المنتج", 
    stock_count: 10,
    image_url: "https://res.cloudinary.com/dsgrl4zf8/...",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  }
  ```

## Technical Implementation

### Files Modified
- `index.html`: Added product management UI components
- `styles.css`: Enhanced modal styling and product image display
- `script.js`: Implemented complete CRUD operations with Firebase

### Key Functions
- `loadAdminProducts()`: Real-time product loading
- `uploadImageToCloudinary()`: Cloudinary image upload handling
- `validateImageFile()`: Image file validation (type and size)
- `openEditProductModal()`: Modal management
- `deleteProduct()`: Confirmation-based deletion

## Next Iterations (Planned)
- User product request system
- Admin request management
- Request approval workflow
- Inventory tracking
- Reporting dashboard

## Setup Instructions

1. Ensure Firebase project is configured with:
   - Authentication enabled
   - Firestore database created
   - Storage bucket configured
   - Security rules properly set

2. User documents in Firestore should follow this structure:
   ```
   users/{userUID}: {
     email: "user@example.com",
     role: "admin" | "superadmin" | "user",
     name: "User Name"
   }
   ```

3. Open `index.html` in a web browser
4. Login with admin credentials to access product management

## Browser Support
- Modern browsers with ES6+ support
- Firefox, Chrome, Safari, Edge
- Mobile responsive design

## Security Notes
- Firebase Security Rules should restrict access based on user roles
- File uploads are limited to image types only
- Input validation on both client and server side recommended 