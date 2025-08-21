import React from "react";
import {
  Home,
  FileText,
  Star,
  Users,
  Briefcase,
  Monitor,
  Code,
  Book,
  Layers,
  Trash,
  Plus,
} from "lucide-react";

import { NavItem } from "../../components/Dashboard.Component/Templates.Components/NavItem.Component";
import { TeamItem } from "../../components/Dashboard.Component/Templates.Components/TeamItem.Component";
import { ProjectItem } from "../../components/Dashboard.Component/Templates.Components/ProjectItem.Component";
import { CategoryButton } from "../../components/Dashboard.Component/Templates.Components/CategoryButton.Component";
import { TemplateSection } from "../../components/Dashboard.Component/Templates.Components/TemplateSelection.Component";
import { Input, Typography } from "@taskflow/ui";

const Templates: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground select-none">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 flex-col text-foreground">
        {/* Logo and Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 cursor-pointer">
              <Layers className="w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:from-primary group-hover:to-accent group-hover:drop-shadow-[0_0_8px_rgba(0,122,223,0.5)] transition-all duration-300 cursor-default">
              Workspace
            </span>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/20 hover:shadow-[0_0_12px_-2px_rgba(0,122,223,0.3)] transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/30">
            <Trash size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <Input 
            placeholder="Search..." 
            className="bg-background border-border focus-visible:ring-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 transition-all duration-300 hover:border-primary/50"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-7 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground font-medium px-3">Your Workspace</p>
            <NavItem icon={<Home size={18} />} label="Dashboard" active={true} />
            <NavItem icon={<FileText size={18} />} label="All Files" />
            <NavItem icon={<Star size={18} />} label="Favorites" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground font-medium px-3">Team Mates</p>
            <TeamItem name="Sarah Wilson" status="online" />
            <TeamItem name="Mike Johnson" status="away" />
            <TeamItem name="David Chen" status="offline" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <p className="text-xs uppercase text-muted-foreground font-medium">Projects</p>
              <button className="text-muted-foreground hover:text-foreground hover:bg-accent/20 p-1.5 rounded-md hover:shadow-[0_0_10px_-2px_rgba(0,122,223,0.3)] transition-all duration-300">
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <ProjectItem label="Mobile App Design" color="bg-blue-500" />
            <ProjectItem label="Website Redesign" color="bg-emerald-500" />
            <ProjectItem label="Brand Guidelines" color="bg-purple-500" />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground font-medium px-3">Templates</p>
            <NavItem icon={<Briefcase size={18} />} label="Business" />
            <NavItem icon={<Monitor size={18} />} label="Design" />
            <NavItem icon={<Star size={18} />} label="Marketing" />
            <NavItem icon={<Book size={18} />} label="Education" />
            <NavItem icon={<Code size={18} />} label="Development" />
            <NavItem icon={<Users size={18} />} label="Team" />
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40?img=15"
              alt=""
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="text-xs text-gray-500">alex@company.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Typography variant="h2">Templates</Typography>
          <Input placeholder="Search templates..." />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <CategoryButton label="Business" icon={<Briefcase />} className="hover:shadow-[0_0_15px_-3px_rgba(0,122,223,0.4)] hover:border-primary/50" />
          <CategoryButton label="Design" icon={<Monitor />} className="hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:border-emerald-500/50" />
          <CategoryButton label="Marketing" icon={<Star />} className="hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] hover:border-amber-500/50" />
          <CategoryButton label="Education" icon={<Book />} className="hover:shadow-[0_0_15px_-3px_rgba(139,92,246,0.4)] hover:border-violet-500/50" />
          <CategoryButton label="Development" icon={<Code />} className="hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)] hover:border-blue-500/50" />
          <CategoryButton label="Team" icon={<Users />} className="hover:shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)] hover:border-pink-500/50" />
        </div>

        {/* Sections */}
        <TemplateSection
          title="New & Notable"
          templates={[
            {
              title: "Business Dashboard",
              desc: "Complete analytics dashboard for business metrics tracking",
              views: 2400,
              likes: 156,
            },
            {
              title: "Creative Portfolio",
              desc: "Showcase your creative work with this stunning portfolio",
              views: 1800,
              likes: 89,
            },
            {
              title: "Project Kanban",
              desc: "Organize your projects with this flexible kanban template",
              views: 3200,
              likes: 234,
            },
          ]}
        />

        <TemplateSection
          title="Business Templates"
          templates={[
            {
              title: "Strategy Planning",
              desc: "Plan your business strategy with comprehensive templates",
              views: 1200,
              likes: 97,
            },
            {
              title: "Meeting Notes",
              desc: "Keep track of meetings with structured note templates",
              views: 900,
              likes: 45,
            },
            {
              title: "Sales Pipeline",
              desc: "Manage your sales process from lead to close",
              views: 2100,
              likes: 112,
            },
          ]}
        />

        <TemplateSection
          title="Design Templates"
          templates={[
            {
              title: "Design System",
              desc: "Build consistent UI with comprehensive design systems",
              views: 1700,
              likes: 98,
            },
            {
              title: "Brand Guidelines",
              desc: "Define your brand identity with clear guidelines",
              views: 1300,
              likes: 76,
            },
            {
              title: "Wireframes",
              desc: "Create detailed wireframes for your next project",
              views: 890,
              likes: 54,
            },
          ]}
        />
      </main>
    </div>
  );
};

export default Templates;
