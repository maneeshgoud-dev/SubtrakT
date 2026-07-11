import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const styles =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-red-50 border-red-200 text-red-600";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-md ${styles}`}
    >
      {message}
    </div>
  );
}
