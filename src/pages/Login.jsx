import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../context/AuthProvider";
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

// Toast Notification Component
function Toast({ message, type = "error", onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top duration-300 ${
      type === "error" 
        ? "bg-red-900/90 border-red-700 text-red-100" 
        : "bg-green-900/90 border-green-700 text-green-100"
    }`}>
      <AlertCircle size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue to RBlogsЯ</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">
          <Formik
            initialValues={{ email: "", password: "" }}
            validate={(values) => {
              const errors = {};
              if (!values.email) {
                errors.email = "Email is required";
              } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = "Invalid email address";
              }
              if (!values.password) {
                errors.password = "Password is required";
              } else if (values.password.length < 6) {
                errors.password = "Password must be at least 6 characters";
              }
              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              const { data, error } = await login(values.email, values.password);
              setSubmitting(false);
              
              if (error) {
                // Check for 403 session expired
                if (error.status === 403) {
                  setToast({ 
                    message: "Your session has expired. Please login again.", 
                    type: "error" 
                  });
                } else {
                  setToast({ 
                    message: error.message || "Login failed. Please check your credentials.", 
                    type: "error" 
                  });
                }
              } else {
                setToast({ 
                  message: "Login successful! Redirecting...", 
                  type: "success" 
                });
                setTimeout(() => nav("/"), 1000);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Field
                      name="email"
                      type="email"
                      className={`w-full pl-11 pr-4 py-3 bg-gray-800 border ${
                        errors.email && touched.email 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-700 focus:ring-indigo-500"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <ErrorMessage 
                    name="email" 
                    component="div" 
                    className="text-red-400 text-sm mt-1 flex items-center gap-1"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full pl-11 pr-12 py-3 bg-gray-800 border ${
                        errors.password && touched.password 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-700 focus:ring-indigo-500"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <ErrorMessage 
                    name="password" 
                    component="div" 
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Sign In
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}