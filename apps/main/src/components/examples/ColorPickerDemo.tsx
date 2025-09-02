import React, { useState } from 'react';
import { ColorPicker, SimpleColorPicker, CompactColorPicker, Card, CardContent, CardHeader, CardTitle, Typography, Stack, Flex } from '@taskflow/ui';

export const ColorPickerDemo: React.FC = () => {
  const [columnColor, setColumnColor] = useState('#007ADF');
  const [taskColor, setTaskColor] = useState('#00E8C6');
  const [labelColor, setLabelColor] = useState('#10b981');

  return (
    <div className="p-6 space-y-6">
      <Typography variant="heading-xl" className="mb-6">
        Color Picker Demo
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Column Color Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <ColorPicker
                value={columnColor}
                onChange={setColumnColor}
                showLabel
                label="Column Color"
                placeholder="Choose column color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: columnColor }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Column Color: {columnColor}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Task Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Task Color Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <SimpleColorPicker
                value={taskColor}
                onChange={setTaskColor}
                placeholder="Choose task color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: taskColor }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Task Color: {taskColor}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Label Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Label Color Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <CompactColorPicker
                value={labelColor}
                onChange={setLabelColor}
                placeholder="Choose label color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: labelColor }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Label Color: {labelColor}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <Typography variant="body-medium">
                The ColorPicker component provides an elegant way to select colors:
              </Typography>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click the color preview button to open the color picker</li>
                <li>Choose from preset colors or use the custom color picker</li>
                <li>Type hex values directly in the text input</li>
                <li>Real-time validation ensures valid hex colors</li>
                <li>Multiple size and variant options available</li>
              </ul>
            </Stack>
          </CardContent>
        </Card>
      </div>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            <Typography variant="body-medium">
              Here&apos;s how to integrate the ColorPicker in your column components:
            </Typography>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// In your column modal or form
import { ColorPicker } from '@taskflow/ui';

const [columnColor, setColumnColor] = useState('#007ADF');

<ColorPicker
  value={columnColor}
  onChange={setColumnColor}
  placeholder="Choose column color..."
  showLabel
  label="Column Color"
  size="default"
  variant="outline"
/>`}
            </pre>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
