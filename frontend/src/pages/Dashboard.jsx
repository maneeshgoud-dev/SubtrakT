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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/40 rounded-2xl p-5 shadow-lg hover:border-indigo-500/30 transition-all duration-200">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
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
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your subscriptions. Please refresh the page to try again.",
      );
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
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete the subscription. Please try again.",
      );
    }
  };

  const active = subscriptions.filter((s) => s.status === "active");
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
        <p className="text-slate-400 text-sm mb-7">
          All your subscriptions at a glance
        </p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
        </div>

        {/* Upcoming Renewals Banner */}
        {upcoming.length > 0 && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">
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
                    className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {s.name} — {daysLeft <= 0 ? "today" : `${daysLeft}d`}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscriptions Grid */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          All subscriptions
        </h3>

        {loading && (
          <p className="text-sm text-slate-500 text-center py-12">Loading…</p>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center py-12">{error}</p>
        )}

        {!loading && !error && subscriptions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-semibold text-slate-300 mb-2">
              No subscriptions yet
            </p>
            <p className="text-sm text-slate-500">
              Click <strong className="text-indigo-400">+ Add</strong> to track
              your first one.
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
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            How does it work?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/40 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-200">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-indigo-400 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">
                Add your subscriptions
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Click <strong className="text-slate-200">+ Add</strong> and
                enter your subscription details — name, price, billing frequency
                (daily, weekly, monthly or yearly) and start date. The renewal
                date is calculated automatically.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/40 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-200">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-amber-400 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">
                We track renewals for you
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                SubTrackt monitors every active subscription and automatically
                advances the renewal date each billing cycle — so your dashboard
                always shows accurate, up-to-date information.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/40 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-200">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-emerald-400 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">
                Get reminder emails
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Reminder emails are sent automatically before each renewal:
              </p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
                  <span>
                    <span className="text-slate-200 font-medium">
                      Monthly / Yearly
                    </span>{" "}
                    — 7, 3 and 1 day before
                  </span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  <span>
                    <span className="text-slate-200 font-medium">Weekly</span> —
                    3 and 1 day before
                  </span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span>
                    <span className="text-slate-200 font-medium">Daily</span> —
                    1 day before
                  </span>
                </li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Each email includes the subscription name, renewal date and
                amount due.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
