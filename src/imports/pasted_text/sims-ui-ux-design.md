Figma prompt:

Design a **complete enterprise-level web application UI/UX** for a system called:

**“Smart Inventory Management System (SIMS)”**

This system is designed for **small and medium-sized businesses (SMEs), retail stores, warehouses, and distribution companies**. It must support **multi-warehouse inventory tracking, real-time updates, and strict role-based access control (Admin, Manager, Inventory Staff)** 

---

## PRODUCT INTENT

Build a system that:

* Replaces Excel/manual inventory tracking
* Eliminates stock inaccuracies, delays, and missing data
* Centralizes all inventory operations
* Scales from small to growing companies
* Provides real-time visibility and reporting

---

## CORE FEATURES (MUST BE REPRESENTED IN UI)

* Real-time product tracking across warehouses
* Full stock movement logging (issue, receive, transfer, adjust)
* Low-stock alerts and notifications
* Detailed report generation with export
* Role-based permissions and activity monitoring

---

## USER ROLES (STRICT VISUAL + FUNCTIONAL DIFFERENTIATION)

### Admin

* Full access
* Manage users (create, delete, update)
* Assign roles and permissions
* View activity logs
* Perform all stock operations
* Generate/export reports

### Manager

* Same as Admin EXCEPT:
* Cannot manage users or permissions

### Inventory Staff

* Limited:
* View stock
* Search items
* Update item location ONLY

---

## SYSTEM-WIDE RULES (REFLECT IN UI BEHAVIOR)

* Role-based access enforced everywhere
* Every action logs activity automatically
* Multi-warehouse context switching (<1s)
* Real-time updates without reload
* Input validation (no invalid entries)
* Secure flows (passwords, sessions, etc.)

---

## INFORMATION ARCHITECTURE

### Sidebar Navigation

* Dashboard
* Inventory
* Stock Actions
* Reports
* User Management (Admin only)
* Activity Logs (Admin only)
* Settings

### Top Bar

* Global search
* Notifications (low stock alerts)
* Warehouse switcher
* User profile

---

## FULL SCREEN SETS (ALL MUST BE DESIGNED)

### 1. DASHBOARD

* KPI cards:

  * Total items
  * Low stock items
  * Warehouses count
  * Recent transactions
* Charts:

  * Stock movement trends
* Activity feed (latest actions)

---

### 2. INVENTORY (VIEW STOCK)

* Table:

  * Product ID
  * Name
  * Quantity
  * Warehouse
  * Location (aisle/shelf)
* Features:

  * Search (keyword, ID, category)
  * Filters
  * Pagination / lazy loading
* Empty state: “No inventory available”
* Error state: database timeout

---

### 3. SEARCH FUNCTION (SUB-FLOW)

* Live filtering as user types
* No-result state with guidance
* Sanitized input (ignore invalid characters)

---

### 4. ISSUE STOCK

Flow:

* Select product
* Enter quantity
* System validates availability
* Confirm → update inventory
* Success message

Edge:

* Insufficient stock → show max available

---

### 5. RECEIVE STOCK

Flow:

* Input/scan product ID
* Enter quantity
* Select warehouse/location
* Confirm → update inventory

Edge:

* Product not found → redirect to create
* Warehouse full → reject

---

### 6. TRANSFER STOCK

Flow:

* Select product
* Source location
* Destination location
* Quantity
* Confirm → update both locations

Edge:

* Insufficient source stock
* Destination capacity exceeded

---

### 7. ADJUST STOCK

Flow:

* Input product
* Enter new quantity
* Select reason (dropdown: damaged, lost, audit)
* Confirm overwrite

Edge:

* Negative values rejected
* System crash → no partial update

---

### 8. UPDATE ITEM LOCATION

Flow:

* Select product
* Show current location
* Input new location (warehouse, aisle, shelf)
* Save

Edge:

* Location occupied → reject

---

### 9. REPORTS

* Select:

  * Report type (inventory, movement, low stock)
  * Date range
* Generate report
* Display:

  * Table or chart
* Export:

  * PDF
  * CSV/Excel

Edge:

* No data → show message
* Large query → request smaller range

---

### 10. ACTIVITY LOGS (ADMIN)

* Table:

  * User
  * Action
  * Timestamp
* Filters:

  * User
  * Date
  * Action type
* Export capability

---

### 11. USER MANAGEMENT (ADMIN)

#### Create Account

* Fields:

  * Name
  * Email
  * Username
  * Password
  * Role dropdown
* Validation:

  * Unique email/username
  * Strong password

#### Delete Account

* Confirmation dialog
* Prevent deleting last Admin

#### Manage Permissions

* Change roles via dropdown
* Optional granular permissions toggle
* Prevent self-demotion

---

## SYSTEM BEHAVIOR FLOWS (REFLECT IN UX)

* Every stock action triggers background logging
* Logs must be immutable (cannot edit)
* All actions give:

  * success
  * warning
  * error feedback
* Sessions auto-expire after inactivity

---

## NON-FUNCTIONAL DESIGN CONSTRAINTS

### PERFORMANCE

* Actions ≤2 seconds
* Search ≤2 seconds on large datasets
* Reports:

  * standard ≤5s
  * complex ≤30s

### SCALABILITY

* ≥2000 items per warehouse
* ≥10,000 items searchable

### RELIABILITY

* Auto-recovery from failures
* Daily backups
* ≥99.5% uptime

### SECURITY

* TLS encryption
* Password hashing (bcrypt/Argon2)
* Role validation on every request

### USABILITY

* New user completes core tasks in ≤10 minutes
* Clear flows, minimal learning curve

---

## DESIGN SYSTEM

* Clean enterprise UI (ERP-like)
* Consistent spacing, margins, alignment
* Responsive grid layout
* Data-heavy components (tables, filters)
* Minimal visual noise
* Strong hierarchy (cards, tables, modals)

---

## INTERACTION PRINCIPLES

* No full page reloads
* Smooth transitions between warehouses
* Dropdowns instead of free text where possible
* Confirmation dialogs for critical actions
* Real-time UI updates

---

## FINAL EXPECTATION

Produce:

* Full high-fidelity prototype
* All screens mapped to use cases
* Consistent design system
* Complete flows for every feature
* Visually clean, efficient, and operational

No missing flows. No placeholder logic. Full system coverage.
