import { useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import api from "../services/api";

function DatabaseConnection() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const response = await api.get("/accounts/db-connection/");
      setStatus(response.data.status || "connected");
      setMessage(response.data.message || "Database connection is healthy.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to connect to the database."
      );
    } finally {
      setLoading(false);
    }
  };

  const statusClass = status === "connected"
    ? "bg-emerald-50 text-emerald-700"
    : status === "error"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-50 text-slate-700";

  return (
    <Layout role="admin">
      <PageHeader title="Database Connection" eyebrow="System Status" />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Test database connectivity</h3>
            <p className="text-sm text-slate-500">
              Use this page to confirm that the backend can reach the configured MongoDB database.
            </p>
          </div>

          <button
            type="button"
            onClick={testConnection}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check Connection"}
          </button>
        </div>

        <div className={`rounded-2xl border p-5 ${statusClass}`}>
          <p className="text-sm font-semibold uppercase tracking-wide">Status</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{status ? status : "Not checked yet"}</p>
          {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
        </div>
      </section>
    </Layout>
  );
}

export default DatabaseConnection;
