import { Heart, Eye } from "lucide-react";
import { Card, CardContent, CardTitle, Typography } from "@taskflow/ui";
import { formatNumber } from "@taskflow/utils";

interface TemplateSectionProps {
  title: string;
  templates: {
    title: string;
    desc: string;
    views: number;
    likes: number;
    image?: string;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden transition-all duration-500 cursor-pointer
          border border-border/50 hover:border-primary/40
          hover:shadow-[0_0_25px_-5px_rgba(0,122,223,0.2)] hover:shadow-primary/20
          bg-gradient-to-br from-card to-card/90
          hover:before:opacity-100
          before:absolute before:inset-0 before:bg-[radial-gradient(800px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(0,122,223,0.1),transparent_40%)]
          before:opacity-0 before:transition-opacity before:duration-500
          after:absolute after:inset-0 after:bg-[radial-gradient(600px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(0,122,223,0.1),transparent_40%)]
          after:opacity-0 after:transition-opacity after:duration-500"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
          }}
        >
          <CardContent className="p-0 relative z-10">
            <div className="relative pt-[56.25%] bg-gradient-to-br from-muted/10 to-muted/20 overflow-hidden">
              {template.image ? (
                <img 
                  src={template.image}
                  alt={template.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
              )}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 group-hover:border-primary/30 transition-colors">
                  <Eye className="w-3 h-3" />
                  {formatNumber(template.views)}
                </span>
                <span className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 group-hover:border-primary/30 transition-colors">
                  <Heart className="w-3 h-3 fill-current group-hover:text-red-400 transition-colors" />
                  {formatNumber(template.likes)}
                </span>
              </div>
            </div>
            <div className="p-4 relative z-10">
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </CardTitle>
              <Typography 
                variant="muted" 
                className="mt-1 line-clamp-2 min-h-[2.5rem] group-hover:text-foreground/80 transition-colors"
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