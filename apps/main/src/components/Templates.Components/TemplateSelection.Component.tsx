import { Heart, Eye } from "lucide-react";
import { Card, CardContent, CardTitle, Typography } from "@taskflow/ui";
import { formatNumber } from "@taskflow/utils";

export const TemplateSection: React.FC<{
  title: string;
  templates: { title: string; desc: string; views: number; likes: number }[];
}> = ({ title, templates }) => (
  <div className="mb-10">
    <Typography variant="h3" className="mb-4">{title}</Typography>
    <div className="grid grid-cols-3 gap-5">
      {templates.map((t, i) => (
        <Card key={i} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
          <CardContent className="p-0 overflow-hidden">
            <div className="h-36 w-full bg-neutral-800" />
            <div className="p-4">
              <CardTitle className="text-base font-medium">{t.title}</CardTitle>
              <Typography variant="muted" as="p" className="mt-1">
                {t.desc}
              </Typography>
              <div className="flex gap-4 text-xs text-gray-400 mt-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {formatNumber(Math.round(t.views))}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {formatNumber(Math.round(t.likes))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);