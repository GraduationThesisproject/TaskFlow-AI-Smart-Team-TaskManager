import React, { useState } from 'react';
import { Button, Typography } from '@taskflow/ui';
import { Plus } from 'lucide-react';
import { CreateTemplateModal } from './modals/CreateTemplateModal';

const TemplatesHeader: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const handleCreate = () => setIsCreateOpen(true);
  const handleClose = () => setIsCreateOpen(false);

  return (
    <div className="mb-6 rounded-lg p-4 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Templates
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            Browse and use professional templates for your projects
          </Typography>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal isOpen={isCreateOpen} onClose={handleClose} />
    </div>
  );
};

export default TemplatesHeader;
