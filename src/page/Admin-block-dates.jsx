import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "../hooks/use-toast.js";
import {
  Loader2,
  Calendar,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

// Weekday block slots (aligned with Calendar weekday times), 24h values for easy comparison
const WEEKDAY_TIME_OPTIONS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "18:30", label: "6:30 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "19:30", label: "7:30 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
];

const BlockDates = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedWeekdays, setBlockedWeekdays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [addWeekday, setAddWeekday] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [weekday, setWeekday] = useState("");
  const { toast } = useToast();

  const endTimeOptions = WEEKDAY_TIME_OPTIONS.filter(
    (opt) => startTime && opt.value > startTime,
  );

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const q = query(collection(db, "blockDates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setBlockedDates(dates.filter((item) => !item.isWeekday));
      setBlockedWeekdays(dates.filter((item) => item.isWeekday));
      console.log("Blocked dates:", dates);
    });
    return () => unsubscribe();
  }, []);

  const formatFullOrdinal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";

    const weekday = date.toLocaleString("en-US", { weekday: "long" });
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${weekday}, ${month} ${day}${suffix}, ${year} at ${time}`;
  };

  function formatTime(time) {
    const [hours, minutes] = time.split(":").map(Number);

    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const handleBlockDate = async () => {
    // 1. Check if inputs are empty
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (!addWeekday) {
      if (!startDate || !endDate) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please select both start and end dates.",
        });
        return;
      }

      // 2. Validation: Allow a 5-minute buffer for "past" checks
      // This prevents the "Invalid Date" error if you select 'now' but click 10 seconds later.
      if (start < new Date(now.getTime() - 300000)) {
        console.warn("Validation failed: Start date is in the past");
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "You cannot block a date in the past.",
        });
        setShowConfirm(false);
        return;
      }

      // 3. Validation: End must be after Start
      if (end <= start) {
        console.warn("Validation failed: End date is before start date");
        toast({
          variant: "destructive",
          title: "Invalid Range",
          description: "Ending time must be after starting time.",
        });
        setShowConfirm(false);
        return;
      }
    }

    if (addWeekday) {
      if (!weekday) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please select a weekday.",
        });
        return;
      }
      if (!startTime || !endTime) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please select both start and end times.",
        });
        return;
      }

      if (endTime <= startTime) {
        toast({
          variant: "destructive",
          title: "Invalid Range",
          description: "Ending time must be after starting time.",
        });
        setShowConfirm(false);
        return;
      }
    }

    if (!addWeekday) {
      console.log("Attempting to block:", { start, end, now });
    }

    if (addWeekday) {
      console.log("Attempting to block:", { startTime, endTime });
    }

    try {
      setIsLoading(true);
      const formattedStart = formatFullOrdinal(startDate);
      const formattedEnd = formatFullOrdinal(endDate);

      console.log("Saving to Firestore...");

      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(endTime);

      let payload;
      if (!addWeekday) {
        payload = {
          startDate: formattedStart,
          endDate: formattedEnd,
          startRaw: startDate,
          endRaw: endDate,
          formattedRange: `${formattedStart} — ${formattedEnd}`,
          createdAt: serverTimestamp(),
          isWeekday: false,
        };
      } else {
        payload = {
          startTime: startTime,
          endTime: endTime,
          timeRange: `${startTime} — ${endTime}`,
          formattedStartTime: formattedStartTime,
          formattedEndTime: formattedEndTime,
          formattedTimeRange: `${formattedStartTime} — ${formattedEndTime}`,
          createdAt: serverTimestamp(),
          weekday: weekday,
          isWeekday: true,
        };
      }

      // await addDoc(collection(db, "blockDates"), {
      //   startDate: formattedStart,
      //   endDate: formattedEnd,
      //   startRaw: startDate,
      //   endRaw: endDate,
      //   formattedRange: `${formattedStart} — ${formattedEnd}`,
      //   createdAt: serverTimestamp(),
      // });

      await addDoc(collection(db, "blockDates"), payload);

      console.log("Save successful!", payload);

      toast({ title: "Success", description: "Range blocked successfully." });
    } catch (error) {
      console.error("Firebase Error details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to save to database. Check your internet or Firebase permissions.",
      });
    } finally {
      setIsLoading(false);
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setWeekday("");
      setAddWeekday(false);
      setShowConfirm(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "blockDates", id));
      toast({ title: "Deleted", description: "Range removed." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Delete failed.",
      });
    }
  };

  const handleUpdate = async (id) => {
    const start = new Date(editStart);
    const end = new Date(editEnd);
    if (end <= start) {
      return toast({
        variant: "destructive",
        title: "Invalid Range",
        description: "End date must be after start date.",
      });
    }
    try {
      const formattedStart = formatFullOrdinal(editStart);
      const formattedEnd = formatFullOrdinal(editEnd);
      await updateDoc(doc(db, "blockDates", id), {
        startDate: formattedStart,
        endDate: formattedEnd,
        startRaw: editStart,
        endRaw: editEnd,
        formattedRange: `${formattedStart} — ${formattedEnd}`,
      });
      setEditingId(null);
      toast({ title: "Updated", description: "Range modified successfully." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Update failed.",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 space-y-6 sm:space-y-8">
      {/* INPUT CARD - RESPONSIVE PADDING AND TEXT */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-blue-50 rounded-full mb-4 text-blue-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center break-words w-full">
              Block Date Range
            </h2>
            {/* <p className="text-gray-500 text-xs sm:text-sm mt-1 text-center">
              Select dates
            </p> */}
          </div>

          {/* radio button weekday */}

          <div className="mb-1">
            <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">
              Add Week day
            </label>
          </div>
          <button
            type="button"
            onClick={() => setAddWeekday(!addWeekday)}
            className={`relative inline-flex h-6 w-11 ml-1 cursor-pointer items-center rounded-full transition-colors ${
              addWeekday ? "bg-red-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                addWeekday ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          {/* dropdown weekday  */}
          {addWeekday && (
            <div className="flex items-center justify-center mt-2">
              <select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 transition-all outline-none bg-gray-50/50 text-sm sm:text-base appearance-none"
              >
                <option value="">Select weekday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          )}

          {!addWeekday ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                    From
                  </label>
                  <input
                    type="datetime-local"
                    min={getCurrentDateTime()}
                    className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 text-sm sm:text-base appearance-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                    To
                  </label>
                  <input
                    type="datetime-local"
                    min={startDate || getCurrentDateTime()}
                    className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 text-sm sm:text-base appearance-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (startDate && endDate) setShowConfirm(true);
                }}
                disabled={!startDate || !endDate || isLoading}
                className="w-full bg-[#007bff] hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 text-sm sm:text-base"
              >
                {isLoading ? "Processing..." : "Confirm & Block Date"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">
                    From
                  </label>
                  <select
                    className="w-full text-[12px]  px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 text-sm sm:text-base"
                    value={startTime}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setStartTime(nextStart);
                      // Clear end if it is no longer after the new start
                      if (endTime && endTime <= nextStart) {
                        setEndTime("");
                      }
                    }}
                  >
                    <option value="">Select start time</option>
                    {WEEKDAY_TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">
                    To
                  </label>
                  <select
                    className="w-full text-[12px] px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 transition-all outline-none bg-gray-50/50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    value={endTime}
                    disabled={!startTime || isLoading}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    <option value="">
                      {startTime
                        ? "Select end time"
                        : "Select start time first"}
                    </option>
                    {endTimeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (startTime && endTime && endTime > startTime && weekday) {
                    setShowConfirm(true);
                  }
                }}
                disabled={
                  !startTime ||
                  !endTime ||
                  endTime <= startTime ||
                  !weekday ||
                  isLoading
                }
                className="w-full cursor-pointer bg-[#007bff] hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 text-sm sm:text-base"
              >
                {isLoading ? "Processing..." : "Confirm & Block Date"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LIST SECTION - FIXED OVERFLOW AND STACKING */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 font-bold text-gray-700 text-sm sm:text-base">
          Blocked Ranges
        </div>
        <div className="divide-y divide-gray-100">
          {blockedDates.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">
              No ranges blocked.
            </p>
          ) : (
            blockedDates.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-all"
              >
                <div className="flex-1 w-full text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-2 w-full max-w-md">
                      <input
                        type="datetime-local"
                        className="border p-2 rounded-lg w-full text-xs"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                      />
                      <div className="flex justify-center sm:block">
                        <ArrowRight
                          className="sm:inline text-gray-400 rotate-90 sm:rotate-0"
                          size={16}
                        />
                      </div>
                      <input
                        type="datetime-local"
                        className="border p-2 rounded-lg w-full text-xs"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="block break-words">
                      {item.formattedRange}
                    </span>
                  )}
                </div>

                {/* ACTIONS - STAYS ALIGNED ON MOBILE */}
                <div className="flex gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                  {editingId === item.id ? (
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="text-green-600 p-2 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                    >
                      <Check size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditStart(item.startRaw);
                        setEditEnd(item.endRaw);
                      }}
                      className="text-blue-600 p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ----------------- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 font-bold text-gray-700 text-sm sm:text-base">
          Blocked Weekdays
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">
                  Week day
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">
                  Time Range
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {blockedWeekdays.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-gray-400"
                  >
                    No weekday blocks found.
                  </td>
                </tr>
              ) : (
                blockedWeekdays.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {item.weekday}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {editingId === item.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <input
                            type="time"
                            className="border rounded-lg px-3 py-2"
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                          />

                          <span>—</span>

                          <input
                            type="time"
                            className="border rounded-lg px-3 py-2"
                            value={editEnd}
                            onChange={(e) => setEditEnd(e.target.value)}
                          />
                        </div>
                      ) : (
                        item.formattedTimeRange
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {/* {editingId === item.id ? (
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="text-green-600 p-2 bg-green-50 rounded-full hover:bg-green-100"
                          >
                            <Check size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditStart(item.startTime);
                              setEditEnd(item.endTime);
                            }}
                            className="text-blue-600 p-2 bg-blue-50 rounded-full hover:bg-blue-100"
                          >
                            <Edit2 size={18} />
                          </button>
                        )} */}

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 p-2 bg-red-50 rounded-full hover:bg-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal - Optimized for Small Screens */}
      {showConfirm &&
        (!addWeekday ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm sm:max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2 mb-4">
                <AlertCircle size={20} /> Confirm Block
              </h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="flex flex-col">
                  <strong className="text-gray-400 uppercase text-[10px]">
                    From:
                  </strong>{" "}
                  <span className="text-gray-800">
                    {formatFullOrdinal(startDate)}
                  </span>
                </p>
                <p className="flex flex-col">
                  <strong className="text-gray-400 uppercase text-[10px]">
                    To:
                  </strong>{" "}
                  <span className="text-gray-800">
                    {formatFullOrdinal(endDate)}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockDate}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-blue-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Yes, Block Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm sm:max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2 mb-4">
                <AlertCircle size={20} /> Confirm Block
              </h3>
              <div className="flex justify-around items-center text-xs sm:text-sm text-gray-600 space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="flex flex-col">
                  <strong className="text-gray-400 uppercase text-[10px]">
                    From:
                  </strong>{" "}
                  <span className="text-gray-800">{startTime}</span>
                </p>
                <p className="flex flex-col">
                  <strong className="text-gray-400 uppercase text-[10px]">
                    To:
                  </strong>{" "}
                  <span className="text-gray-800">{endTime}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockDate}
                  className="flex-1 py-3 cursor-pointer bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-blue-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Yes, Block Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default BlockDates;
