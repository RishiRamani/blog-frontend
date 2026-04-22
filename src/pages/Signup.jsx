import React from "react";
import { SignUp } from "@clerk/clerk-react";
import {dark} from "@clerk/themes";

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
              Join the blog
            </p>
            <h1 className="mt-4 text-5xl font-bold text-white leading-tight">
              Sign up to create your account and start <span className="text-indigo-400">sharing your thoughts</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl">
              Create your account to access your personalized dashboard, manage your posts, and connect with our vibrant blogging community.
            </p>
          </div>

          <SignUp
            afterSignUpUrl="/"
            appearance={{
              baseTheme: dark,
              
            }}
          />
        </div>
      </div>
    </div>
  );
}
