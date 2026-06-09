import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogIn } from "lucide-react";
import api, { checkSession, formatApiError, getCsrfToken } from "../services/api";

function StudentLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("Tech@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await getCsrfToken();
      await api.post("/accounts/login/", {
        role: "student",
        student_id: studentId,
        password,
      });

      const session = await checkSession();
      if (!session.authenticated || session.role !== "student") {
        throw new Error(
          "Session could not be established. Try logging in again."
        );
      }

      localStorage.setItem("role", session.role);
      localStorage.setItem("student_id", session.student_id);
      navigate("/student-dashboard");
    } catch (err) {
      setError(formatApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-lg bg-cyan-600 text-white">
            <GraduationCap size={30} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Tech S Cube IT Solutions</p>
          <h1 className="text-2xl font-bold text-slate-950">Student Certificate Access</h1>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Student ID</span>
          <input
            value={studentId}
            onChange={(event) => setStudentId(event.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
            placeholder="TSC001"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-cyan-600"
          />
        </label>

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? "Opening dashboard..." : "Login"}
        </button>

        <Link to="/admin" className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-cyan-700">
          Admin login
        </Link>
      </form>
    </main>
  );
}

export default StudentLogin;
