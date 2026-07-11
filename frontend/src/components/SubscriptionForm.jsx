const CURRENCIES = ["RUP", "USD", "EUR"];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];
const CATEGORIES = [
  "sports",
  "entertainment",
  "technology",
  "finance",
  "lifestyle",
  "others",
];
const STATUSES = ["active", "cancelled", "expired"];

const todayStr = () => new Date().toISOString().split("T")[0];

export const defaultForm = {
  name: "",
  price: "",
  currency: "RUP",
  frequency: "monthly",
  category: "entertainment",
  paymentMethod: "",
  status: "active",
  startDate: todayStr(),
  renewalDate: "",
};

export default function SubscriptionForm({ form, onChange, onSubmit, loading, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscription name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          required
          placeholder="Netflix, Spotify…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Price + Currency */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            required
            min="0"
            step="0.01"
            placeholder="9.99"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            value={form.currency}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Frequency + Category */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} className="capitalize">
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment method
        </label>
        <input
          type="text"
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={onChange}
          required
          placeholder="Credit card, PayPal…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Start date + Renewal date */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start date
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
            max={todayStr()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Renewal date{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="renewalDate"
            value={form.renewalDate}
            onChange={onChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
