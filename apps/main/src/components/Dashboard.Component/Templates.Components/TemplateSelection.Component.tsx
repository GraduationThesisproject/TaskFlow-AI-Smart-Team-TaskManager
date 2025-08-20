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
          className="group hover:border-primary/30 transition-colors overflow-hidden"
        >
          <CardContent className="p-0">
            <div className="relative pt-[56.25%] bg-muted/20 overflow-hidden">
              {template.image ? (
                <img 
                  src={template.image}
                  alt={template.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
              )}
            </div>
            <div className="p-4">
              <CardTitle className="text-base font-medium text-foreground">
                {template.title}
              </CardTitle>
              <Typography 
                variant="muted" 
                className="mt-1 line-clamp-2 min-h-[2.5rem]"
              >
                {template.desc}
              </Typography>
              <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> 
                  {formatNumber(template.views)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> 
                  {formatNumber(template.likes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);