import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import api, { checkSession, formatApiError, getCsrfToken } from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await getCsrfToken();
      await api.post("/accounts/login/", {
        role: "admin",
        username: form.username,
        password: form.password,
      });

      const session = await checkSession();
      if (!session.authenticated || session.role !== "admin") {
        throw new Error(
          "Session could not be established. Try logging in again."
        );
      }

      localStorage.setItem("role", session.role);
      navigate("/admin-dashboard");
    } catch (err) {
      setError(formatApiError(err, "Unable to sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-100 text-cyan-700">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Tech S Cube</p>
            <h1 className="text-2xl font-bold text-slate-950">Admin Login</h1>
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
            placeholder="Django admin username"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
            placeholder="Admin password"
          />
        </label>

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
        >
          <LockKeyhole size={18} />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Link to="/" className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-cyan-700">
          Student login
        </Link>
      </form>
    </main>
  );
}

export default AdminLogin;
