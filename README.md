# School Furniture Planning System
**Department of Education – Legazpi City Division**

A web-based planning tool for tracking and managing school chair and furniture needs across Legazpi City schools. Built with plain HTML/CSS/JavaScript and powered by Supabase for real-time data storage.

---

## Features

### Dashboard
- KPI cards showing total schools, primary/secondary chair capacity, and total remaining gap
- Priority bar chart — top schools ranked by remaining chair gap
- Quick interpretation panel with automated insights

### Data Entry & Parameters *(Admin only)*
- Select any school from the list and edit its planning inputs
- Fields include room counts per grade level, student load (AM/PM), existing and planned chairs, and admin remarks
- Per-school parameter overrides for room dimensions and chairs per room
- Changes are saved automatically to Supabase on field blur

### Reports *(Admin and User)*
- Full computed report table with capacities, demand, gaps, and priority per school
- **Search bar** — filter by school name or ID
- **Funding year filter** — view only schools for a specific year (e.g. 2026, 2027)
- **Click any school name** to open a detailed breakdown modal
- **Export CSV** — downloads the current filtered view as a spreadsheet

### Forecast *(Admin only)*
- What-if analysis tool — adjust a load increase percentage (0–25%)
- Projects future primary and secondary demand
- Shows which school will have the highest projected gap

### Admin Panel *(Admin only)*
- **User Management** — create, view, and delete user accounts
- **Change Password** — update any account's password
- **Audit Log** — full history of who changed what and when, filterable by user

---

## User Roles

| Feature | Admin | User |
|---|---|---|
| View Dashboard | ✅ | ✅ |
| View Reports | ✅ | ✅ |
| Search & filter reports | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Click school detail | ✅ | ✅ |
| Edit school data | ✅ | ❌ |
| Data Entry & Parameters page | ✅ | ❌ |
| Forecast page | ✅ | ❌ |
| Admin panel | ✅ | ❌ |

---

## How to Use

### Logging In
1. Open the site and you will be redirected to the **Login** page
2. Enter your **username** (e.g. `admin1`, `user1`) and **password**
3. Click **Sign in**
4. Admins are taken to the Dashboard with full access
5. Users are taken to the Dashboard in view-only mode

### Typical Admin Workflow
1. **Log in** as admin
2. Go to **Data Entry & Parameters**
3. Select a school from the left panel
4. Fill in room counts, student numbers, existing and planned chairs
5. Click away from each field — data saves automatically
6. Go to **Reports** to see computed gaps and priorities
7. Use the **funding year filter** to focus on a specific year
8. Click a school name to see its full detail breakdown
9. Click **Export CSV** to download the report for submission

### Typical User Workflow
1. **Log in** as user
2. View the **Dashboard** for a summary of chair gaps and priorities
3. Go to **Reports** to search or filter schools
4. Click any school name to see its full breakdown
5. Export CSV if needed

### Creating a New Account *(Admin)*
1. Go to **Admin** in the navigation
2. Under **User Management**, enter a username, password, and role
3. Click **+ Create Account**
4. The account is immediately active

### Changing a Password *(Admin)*
1. Go to **Admin → Change Password**
2. Select the username from the dropdown
3. Enter and confirm the new password
4. Click **Update Password**

---

## Pages

| File | Description |
|---|---|
| `login.html` | Login page — entry point for all users |
| `index.html` | Dashboard — KPIs, priority chart, insights |
| `data-entry.html` | Data Entry & Parameters — admin only |
| `reports.html` | Reports — viewable by all, exportable |
| `forecast.html` | Forecast / What-if analysis — admin only |
| `admin.html` | Admin panel — user management and audit log |

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Hosting | GitHub Pages / Netlify |

### Database Tables

| Table | Purpose |
|---|---|
| `chair_planning` | All school planning data (rooms, students, chairs) |
| `app_parameters` | Global and per-school room parameter settings |
| `profiles` | User accounts and roles |
| `audit_log` | Activity history for all admin actions |

---

## Setup

### Prerequisites
- A Supabase project with the tables above created
- The site served over HTTP (not `file://`) — use Live Server, Netlify, or GitHub Pages

### Running Locally
1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `login.html` → **Open with Live Server**
4. The site opens at `http://127.0.0.1:5500`

### Creating the First Admin Account
1. Go to your Supabase project → **Authentication → Users → Add user**
2. Email: `admin1@deped.local`, set a password, check **Auto Confirm**
3. Copy the UUID shown next to the user
4. Run in Supabase SQL Editor:
```sql
INSERT INTO profiles (id, username, role)
VALUES ('paste-uuid-here', 'admin1', 'admin');
```
5. Log in at the site with username `admin1`

---

## Notes
- Usernames are stored internally as `username@deped.local` in Supabase Auth — users only ever type their username, never the email
- Data saves automatically when you click away from a field (on blur)
- The funding year filter and search bar are available to all users on the Reports page
- The audit log records all school saves, deletions, user creations, password changes, and bulk operations
