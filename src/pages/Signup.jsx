import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

export default function Signup() {
  return (<div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12"> <div className="w-full max-w-md">
    <SignUp
      afterSignUpUrl="/"
      signInUrl="/login"
      appearance={{
        baseTheme: dark,
      }}
      localization={{
        formFieldLabel__emailAddress: "Email",
        verificationLinkSent: "Enter the verification code sent to your email",
      }}
    />
  </div> </div>
  );
}
