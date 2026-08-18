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

## 3. Implementation Notes

Actual admin listing route is `/admin/property-confirm` (`src/page/Property-confirmation.jsx`), not `/property-confirm`. Detail route matches the spec: `/admin/property-details/:bookingId` (`src/page/Property-details.jsx`).

### New shared logic
- **`src/lib/appointmentAvailability.js`** — availability rules extracted to match `Calendar.jsx` exactly (weekday 8:00 AM–5:00 PM / Saturday 7:30 AM–2:00 PM slots, 3-hour booking-conflict window, weekend rejection):
  - `fetchAvailabilityData(db, { excludeBookingId })` — reads live conflicts from `inspectionDates` (existing appointments) and admin blocks from `blockDates` (same collection `/admin/block` writes to — both one-off date/time ranges via `startRaw`/`endRaw` and recurring weekday rules via `weekday`/`startTime`/`endTime`). `excludeBookingId` omits the appointment being edited from its own conflict check.
  - `isTimeSlotBlocked`, `isWithinBlockedRange`, `isWithinBlockedWeekday`, `calculateBlockedSlots`, `getTimeSlots`, `isWeekendDate`, `normalizeDateKey`, `convertTimeTo24Hour`, `parseInceptionDate` — pure helpers, verified against a real `blockDates` range case (e.g. "Mon Aug 24 10:25 PM – Fri Aug 28 10:30 AM" correctly blocks every slot Aug 25–27 and Aug 28 up to 10:30 AM).

### Admin appointment table (`Property-confirmation.jsx`)
- Each row now has both **View** and a new **Edit** button.
- Edit navigates to `/admin/property-details/{bookingId}?edit=true`.

### Appointment detail page (`Property-details.jsx`)
- **Edit Appointment dialog** (date + time only — payment/property/contact fields are untouched):
  - Opened via the "Edit" button on the Appointment Details card, or automatically when landing with `?edit=true` in the URL (from the table's Edit button) — auto-scrolls to the Appointment Details card and opens the dialog once per page load.
  - Loads live availability on open (`fetchAvailabilityData`, excluding the booking's own current slot).
  - Time dropdown disables any slot that collides with another appointment or an admin block; weekend dates are rejected.
  - If every slot for the selected date is blocked/booked, shows an explicit "This date is fully blocked or booked... choose another date" message and disables the time picker + Save button (native `<input type="date">` can't gray out individual days, so this message is the fallback signal).
  - Re-validates availability again at save time before writing.
- **On save**:
  - Updates `bookings/{id}`: `date`, `time`, `formattedDateTime`, `updatedAt`.
  - Appends the previous date/time to a new `bookings/{id}.history` array (`arrayUnion`) with `changedAt` and `changedBy` (admin email).
  - Syncs the matching `inspectionDates` doc(s) (`where bookingId == id`) to the new `inceptionDate`, or creates one if missing, so the public booking calendar's blocked-slot calculation stays correct.
  - Calls the new `appointmentUpdated` Cloud Function to email the user (best-effort, non-blocking).
- **Appointment History card**: lists `booking.history` entries (previous date/time + when/who changed it), newest first.

### Notification
- **`functions/index.js`** — new `exports.appointmentUpdated` SendGrid endpoint (same CORS/SendGrid pattern as `rejectPropertyVerification`/`additionalAcknowledgementReport`), takes `{ email, name, propertyAddress, previousDateTime, newDateTime }` and emails the user that their inspection was rescheduled.

### Known pre-existing item (not part of this change, flagged for awareness)
- `firestore.rules` currently reads `allow read, write: if request.time < timestamp.date(2026, 2, 11)` — that cutoff date is in the past relative to project "today" (2026-08-18). Worth confirming what rules are actually deployed in the Firebase console, since a stale local file would deny all Firestore access if it matches production.