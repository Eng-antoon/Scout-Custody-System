# Email Notification Setup Instructions

This system now includes automatic email notifications when a reservation is created. The email will be sent to `antoonkamel20000@outlook.com` automatically.

## Setup Required

To enable email notifications, you need to set up EmailJS (a free email service):

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions to connect your email account
5. Note down your **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. **IMPORTANT**: Configure the template as follows:

**To Email Field:** (This is crucial!)
```
{{to_email}}
```
**DO NOT** put your Gmail address here. Use the variable `{{to_email}}` so EmailJS will send to the address specified in the code.

**Subject:** 
```
طلب حجز جديد - {{reservation_id}}
```

**Body:**
```
مرحباً،

تم إنشاء طلب حجز جديد في نظام عهدة الكشافة:

رقم الطلب: {{reservation_id}}
البريد الإلكتروني للمستخدم: {{user_email}}
اسم المستلم: {{recipient_name}}
رقم موبايل المستلم: {{recipient_mobile}}
الوحدة: {{unit}}
تاريخ البداية: {{start_date}}
تاريخ الانتهاء: {{end_date}}

العهد المطلوبة:
{{items_list}}

إجمالي العهد: {{total_items}} قطعة

يرجى مراجعة الطلب في النظام.

تحياتي،
نظام عهدة الكشافة
```

4. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

**CRITICAL**: Make sure the "To Email" field in your EmailJS template is set to `{{to_email}}` and NOT your personal email address. This is why emails are going to your Gmail instead of the target recipient.

### Step 4: Get Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (e.g., `abcdefghijklmnop`)
3. **IMPORTANT**: Use the PUBLIC KEY, NOT the secret key. The public key is safe to use in frontend code.

### Step 5: Update Configuration
Open `script.js` file and replace these placeholders:

1. **Line ~13**: Replace `YOUR_EMAILJS_PUBLIC_KEY` with your actual **PUBLIC KEY**
2. **Line ~44**: Replace `YOUR_SERVICE_ID` with your service ID  
3. **Line ~45**: Replace `YOUR_TEMPLATE_ID` with your template ID

**IMPORTANT**: You need the **PUBLIC KEY** from EmailJS, not the secret key. The public key is designed to be used in frontend applications and is safe to include in your JavaScript code.

Example:
```javascript
// Replace this line:
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
// With:
emailjs.init("abcdefghijklmnop");

// Replace these lines:
const response = await emailjs.send(
    'YOUR_SERVICE_ID',    // Replace with your EmailJS service ID
    'YOUR_TEMPLATE_ID',   // Replace with your EmailJS template ID
    templateParams
);
// With:
const response = await emailjs.send(
    'service_abc123',     // Your actual service ID
    'template_xyz789',    // Your actual template ID
    templateParams
);
```

## Testing
1. After updating the configuration, create a test reservation
2. Check if the email is sent to `antoonkamel20000@outlook.com`
3. If there are any issues, check the browser console for error messages

## Free Tier Limits
EmailJS free tier includes:
- 200 emails per month
- Basic email templates
- Standard support

This should be sufficient for most reservation systems. If you need more emails, you can upgrade to a paid plan.

## Troubleshooting
- Make sure all three values (Public Key, Service ID, Template ID) are correctly replaced
- Check that your email service is properly connected in EmailJS dashboard
- Verify the template variables match exactly (case-sensitive)
- Check browser console for any JavaScript errors 