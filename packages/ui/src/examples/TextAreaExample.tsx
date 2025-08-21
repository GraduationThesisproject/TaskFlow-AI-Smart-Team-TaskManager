import React, { useState } from 'react';
import { TextArea } from '../TextArea';
import { Card } from '../Card';
import { Typography } from '../Typography';

export const TextAreaExample: React.FC = () => {
  const [basicValue, setBasicValue] = useState('');
  const [characterCountValue, setCharacterCountValue] = useState('');
  const [autoResizeValue, setAutoResizeValue] = useState('');

  return (
    <div className="space-y-6 p-6">
      <Typography variant="h2">TextArea Examples</Typography>
      
      <Card className="p-4">
        <Typography variant="h3" className="mb-4">Basic TextArea</Typography>
        <TextArea
          placeholder="Enter your text here..."
          value={basicValue}
          onChange={(e) => setBasicValue(e.target.value)}
          rows={4}
        />
      </Card>

      <Card className="p-4">
        <Typography variant="h3" className="mb-4">TextArea with Character Count</Typography>
        <TextArea
          placeholder="Enter your text here (max 100 characters)..."
          value={characterCountValue}
          onChange={(e) => setCharacterCountValue(e.target.value)}
          maxLength={100}
          showCharacterCount={true}
          rows={3}
        />
      </Card>

      <Card className="p-4">
        <Typography variant="h3" className="mb-4">Auto-resizing TextArea</Typography>
        <TextArea
          placeholder="This textarea will automatically resize as you type..."
          value={autoResizeValue}
          onChange={(e) => setAutoResizeValue(e.target.value)}
          autoResize={true}
          rows={2}
        />
      </Card>

      <Card className="p-4">
        <Typography variant="h3" className="mb-4">Disabled TextArea</Typography>
        <TextArea
          placeholder="This textarea is disabled"
          value="This is disabled content"
          disabled
          rows={3}
        />
      </Card>

      <Card className="p-4">
        <Typography variant="h3" className="mb-4">TextArea with Custom Styling</Typography>
        <TextArea
          placeholder="Custom styled textarea..."
          className="border-blue-500 focus-visible:ring-blue-500"
          rows={3}
        />
      </Card>
    </div>
  );
};
