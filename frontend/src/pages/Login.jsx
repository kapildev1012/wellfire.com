import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { FaEye, FaEyeSlash, FaChevronRight, FaSpinner } from "react-icons/fa";

const fields = {
  Login: [
    {
      id: "email",
      type: "email",
      placeholder: "Email",
      autoComplete: "email",
      required: true,
    },
    {
      id: "password",
      type: "password",
      placeholder: "Password",
      autoComplete: "current-password",
      required: true,
    },
  ],
  "Sign Up": [
    {
      id: "name",
      type: "text",
      placeholder: "Full Name",
      autoComplete: "name",
      required: true,
    },
    {
      id: "email",
      type: "email",
      placeholder: "Email",
      autoComplete: "email",
      required: true,
    },
    {
      id: "password",
      type: "password",
      placeholder: "Password",
      autoComplete: "new-password",
      required: true,
    },
  ],
};

const validate = (mode, values) => {
  const errors = {};
  if (mode === "Sign Up" && !values.name.trim()) errors.name = "Name required";
  if (!values.email.trim()) errors.email = "Email required";
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Invalid email";
  if (!values.password) errors.password = "Password required";
  else if (values.password.length < 8) errors.password = "Min 8 characters";
  return errors;
};

const InputField = ({
  field,
  value,
  error,
  onChange,
  showPassword,
  togglePassword,
}) => (
  <div className="mb-5 relative">
    <label htmlFor={field.id} className="sr-only">
      {field.placeholder}
    </label>
    <input
      id={field.id}
      type={
        field.type === "password"
          ? showPassword
            ? "text"
            : "password"
          : field.type
      }
      name={field.id}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
      required={field.required}
      value={value}
      onChange={onChange}
      className={`w-full px-5 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
        error ? "border-orange-500" : "border-gray-600"
      }`}
    />
    {field.type === "password" && (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    )}
    {error && (
      <p className="text-orange-500 text-xs mt-1 animate-pulse">{error}</p>
    )}
  </div>
);

const Login = () => {
  const [mode, setMode] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  const handleChange = (e) =>
    setValues({ ...values, [e.target.name]: e.target.value });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const errs = validate(mode, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setIsLoading(true);
    try {
      const endpoint = mode === "Sign Up" ? "/register" : "/login";
      const body =
        mode === "Sign Up"
          ? values
          : { email: values.email, password: values.password };
      const { data } = await axios.post(
        `${backendUrl}/api/user${endpoint}`,
        body
      );

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 tracking-wide">
          WELLFIRE
        </h1>
      </header>

      <form
        onSubmit={onSubmitHandler}
        className="bg-black/80 backdrop-blur-sm rounded-xl p-8 w-full max-w-md border border-gray-800 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === "Login" ? "Sign In" : "Create Account"}
        </h2>

        {errors.general && (
          <div className="mb-4 bg-orange-900/70 border border-orange-500 text-orange-200 p-3 rounded text-sm text-center">
            {errors.general}
          </div>
        )}

        {fields[mode].map((field) => (
          <InputField
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            onChange={handleChange}
            showPassword={showPassword}
            togglePassword={() => setShowPassword((s) => !s)}
          />
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
            isLoading
              ? "bg-red-700/70 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaChevronRight />
          )}
          {isLoading
            ? "Processing..."
            : mode === "Login"
            ? "Sign In"
            : "Sign Up"}
        </button>

        <div className="mt-5 text-gray-400 text-sm text-center">
          {mode === "Login" ? "New to Wellfire?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setMode(mode === "Login" ? "Sign Up" : "Login")}
            className="text-white ml-2 hover:underline"
          >
            {mode === "Login" ? "Sign up now" : "Sign in"}
          </button>
        </div>
      </form>

      <footer className="mt-4 text-center text-gray-500 text-xs">
        This page is protected by reCAPTCHA to ensure you're not a bot.
      </footer>
    </div>
  );
};

export default Login;
