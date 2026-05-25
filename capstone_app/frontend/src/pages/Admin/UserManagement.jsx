import { useEffect, useMemo, useState } from "react";
import { fetchAdminUsers, updateUserRole, upsertCourseEnrollment, upsertSectionEnrollment } from "../../api/adminDashboard";
import { getLocalUsers, registerLocalUser } from "../../demoAuth";

const roleOptions = ["student", "instructor", "admin"];

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [payload, setPayload] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [selectedRole, setSelectedRole] = useState({});
  const [localAccounts, setLocalAccounts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
  });

  const loadLocalAccounts = () => {
    const localUsers = getLocalUsers();
    setLocalAccounts(localUsers);
  };

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchAdminUsers();
      setPayload(data);
      setSelectedRole(
        (data.users || []).reduce((acc, user) => {
          acc[user.id] = user.role || "student";
          return acc;
        }, {}),
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLocalAccounts();
  }, []);

  const courses = payload?.courses || [];
  const sections = payload?.sections || [];

  const enrollmentSummary = useMemo(() => {
    const courseCount = (payload?.courseEnrollments || []).length;
    const sectionCount = (payload?.sectionEnrollments || []).length;
    return { courseCount, sectionCount };
  }, [payload]);

  const handleRoleSave = async (userId) => {
    try {
      setBusyAction(`role-${userId}`);
      await updateUserRole(userId, selectedRole[userId]);
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Failed to update role.");
    } finally {
      setBusyAction("");
    }
  };

  const handleAssignCourse = async (userId, courseId) => {
    try {
      setBusyAction(`course-${userId}-${courseId}`);
      await upsertCourseEnrollment({ user_id: userId, course_id: courseId, role_in_course: "student" });
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Failed to assign course.");
    } finally {
      setBusyAction("");
    }
  };

  const handleAssignSection = async (userId, sectionId) => {
    try {
      setBusyAction(`section-${userId}-${sectionId}`);
      await upsertSectionEnrollment({ user_id: userId, section_id: sectionId, role_in_section: "student" });
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Failed to assign section.");
    } finally {
      setBusyAction("");
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const firstName = newUser.firstName.trim();
    const lastName = newUser.lastName.trim();
    const email = newUser.email.trim().toLowerCase();
    const password = newUser.password;

    if (!firstName || !lastName) {
      setErrorMessage("First name and last name are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setBusyAction("create-user");
      registerLocalUser({
        firstName,
        lastName,
        email,
        password,
        role: newUser.role,
      });
      setSuccessMessage(`User created: ${email}`);
      setShowCreateForm(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "student",
      });
      loadLocalAccounts();
    } catch (error) {
      setErrorMessage(error.message || "Failed to create user.");
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return <div className="p-5 text-sm text-slate-500">Loading users...</div>;
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}
      {successMessage ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Users</p>
          <p className="mt-2 text-3xl font-black text-[#165A9E]">{payload?.users?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Course Enrollments</p>
          <p className="mt-2 text-3xl font-black text-[#165A9E]">{enrollmentSummary.courseCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Section Enrollments</p>
          <p className="mt-2 text-3xl font-black text-[#165A9E]">{enrollmentSummary.sectionCount}</p>
        </div>
      </div>

      <SectionCard title="Create User" subtitle="Create a new account for local role-based login">
        {!showCreateForm ? (
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setShowCreateForm(true);
            }}
            className="rounded-lg bg-[#165A9E] px-4 py-2 text-xs font-semibold text-white"
          >
            Create User
          </button>
        ) : (
          <form onSubmit={handleCreateUser} className="grid gap-3 md:grid-cols-6">
            <input
              type="text"
              placeholder="First name"
              value={newUser.firstName}
              onChange={(event) => setNewUser((prev) => ({ ...prev, firstName: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 md:col-span-1"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={newUser.lastName}
              onChange={(event) => setNewUser((prev) => ({ ...prev, lastName: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 md:col-span-1"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 md:col-span-2"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 md:col-span-1"
              minLength={8}
              required
            />
            <div className="flex gap-2 md:col-span-1">
              <select
                value={newUser.role}
                onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-6">
              <button
                type="submit"
                disabled={busyAction === "create-user"}
                className="rounded-lg bg-[#165A9E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busyAction === "create-user" ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Local Accounts</p>
          <p className="mt-1 text-sm text-slate-700">{localAccounts.length} created account(s)</p>
        </div>
      </SectionCard>

      <SectionCard title="User Management" subtitle="Role selector, deactivate toggle, and assignment controls">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Sections</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(payload?.users || []).map((user) => {
                const userCourses = (payload?.courseEnrollments || []).filter((item) => item.user_id === user.id);
                const userSections = (payload?.sectionEnrollments || []).filter((item) => item.user_id === user.id);

                return (
                  <tr key={user.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{user.full_name || "Unnamed user"}</p>
                      <p className="text-xs text-slate-500">{user.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={selectedRole[user.id] || "student"}
                        onChange={(event) => setSelectedRole((prev) => ({ ...prev, [user.id]: event.target.value }))}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {courses.slice(0, 3).map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => handleAssignCourse(user.id, course.id)}
                            disabled={busyAction === `course-${user.id}-${course.id}`}
                            className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-900 disabled:opacity-50"
                          >
                            {course.code}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{userCourses.length} assigned</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {sections.slice(0, 3).map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => handleAssignSection(user.id, section.id)}
                            disabled={busyAction === `section-${user.id}-${section.id}`}
                            className="rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-900 disabled:opacity-50"
                          >
                            {section.name}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{userSections.length} assigned</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-900">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleRoleSave(user.id)}
                          disabled={busyAction === `role-${user.id}`}
                          className="rounded-lg bg-[#165A9E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {busyAction === `role-${user.id}` ? "Saving..." : "Save Role"}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
