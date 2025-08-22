import React from "react";
import { Routes, Route } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@taskflow/ui";
import { Button } from "@taskflow/ui";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  CreditCard, 
  Trash2, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Bell,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../store";
import { logoutUser } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import HomeLayout from "./Home.Layouts";
import SettingsLayout from "./Settings.Layouts";
import { Avatar, AvatarImage, AvatarFallback } from "@taskflow/ui";
import { Typography } from "@taskflow/ui";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, title = "Dashboard" }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser({ allDevices: false }));
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <header className="border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <Typography variant="heading-large" className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TaskFlow AI
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
                  <AvatarFallback variant="primary">
                    {user?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <Typography variant="body-medium" className="font-medium">
                    {user?.user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {user?.user?.email}
                  </Typography>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/workspace")}>
                <Users className="h-4 w-4 mr-2" />
                Workspaces
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="mb-6">
              <Typography variant="heading-large" className="font-bold">
                {title}
              </Typography>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
