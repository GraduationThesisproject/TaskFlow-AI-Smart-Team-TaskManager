import { Heart, Eye } from "lucide-react";
import { Card, CardContent, CardTitle, Typography } from "@taskflow/ui";
import { formatNumber } from "@taskflow/utils";

interface TemplateSectionProps {
  title: string;
  templates: {
    id: string;
    title: string;
    desc: string;
    views: number;
    likes: number;
    image?: string;
    category: string;
  }[];
  className?: string;
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  title,
  templates,
  className = ''
}) => (
  <div className={`mb-10 ${className}`}>
    <Typography variant="h3" className="mb-4 text-foreground">{title}</Typography>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template, index) => (
        <Card 
          key={index} 
          className="group relative h-full flex flex-col overflow-hidden transition-all duration-500 cursor-pointer
          border border-border/50 hover:border-primary/40
          hover:shadow-[0_0_25px_-5px_rgba(0,122,223,0.2)] hover:shadow-primary/20
          bg-gradient-to-br from-card to-card/90"
        >
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="relative h-36 overflow-hidden group">
              <div className={`absolute inset-0 ${
                template.category === 'development' ? 'bg-gradient-to-br from-blue-900/90 to-blue-700/90' :
                template.category === 'marketing' ? 'bg-gradient-to-br from-purple-900/90 to-pink-800/90' :
                template.category === 'hr' ? 'bg-gradient-to-br from-emerald-900/90 to-teal-800/90' :
                template.category === 'design' ? 'bg-gradient-to-br from-rose-900/90 to-fuchsia-800/90' :
                'bg-gradient-to-br from-gray-900/90 to-slate-800/90'
              }`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-5xl font-bold opacity-10 group-hover:opacity-20 transition-all duration-500 ${
                    template.category === 'development' ? 'text-blue-300' :
                    template.category === 'marketing' ? 'text-purple-300' :
                    template.category === 'hr' ? 'text-emerald-300' :
                    template.category === 'design' ? 'text-rose-300' : 'text-gray-300'
                  }`}>
                    {template.title.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]`} />
                <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent`} />
                <div className="absolute inset-0.5 border border-white/10 rounded-t-md group-hover:border-white/30 transition-all duration-300" />
                <div className={`absolute -inset-1 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  template.category === 'development' ? 'bg-blue-500/30' :
                  template.category === 'marketing' ? 'bg-purple-500/30' :
                  template.category === 'hr' ? 'bg-emerald-500/30' :
                  template.category === 'design' ? 'bg-rose-500/30' : 'bg-gray-500/30'
                }`} style={{
                  filter: 'blur(12px)'
                }} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
                <span className={`flex items-center gap-1 text-xs backdrop-blur-sm px-3 py-1.5 rounded-full border ${
                  template.category === 'development' ? 'border-blue-400/30 bg-blue-900/40 text-blue-100' :
                  template.category === 'marketing' ? 'border-purple-400/30 bg-purple-900/40 text-purple-100' :
                  template.category === 'hr' ? 'border-emerald-400/30 bg-emerald-900/40 text-emerald-100' :
                  template.category === 'design' ? 'border-rose-400/30 bg-rose-900/40 text-rose-100' :
                  'border-gray-400/30 bg-gray-900/40 text-gray-100'
                } group-hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300`}>
                  <Eye className="w-3 h-3" />
                  {formatNumber(template.views)}
                </span>
                <span className={`flex items-center gap-1 text-xs backdrop-blur-sm px-3 py-1.5 rounded-full border ${
                  template.category === 'development' ? 'border-blue-400/30 bg-blue-900/40 text-blue-100' :
                  template.category === 'marketing' ? 'border-purple-400/30 bg-purple-900/40 text-purple-100' :
                  template.category === 'hr' ? 'border-emerald-400/30 bg-emerald-900/40 text-emerald-100' :
                  template.category === 'design' ? 'border-rose-400/30 bg-rose-900/40 text-rose-100' :
                  'border-gray-400/30 bg-gray-900/40 text-gray-100'
                } group-hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300`}>
                  <Heart className="w-3 h-3" />
                  {formatNumber(template.likes)}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </CardTitle>
              <Typography 
                variant="muted" 
                className="mt-1 line-clamp-2 text-sm group-hover:text-foreground/80 transition-colors"
              >
                {template.desc}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);