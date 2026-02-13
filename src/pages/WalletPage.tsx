import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, IndianRupee, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { transactions, balance, isLoading } = useWallet();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Wallet</h2>

      {/* Balance Card */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
        <CardContent className="p-6">
          <p className="text-sm opacity-80">Available Balance</p>
          <div className="mt-1 flex items-baseline gap-1">
            <IndianRupee className="h-6 w-6" />
            <span className="font-display text-4xl font-bold">{balance}</span>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5 text-sm opacity-80">
              <TrendingUp className="h-4 w-4" />
              <span>{transactions.filter((t: any) => t.type === "credit").length} credits</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm opacity-80">
              <ArrowUpRight className="h-4 w-4" />
              <span>{transactions.filter((t: any) => t.type === "debit").length} debits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Wallet className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Earn credits through referrals and rewards</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border px-3 py-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    t.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {t.type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.created_at), "MMM dd, yyyy • HH:mm")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn("font-semibold", t.type === "credit" ? "text-success" : "text-destructive")}>
                      {t.type === "credit" ? "+" : "-"}₹{Math.abs(t.amount)}
                    </span>
                    <p className="text-[10px] text-muted-foreground">Bal: ₹{t.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
