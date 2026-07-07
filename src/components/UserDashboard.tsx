import React, { useState, useEffect } from "react";
import { StoreForUser } from "../types.ts";
import {
  Search,
  Star,
  ChevronUp,
  ChevronDown,
  Building,
  Check,
  AlertCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserDashboardProps {
  token: string;
}

export default function UserDashboard({ token }: UserDashboardProps) {
  const [stores, setStores] = useState<StoreForUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Interaction feedback states
  const [actionStoreId, setActionStoreId] = useState<number | null>(null);
  const [actionRating, setActionRating] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/stores?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStores(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchQuery, sortBy, sortOrder]);

  const handleRatingSubmit = async (storeId: number, rating: number) => {
    setErrorMsg("");
    setSuccessMsg("");
    setActionStoreId(storeId);
    setActionRating(rating);
    setActionLoading(true);

    try {
      const res = await fetch(`/api/stores/${storeId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit rating.");
      }

      setSuccessMsg("Your rating was submitted successfully!");
      // Refresh list to update ratings
      fetchStores();

      setTimeout(() => {
        setSuccessMsg("");
        setActionStoreId(null);
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
      setTimeout(() => {
        setErrorMsg("");
        setActionStoreId(null);
      }, 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 font-sans">Registered Stores</h1>
          <p className="text-sm text-slate-500 mt-1">Search for stores, view their ratings, and submit or modify your feedback</p>
        </div>
      </div>

      {/* Global alert feedback */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm flex items-center gap-2"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by Name or Address..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>

        {/* Desktop Sorting Quickbar */}
        <div className="flex gap-2 items-center text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="mr-2 shrink-0">Sort By:</span>
          <button
            onClick={() => handleSort("name")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              sortBy === "name" ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            Name {getSortIcon("name")}
          </button>
          <button
            onClick={() => handleSort("address")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              sortBy === "address" ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            Address {getSortIcon("address")}
          </button>
          <button
            onClick={() => handleSort("overallRating")}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              sortBy === "overallRating" ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            Overall Rating {getSortIcon("overallRating")}
          </button>
        </div>
      </div>

      {/* Stores Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white space-y-3 max-w-lg mx-auto">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-lg">No stores found</h3>
          <p className="text-sm text-slate-400">We couldn't find any stores matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stores.map((store) => (
            <motion.div
              key={store.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300/80 transition-all group"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base line-clamp-1" title={store.name}>
                    {store.name}
                  </h3>
                  {/* Overall Store Rating Badge */}
                  <div className="flex items-center gap-1 shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                    <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                    <span>{store.overallRating > 0 ? store.overallRating : "N/A"}</span>
                  </div>
                </div>

                <div className="flex gap-2 text-xs text-slate-500 mt-1 items-start">
                  <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                  <p className="line-clamp-2" title={store.address}>
                    {store.address}
                  </p>
                </div>
              </div>

              {/* Card Footer: Rating actions */}
              <div className="border-t border-slate-100 pt-5 mt-5 flex flex-col space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">
                    {store.userRating > 0 ? "Your submitted rating:" : "Not rated by you yet:"}
                  </span>
                  {store.userRating > 0 && (
                    <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {store.userRating} / 5
                    </span>
                  )}
                </div>

                {/* Submitting star system */}
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHoveredOrRated = star <= (store.userRating || 0);
                      return (
                        <button
                          key={star}
                          onClick={() => handleRatingSubmit(store.id, star)}
                          disabled={actionLoading && actionStoreId === store.id}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                          title={`Submit rating score ${star}`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isHoveredOrRated
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 hover:text-amber-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {actionLoading && actionStoreId === store.id ? (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {store.userRating > 0 ? "Modify" : "Submit"}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
