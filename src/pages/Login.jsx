import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
              Welcome back
            </p>
            <h1 className="mt-4 text-5xl font-bold text-white leading-tight">
              Sign in with your account to continue <span className="text-indigo-400">exploring blogs</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl">
              Access your personalized dashboard, manage your posts, and connect with our vibrant blogging community.
            </p>
          </div>

          <SignIn
            afterSignInUrl="/"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: "#4f46e5",
                colorBackground: "#111827",
                colorInputBackground: "#111827",
                colorInputBorder: "#374151",
                colorText: "#f3f4f6",
                colorTextSecondary: "#cbd5e1",
                colorDanger: "#f87171",
              },
              elements: {
                rootBox: "max-w-md mx-auto w-full",
                card: "bg-gray-900/95 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur",
                headerTitle: "text-3xl font-bold text-white",
                headerSubtitle: "text-gray-400",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
                formFieldInput: "bg-gray-800 border border-gray-700 text-white",
                formFieldLabel: "text-gray-300",
                socialButtonsBlockButton: "bg-gray-800 border border-gray-700 text-gray-100 hover:bg-gray-700",
                socialButtonsBlockButtonText: "text-gray-100",
                dividerLine: "bg-gray-700",
                dividerText: "text-gray-500",
                footer: "bg-transparent",
                footerActionLink: "text-indigo-400 hover:text-indigo-300",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
