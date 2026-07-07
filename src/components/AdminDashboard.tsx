import React, { useState, useEffect } from "react";
import { DbUser, AdminStats } from "../types.ts";
import {
  Users,
  Store,
  Star,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Eye,
  AlertCircle,
  Check,
  Building,
  Shield,
  MapPin,
  Mail,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users and Stores List
  const [allListings, setAllListings] = useState<DbUser[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Sorting
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selected user for details panel
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);

  // Form State for User Creation
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formRole, setFormRole] = useState<"user" | "store_owner" | "admin">("user");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Stats and Listings
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role", roleFilter);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllListings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [searchQuery, roleFilter, sortBy, sortOrder]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Validate validations exactly as requested
    if (formName.length < 20 || formName.length > 60) {
      setFormError("Name must be min 20 and max 60 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setFormError("Invalid email format.");
      return;
    }
    if (formPassword.length < 8 || formPassword.length > 16) {
      setFormError("Password must be between 8 and 16 characters.");
      return;
    }
    const hasUpper = /[A-Z]/.test(formPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(formPassword);
    if (!hasUpper || !hasSpecial) {
      setFormError("Password must include at least one uppercase letter and one special character.");
      return;
    }
    if (formAddress.length > 400) {
      setFormError("Address must be at most 400 characters.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          address: formAddress,
          role: formRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setFormSuccess(`Successfully created ${formRole === "store_owner" ? "Store Owner" : "User"}!`);
      fetchStats();
      fetchListings();

      // Clear Form
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormAddress("");
      setFormRole("user");

      setTimeout(() => {
        setShowAddUserModal(false);
        setFormSuccess("");
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "An error occurred during user creation.");
    } finally {
      setFormLoading(false);
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
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Divide list into stores and regular users
  const storesList = allListings.filter((item) => item.role === "store_owner");
  const regularUsersList = allListings.filter((item) => item.role === "user" || item.role === "admin");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">System Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor stores, normal users, and system admins</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100/50 transition-colors shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Add New User / Store
        </button>
      </div>

      {/* Metrics Row */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
              <p className="text-3xl font-bold text-slate-800">{stats?.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stores</span>
              <p className="text-3xl font-bold text-slate-800">{stats?.totalStores}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ratings Submitted</span>
              <p className="text-3xl font-bold text-slate-800">{stats?.totalRatings}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores and users by name, email, or address..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white text-slate-800"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer appearance-none text-slate-700 font-medium"
            >
              <option value="">All Roles</option>
              <option value="user">Normal Users</option>
              <option value="store_owner">Store Owners</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two-Column List Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stores Listings Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[540px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-slate-800 text-md">Registered Stores</h2>
              <p className="text-xs text-slate-500 mt-0.5">Displays stores and their aggregate rating score</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              {storesList.length} Stores
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingListings ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : storesList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Store className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No stores match your search criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white border-b border-slate-100">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    >
                      <span className="flex items-center gap-1">Store Name {getSortIcon("name")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("address")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 hidden sm:table-cell"
                    >
                      <span className="flex items-center gap-1">Address {getSortIcon("address")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("rating")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    >
                      <span className="flex items-center gap-1">Rating {getSortIcon("rating")}</span>
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storesList.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 text-sm max-w-[150px] truncate" title={store.name}>
                          {store.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">{store.email}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 hidden sm:table-cell max-w-[160px] truncate" title={store.address}>
                        {store.address}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-700">
                            {store.averageRating && store.averageRating > 0 ? store.averageRating : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(store)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all inline-flex cursor-pointer"
                          title="View Store Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Regular Users List Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[540px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-slate-800 text-md">Platform Users</h2>
              <p className="text-xs text-slate-500 mt-0.5">Displays list of normal and admin users</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              {regularUsersList.length} Users
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingListings ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : regularUsersList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Users className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No users match your search criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white border-b border-slate-100">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    >
                      <span className="flex items-center gap-1">User Name {getSortIcon("name")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("address")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 hidden sm:table-cell"
                    >
                      <span className="flex items-center gap-1">Address {getSortIcon("address")}</span>
                    </th>
                    <th
                      onClick={() => handleSort("role")}
                      className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    >
                      <span className="flex items-center gap-1">Role {getSortIcon("role")}</span>
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regularUsersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 text-sm max-w-[150px] truncate" title={usr.name}>
                          {usr.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">{usr.email}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 hidden sm:table-cell max-w-[160px] truncate" title={usr.address}>
                        {usr.address}
                      </td>
                      <td className="px-5 py-4">
                        {usr.role === "admin" ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
                             Admin
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700">
                             Normal
                           </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(usr)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all inline-flex cursor-pointer"
                          title="View Store Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* User Details Side Panel */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-xl flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-800 text-lg">Details Overview</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {selectedUser.role === "store_owner" ? (
                      <Building className="w-8 h-8 text-emerald-600" />
                    ) : selectedUser.role === "admin" ? (
                      <Shield className="w-8 h-8 text-rose-600" />
                    ) : (
                      <Users className="w-8 h-8 text-sky-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{selectedUser.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{selectedUser.email}</p>
                  </div>
                  <div className="capitalize">
                    {selectedUser.role === "admin" ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Platform Admin
                      </span>
                    ) : selectedUser.role === "store_owner" ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Registered Store
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Normal User
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Info if Store Owner */}
                {selectedUser.role === "store_owner" && (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Average Rating</span>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        {selectedUser.averageRating && selectedUser.averageRating > 0
                          ? `${selectedUser.averageRating} / 5`
                          : "No Ratings Yet"}
                      </p>
                    </div>
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400 shrink-0" />
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Address</span>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed">{selectedUser.address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                      <p className="text-sm text-slate-700 mt-1">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Since</span>
                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Add User or Store</h3>
                  <p className="text-xs text-slate-500">Create a credentials profile with role capabilities</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-center gap-2 border border-rose-200">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2 border border-emerald-200">
                    <Check className="w-4.5 h-4.5 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Full Name / Store Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Minimum 20, maximum 60 characters"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 block">Length: {formName.length}/60</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Account Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700 font-medium"
                    >
                      <option value="user">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Password</label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="8-16 chars, uppercase & special"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Physical Address</label>
                  <textarea
                    required
                    rows={3}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Physical address of the store or user (maximum 400 characters)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block text-right">
                    Characters remaining: {400 - formAddress.length}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    {formLoading ? "Creating..." : "Save User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
