import { useState } from "react";
import { BaseNavbar, NavbarLeft, NavbarCenter, NavbarRight } from "../authNav/BaseNavbar";
import { Logo } from "../authNav/Logo";
import { MenuButton } from "./MenuButton";
import { NavigationActions } from "./NavigationActions";
import { SearchBar } from "./SearchBar";
import { DashboardActions } from "./DashboardActions";
import { NotificationButton } from "./NotificationButton";
import { UserProfile } from "../../../dashboard/UserProfile";

interface DashboardNavbarProps {
  user?: {
    user?: {
      name?: string;
      avatar?: string;
    };
  };
  onLogout?: () => void;
}

export default function DashboardNavbar({ user, onLogout }: DashboardNavbarProps) {
  const [notificationCount] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BaseNavbar className="">
      <NavbarLeft>
        <MenuButton 
          isOpen={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <Logo />
        <NavigationActions className="ml-8" />
      </NavbarLeft>

      <NavbarCenter>
        <SearchBar className="mx-8" />
      </NavbarCenter>

      <NavbarRight>
        <DashboardActions />
        <NotificationButton count={notificationCount} />
        <UserProfile user={user} onLogout={onLogout} />
      </NavbarRight>
    </BaseNavbar>
  );
}
