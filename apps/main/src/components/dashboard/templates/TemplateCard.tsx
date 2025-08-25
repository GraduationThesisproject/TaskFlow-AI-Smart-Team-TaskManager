import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Typography, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import { Heart } from 'lucide-react';
import type { TemplateCardProps } from '../../../types/dash.types';

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick, onLike }) => {
  return (
    <Card className="cursor-pointer rounded-lg overflow-hidden backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow" onClick={() => onClick(template)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{template.title}</CardTitle>
            <Typography variant="body-small" className="text-muted-foreground mb-3">
              {template.description}
            </Typography>
          </div>
          <Badge variant="secondary">{template.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Avatar size="sm">
            <AvatarImage src={template.author.avatar} />
            <AvatarFallback variant="primary" size="sm">
              {template.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Typography variant="caption" className="text-muted-foreground">
            by {template.author.name}
          </Typography>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <span>{template.views} views</span>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:text-foreground ${template.userLiked ? 'text-red-600' : ''}`}
              onClick={(e) => { e.stopPropagation(); onLike?.(template); }}
              aria-pressed={template.userLiked ? 'true' : 'false'}
              aria-label="Like template"
            >
              <Heart className="h-4 w-4" fill={template.userLiked ? 'currentColor' : 'none'} />
              <span>{template.likes}</span>
            </button>
          </div>
          <Typography variant="caption" className="ml-auto whitespace-nowrap">
            {new Date(template.updatedAt).toLocaleDateString()}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
