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
  Settings,
} from "lucide-react";

import { NavItem } from "../../components/Templates.Components/NavItem.Component";
import { TeamItem } from "../../components/Templates.Components/TeamItem.Component";
import { ProjectItem } from "../../components/Templates.Components/ProjectItem.Component";
import { CategoryButton } from "../../components/Templates.Components/CategoryButton.Component";
import { TemplateSection } from "../../components/Templates.Components/TemplateSelection.Component";
import { Input, Typography } from "@taskflow/ui";

const Templates: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Workspace</span>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <Input placeholder="Search..." />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <p className="text-xs uppercase text-gray-500 mb-2">Your Workspace</p>
          <NavItem icon={<Home />} label="Dashboard" />
          <NavItem icon={<FileText />} label="All Files" />
          <NavItem icon={<Star />} label="Favorites" />

          <p className="text-xs uppercase text-gray-500 mt-6 mb-2">Team Mates</p>
          <TeamItem name="Sarah Wilson" status="online" />
          <TeamItem name="Mike Johnson" status="away" />
          <TeamItem name="David Chen" status="offline" />

          <p className="text-xs uppercase text-gray-500 mt-6 mb-2">Projects</p>
          <ProjectItem label="Mobile App Design" color="bg-blue-500" />
          <ProjectItem label="Website Redesign" color="bg-emerald-500" />
          <ProjectItem label="Brand Guidelines" color="bg-purple-500" />

          <p className="text-xs uppercase text-gray-500 mt-6 mb-2">Templates</p>
          <NavItem icon={<Briefcase />} label="Business" />
          <NavItem icon={<Monitor />} label="Design" />
          <NavItem icon={<Star />} label="Marketing" />
          <NavItem icon={<Book />} label="Education" />
          <NavItem icon={<Code />} label="Development" />
          <NavItem icon={<Users />} label="Team" />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-neutral-800">
          <NavItem icon={<Trash />} label="Trash" />
          <NavItem icon={<Settings />} label="Change Theme" />

          <div className="flex items-center mt-4 gap-3">
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
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        {/* Header */}
        <Typography variant="h2" className="mb-4">Templates</Typography>
        <Input
          placeholder="Search templates..."
          className="mb-6"
        />

        {/* Categories */}
        <div className="flex gap-4 mb-8">
          <CategoryButton label="Business" icon={<Briefcase />} />
          <CategoryButton label="Design" icon={<Monitor />} />
          <CategoryButton label="Marketing" icon={<Star />} />
          <CategoryButton label="Education" icon={<Book />} />
          <CategoryButton label="Development" icon={<Code />} />
          <CategoryButton label="Team" icon={<Users />} />
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
