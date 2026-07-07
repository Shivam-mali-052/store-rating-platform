import React, { useState, useEffect } from "react";
import { StoreOwnerDashboardData } from "../types.ts";
import {
  Star,
  Users,
  ChevronUp,
  ChevronDown,
  Calendar,
  AlertCircle,
  Building,
  RefreshCw,
  Mail,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";

interface StoreDashboardProps {
  token: string;
}

export default function StoreDashboard({ token }: StoreDashboardProps) {
  const [data, setData] = useState<StoreOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sort settings
  const [sortBy, setSortBy] = useState<string>("userName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/store-owner/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      } else {
        setError(resData.error || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch store dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

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

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 shrink-0 text-rose-600" />
          <h3 className="font-bold text-lg">Error Loading Dashboard</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 font-sans">
            Store Owner Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor ratings, reviews, and customer listings for <span className="font-bold text-indigo-600">{data?.storeName}</span>
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Store rating visual */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Store Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">
                {data?.averageRating && data.averageRating > 0 ? data.averageRating : "0.00"}
              </span>
              <span className="text-sm text-slate-400">/ 5.00</span>
            </div>
            {/* Aggregate star preview */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFull = star <= Math.floor(data?.averageRating || 0);
                return (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      isFull ? "fill-amber-400 text-amber-400" : "text-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Total reviewing users */}
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Ratings Given</span>
            <p className="text-4xl font-black text-slate-800">{data?.ratingsList.length}</p>
            <p className="text-xs text-slate-500">Unique customers who have rated your store</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Review list details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-md">Customer Ratings</h2>
            <p className="text-xs text-slate-500 mt-0.5">List of users who rated your store</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {data?.ratingsList.length} Ratings
          </span>
        </div>

        <div className="overflow-x-auto">
          {data?.ratingsList.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Building className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-700">No ratings submitted yet</p>
              <p className="text-sm text-slate-400 mt-1">Once a normal user submits a rating for your store, it will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort("userName")}
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-700 select-none"
                  >
                    <span className="flex items-center gap-1">Customer Name {getSortIcon("userName")}</span>
                  </th>
                  <th className="px-6 py-3.5 hidden sm:table-cell">Contact Details</th>
                  <th className="px-6 py-3.5 hidden md:table-cell">Physical Address</th>
                  <th
                    onClick={() => handleSort("rating")}
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-700 select-none"
                  >
                    <span className="flex items-center gap-1">Score {getSortIcon("rating")}</span>
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-700 select-none text-right"
                  >
                    <span className="flex items-center gap-1 justify-end">Date Submitted {getSortIcon("date")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data?.ratingsList.map((rating) => (
                  <tr key={rating.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{rating.userName}</div>
                    </td>
                    {/* Contact details */}
                    <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{rating.userEmail}</span>
                      </div>
                    </td>
                    {/* Address details */}
                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell max-w-xs truncate" title={rating.userAddress}>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{rating.userAddress}</span>
                      </div>
                    </td>
                    {/* Score */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg w-fit font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span>{rating.rating}</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(rating.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
