import React, { useEffect, useState } from 'react';
import { SpaceService } from '../../../services/spaceService';
import { Button } from '@taskflow/ui';
import type { Space } from '../../../types/space.types';
import type { SpaceTableProps } from '../../../../types/interfaces/ui';

const SpaceTable: React.FC<SpaceTableProps> = ({
  filteredSpaces,
  isLoading,
  error,
  onRemove,
  onAddSpace,
}) => {
  if (isLoading) {
    return <div>Loading spaces...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (filteredSpaces.length === 0) {
    return (
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Spaces</h3>
          <Button onClick={onAddSpace} size="sm">
            Add Space
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No spaces found</p>
          <p className="text-sm mt-2">Create your first space to get started</p>
        </div>
      </div>
    );
  }

  // Safety check to ensure filteredSpaces is an array
  if (!Array.isArray(filteredSpaces)) {
    console.error('filteredSpaces is not an array:', filteredSpaces);
    return <div className="text-red-500">Error: Invalid spaces data</div>;
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Spaces</h3>
        <Button onClick={onAddSpace} size="sm">
          Add Space
        </Button>
      </div>
      <div className="space-y-3">
        {filteredSpaces.map((space) => (
          <div 
            key={space._id}
            className="p-4 bg-background rounded-lg shadow-md border border-border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{space.name}</h4>
                {space.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {space.description}
                  </p>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  {space.members.length} members
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to archive "${space.name}"? This action can be undone later.`)) {
                    onRemove(space._id);
                  }
                }}
                className="text-destructive hover:text-destructive/90"
              >
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceTable;
