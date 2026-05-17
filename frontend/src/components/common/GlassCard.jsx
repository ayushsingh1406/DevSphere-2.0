function GlassCard({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`
        rounded-xl border border-white/5 bg-white/[0.035] p-5
        shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl
        transition-all duration-300 hover:border-[#edc390]/20 hover:bg-white/[0.055]
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlassCard;
