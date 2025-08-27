import React, { useState } from 'react';
import { ColorPicker, IconPicker, Card, CardContent, CardHeader, CardTitle, Typography, Stack, Flex } from '@taskflow/ui';

export const ColumnStylingDemo: React.FC = () => {
  const [backgroundColor, setBackgroundColor] = useState('#F9FAFB');
  const [icon, setIcon] = useState<string | null>('📋');

  return (
    <div className="p-6 space-y-6">
      <Typography variant="heading-xl" className="mb-6">
        Column Styling Demo
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Column Styling Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="lg">
              <div>
                <Typography variant="body-medium" className="mb-2">
                  Background Color
                </Typography>
                <ColorPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  placeholder="Choose background color..."
                  showLabel={false}
                  size="default"
                  variant="outline"
                />
              </div>

              <div>
                <Typography variant="body-medium" className="mb-2">
                  Column Icon
                </Typography>
                <IconPicker
                  value={icon}
                  onChange={setIcon}
                  placeholder="Choose column icon..."
                  showLabel={false}
                  size="default"
                  variant="outline"
                />
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Column Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-lg border-2 border-dashed border-border"
              style={{ backgroundColor }}
            >
              <div className="flex items-center gap-3 mb-4">
                {icon && (
                  <span className="text-2xl">{icon}</span>
                )}
                <Typography variant="h4" className="font-bold">
                  Sample Column
                </Typography>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 bg-white/50 rounded border">
                  <Typography variant="body-small">Sample Task 1</Typography>
                </div>
                <div className="p-3 bg-white/50 rounded border">
                  <Typography variant="body-small">Sample Task 2</Typography>
                </div>
                <div className="p-3 bg-white/50 rounded border">
                  <Typography variant="body-small">Sample Task 3</Typography>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            <Typography variant="body-medium">
              The ColorPicker and IconPicker components work together to provide elegant column styling:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Background Color:</strong> Click the color preview to open the color picker with preset colors and custom hex input</li>
              <li><strong>Column Icon:</strong> Click the icon preview to choose from 100+ preset icons or enter custom emojis</li>
              <li><strong>Real-time Preview:</strong> See your changes immediately in the preview panel</li>
              <li><strong>Validation:</strong> Color picker validates hex colors, icon picker supports emoji input</li>
              <li><strong>Accessibility:</strong> Both components support keyboard navigation and screen readers</li>
            </ul>
          </Stack>
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            <Typography variant="body-medium">
              Here's how to integrate these components in your column modals:
            </Typography>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// In your column modal or form
import { ColorPicker, IconPicker } from '@taskflow/ui';

const [backgroundColor, setBackgroundColor] = useState('#F9FAFB');
const [icon, setIcon] = useState<string | null>(null);

// Background Color Picker
<ColorPicker
  value={backgroundColor}
  onChange={setBackgroundColor}
  placeholder="Choose background color..."
  showLabel
  label="Background Color"
  size="default"
  variant="outline"
/>

// Icon Picker
<IconPicker
  value={icon}
  onChange={setIcon}
  placeholder="Choose column icon..."
  showLabel
  label="Column Icon"
  size="default"
  variant="outline"
/>

// When saving the column
await onSave({
  name: columnName,
  backgroundColor,
  icon,
  // ... other properties
});`}
            </pre>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
