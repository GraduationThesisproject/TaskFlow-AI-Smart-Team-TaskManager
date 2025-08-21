import Sidebar from "./Sidebar";
import {
  Card,

  CardContent,
  Button,
  Typography,
  Badge,
  Gradient,
} from "@taskflow/ui";
import { useState } from "react";

function UpgradeLayout() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  const billingOptions = [
    { key: "monthly", label: "Monthly", active: true },
    { key: "annually", label: "Annually" },
  ];

  const plans = [
    {
      key: "free",
      name: "Free",
      price: "$0 USD",
      period: "",
      desc: "For individuals or small teams looking to keep work organized.",
      cta: "Current",
      ctaVariant: "secondary" as const,
      highlighted: false,
    },
    {
      key: "standard",
      name: "Standard",
      price: "$5 USD",
      period: "per user/month (billed annually)",
      desc: "Get more done with unlimited boards, card mirroring, and more automation.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: false,
    },
    {
      key: "premium",
      name: "Premium",
      price: "$10 USD",
      period: "per user/month (billed annually)",
      desc: "Add AI to your boards and admin controls to your toolkit. Plus, get more perspective with views.",
      cta: "Upgrade",
      ctaVariant: "default" as const,
      highlighted: true,
    },
    {
      key: "enterprise",
      name: "Enterprise",
      price: "$17.50 USD",
      period: "per user (billed annually)",
      desc: "Add enterprise‑grade security and controls to your toolkit.",
      cta: "Contact Sales",
      ctaVariant: "accent" as const,
      highlighted: false,
    },
  ];

  const tableRows = [
    {
      section: "BASICS",
      items: [
        {
          label: "Unlimited cards",
          values: [true, true, true, true],
        },
        {
          label: "Boards per Workspace",
          values: ["Up to 10", "∞", "∞", "∞"],
        },
        {
          label: "Storage",
          values: ["10MB/file", "250MB/file", "250MB/file", "∞"],
        },
      ],
    },
    {
      section: "AUTOMATION",
      items: [
        {
          label: "Workspace command runs",
          values: ["250/month", "1,000/month", "∞", "∞"],
        },
        {
          label: "Advanced checklists",
          values: ["—", true, true, true],
        },
      ],
    },
    {
      section: "VIEWS",
      items: [
        {
          label: "Calendar, Timeline, Table, Dashboard",
          values: ["—", "—", true, true],
        },
      ],
    },
  ];

  // Build a flat row model to render aligned cards
  const flatRows = [
    { type: "header" as const },
    ...tableRows.flatMap((group) => [
      { type: "section" as const, section: group.section },
      ...group.items.map((it) => ({ type: "item" as const, label: it.label, values: it.values })),
    ]),
  ];

  return (
    <div className="flex min-h-screen text-[hsl(var(--foreground))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-neutral-0 ring-1 ring-accent/10 px-5 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <Typography variant="h1" className="text-3xl font-bold">
                  Upgrade account
                </Typography>
                <div className="mt-2 flex items-center gap-2">
                  <Typography variant="caption" className="text-foreground/70">
                    Billing:
                  </Typography>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-xl bg-[hsl(var(--neutral-900))] border border-[hsl(var(--accent))]/40 p-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-4 font-semibold ${
                          billingCycle === "monthly"
                            ? "bg-[hsl(var(--primary))] text-white"
                            : "text-[hsl(var(--accent))]"
                        }`}
                      >
                        Monthly
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBillingCycle("annually")}
                        className={`rounded-full px-4 font-semibold ${
                          billingCycle === "annually"
                            ? "bg-[hsl(var(--primary))] text-white"
                            : "text-[hsl(var(--accent))]"
                        }`}
                      >
                        Annually
                      </Button>
                    </div>
                    <Badge variant="accent" className="ml-1">Save 17%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Plans */}
          <Card className="bg-[hsl(var(--neutral-100))] rounded-xl border-none !border-0 ring-0 !ring-0 shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
              {plans.map((p) => (
                <div key={p.key} className="rounded-md overflow-hidden">
                  {p.highlighted ? (
                    <Gradient
                      variant="primary"
                      direction="to-r"
                      className="rounded-md"
                    >
                      <Card className="bg-transparent border-none !border-0 ring-0 !ring-0 shadow-none">
                        <CardContent className="p-6 text-center flex flex-col items-center">
                          <div className="flex items-center justify-center w-full">
                            <Typography variant="h3" textColor="white" className="font-bold">
                              {p.name}
                            </Typography>
                          </div>
                          <div className="mt-3">
                            <Typography variant="large" textColor="white" className="text-2xl font-extrabold">
                              {p.price}
                            </Typography>
                            <Typography variant="caption" textColor="white" className="opacity-90">
                              {p.period}
                            </Typography>
                          </div>
                          <Typography variant="caption" textColor="white" className="mt-3 block">
                            {p.desc}
                          </Typography>
                          {p.key !== "free" && (
                            <Button size="sm" className="mt-4 rounded-md bg-[hsl(var(--primary))] text-white">
                              {p.cta}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Gradient>
                  ) : (
                    <Card className="bg-transparent border-none !border-0 ring-0 !ring-0 shadow-none">
                      <CardContent className="p-6 text-center flex flex-col items-center">
                        <div className="flex items-center justify-center w-full gap-2">
                          <Typography variant="h3" className="text-white font-bold">
                            {p.name}
                          </Typography>
                          {p.key === "free" && (
                            <Badge className="rounded-md bg-accent text-neutral-0" variant="info">Current</Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          <Typography variant="large" className="text-2xl font-extrabold text-white">
                            {p.price}
                          </Typography>
                          {p.period && (
                            <Typography variant="caption" className="text-white/80">
                              {p.period}
                            </Typography>
                          )}
                        </div>
                        <Typography variant="caption" className="mt-3 block text-white/85">
                          {p.desc}
                        </Typography>
                        {p.key !== "free" && (
                          <Button
                            size="sm"
                            variant={p.key === "enterprise" ? "accent" : undefined}
                            className={p.key === "enterprise" ? "mt-4 rounded-md" : "mt-4 rounded-md bg-[hsl(var(--primary))] text-white"}
                          >
                            {p.cta}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Single unified features comparison (all in one container) */}
          <Card className="mt-6 overflow-hidden rounded-md border border-[hsl(var(--accent))]">
            <div className="bg-[hsl(var(--neutral-100))]">
              {/* Header row: FEATURES + Plan names */}
              <div className="grid grid-cols-5 text-xs md:text-sm">
                <div className="col-span-2 p-4 border-b border-[hsl(var(--neutral-200))]">
                  <span className="text-[hsl(var(--accent))] font-semibold tracking-wide">FEATURES</span>
                </div>
                {plans.map((p) => (
                  <div key={p.key} className="p-4 border-b border-[hsl(var(--neutral-200))] text-center text-white font-semibold">
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[hsl(var(--neutral-100))] rounded-b-md">
              {tableRows.map((group) => (
                <div key={group.section}>
                  {/* Section label row */}
                  <div className="px-4 py-2 text-[11px] tracking-wide text-accent border-t border-[hsl(var(--neutral-200))]">
                    {group.section}
                  </div>
                  {/* Feature rows */}
                  {group.items.map((row) => (
                    <div key={row.label} className="grid grid-cols-5 items-center border-t border-[hsl(var(--neutral-200))]">
                      <div className="col-span-2 p-4 text-white/90">{row.label}</div>
                      {row.values.map((v, idx) => (
                        <div key={idx} className="p-4 text-center">
                          {typeof v === "boolean" ? (
                            v ? (
                              <span className="text-[hsl(var(--accent))] text-lg leading-none">✓</span>
                            ) : (
                              <span className="text-white/60">—</span>
                            )
                          ) : v === "∞" ? (
                            <span className="text-[hsl(var(--accent))]">{v}</span>
                          ) : v === "—" ? (
                            <span className="text-white/60">{v}</span>
                          ) : (
                            <span className="text-white/85">{v}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default UpgradeLayout;