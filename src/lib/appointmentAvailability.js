import { collection, getDocs } from "firebase/firestore";
import { format, isSaturday } from "date-fns";

/**
 * Shared appointment-availability helpers.
 *
 * Mirrors the slot/blocking rules used on the public booking calendar
 * (src/page/Calendar.jsx) and the admin block-dates manager
 * (src/page/Admin-block-dates.jsx, collection "blockDates"), so an admin
 * editing an existing appointment (Property-details.jsx) is held to the
 * same availability rules as a brand-new booking.
 */

// Weekday slots: 8:00 AM - 5:00 PM in 30 min increments
const WEEKDAY_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

// Saturday slots: 7:30 AM - 2:00 PM in 30 min increments
const SATURDAY_SLOTS = [
  "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
  "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM",
  "1:30 PM", "2:00 PM",
];

export function getTimeSlots(date) {
  if (!date) return [];
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isSaturday(dateObj) ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
}

/** Matches the calendar's booking rule: only Monday-Friday accepts new appointments */
export function isWeekendDate(date) {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = dateObj.getDay();
  return day === 0 || day === 6;
}

/** Normalize a date input (string or Date) to YYYY-MM-DD for comparisons */
export function normalizeDateKey(date) {
  if (!date) return null;

  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return null;
    return format(parsed, "yyyy-MM-dd");
  }

  if (date instanceof Date && !isNaN(date.getTime())) {
    return format(date, "yyyy-MM-dd");
  }

  return null;
}

export function convertTimeTo24Hour(timeStr) {
  if (!timeStr) return null;
  const [time, ampm] = timeStr.split(" ");
  if (!time || !ampm) return null;

  const [hourStr, minuteStr] = time.split(":");
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const upper = ampm.toUpperCase();
  if (upper === "PM" && hours !== 12) hours += 12;
  else if (upper === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Parses inceptionDate string format: "Thursday, February 12th, 2026 at 3:30 PM"
 */
export function parseInceptionDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  try {
    const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
    const dateMatch = cleaned.match(
      /(\w+day),\s+(\w+)\s+(\d+),\s+(\d+)\s+at\s+(\d+):(\d+)\s+(AM|PM)/i,
    );
    if (!dateMatch) return null;

    const [, , monthName, day, year, hour, minute, ampm] = dateMatch;
    const months = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };
    const month = months[monthName.toLowerCase()];
    if (month === undefined) return null;

    let hour24 = parseInt(hour, 10);
    if (ampm.toUpperCase() === "PM" && hour24 !== 12) hour24 += 12;
    else if (ampm.toUpperCase() === "AM" && hour24 === 12) hour24 = 0;

    const date = new Date(
      parseInt(year, 10), month, parseInt(day, 10), hour24, parseInt(minute, 10), 0, 0,
    );

    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Error parsing inceptionDate:", error, dateString);
    return null;
  }
}

/**
 * Calculates blocked time slots based on existing bookings.
 * Each booking blocks its own slot plus the next 2 slots (3-hour window).
 * Returns an object mapping YYYY-MM-DD -> array of blocked time strings.
 */
export function calculateBlockedSlots(bookingsData) {
  const blocked = {};

  bookingsData.forEach((booking) => {
    if (!booking.inceptionDate) return;

    const bookingDate = parseInceptionDate(booking.inceptionDate);
    if (!bookingDate) return;

    const dateKey = format(bookingDate, "yyyy-MM-dd");
    const bookingHour = bookingDate.getHours();
    const bookingMinute = bookingDate.getMinutes();

    let hour12 = bookingHour % 12;
    if (hour12 === 0) hour12 = 12;
    const ampm = bookingHour >= 12 ? "PM" : "AM";
    const bookingTimeStr = `${hour12}:${bookingMinute.toString().padStart(2, "0")} ${ampm}`;

    if (!blocked[dateKey]) blocked[dateKey] = [];

    const testDate = new Date(bookingDate);
    testDate.setHours(0, 0, 0, 0);
    const allTimeSlots = getTimeSlots(testDate);
    const bookingTimeIndex = allTimeSlots.findIndex((slot) => slot === bookingTimeStr);

    if (bookingTimeIndex !== -1) {
      for (let i = 0; i < 6 && bookingTimeIndex + i < allTimeSlots.length; i++) {
        const blockedTime = allTimeSlots[bookingTimeIndex + i];
        if (blockedTime && !blocked[dateKey].includes(blockedTime)) {
          blocked[dateKey].push(blockedTime);
        }
      }
    } else if (!blocked[dateKey].includes(bookingTimeStr)) {
      blocked[dateKey].push(bookingTimeStr);
    }
  });

  return blocked;
}

