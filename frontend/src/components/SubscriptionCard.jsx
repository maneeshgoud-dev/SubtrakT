import { Link } from "react-router-dom";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  expired: "bg-red-100 text-red-600",
};

const CATEGORY_COLORS = {
  entertainment: "bg-purple-50 text-purple-700",
  sports: "bg-orange-50 text-orange-700",
  technology: "bg-cyan-50 text-cyan-700",
  finance: "bg-emerald-50 text-emerald-700",
  lifestyle: "bg-pink-50 text-pink-700",
  others: "bg-gray-50 text-gray-600",
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 capitalize ${categoryColor}`}
          >
            {category}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
            effectiveStatus === "overdue"
              ? "bg-orange-100 text-orange-600"
              : STATUS_STYLES[effectiveStatus] || STATUS_STYLES.active
          }`}
        >
          {effectiveStatus === "overdue" ? "overdue" : status}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {price}{" "}
            <span className="text-sm font-normal text-gray-400">{currency}</span>
          </p>
          <p className="text-xs text-gray-400 capitalize">{frequency}</p>
        </div>

        {(status === "active" || effectiveStatus === "overdue") && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Renews</p>
            <p className={`text-sm font-medium ${
              effectiveStatus === "overdue"
                ? "text-orange-500"
                : daysLeft <= 3
                ? "text-red-500"
                : daysLeft <= 7
                ? "text-amber-500"
                : "text-gray-700"
            }`}>
              {effectiveStatus === "overdue" ? "Overdue" : daysLeft <= 0 ? "Today" : `in ${daysLeft}d`}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <Link
          to={`/subscriptions/${_id}`}
          className="flex-1 text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
        >
          View
        </Link>
        <Link
          to={`/subscriptions/${_id}/edit`}
          className="flex-1 text-center text-xs text-gray-500 hover:text-gray-800 font-medium py-1"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(_id)}
          className="flex-1 text-center text-xs text-red-400 hover:text-red-600 font-medium py-1"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
