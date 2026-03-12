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

const BlockDates = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const { toast } = useToast();

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const q = query(collection(db, "blockDates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBlockedDates(dates);
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

  const handleBlockDate = async () => {
    // 1. Check if inputs are empty
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both start and end dates.",
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    console.log("Attempting to block:", { start, end, now });

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

    try {
      setIsLoading(true);
      const formattedStart = formatFullOrdinal(startDate);
      const formattedEnd = formatFullOrdinal(endDate);

      console.log("Saving to Firestore...");

      await addDoc(collection(db, "blockDates"), {
        startDate: formattedStart,
        endDate: formattedEnd,
        startRaw: startDate,
        endRaw: endDate,
        formattedRange: `${formattedStart} — ${formattedEnd}`,
        createdAt: serverTimestamp(),
      });

      console.log("Save successful!");

      toast({ title: "Success", description: "Range blocked successfully." });
      setStartDate("");
      setEndDate("");
      setShowConfirm(false);
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
        </div>
      </div>

      {/* LIST SECTION - FIXED OVERFLOW AND STACKING */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
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

      {/* Confirmation Modal - Optimized for Small Screens */}
      {showConfirm && (
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
      )}
    </div>
  );
};

export default BlockDates;
