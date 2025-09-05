import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownSeparator, Avatar, AvatarFallback } from '@taskflow/ui';
import { User, LogOut } from 'lucide-react';

export const DropdownTest: React.FC = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-lg font-semibold">Dropdown Test</h2>
      
      <Dropdown
        trigger={
          <Button variant="ghost" className="gap-2 px-3 h-10">
            <Avatar size="sm" className="flex-shrink-0">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-[120px] text-foreground">
              Regular User
            </span>
          </Button>
        }
      >
        <DropdownItem>
          <User className="h-4 w-4 mr-2" />
          <span>View Profile</span>
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem variant="destructive">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export default DropdownTest;
