import React from 'react';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@taskflow/ui';
import { Card, CardContent, Typography } from '@taskflow/ui';

export const AvatarThemeTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <Typography variant="h1" className="mb-4">Avatar Theme Test</Typography>
        <Typography variant="lead" className="text-muted-foreground">
          Testing theme-aware colors in both light and dark modes
        </Typography>
      </div>

      {/* Avatar Variants */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h2" className="mb-4">Avatar Color Variants</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="default">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Default</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="primary">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Primary</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="accent">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Accent</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="success">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Success</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="warning">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Warning</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="error">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Error</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="purple">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Purple</Typography>
            </div>
            <div className="text-center">
              <Avatar className="mx-auto mb-2">
                <AvatarFallback variant="blue">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Blue</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h2" className="mb-4">Status Indicators</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Avatar status="online" className="mx-auto mb-2">
                <AvatarFallback variant="primary">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Online</Typography>
            </div>
            <div className="text-center">
              <Avatar status="away" className="mx-auto mb-2">
                <AvatarFallback variant="accent">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Away</Typography>
            </div>
            <div className="text-center">
              <Avatar status="busy" className="mx-auto mb-2">
                <AvatarFallback variant="error">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Busy</Typography>
            </div>
            <div className="text-center">
              <Avatar status="offline" className="mx-auto mb-2">
                <AvatarFallback variant="default">JD</AvatarFallback>
              </Avatar>
              <Typography variant="body-small">Offline</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Group */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h2" className="mb-4">Avatar Group</Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="body-small" className="mb-2">Team Members</Typography>
              <AvatarGroup max={4}>
                <Avatar>
                  <AvatarFallback variant="primary">JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback variant="accent">JS</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback variant="success">MJ</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback variant="warning">AB</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback variant="error">CD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback variant="purple">EF</AvatarFallback>
                </Avatar>
              </AvatarGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Instructions */}
      <Card>
        <CardContent className="p-6">
          <Typography variant="h2" className="mb-4">Theme Testing</Typography>
          <Typography variant="body" className="mb-4">
            To test theme awareness:
          </Typography>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Switch between light and dark themes in your app</li>
            <li>Notice how avatar colors adapt to the theme</li>
            <li>Status indicators should be visible in both modes</li>
            <li>Gradients should maintain proper contrast</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarThemeTest;
