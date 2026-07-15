import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SubscriptionCard from "../components/SubscriptionCard";
import {
  deleteSubscription,
  getSubscriptions,
  getUpcomingRenewals,
} from "../api/subscriptions";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subRes, upcomingRes] = await Promise.all([
        getSubscriptions(),
        getUpcomingRenewals(7),
      ]);
      setSubscriptions(subRes.data.data);
      setUpcoming(upcomingRes.data.data);
    } catch {
      setError("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s._id !== id));
      setUpcoming((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert("Failed to delete subscription.");
    }
  };

  const active = subscriptions.filter((s) => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => {
    const multipliers = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
    return sum + s.price * (multipliers[s.frequency] || 1);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Overview</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total"
            value={subscriptions.length}
            sub="subscriptions"
          />
          <StatCard label="Active" value={active.length} sub="subscriptions" />
          <StatCard
            label="Due this week"
            value={upcoming.length}
            sub="renewals"
          />
          <StatCard
            label="Est. monthly"
            value={`~${totalMonthly.toFixed(2)}`}
            sub="spend (mixed currencies)"
          />
        </div>

        {/* Upcoming Renewals Banner */}
        {upcoming.length > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-amber-800 mb-3">
              🔔 Renewing within 7 days
            </h3>
            <div className="flex flex-wrap gap-2">
              {upcoming.map((s) => {
                const daysLeft = Math.ceil(
                  (new Date(s.renewalDate) - new Date()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <span
                    key={s._id}
                    className="bg-white border border-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {s.name} — {daysLeft <= 0 ? "today" : `${daysLeft}d`}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscriptions Grid */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          All subscriptions
        </h3>

        {loading && (
          <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center py-12">{error}</p>
        )}

        {!loading && !error && subscriptions.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-2">No subscriptions yet</p>
            <p className="text-sm">
              Click <strong>+ Add</strong> to track your first one.
            </p>
          </div>
        )}

        {!loading && subscriptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                subscription={sub}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* How does it work */}
        <div className="mt-16 mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            How does it work?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Step 1 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Add your subscriptions</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Click <strong>+ Add</strong> and enter your subscription details — name, price,
                billing frequency (daily, weekly, monthly or yearly) and start date.
                The renewal date is calculated automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-amber-500 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">We track renewals for you</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                SubTrackt monitors every active subscription and automatically advances
                the renewal date each billing cycle — so your dashboard always shows
                accurate, up-to-date information.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get reminder emails</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Reminder emails are sent automatically before each renewal:
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                  <span><strong>Monthly / Yearly</strong> — 7, 3 and 1 day before</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span><strong>Weekly</strong> — 3 and 1 day before</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                  <span><strong>Daily</strong> — 1 day before</span>
                </li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Each email includes the subscription name, renewal date and amount due.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
