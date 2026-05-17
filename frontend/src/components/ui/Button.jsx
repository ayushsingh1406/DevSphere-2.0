const variants = {
  primary:
    "bg-[#e7380d] text-[#f8f6f3] shadow-sm hover:bg-[#c66b3b]",
  secondary:
    "border border-[#8d807c]/30 bg-[#505b90]/20 text-[#f8f6f3] hover:border-[#edc390]/50 hover:bg-[#505b90]/40",
  ghost:
    "text-[#8d807c] hover:bg-white/[0.07] hover:text-[#f8f6f3]",
  danger:
    "border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/15",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

function Button({
  children,
  className = "",
  isLoading = false,
  size = "md",
  variant = "primary",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        outline-none transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-[#e7380d] focus-visible:ring-offset-2
        focus-visible:ring-offset-[#1d1917]
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
