# Kalpra Marketing CRM & Employee Work Management System

A production-grade, full-stack **Marketing CRM and Employee Work Management System** built with React, Vite, Tailwind CSS, Node.js, Express, Prisma ORM, and PostgreSQL.

---

## 🌟 Key Modules & Capabilities

1. **Role-Based Dashboards & Access Control**:
   - **CEO (`ceo@kalpracrm.com`)**: Complete organization command center, revenue metrics (total, monthly, targets), employee productivity comparisons (Shivani vs Uday), lead conversion rates, overdue follow-up alerts, activity stream.
   - **ADMIN - Srija Mam (`admin.srija@kalpracrm.com`)**: Client acquisition, lead generation, allocation to Shivani or Uday, tracking employee contact status.
   - **MANAGER (`manager@kalpracrm.com`)**: Team workload overview, task assignment, task review & approval/rejection with remarks, unassigned leads monitoring, field check-in monitoring.
   - **SALES & MARKETING EMPLOYEES (Shivani Reddy & Uday Kiran)**: Individual dashboards, assigned leads, interaction logging (calls, meetings, notes), task progress updates, completion evidence submission with file attachments, field check-ins.

2. **Client Management**:
   - Client registration with unique Client ID generation (`CLT-XXXX`).
   - Real-time duplicate detection warning (checks phone, email, and organization).
   - Detailed Client Profile with associated leads, contacts, deals, tasks, and field visit photos.

3. **Lead Management**:
   - Comprehensive lead pipeline, priority, requirements, and deal values.
   - Lead allocation & reassignment with audit history in `lead_assignments`.
   - Status updates requiring mandatory reason for `Lost` or `On Hold`.

4. **Visual Kanban Sales Pipeline**:
   - 10 distinct sales stages: `New Lead`, `Assigned`, `Contacted`, `Interested`, `Demo Scheduled`, `Proposal Sent`, `Negotiation`, `Won`, `Lost`, `On Hold`.
   - Interactive stage mover dropdown with audit logging.
   - Celebratory confetti animation on deal closure (`Won`) and automatic revenue deal generation.

5. **Task Management**:
   - Manager task assignments with deadlines, priority, and client association.
   - Employee work completion submission with evidence text and file attachment upload.
   - Manager approval / rework rejection workflow with remarks.

6. **Follow-up Management**:
   - List and Calendar view.
   - Today's, upcoming, and overdue follow-up filters.
   - Call outcome recording, client response, discussion notes, and optional automated next follow-up scheduling.

7. **Employee Performance Analytics**:
   - Measurable KPI scorecards (contacted leads, conversion rate, tasks done, follow-ups missed/completed, revenue generated, meetings conducted).
   - Side-by-side comparative bar charts (Shivani Reddy vs Uday Kiran).
   - Configurable date range filters (7d, 30d, 90d, All time).

8. **Field Employee Visit Tracking & Photo Verification**:
   - Employee on-site check-in with current site photo upload, GPS coordinates (browser geolocation API), address, and visit notes.
   - Manager & CEO photo gallery stream of verified client visits.

9. **Reports & Exports**:
   - Real-time report generator for Lead Conversion, Daily Work, Employee Productivity, Realized Revenue, and Lost Leads.
   - Export to CSV / Excel and printable / PDF-friendly layout.

10. **In-App Notification Center**:
    - Notifications for lead assignments, task deadlines, task review submissions, manager approvals/rejections, and follow-up reminders.

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express.js, TypeScript, Multer, Bcrypt, JWT.
- **Database**: PostgreSQL 18.6 with Prisma ORM 5.22.
- **Validation**: Zod schema validation.

---

## 🔑 Demo User Credentials (Password: `password123`)

| Role | Name | Email | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **CEO** | Rajesh Varma | `ceo@kalpracrm.com` | Org-wide monitoring, revenue analytics, executive reports |
| **ADMIN** | Srija Mam | `admin.srija@kalpracrm.com` | Client acquisition, lead generation, employee allocation |
| **MANAGER** | Arvind Kumar | `manager@kalpracrm.com` | Task assignment, evidence approval/rejection, field tracking |
| **EMPLOYEE** | Shivani Reddy | `shivani@kalpracrm.com` | Sales Executive, calls, follow-ups, task evidence, field check-ins |
| **EMPLOYEE** | Uday Kiran | `uday@kalpracrm.com` | Senior Sales Specialist, proposals, pipeline management |

*Note: The application includes a **1-Click Quick Demo Sign In** on the login page and a **Role Switcher** in the top navigation bar to test and evaluate all roles seamlessly!*

---

## 🏃 Running the Application

### 1. Backend Server & PostgreSQL Database
```bash
cd backend
npm run dev
```
- API running on: `http://localhost:5000`
- PostgreSQL 18 active on port: `5433`

### 2. Frontend Application
```bash
cd frontend
npm run dev
```
- Web Application running on: `http://localhost:5173`

