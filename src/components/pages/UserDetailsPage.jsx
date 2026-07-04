import { useMemo, useState } from "react";
import usePeople from "../store/usePeopleStore";
import { USER_TYPES, getUserTypeById } from "../../data/UserTypes";

const emptyErrors = {
  fullName: "",
  preferredName: "",
  email: "",
  userType: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserDetailsPage() {
  const userProfile = usePeople((s) => s.userProfile);
  const updateUserProfile = usePeople((s) => s.updateUserProfile);

  const [form, setForm] = useState({
    fullName: userProfile?.fullName || "",
    preferredName: userProfile?.preferredName || "",
    email: userProfile?.email || "",
    userType: userProfile?.userType || "",
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [saved, setSaved] = useState(false);

  const selectedUserType = useMemo(
    () => getUserTypeById(form.userType),
    [form.userType]
  );

  const validate = () => {
    const nextErrors = { ...emptyErrors };

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.preferredName.trim()) {
      nextErrors.preferredName = "Preferred name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.userType) {
      nextErrors.userType = "Please choose a user type.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const onSave = (event) => {
    event.preventDefault();
    setSaved(false);

    if (!validate()) return;

    updateUserProfile({
      fullName: form.fullName.trim(),
      preferredName: form.preferredName.trim(),
      email: form.email.trim().toLowerCase(),
      userType: form.userType,
      updatedAt: Date.now(),
    });

    setSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        This profile is stored locally and prepares the app for future login and role-based agenda experiences.
      </div>

      <form onSubmit={onSave} className="bg-white border rounded-xl shadow p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className={`border rounded p-2 text-sm w-full ${errors.fullName ? "border-red-500 bg-red-50" : ""}`}
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Your full name"
            />
            {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Preferred Name</label>
            <input
              type="text"
              className={`border rounded p-2 text-sm w-full ${errors.preferredName ? "border-red-500 bg-red-50" : ""}`}
              value={form.preferredName}
              onChange={(e) => setForm((prev) => ({ ...prev, preferredName: e.target.value }))}
              placeholder="What should we call you?"
            />
            {errors.preferredName && <p className="text-xs text-red-600">{errors.preferredName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className={`border rounded p-2 text-sm w-full ${errors.email ? "border-red-500 bg-red-50" : ""}`}
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@company.com"
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">User Type</label>
            <select
              className={`border rounded p-2 text-sm w-full ${errors.userType ? "border-red-500 bg-red-50" : ""}`}
              value={form.userType}
              onChange={(e) => setForm((prev) => ({ ...prev, userType: e.target.value }))}
            >
              <option value="">Select user type...</option>
              {USER_TYPES.map((userType) => (
                <option key={userType.id} value={userType.id}>
                  {userType.label}
                </option>
              ))}
            </select>
            {errors.userType && <p className="text-xs text-red-600">{errors.userType}</p>}
          </div>
        </div>

        {selectedUserType && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
            <div className="font-semibold">{selectedUserType.label}</div>
            <p>{selectedUserType.description}</p>
            <div>
              <span className="font-medium">Suggested agenda focus: </span>
              {selectedUserType.recommendedAgendaFocus.join(", ")}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            Save User Details
          </button>
          {saved && (
            <span className="text-sm text-green-700 font-medium">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
