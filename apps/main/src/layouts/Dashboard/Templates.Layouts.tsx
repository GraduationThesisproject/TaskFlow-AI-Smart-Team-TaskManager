import React, { useState, useMemo } from "react";
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
  Search,
} from "lucide-react";

import { NavItem } from "../../components/Dashboard.Component/Templates.Components/NavItem.Component";
import { TeamItem } from "../../components/Dashboard.Component/Templates.Components/TeamItem.Component";
import { ProjectItem } from "../../components/Dashboard.Component/Templates.Components/ProjectItem.Component";
import { CategoryButton } from "../../components/Dashboard.Component/Templates.Components/CategoryButton.Component";
import { TemplateSection } from "../../components/Dashboard.Component/Templates.Components/TemplateSelection.Component";
import { Input, Typography } from "@taskflow/ui";

type CategoryKey = 'business' | 'design' | 'marketing' | 'education' | 'development' | 'team';

const getTemplatesByCategory = () => ({
  business: {
    title: 'Business Templates',
    templates: [
      { id: 1, title: 'Project Proposal', description: 'Professional project proposal template', category: 'business' },
      { id: 2, title: 'Meeting Notes', description: 'Structured meeting notes template', category: 'business' }
    ]
  },
  design: {
    title: 'Design Templates',
    templates: [
      { id: 3, title: 'UI Kit', description: 'Complete UI component library', category: 'design' },
      { id: 4, title: 'Wireframe', description: 'Basic wireframe template', category: 'design' }
    ]
  },
  marketing: {
    title: 'Marketing Templates',
    templates: [
      { id: 5, title: 'Campaign Plan', description: 'Marketing campaign template', category: 'marketing' }
    ]
  },
  education: {
    title: 'Education Templates',
    templates: [
      { id: 6, title: 'Lesson Plan', description: 'Structured lesson plan template', category: 'education' }
    ]
  },
  development: {
    title: 'Development Templates',
    templates: [
      { id: 7, title: 'API Documentation', description: 'API documentation template', category: 'development' }
    ]
  },
  team: {
    title: 'Team Templates',
    templates: [
      { id: 8, title: 'Team Retrospective', description: 'Team retrospective template', category: 'team' }
    ]
  }
});

const Templates: React.FC = () => {
  const templatesByCategory = getTemplatesByCategory();
  const [activeCategory, setActiveCategory] = useState<'all' | CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Define all categories
  const categories: ('all' | CategoryKey)[] = ['all', ...Object.keys(templatesByCategory) as CategoryKey[]];

  
  // Filter templates based on active category and search query
  const filteredTemplates = useMemo(() => {
    let templates = [];
    
    if (activeCategory === 'all') {
      templates = Object.values(templatesByCategory).flatMap(section => section.templates);
    } else {
      templates = templatesByCategory[activeCategory]?.templates || [];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template => 
        template.title.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query)
      );
    }
    
    // Transform the data to match the expected type
    return templates.map(template => ({
      ...template,
      id: String(template.id),
      desc: template.description,
      views: 0,
      likes: 0,
      // image is optional, so we can omit it
    }));
  }, [activeCategory, searchQuery, templatesByCategory]);

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
        <div className="px-4 py-2 relative">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-background border-border focus-visible:ring-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 transition-all duration-300 hover:border-primary/50"
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryButton 
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              icon={
                category === 'business' ? <Briefcase size={16} /> :
                category === 'design' ? <Monitor size={16} /> :
                category === 'marketing' ? <Star size={16} /> :
                category === 'education' ? <Book size={16} /> :
                category === 'development' ? <Code size={16} /> :
                category === 'team' ? <Users size={16} /> : <Layers size={16} />
              }
              className={`hover:shadow-[0_0_15px_-3px_rgba(0,122,223,0.4)] ${
                activeCategory === category 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-transparent hover:border-primary/30'
              }`}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>

        {/* Render template sections */}
        {activeCategory === 'all' ? (
          // Show all categories in sections
          Object.entries(filteredTemplates).map(([category, section]) => (
            <TemplateSection
              key={category}
              title={section.title}
              templates={section.templates}
            />
          ))
        ) : (
          // Show only the selected category with search results
          <TemplateSection
            title={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Templates`}
            templates={Array.isArray(filteredTemplates) ? filteredTemplates : filteredTemplates.templates}
          />
        )}
      </main>
    </div>
  );
};

export default Templates;
