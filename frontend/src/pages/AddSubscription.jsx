import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubscriptionForm, { defaultForm } from "../components/SubscriptionForm";
import Toast from "../components/Toast";
import { createSubscription } from "../api/subscriptions";

export default function AddSubscription() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.renewalDate) delete payload.renewalDate;
      await createSubscription(payload);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the subscription. Please check all fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {success && <Toast message="Subscription added!" />}
      <main className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-white mb-5 inline-flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-white mb-1">Add subscription</h2>
        <p className="text-slate-400 text-sm mb-6">Fill in the details below to start tracking</p>

        {error && (
          <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/30 p-6">
          <SubscriptionForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Add subscription"
          />
        </div>
      </main>
    </div>
  );
}