/** Recurring weekday time-window blocks (e.g. every Wednesday 4:00 PM - 8:00 PM) */
export function isWithinBlockedWeekday(date, timeStr, blockedWeekdayRules) {
  if (!date || !timeStr || !blockedWeekdayRules?.length) return false;

  const dateKey = normalizeDateKey(date);
  if (!dateKey) return false;

  const time24 = convertTimeTo24Hour(timeStr);
  if (!time24) return false;

  const [year, month, day] = dateKey.split("-").map(Number);
  const weekdayName = format(new Date(year, month - 1, day), "EEEE");

  return blockedWeekdayRules.some(
    (rule) =>
      rule.weekday === weekdayName &&
      time24 >= rule.startTime &&
      time24 <= rule.endTime,
  );
}

/** Admin-defined blocked date/time ranges + recurring weekday blocks */
export function isWithinBlockedRange(date, timeStr, blockedDateRanges, blockedWeekdayRules) {
  if (!date || !timeStr) return false;

  const time24 = convertTimeTo24Hour(timeStr);
  if (!time24) return false;

  if (isWithinBlockedWeekday(date, timeStr, blockedWeekdayRules)) return true;
  if (!blockedDateRanges?.length) return false;

  const dateKey = normalizeDateKey(date);
  if (!dateKey) return false;

  const candidate = new Date(`${dateKey}T${time24}`);
  if (isNaN(candidate.getTime())) return false;

  return blockedDateRanges.some(
    (range) => candidate >= range.start && candidate <= range.end,
  );
}

/** Checks if a time slot is blocked by either an existing booking or an admin block */
export function isTimeSlotBlocked(
  date,
  timeSlot,
  { blockedSlotsByDate, blockedDateRanges, blockedWeekdayRules },
) {
  if (!date || !timeSlot) return false;

  const dateKey = normalizeDateKey(date);
  if (!dateKey) return false;

  const blockedSlots = blockedSlotsByDate?.[dateKey] || [];
  const isBookedBlocked = blockedSlots.includes(timeSlot);
  const isAdminBlocked = isWithinBlockedRange(
    dateKey, timeSlot, blockedDateRanges, blockedWeekdayRules,
  );

  return isBookedBlocked || isAdminBlocked;
}

/**
 * Fetches the live availability data used for booking-conflict and
 * admin-block checks: existing appointments ("inspectionDates" collection)
 * and admin blocks ("blockDates" collection, same one /admin/block writes to).
 *
 * `excludeBookingId` omits the appointment being edited from the conflict
 * check, so an admin can re-save the same slot (or shift it slightly)
 * without tripping over their own existing appointment.
 */
export async function fetchAvailabilityData(db, { excludeBookingId } = {}) {
  const [inspectionDatesSnap, blockDatesSnap] = await Promise.all([
    getDocs(collection(db, "inspectionDates")),
    getDocs(collection(db, "blockDates")),
  ]);

  const inspectionDatesData = inspectionDatesSnap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((entry) => !excludeBookingId || entry.bookingId !== excludeBookingId);

  const blockedSlotsByDate = calculateBlockedSlots(inspectionDatesData);

  const allBlocks = blockDatesSnap.docs.map((docSnap) => docSnap.data());

  const blockedDateRanges = allBlocks
    .filter((item) => !item.isWeekday)
    .map((item) => ({
      start: item.startRaw ? new Date(item.startRaw) : null,
      end: item.endRaw ? new Date(item.endRaw) : null,
    }))
    .filter(
      (range) =>
        range.start && range.end &&
        !isNaN(range.start.getTime()) && !isNaN(range.end.getTime()),
    );

  const blockedWeekdayRules = allBlocks
    .filter((item) => item.isWeekday && item.weekday && item.startTime && item.endTime)
    .map((item) => ({
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
    }));

  return { blockedSlotsByDate, blockedDateRanges, blockedWeekdayRules };
}

/** Convenience wrapper: is this date/time slot available right now? */
export function isSlotAvailable(date, timeSlot, availability) {
  return !isTimeSlotBlocked(date, timeSlot, availability);
}
