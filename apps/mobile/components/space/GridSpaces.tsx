import React from 'react';
import { View } from 'react-native';
import SpaceCard from '@/components/common/SpaceCard';
import PremiumSpaceCard from '@/components/common/PremiumSpaceCard';

export type GridSpacesProps = {
  spaces: any[];
  previewTile?: number;
  isSpaceLocked: (space: any, index: number) => boolean;
  getSpaceMemberCount: (space: any) => number;
  onOpenSpace: (space: any) => void;
  onToggleArchive: (spaceId: string, spaceName: string, archived: boolean) => void;
};

export default function GridSpaces({
  spaces = [],
  previewTile,
  isSpaceLocked,
  getSpaceMemberCount,
  onOpenSpace,
  onToggleArchive,
}: GridSpacesProps) {
  const computeArchived = (s: any): boolean => {
    const status = String(s?.status || '').toLowerCase();
    return s?.isArchived === true || s?.archived === true || status === 'archived' || status === 'inactive';
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {spaces.map((space: any, index: number) => {
        const archived = computeArchived(space);
        if (isSpaceLocked(space, index)) {
          return (
            <PremiumSpaceCard
              key={space._id || space.id}
              name={space.name}
              description={space.description}
              membersCount={getSpaceMemberCount(space)}
              icon={space.icon || '📂'}
              isArchived={archived}
              createdAt={space.createdAt || space.created_at || space.createdOn || space.created || space.createdDate}
              tileSize={previewTile}
              onPress={() => onOpenSpace(space)}
              onToggleArchive={() => onToggleArchive(space._id || space.id, space.name, archived)}
              isLocked={true}
              lockReason="This space requires Premium"
              benefits={[
                'Unlimited spaces (currently limited to 5)',
                'Advanced analytics',
                'Priority support',
                'Custom integrations',
              ]}
            />
          );
        }

        return (
          <SpaceCard
            key={space._id || space.id}
            name={space.name}
            description={space.description}
            membersCount={getSpaceMemberCount(space)}
            icon={space.icon || '📂'}
            isArchived={archived}
            createdAt={space.createdAt || space.created_at || space.createdOn || space.created || space.createdDate}
            tileSize={previewTile}
            boardsCount={Array.isArray((space as any)?.boards) ? (space as any).boards.length : ((space as any)?.stats?.totalBoards || 0)}
            onPress={() => onOpenSpace(space)}
            onToggleArchive={() => onToggleArchive(space._id || space.id, space.name, archived)}
          />
        );
      })}
    </View>
  );
}


