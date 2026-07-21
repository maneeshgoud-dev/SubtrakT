import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import {
  cancelSubscription,
  deleteSubscription,
  getSubscription,
} from "../api/subscriptions";

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-slate-500/15 text-slate-400",
  expired: "bg-red-500/15 text-red-400",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-3.5 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-200 capitalize">{value}</span>
    </div>
  );
}

export default function ViewSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSubscription(id);
        setSub(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this subscription. It may have been deleted or you may not have access to it.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await deleteSubscription(id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this subscription. Please try again.");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this subscription?")) return;
    try {
      const { data } = await cancelSubscription(id);
      setSub(data.data);
      setToast("Subscription cancelled.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel this subscription. Please try again.");
    }
  };

  const daysLeft = sub
    ? Math.ceil((new Date(sub.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <main className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white mb-5 inline-flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        {loading && (
          <p className="text-sm text-slate-500 text-center py-12">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-red-400 text-center py-12">{error}</p>
        )}

        {sub && (
          <>
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/40 rounded-3xl p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{sub.name}</h2>
                  <p className="text-sm text-slate-400 capitalize mt-0.5">{sub.category}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[sub.status] || STATUS_STYLES.active}`}>
                  {sub.status}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold text-white">{sub.price}</span>
                <span className="text-slate-400 mb-1">{sub.currency} / {sub.frequency}</span>
              </div>

              {sub.status === "active" && daysLeft !== null && (
                <div
                  className={`text-sm font-semibold px-4 py-2 rounded-xl inline-block ${
                    daysLeft <= 3
                      ? "bg-red-500/15 text-red-400"
                      : daysLeft <= 7
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-indigo-500/15 text-indigo-400"
                  }`}
                >
                  {daysLeft <= 0
                    ? "Renewing today"
                    : `Renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/40 rounded-3xl px-6 py-2 mb-4">
              <DetailRow label="Payment method" value={sub.paymentMethod} />
              <DetailRow label="Start date" value={new Date(sub.startDate).toLocaleDateString()} />
              <DetailRow label="Renewal date" value={new Date(sub.renewalDate).toLocaleDateString()} />
              <DetailRow label="Added on" value={new Date(sub.createdAt).toLocaleDateString()} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to={`/subscriptions/${id}/edit`}
                className="w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Edit subscription
              </Link>
              {sub.status === "active" && (
                <button
                  onClick={handleCancel}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl py-3 text-sm transition-all duration-200 border border-slate-600/50"
                >
                  Cancel subscription
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium rounded-xl py-3 text-sm transition-all duration-200 border border-red-500/20"
              >
                Delete subscription
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
