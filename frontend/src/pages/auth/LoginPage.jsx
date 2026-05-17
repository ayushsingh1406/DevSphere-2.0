import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../../services/authService";
import { saveTokens } from "../../utils/auth";

function LoginPage() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Multi-Stage States
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const data = await loginUser(formData);
      saveTokens(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "We could not verify those credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 1: Request OTP for Forgot Password
  const handleRequestRecoveryOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await forgotPassword({ email: forgotEmail });
      setSuccessMsg("OTP dispatched securely to your email address.");
      setRecoveryStep(2);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.email?.[0] ||
          error.response?.data?.detail ||
          "No user registered with this email address."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 2: Verify OTP
  const handleVerifyRecoveryOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await verifyOTP({
        email: forgotEmail,
        otp_code: otpCode,
      });
      setSuccessMsg("OTP authorization successful. Please configure your new password.");
      setRecoveryStep(3);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.otp_code?.[0] ||
          error.response?.data?.error ||
          "Invalid or expired OTP code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 3: Complete Password Reset
  const handleCompletePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await resetPassword({
        email: forgotEmail,
        password: newPassword,
      });

      // Transition smoothly back to Login mode
      setSuccessMsg("Password successfully reset! You can now authenticate using your new password.");
      setIsForgotPasswordMode(false);
      setRecoveryStep(1);
      setOtpCode("");
      setNewPassword("");
      
      // Auto-populate login field with the recovered email for smooth user convenience
      setFormData((prev) => ({
        ...prev,
        login: forgotEmail,
        password: "",
      }));
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.password?.[0] ||
          error.response?.data?.error ||
          "Failed to reset password. Please ensure it meets criteria."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRecovery = () => {
    setIsForgotPasswordMode(false);
    setRecoveryStep(1);
    setError("");
    setSuccessMsg("");
    setForgotEmail("");
    setOtpCode("");
    setNewPassword("");
  };

  return (
    <div
      className="
        w-full max-w-md animate-rise-in rounded-xl border border-white/5
        bg-white/[0.035] p-6 shadow-xl
        backdrop-blur-2xl sm:p-8
      "
    >
      {isForgotPasswordMode ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#edc390]">
            Account Recovery
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#f8f6f3] sm:text-4xl">
            {recoveryStep === 1 && "Reset Password"}
            {recoveryStep === 2 && "Verify Security OTP"}
            {recoveryStep === 3 && "Secure New Password"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8d807c]">
            {recoveryStep === 1 && "Enter your registered developer email address to receive secure reset instructions."}
            {recoveryStep === 2 && `We dispatched a verification token to ${forgotEmail}. Please submit it below.`}
            {recoveryStep === 3 && "Configure a strong, production-grade credential for your DevSphere command center."}
          </p>

          {/* Indicator rail for progress */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {["Email", "Token", "Reset"].map((label, index) => (
              <div
                key={label}
                title={label}
                className={`h-1.5 rounded-full transition-colors ${
                  recoveryStep >= index + 1 ? "bg-[#edc390]" : "bg-white/5"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-rise-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 animate-rise-in">
              {successMsg}
            </div>
          )}

          {recoveryStep === 1 && (
            <form onSubmit={handleRequestRecoveryOTP} className="mt-8 space-y-5">
              <Input
                type="email"
                name="forgotEmail"
                label="Registered Email Address"
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />

              <Button className="w-full" isLoading={isLoading} type="submit">
                Dispatch OTP
              </Button>
            </form>
          )}

          {recoveryStep === 2 && (
            <form onSubmit={handleVerifyRecoveryOTP} className="mt-8 space-y-5">
              <Input
                type="text"
                name="otpCode"
                label="One-Time Verification Token"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />

              <Button className="w-full" isLoading={isLoading} type="submit">
                Authorize OTP
              </Button>
            </form>
          )}

          {recoveryStep === 3 && (
            <form onSubmit={handleCompletePasswordReset} className="mt-8 space-y-5">
              <Input
                type="password"
                name="newPassword"
                label="New Password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Button className="w-full" isLoading={isLoading} type="submit">
                Finalize Secure Reset
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#8d807c]">
            Remembered your credentials?{" "}
            <button
              className="font-semibold text-[#edc390] hover:text-[#f8f6f3] transition-colors"
              onClick={handleCancelRecovery}
              type="button"
            >
              Back to Sign in
            </button>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#edc390]">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#f8f6f3] sm:text-4xl">
            Sign in to DevSphere
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8d807c]">
            Return to your developer growth cockpit and keep your streak alive.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-rise-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 animate-rise-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            <Input
              type="text"
              name="login"
              label="Username or email"
              placeholder="Username or Email"
              value={formData.login}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              labelRight={
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(true);
                    setRecoveryStep(1);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-xs font-semibold text-[#edc390] hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              }
            />

            <Button className="w-full" isLoading={isLoading} type="submit">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8d807c]">
            New here?{" "}
            <button
              className="font-semibold text-[#edc390] hover:text-[#f8f6f3] transition-colors"
              onClick={() => navigate("/register")}
              type="button"
            >
              Create an account
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
