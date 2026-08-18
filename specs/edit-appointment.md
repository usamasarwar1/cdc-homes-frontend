# Feature Spec: Admin Appointment Editing & Appointment History
 
## 1. Overview
 
Admins need the ability to view and edit property appointments from a central table, and every edit must notify the affected user. Users need a way to see the full history of their appointments (past and current) on their property details page.
 
This spec covers two routes:
 
- **`/property-confirm`** — Admin appointment management (list + edit)
- **`/admin/property-details/:propertyId`** — Appointment history view (e.g. `/admin/property-details/31L6Tiiy4g43Y6OomjnF`)
## 2. Goals
 
- Admin can see all appointments in one table.
- Admin can open an appointment ("View") and edit it — repeatedly, not just once.
- Every time an appointment is edited, the associated user is notified.
- Users (or admins viewing on their behalf) can see a full appointment history — previous and current — under the property summary.
- payment would not be affect only the date or time will be able to change 
- check the availablity first if a date with any appointment already exist then don't create another on same time and date and also check the block dates you get teh reference in clender.tsx and  / admin/block which collection has been in use