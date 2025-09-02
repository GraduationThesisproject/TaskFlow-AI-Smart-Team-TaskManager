import { useState } from "react";
import { Button, Avatar, AvatarImage, AvatarFallback } from "@taskflow/ui";
import { ThemeToggleButton } from "../common/navbar/authNav/ThemeToggleButton";
import { LogOut } from "lucide-react";
import type { User, UserProfileProps } from "../../types/interfaces/ui";

export function UserProfile({ user, onLogout, className = "" }: UserProfileProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowLogoutConfirm(false);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <ThemeToggleButton />

      {/* User Info and Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <Avatar size="sm">
            {user?.user?.avatar && (
              <AvatarImage src={user.user.avatar} alt={user.user.name || 'User'} />
            )}
            <AvatarFallback variant="primary">
              {user?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {user?.user?.name || 'User'}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
