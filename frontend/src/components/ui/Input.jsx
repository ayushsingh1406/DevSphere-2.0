import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function Input({
  className = "",
  label,
  labelRight,
  error,
  type = "text",
  ...props
}) {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block space-y-2">
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label ? (
            <span className="text-sm font-medium text-[#8d807c]">
              {label}
            </span>
          ) : <span />}
          {labelRight && <div>{labelRight}</div>}
        </div>
      )}

      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`
            h-12 w-full rounded-lg border border-white/5 bg-white/[0.035]
            px-4 text-sm text-[#f8f6f3] outline-none transition-all
            placeholder:text-[#8d807c]/60
            focus:border-[#e7380d]/70 focus:bg-white/[0.055]
            focus:ring-4 focus:ring-[#e7380d]/10
            ${isPasswordField ? "pr-12" : ""}
            ${error ? "border-red-400/60 focus:border-red-300" : ""}
            ${className}
          `}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d807c] hover:text-[#edc390] transition-colors p-1"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-sm text-red-300 block animate-rise-in">
          {error}
        </span>
      )}
    </label>
  );
}

export default Input;
