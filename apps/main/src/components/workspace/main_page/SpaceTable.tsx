import React, { useEffect, useState } from 'react';
import { SpaceService } from '../../../services/spaceService';
import { Button } from '@taskflow/ui';

export interface Space {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  memberCount?: number;
}

interface SpaceTableProps {
  filteredSpaces: Space[];
  isLoading: boolean;
  error: string | null;
  onRemove: (spaceId: string) => Promise<void>;
}

const SpaceTable: React.FC<SpaceTableProps> = ({
  filteredSpaces,
  isLoading,
  error,
  onRemove,
}) => {
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  // Fetch member count for each space
  useEffect(() => {
    const fetchMemberCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const space of filteredSpaces) {
        try {
          const response = await SpaceService.getSpaceMembers(space._id);
          counts[space._id] = response.data?.length || 0;
        } catch (error) {
          console.error(`Error fetching members for space ${space._id}:`, error);
          counts[space._id] = 0;
        }
      }
      
      setMemberCounts(counts);
    };

    if (filteredSpaces.length > 0) {
      fetchMemberCounts();
    }
  }, [filteredSpaces]);

  if (isLoading) {
    return <div>Loading spaces...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (filteredSpaces.length === 0) {
    return <div>No spaces found</div>;
  }

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Spaces</h3>
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
                  {memberCounts[space._id] ?? 0} members
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(space._id)}
                className="text-destructive hover:text-destructive/90"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceTable;
