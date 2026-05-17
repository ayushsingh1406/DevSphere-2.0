import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  registerUser,
  verifyOTP,
  setPassword,
} from "../../services/authService";

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otp_code: "",
    password: "",
  });

  const stepLabels = ["Identity", "Verify", "Password"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
      });

      setStep(2);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.email?.[0] ||
          error.response?.data?.username?.[0] ||
          "Registration failed. Please check your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await verifyOTP({
        email: formData.email,
        otp_code: formData.otp_code,
      });

      setStep(3);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.otp_code?.[0] ||
          error.response?.data?.detail ||
          "That OTP does not look right."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await setPassword({
        email: formData.email,
        password: formData.password,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.password?.[0] || "Failed to set password";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        w-full max-w-md animate-rise-in rounded-xl border border-white/5
        bg-white/[0.035] p-6 shadow-xl
        backdrop-blur-2xl sm:p-8
      "
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#edc390]">
        Developer onboarding
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-[#f8f6f3] sm:text-4xl">
        Create your account
      </h1>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {stepLabels.map((label, index) => (
          <div
            className={`h-1.5 rounded-full transition-colors ${
              step >= index + 1 ? "bg-[#edc390]" : "bg-white/5"
            }`}
            key={label}
            title={label}
          />
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <Input
            type="text"
            name="username"
            label="Username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Button className="w-full" isLoading={isLoading} type="submit">
            Send OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="mt-8 space-y-5">
          <Input
            type="text"
            name="otp_code"
            label="One-time password"
            placeholder="Enter OTP"
            value={formData.otp_code}
            onChange={handleChange}
            required
          />

          <Button className="w-full" isLoading={isLoading} type="submit">
            Verify OTP
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSetPassword} className="mt-8 space-y-5">
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button className="w-full" isLoading={isLoading} type="submit">
            Complete Registration
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#8d807c]">
        Already have an account?{" "}
        <button
          className="font-semibold text-[#edc390] hover:text-[#f8f6f3] transition-colors"
          onClick={() => navigate("/login")}
          type="button"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default RegisterPage;
