import { AlertCircle, Inbox } from "lucide-react";

function StatusMessage({
  action,
  message,
  title,
  type = "empty",
}) {
  const Icon = type === "error" ? AlertCircle : Inbox;

  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-white/[0.02] p-6 text-center">
      <div className="mb-3 rounded-lg border border-white/5 bg-white/[0.04] p-3 text-[#8d807c]">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-[#f8f6f3]">
        {title}
      </h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm leading-6 text-[#8d807c]">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default StatusMessage;
