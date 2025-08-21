import Sidebar from "./Sidebar";
import CalendarIcon from "../../components/workspace/reports-page/CalendarIcon";
import PeopleIcon from "../../components/workspace/reports-page/PeopleIcon";
import CheckSquareIcon from "../../components/workspace/reports-page/CheckSquareIcon";
import ClockIcon from "../../components/workspace/reports-page/ClockIcon";
import BellIcon from "../../components/workspace/reports-page/BellIcon";
import ExportIcon from "../../components/workspace/reports-page/ExportIcon";
import {
  Card,
  CardTitle,
  CardContent,
  Button,
  Typography,
  Gradient,
  Avatar,
  AvatarFallback,
} from "@taskflow/ui";

function LineChartMock() {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-40 text-[hsl(var(--accent))]">
      <rect x="0" y="0" width="320" height="160" rx="8" className="fill-transparent" />
      {[1,2,3,4].map((i) => (
        <line key={i} x1={i*64} y1="16" x2={i*64} y2="144" className="stroke-white/10" strokeWidth="1" />
      ))}
      {[1,2,3,4].map((i) => (
        <line key={i} x1="16" y1={i*32} x2="304" y2={i*32} className="stroke-white/10" strokeWidth="1" />
      ))}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        points="32,120 96,96 160,80 224,60 288,52"
      />
      {[{x:32,y:120},{x:96,y:96},{x:160,y:80},{x:224,y:60},{x:288,y:52}].map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-current" />
      ))}
    </svg>
  );
}

function PieChartMock() {
  // Simple donut via two arcs
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-40 w-40">
        <circle cx="100" cy="100" r="70" className="fill-[hsl(var(--neutral-200))]" />
        <path d="M100 30 A70 70 0 0 1 168 118 L100 100 Z" className="fill-[hsl(var(--accent))]" />
        <path d="M168 118 A70 70 0 0 1 60 160 L100 100 Z" className="fill-[hsl(var(--primary))]" />
        <path d="M60 160 A70 70 0 0 1 100 30 L100 100 Z" className="fill-foreground/40" />
        <circle cx="100" cy="100" r="45" className="fill-[hsl(var(--neutral-100))]" />
      </svg>
    </div>
  );
}

function BarChartMock() {
  const bars = [46, 38, 42, 34, 40];
  const labels = ["Alex", "Sarah", "Mike", "Emma", "John"];
  return (
    <svg viewBox="0 0 640 220" className="w-full h-56">
      <rect x="0" y="0" width="640" height="220" rx="8" className="fill-transparent" />
      {[1,2,3,4].map((i) => (
        <line key={i} x1="32" y1={i*40} x2="608" y2={i*40} className="stroke-white/10" strokeWidth="1" />
      ))}
      {bars.map((v, i) => {
        const x = 64 + i * 110;
        const h = v * 3; // scale
        const y = 200 - h;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width="60" height={h} rx="8" fill={`url(#g${i})`} />
            <text x={x + 30} y="212" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ReportsLayout() {
  return (
    <div className="flex min-h-screen text-[hsl(var(--foreground))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-0">
        <div className="px-5 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between border-b border-neutral-200">
            <Typography variant="h1" className="text-3xl font-bold mb-4">
              Reports
            </Typography>
            <div className="flex gap-2">
              <Button className="rounded-xl" variant="outline" size="sm">
                <span className="mr-2 inline-flex items-center"><CalendarIcon size={15} className="text-[hsl(var(--accent))]" /></span>
                Date Range
              </Button>
              <Button className="rounded-xl" variant="outline" size="sm">
                <span className="mr-2 inline-flex items-center"><PeopleIcon size={15} className="text-[hsl(var(--accent))]" /></span>
                Project
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            {/* Left content column */}
            <div className="space-y-6">
              {/* Row 1: two charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[hsl(var(--neutral-100))] border border-[hsl(var(--neutral-200))] rounded-xl">
                  <CardContent className="p-5">
                    <CardTitle className="mb-2">Task Completion Over Time</CardTitle>
                    <div className="rounded-md bg-[hsl(var(--neutral-100))] p-3">
                      <LineChartMock />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--neutral-100))] border border-[hsl(var(--neutral-200))] rounded-xl">
                  <CardContent className="p-5">
                    <CardTitle className="mb-2">Task Distribution by Status</CardTitle>
                    <div className="rounded-md bg-[hsl(var(--neutral-100))] p-3 flex items-center justify-center">
                      <PieChartMock />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: big bar chart */}
              <Card className="overflow-hidden  border-0 rounded-xl">
                <Gradient variant="primary" direction="to-r" className="p-0 rounded-xl bg-neutral-100">
                  <div className="p-5 bg-neutral-100">
                    <Typography variant="h3" className="text-white mb-3">
                      Team Member Contributions
                    </Typography>
                    <div className="rounded-sm bg-black/30 backdrop-blur-sm p-3 border border-white/10">
                      <BarChartMock />
                    </div>
                  </div>
                </Gradient>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 py-2">
                <Button variant="ghost" className="rounded-xl px-4 bg-neutral-200">Cancel</Button>
                <Button variant="secondary" className="rounded-xl px-4">Save</Button>
                <Button variant="gradient" className="rounded-xl px-5">
                  <span className="mr-2 inline-flex items-center" aria-hidden>
                    <ExportIcon size={14} className="text-current" />
                  </span>
                  Export Report
                </Button>
              </div>
            </div>

            {/* Right column: analytics summary */}
            <aside className=" border-l border-[hsl(var(--neutral-200))] border-h-full">
              <Card className="bg-neutral-0 border-0">
                <CardContent className="p-5 space-y-4">
                  <Typography variant="h3">Analytics Summary</Typography>

                  <div className=" flex flex-col justify-start rounded-xl bg-neutral-100 border border-[hsl(var(--neutral-200))] p-4">                   
                      <div className="flex items-center">
                        <CheckSquareIcon size={50} className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_hsl(var(--accent))]" />
                        <Typography variant="small" className="text-muted-foreground">Tasks Completed</Typography>
                      </div>
                      <Typography variant="large">87%</Typography>       
                  </div>

                  <div className="rounded-xl bg-neutral-100 border border-[hsl(var(--neutral-200))] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ClockIcon size={22} className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_hsl(var(--accent))]" />
                      <Typography variant="small" className="justify-self-start text-muted-foreground">Avg Completion Time</Typography>
                    </div>
                    <Typography variant="large" className="justify-self-start">2.4 days</Typography>
                  </div>

                  <div className="rounded-xl bg-neutral-100 border border-[hsl(var(--neutral-200))] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BellIcon size={22} className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_hsl(var(--accent))]" />
                      <Typography variant="small" className="justify-self-start text-muted-foreground">Top Contributor</Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback variant="accent">AC</AvatarFallback>
                      </Avatar>
                      <Typography variant="p">Alex Chen</Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportsLayout;