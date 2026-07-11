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
  active: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  expired: "bg-red-100 text-red-600",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
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
      } catch {
        setError("Subscription not found.");
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
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this subscription?")) return;
    try {
      const { data } = await cancelSubscription(id);
      setSub(data.data);
      setToast("Subscription cancelled.");
    } catch {
      alert("Failed to cancel.");
    }
  };

  const daysLeft = sub
    ? Math.ceil((new Date(sub.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <main className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-700 mb-4 inline-block"
        >
          ← Back
        </button>

        {loading && (
          <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center py-12">{error}</p>
        )}

        {sub && (
          <>
            {/* Header */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{sub.name}</h2>
                  <p className="text-sm text-gray-400 capitalize mt-0.5">
                    {sub.category}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[sub.status]}`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {sub.price}
                </span>
                <span className="text-gray-400 mb-1">
                  {sub.currency} / {sub.frequency}
                </span>
              </div>

              {sub.status === "active" && daysLeft !== null && (
                <div
                  className={`text-sm font-medium px-3 py-2 rounded-lg inline-block ${
                    daysLeft <= 3
                      ? "bg-red-50 text-red-600"
                      : daysLeft <= 7
                      ? "bg-amber-50 text-amber-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {daysLeft <= 0
                    ? "Renewing today"
                    : `Renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-2 mb-4">
              <DetailRow label="Payment method" value={sub.paymentMethod} />
              <DetailRow
                label="Start date"
                value={new Date(sub.startDate).toLocaleDateString()}
              />
              <DetailRow
                label="Renewal date"
                value={new Date(sub.renewalDate).toLocaleDateString()}
              />
              <DetailRow
                label="Added on"
                value={new Date(sub.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                to={`/subscriptions/${id}/edit`}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
              >
                Edit subscription
              </Link>
              {sub.status === "active" && (
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg py-2.5 text-sm transition-colors"
                >
                  Cancel subscription
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg py-2.5 text-sm transition-colors"
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
