import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet2, LineChart, Bell, Repeat, ShieldCheck, Globe2, Download, ChevronRight, Sparkles, Layers, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * ISave — Fresh Landing (Goodbye SheSaves vibes)
 * — Dark, modern, glassy aesthetic
 * — New sections + messaging for a personal wallet (not community)
 * — Tailwind + shadcn/ui + lucide-react
 */

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const fmt = (n: number, currency = "RWF") =>
    new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 })
      .format(n)
      .replace(/\s+/g, " ");

  const features = [
    {
      icon: Wallet2,
      title: "Wallet-first by design",
      desc: "A clean home to add money, track spending, and watch savings grow in real time.",
    },
    {
      icon: LineChart,
      title: "Clarity you can act on",
      desc: "See monthly trends, category breakdowns, and goal progress without the clutter.",
    },
    {
      icon: Repeat,
      title: "Recurring made simple",
      desc: "Auto‑log salary, rent, and subscriptions with flexible schedules.",
    },
    {
      icon: ShieldCheck,
      title: "Private & secure",
      desc: "Local PIN / biometric lock and transparent controls for your data.",
    },
    {
      icon: Globe2,
      title: "Multi‑currency ready",
      desc: "RWF by default with optional USD/EUR for travel and online purchases.",
    },
    {
      icon: Bell,
      title: "Smart nudges",
      desc: "Know when a budget is near its limit or a goal is within reach.",
    },
  ];

  const steps = [
    { title: "Connect", text: "Link mobile money for easy top‑ups (withdraw optional)." },
    { title: "Track", text: "Add income & expenses, set budgets, create goals." },
    { title: "Understand", text: "View insights, trends, and category breakdowns." },
    { title: "Achieve", text: "Hit goals and export clean monthly statements." },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary shadow-lg">
              <span className="text-lg font-extrabold text-white">I</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">ISave</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>Sign in</Button>
            <Button className="bg-primary text-white shadow-lg hover:bg-primary/90" onClick={() => navigate("/auth")}>Open the app</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute left-[10%] top-[40%] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-6xl text-foreground">
              Take control of your money—
              <span className="text-primary"> simply</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Smart savings. Simple control.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-xl bg-primary text-white text-base font-semibold shadow-lg hover:bg-primary/90" onClick={() => navigate("/auth")}>Start now</Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl text-base"
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See how it works
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Hero bullets */}
            <ul className="mt-6 grid max-w-xl grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2"><Layers className="h-4 w-4" /> Budgets, goals & insights</li>
              <li className="flex items-center gap-2"><Download className="h-4 w-4" /> Export clean statements</li>
              <li className="flex items-center gap-2"><Repeat className="h-4 w-4" /> Recurring transactions</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> PIN / biometric lock</li>
            </ul>
          </div>

          {/* Glass phone preview */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/10 blur-xl" />
            <Card className="overflow-hidden rounded-3xl border-border bg-card backdrop-blur will-change-transform transition-transform duration-300 hover:-translate-y-0.5">
              <CardContent className="p-0">
                <div className="bg-card p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
                        <Wallet2 className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground">ISave Wallet</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Today, 09:30</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{fmt(245000)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">This month</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-500">+ {fmt(58200)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Budget used</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">62%</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Goals</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">2 nearly done</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Incoming
                      </div>
                      <span className="text-sm font-semibold text-emerald-500">{fmt(120000)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" /> Spending
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">{fmt(61800)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Everything you need in one wallet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Budgets, recurring transactions, multi‑currency, and crisp statements—without the bloat.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Card key={i} className="group h-full rounded-2xl border-border bg-card p-6 transition hover:bg-accent/5 hover:-translate-y-[2px]">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary p-3 text-white shadow-md">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">How it works</h2>
            <p className="mt-2 text-muted-foreground">From top‑up to insight in minutes.</p>
          </div>
          <ol className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 text-sm text-muted-foreground">Step {i + 1}</div>
                <div className="text-lg font-semibold text-foreground">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <Button className="rounded-xl bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/auth")}>
              Create your wallet
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
              <span className="text-sm font-extrabold text-white">I</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ISave. Personal wallet, zero noise.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}