import { Link } from "react-router-dom";

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-slate-500/15 text-slate-400",
  expired: "bg-red-500/15 text-red-400",
};

const CATEGORY_COLORS = {
  entertainment: "bg-purple-500/15 text-purple-400",
  sports: "bg-orange-500/15 text-orange-400",
  technology: "bg-cyan-500/15 text-cyan-400",
  finance: "bg-emerald-500/15 text-emerald-400",
  lifestyle: "bg-pink-500/15 text-pink-400",
  others: "bg-slate-500/15 text-slate-400",
};

export default function SubscriptionCard({ subscription, onDelete }) {
  const { _id, name, price, currency, frequency, category, status, renewalDate } =
    subscription;

  const daysLeft = Math.round(
    (new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Safety net: if backend hasn't auto-advanced yet, treat as overdue in the UI
  const effectiveStatus = status === "active" && daysLeft < 0 ? "overdue" : status;

  const categoryColor =
    CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.others;

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/40 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 capitalize ${categoryColor}`}>
            {category}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
            effectiveStatus === "overdue"
              ? "bg-orange-500/15 text-orange-400"
              : STATUS_STYLES[effectiveStatus] || STATUS_STYLES.active
          }`}
        >
          {effectiveStatus === "overdue" ? "overdue" : status}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {price}{" "}
            <span className="text-sm font-normal text-slate-400">{currency}</span>
          </p>
          <p className="text-xs text-slate-500 capitalize">{frequency}</p>
        </div>

        {(status === "active" || effectiveStatus === "overdue") && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Renews</p>
            <p className={`text-sm font-semibold ${
              effectiveStatus === "overdue"
                ? "text-orange-400"
                : daysLeft <= 3
                ? "text-red-400"
                : daysLeft <= 7
                ? "text-amber-400"
                : "text-slate-200"
            }`}>
              {effectiveStatus === "overdue" ? "Overdue" : daysLeft <= 0 ? "Today" : `in ${daysLeft}d`}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-700/50">
        <Link
          to={`/subscriptions/${_id}`}
          className="flex-1 text-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
        >
          View
        </Link>
        <Link
          to={`/subscriptions/${_id}/edit`}
          className="flex-1 text-center text-xs text-slate-400 hover:text-slate-200 font-semibold py-1.5 rounded-lg hover:bg-slate-500/10 transition-all"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(_id)}
          className="flex-1 text-center text-xs text-red-400 hover:text-red-300 font-semibold py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
