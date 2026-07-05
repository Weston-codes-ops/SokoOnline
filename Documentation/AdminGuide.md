# SokoOnline Admin Guide

## Project Structure Overview

### Backend Admin Structure

The backend admin components are currently organized as follows:

```
Backend/src/main/java/com/westoncodesops/sokoonline/
├── controllers/
│   └── AdminUserController.java          (Admin user management: role/status changes)
├── dtos/
│   └── requests/
│       └── AdminRegisterRequest.java     (DTO for initial admin setup)
├── entities/
│   └── AdminAuditLog.java                (Entity for audit logging)
├── repositories/
│   └── AdminAuditLogRepository.java      (JPA repository for audit logs)
└── services/
    └── AdminUserService/
        └── AdminUserService.java         (Business logic for admin user management)
```

### Frontend Admin Structure

The frontend admin pages are organized under `src/pages/admin/`, with dedicated layout components:

```
Frontend/src/
├── components/
│   ├── AdminSidebar.jsx                 (Admin navigation sidebar)
│   └── AdminLayout.jsx                  (Layout wrapper for admin pages)
├── pages/admin/
│   ├── AdminSetupPage.jsx               (Initial admin creation: one-time use)
│   ├── AdminDashboard.jsx               (Admin landing page: stats & overview)
│   ├── AdminProductsPage.jsx            (Product management: create/edit/delete)
│   ├── AdminCategoriesPage.jsx          (Category/subcategory management)
│   ├── AdminOrdersPage.jsx              (Order management and status updates)
│   └── AdminPromotionsPage.jsx          (Promotions management)
└── utils/adminDomain.js                 (Utilities for admin subdomain checking)
```

## Admin Security Architecture

### 1. Access Control
- **Role-based access control**: Only users with `Role.ADMIN` can access admin endpoints
- **JWT token authentication**: Every admin request must carry a valid JWT with role ADMIN
- **Subdomain separation (optional but recommended)**: Configure VITE_ADMIN_HOST/VITE_ADMIN_SUBDOMAIN to use a dedicated admin host

### 2. Backend Security Rules (from SecurityConfig.java)
- `/api/users/admin` is public only for initial setup
- All product/category/order write operations are restricted to ADMIN

### 3. Initial Admin Setup Flow
1. Configure `app.admin.create-secret` property in `application.properties` (backend)
2. Visit `/admin-setup` on frontend
3. Enter the secret and admin credentials to create the first admin
4. Once created, log in via `/login`

## Frontend Admin Access

The admin area is accessible via hidden routes (not linked from main storefront navigation) or via dedicated admin subdomain/host:
- **Admin Dashboard**: Local development: `/hidden-admin/dashboard`
- **Admin Pages**: `/hidden-admin/products` → `/hidden-admin/categories` → `/hidden-admin/orders` → `/hidden-admin/promotions`
- Production (if configured): `https://admin.yourdomain.com/hidden-admin/dashboard`

All admin pages use a consistent layout with a sidebar for navigation.

## Next Steps (Recommended)

1. **Organize backend admin components into dedicated `admin/` directories** in each layer (controllers, dtos, entities, repositories, services)
2. **Create dedicated admin controllers** for products/categories/orders/promotions under `controllers/admin/` to separate public and admin endpoints clearly
3. **Implement IP allowlist** for admin endpoints in production
4. **Add MFA (Multi-Factor Authentication)** for admin users
5. **Enhance audit logging** to track all admin actions
6. **Add AdminSession entity** to track active admin sessions
