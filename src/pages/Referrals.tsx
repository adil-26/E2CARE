import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Send, CheckCircle2, Users, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Referrals() {
  const { referrals, referralCode, totalEarned, sendReferral } = useReferrals();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  const handleSend = () => {
    if (!email) return;
    sendReferral.mutate(email, {
      onSuccess: () => {
        toast({ title: "Referral Sent!", description: `Invitation sent to ${email}` });
        setEmail("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send referral.", variant: "destructive" });
      },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Refer & Earn</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-success" />
            <p className="text-2xl font-bold text-foreground">
              {referrals.filter((r: any) => r.status === "completed").length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <IndianRupee className="mx-auto mb-1 h-5 w-5 text-warning" />
            <p className="text-2xl font-bold text-foreground">₹{totalEarned}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4 text-primary" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
              <span className="font-mono text-xl font-bold tracking-widest text-primary">
                {referralCode || "Loading..."}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy} title="Copy code">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Share this code with friends. You both earn ₹50 when they sign up!
          </p>
        </CardContent>
      </Card>

      {/* Send Invite */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Send Invite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSend} disabled={sendReferral.isPending || !email}>
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No referrals yet. Share your code to start earning!
            </p>
          ) : (
            <div className="space-y-2">
              {referrals.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.referred_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge variant={r.status === "completed" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
