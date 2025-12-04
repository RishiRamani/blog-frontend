import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust path
import { useNavigate } from "react-router-dom";

export default function EmailConfirm() {
  const nav = useNavigate();

  useEffect(() => {
    const run = async () => {

      const { data, error } = await supabase.auth.getSession();

      // Optionally force refresh auth session:
      await supabase.auth.refreshSession();

      // Redirect user to login after confirmation
      nav("/login");
    };

    run();
  }, []);

  return (
    <div className="text-white flex items-center justify-center h-screen">
      <p className="text-lg">Confirming your email... Please wait.</p>
    </div>
  );
}
