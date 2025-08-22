import { Typography } from "@taskflow/ui";
import type { WelcomeHeaderProps } from "../../../types/dash.types";


export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ displayName }) => (
  <div className="mb-8">
    <Typography variant="h1" className="text-3xl font-bold text-foreground">
      Welcome back, {displayName}!
    </Typography>
    <Typography variant="body-medium" className="text-muted-foreground mt-2">
      Here's what's happening with your projects today.
    </Typography>
  </div>
);
