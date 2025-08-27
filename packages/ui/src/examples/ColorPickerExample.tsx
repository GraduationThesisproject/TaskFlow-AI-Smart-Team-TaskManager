import React, { useState } from 'react';
import { ColorPicker, SimpleColorPicker, CompactColorPicker, Card, CardContent, CardHeader, CardTitle, Typography, Stack, Flex } from '../index';

export const ColorPickerExample: React.FC = () => {
  const [color1, setColor1] = useState('#007ADF');
  const [color2, setColor2] = useState('#00E8C6');
  const [color3, setColor3] = useState('#10b981');
  const [color4, setColor4] = useState('#f59e0b');

  return (
    <div className="p-6 space-y-6">
      <Typography variant="heading-xl" className="mb-6">
        Color Picker Examples
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic ColorPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Basic ColorPicker</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <ColorPicker
                value={color1}
                onChange={setColor1}
                showLabel
                label="Primary Color"
                placeholder="Choose primary color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: color1 }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Color: {color1}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Simple ColorPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Simple ColorPicker</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <SimpleColorPicker
                value={color2}
                onChange={setColor2}
                placeholder="Choose accent color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: color2 }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Color: {color2}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Compact ColorPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Compact ColorPicker</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <CompactColorPicker
                value={color3}
                onChange={setColor3}
                placeholder="Choose success color..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: color3 }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Color: {color3}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Different Variants */}
        <Card>
          <CardHeader>
            <CardTitle>ColorPicker Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <ColorPicker
                value={color4}
                onChange={setColor4}
                variant="outline"
                placeholder="Outline variant..."
              />
              <ColorPicker
                value={color4}
                onChange={setColor4}
                variant="ghost"
                placeholder="Ghost variant..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: color4 }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Color: {color4}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Different Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>ColorPicker Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <ColorPicker
                value={color1}
                onChange={setColor1}
                size="sm"
                placeholder="Small size..."
              />
              <ColorPicker
                value={color2}
                onChange={setColor2}
                size="default"
                placeholder="Default size..."
              />
              <ColorPicker
                value={color3}
                onChange={setColor3}
                size="lg"
                placeholder="Large size..."
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Custom Preset Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Preset Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <ColorPicker
                value={color4}
                onChange={setColor4}
                presetColors={[
                  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
                  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
                ]}
                placeholder="Choose from custom colors..."
              />
              <div className="p-4 rounded-lg border" style={{ backgroundColor: color4 }}>
                <Typography variant="body-medium" className="text-white">
                  Selected Color: {color4}
                </Typography>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            <Typography variant="body-medium">
              The ColorPicker component provides an elegant way to select colors with:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Visual color preview with hover effects</li>
              <li>Preset color swatches for quick selection</li>
              <li>Custom color input with hex validation</li>
              <li>Multiple size variants (sm, default, lg)</li>
              <li>Multiple style variants (default, outline, ghost)</li>
              <li>Accessible keyboard navigation</li>
              <li>Responsive design that works on all devices</li>
            </ul>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
