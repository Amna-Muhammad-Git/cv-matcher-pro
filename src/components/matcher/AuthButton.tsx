import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span className="mono-label hidden sm:inline-flex items-center gap-1.5">
          <User className="h-3 w-3" /> {email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Signed out");
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link to="/auth">
        <LogIn className="h-3.5 w-3.5" /> Sign in
      </Link>
    </Button>
  );
}
