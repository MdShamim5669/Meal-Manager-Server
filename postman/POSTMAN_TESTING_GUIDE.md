# 🚀 Complete Postman API Testing Guide & Workflow

This document provides a step-by-step guide to testing all **Meal Manager Backend APIs** using Postman.

---

## 🛠️ Postman Environment Setup

1. **Import Files in Postman**:
   - Collection: `postman/collections/Meal-Manager.postman_collection.json`
   - Environments: 
     - `postman/environments/Local.postman_environment.json` (Local testing: `http://localhost:5000`)
     - `postman/environments/Production.postman_environment.json` (Live Render server: `https://meal-manager-server.onrender.com`)
2. **Select Environment**:
   - In the top right corner of Postman, select **`Local Environment`** (for local development) or **`Production Environment (Render)`** (for deployed production backend).
3. **Environment Variables**:
   - `baseUrl` = `http://localhost:5000` (Local) or `https://meal-manager-server.onrender.com` (Production)
   - `authToken` = *(automatically set upon login)*

---

## 📋 Recommended Testing Order

---

### 1. 🔑 Step 1: Login as Super Admin

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "memberId": "77467e3b-7ad6-42c9-9812-f9ed718adc08",
  "pin": "1234"
}
```
> **Tip**: The test script automatically saves the returned JWT token to your Postman `authToken` variable!

---

### 2. 👤 Step 2: Get Current User Profile (`/me`)

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/auth/me`
- **Auth**: `Bearer {{authToken}}`
- **Expected Response**: Returns Super Admin profile (`Md Samim`, `SUPER_ADMIN`).

---

### 3. 👥 Step 3: Create New Members

#### Create Member 1 (Manager)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/members`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "name": "Mess Manager Rahim",
  "email": "rahim@example.com",
  "phone": "01711112222",
  "pin": "1234",
  "role": "MANAGER"
}
```
*(Copy the returned member `id` for testing)*

#### Create Member 2 (Regular Member)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/members`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "name": "Member Karim",
  "email": "karim@example.com",
  "phone": "01822223333",
  "pin": "1234",
  "role": "MEMBER"
}
```

---

### 4. 📄 Step 4: Get All Members List

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/members`
- **Auth**: `Bearer {{authToken}}`
- **Query Params**:
  - `search` = *(optional)*
  - `role` = `MEMBER` *(optional)*
  - `active` = `true` *(optional)*

---

### 5. 🗓️ Step 5: Get Active Period Dashboard & Auto-Set `periodId`

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/period/dashboard`
- **Auth**: `Bearer {{authToken}}`
> **Tip**: This returns active period details and automatically populates `periodId` in your Postman environment!

---

### 6. 💳 Step 6: Add Money Deposit for a Member

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/deposits`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "memberId": "77467e3b-7ad6-42c9-9812-f9ed718adc08",
  "amount": 3000,
  "date": "2026-08-06"
}
```

---

### 7. 🍱 Step 7: Upsert (Add/Update) Meal Entries

- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/v1/meals/77467e3b-7ad6-42c9-9812-f9ed718adc08/2026-08-06`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "mealCount": 2.5
}
```

---

### 8. 💰 Step 8: Add Mess Bazaar Expense

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/expenses`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "category": "MARKET",
  "amount": 1850,
  "description": "Chicken, Rice, and Vegetables bazaar",
  "date": "2026-08-06",
  "paidBy": "77467e3b-7ad6-42c9-9812-f9ed718adc08"
}
```

---

### 9. 📅 Step 9: Assign Duty Roster

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/roster`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "memberId": "77467e3b-7ad6-42c9-9812-f9ed718adc08",
  "date": "2026-08-07",
  "periodId": "{{periodId}}"
}
```

---

### 10. 📊 Step 10: View Role-Based Dashboards

#### Super Admin Dashboard
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/dashboard/super-admin`
- **Auth**: `Bearer {{authToken}}`

#### Manager Dashboard
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/dashboard/manager`
- **Auth**: `Bearer {{authToken}}`

#### Member Dashboard
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/v1/dashboard/member`
- **Auth**: `Bearer {{authToken}}`

---

### 11. 🔒 Step 11: Change PIN

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/auth/change-pin`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "oldPin": "1234",
  "newPin": "5678"
}
```

---

### 12. 🏁 Step 12: Close Active Period & Start Next Month

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/v1/period/close`
- **Auth**: `Bearer {{authToken}}`
- **Body** (JSON):
```json
{
  "periodId": "{{periodId}}",
  "nextPeriodLabel": "September 2026"
}
```
