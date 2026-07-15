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
  const inputClass = "w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all";
  const selectClass = "w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Subscription name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          required
          placeholder="Netflix, Spotify…"
          className={inputClass}
        />
      </div>

      {/* Price + Currency */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            required
            min="0"
            step="0.01"
            placeholder="9.99"
            className={inputClass}
          />
        </div>
        <div className="w-28">
          <label className={labelClass}>Currency</label>
          <select name="currency" value={form.currency} onChange={onChange} className={selectClass}>
            {CURRENCIES.map((c) => (<option key={c}>{c}</option>))}
          </select>
        </div>
      </div>

      {/* Frequency + Category */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Frequency</label>
          <select name="frequency" value={form.frequency} onChange={onChange} className={`${selectClass} capitalize`}>
            {FREQUENCIES.map((f) => (<option key={f} className="capitalize">{f}</option>))}
          </select>
        </div>
        <div className="flex-1">
          <label className={labelClass}>Category</label>
          <select name="category" value={form.category} onChange={onChange} className={`${selectClass} capitalize`}>
            {CATEGORIES.map((c) => (<option key={c} className="capitalize">{c}</option>))}
          </select>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className={labelClass}>Payment method</label>
        <input
          type="text"
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={onChange}
          required
          placeholder="Credit card, PayPal…"
          className={inputClass}
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <select name="status" value={form.status} onChange={onChange} className={`${selectClass} capitalize`}>
          {STATUSES.map((s) => (<option key={s} className="capitalize">{s}</option>))}
        </select>
      </div>

      {/* Start date + Renewal date */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
            max={todayStr()}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>
            Renewal date{" "}
            <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="renewalDate"
            value={form.renewalDate}
            onChange={onChange}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-indigo-500/30"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
