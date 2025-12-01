import { useState } from "react";

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); 
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const errors = {};

    if (!form.username) errors.username = "Username is required";
    if (!form.password) errors.password = "Password is required";

    if (!isLogin) {
      if (!form.email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (form.password !== form.confirm) {
        errors.confirm = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = isLogin
        ? `${import.meta.env.VITE_API_URL}/login`
        : `${import.meta.env.VITE_API_URL}/register`;

      const body = isLogin
        ? { username: form.username, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        onLogin(data.access_token);
      } else {
        setSuccessMessage("User registered successfully! You can now log in.");
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirm: "" });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`px-4 py-2 font-semibold ${isLogin ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`px-4 py-2 font-semibold ${!isLogin ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
          >
            Register
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`w-full border px-3 py-2 rounded ${formErrors.username ? "border-red-500" : ""}`}
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
          </div>

          {!isLogin && (
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`w-full border px-3 py-2 rounded ${formErrors.email ? "border-red-500" : ""}`}
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
            </div>
          )}

          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`w-full border px-3 py-2 rounded ${formErrors.password ? "border-red-500" : ""}`}
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
          </div>

          {!isLogin && (
            <div className="mb-4">
              <input
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                className={`w-full border px-3 py-2 rounded ${formErrors.confirm ? "border-red-500" : ""}`}
                value={form.confirm}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {formErrors.confirm && <p className="text-red-500 text-sm">{formErrors.confirm}</p>}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 rounded ${isLogin ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white font-semibold transition`}
            disabled={loading}
          >
            {loading ? (isLogin ? "Logging in..." : "Registering...") : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
