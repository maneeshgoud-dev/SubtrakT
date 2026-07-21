import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubscriptionForm from "../components/SubscriptionForm";
import Toast from "../components/Toast";
import { getSubscription, updateSubscription } from "../api/subscriptions";

const toDateInput = (iso) => (iso ? iso.split("T")[0] : "");

export default function EditSubscription() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSubscription(id);
        const s = data.data;
        setForm({
          name: s.name,
          price: s.price,
          currency: s.currency,
          frequency: s.frequency,
          category: s.category,
          paymentMethod: s.paymentMethod,
          status: s.status,
          startDate: toDateInput(s.startDate),
          renewalDate: toDateInput(s.renewalDate),
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this subscription. It may have been deleted or you may not have access to it.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.renewalDate) delete payload.renewalDate;
      await updateSubscription(id, payload);
      setSuccess(true);
      setTimeout(() => navigate(`/subscriptions/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your changes. Please check the fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {success && <Toast message="Changes saved!" />}
      <main className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-700 mb-4 inline-block"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Edit subscription
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {fetching && (
          <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
        )}

        {!fetching && form && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <SubscriptionForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Save changes"
            />
          </div>
        )}
      </main>
    </div>
  );
}
