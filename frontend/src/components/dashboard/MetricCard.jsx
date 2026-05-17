import GlassCard from "../common/GlassCard";
import Skeleton from "../ui/Skeleton";

function MetricCard({
  icon: Icon,
  isLoading,
  label,
  tone = "cyan",
  trend,
  value,
}) {
  const tones = {
    cyan: "text-cyan-200 bg-cyan-300/10 border-cyan-300/20",
    emerald: "text-emerald-200 bg-emerald-300/10 border-emerald-300/20",
    violet: "text-violet-200 bg-violet-300/10 border-violet-300/20",
    amber: "text-amber-200 bg-amber-300/10 border-amber-300/20",
  };

  return (
    <GlassCard className="animate-rise-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-4 h-9 w-28" />
          ) : (
            <p className="mt-3 text-3xl font-black tracking-tight text-white">
              {value ?? "0"}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`rounded-lg border p-3 ${tones[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend && !isLoading && (
        <p className="mt-5 text-sm text-zinc-400">
          <span className="font-semibold text-emerald-300">
            {trend}
          </span>
        </p>
      )}
    </GlassCard>
  );
}

export default MetricCard;
