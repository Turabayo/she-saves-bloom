import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet2, LineChart, Bell, Repeat, ShieldCheck, Globe2, Download, ChevronRight, Sparkles, Layers } from "lucide-react";

/**
 * ISave — Fresh Landing (Goodbye SheSaves vibes)
 * — Dark, modern, glassy aesthetic
 * — New sections + messaging for a personal wallet (not community)
 * — Tailwind + shadcn/ui + lucide-react
 */

export default function Landing() {
  const navigate = useNavigate();

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
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-slate-100">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg">
              <span className="text-lg font-extrabold text-white">I</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">ISave</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/auth")}>Sign in</Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg hover:opacity-90" onClick={() => navigate("/auth")}>Open the app</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <div className="absolute left-[10%] top-[40%] h-[320px] w-[320px] rounded-full bg-indigo-500/20 blur-[100px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur px-3 py-1 text-xs text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              Fresh design. Personal wallet energy.
            </div>
            <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-6xl">
              Take control of your money—
              <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent"> simply</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              ISave keeps income, expenses, budgets, and goals in one calm place. No feeds. No noise. Just your wallet, upgraded.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-base font-semibold shadow-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-fuchsia-500/40" onClick={() => navigate("/auth")}>Start now</Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-white/20 bg-transparent text-base text-white hover:bg-white/10"
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
            <ul className="mt-6 grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <li className="flex items-center gap-2"><Layers className="h-4 w-4" /> Budgets, goals & insights</li>
              <li className="flex items-center gap-2"><Download className="h-4 w-4" /> Export clean statements</li>
              <li className="flex items-center gap-2"><Repeat className="h-4 w-4" /> Recurring transactions</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> PIN / biometric lock</li>
            </ul>
          </div>

          {/* Glass phone preview */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 blur-xl" />
            <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/10 backdrop-blur will-change-transform transition-transform duration-300 hover:-translate-y-0.5">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                        <Wallet2 className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm text-slate-300">ISave Wallet</p>
                    </div>
                    <p className="text-xs text-slate-400">Today, 09:30</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Balance</p>
                      <p className="mt-1 text-2xl font-bold">{fmt(245000)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">This month</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-300">+ {fmt(58200)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Budget used</p>
                      <p className="mt-1 text-2xl font-bold">62%</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Goals</p>
                      <p className="mt-1 text-2xl font-bold">2 nearly done</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Incoming
                      </div>
                      <span className="text-sm font-semibold text-emerald-300">{fmt(120000)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> Spending
                      </div>
                      <span className="text-sm font-semibold text-rose-300">{fmt(61800)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need in one wallet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-300">
            Budgets, recurring transactions, multi‑currency, and crisp statements—without the bloat.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Card key={i} className="group h-full rounded-2xl border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/[0.07] hover:-translate-y-[2px]">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500/80 p-3 text-white shadow-md">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-200">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10 bg-gradient-to-b from-slate-950 to-black">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-2 text-slate-300">From top‑up to insight in minutes.</p>
          </div>
          <ol className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-2 text-sm text-slate-400">Step {i + 1}</div>
                <div className="text-lg font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-slate-300">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white" onClick={() => navigate("/auth")}>
              Create your wallet
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <span className="text-sm font-extrabold text-white">I</span>
            </div>
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} ISave. Personal wallet, zero noise.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}