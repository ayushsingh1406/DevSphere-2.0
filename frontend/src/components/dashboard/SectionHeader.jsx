function SectionHeader({
  action,
  eyebrow,
  subtitle,
  title,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-bold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;
