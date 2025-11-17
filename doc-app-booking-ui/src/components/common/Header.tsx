import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { UserCircle, LogOut } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  user: { name: string; profileImage?: string };
  onLogout: () => void;
  onProfileOpen: () => void;
  title?: string; // Optional title prop for different dashboards
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileOpen, title = "Dashboard" }) => (
  <div className="flex items-center justify-between py-2 px-4 bg-white shadow-sm rounded-lg mb-2">
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-bold text-base sm:text-lg text-blue-700 truncate">{title}</span>
    </div>
      <div className="flex items-center gap-3 shrink-0">
      <LogOut
        className="w-5 h-5 text-blue-500 bg-transparent cursor-pointer hover:text-blue-700 transition-colors"
        onClick={onLogout}
      />
      <button
        onClick={onProfileOpen}
        title="Profile"
        className="flex items-center gap-2 focus:outline-none group bg-transparent border-none p-0 m-0 cursor-pointer min-w-0"
        type="button"
      >
        <Avatar className="w-8 h-8 group-hover:ring-2 group-hover:ring-blue-400 shrink-0">
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm sm:text-base truncate group-hover:text-blue-700 transition-colors max-w-[100px] sm:max-w-none">{user.name}</span>
  <UserCircle className="w-5 h-5 text-blue-600 bg-transparent group-hover:text-blue-800 transition-colors shrink-0" />
      </button>
    </div>
  </div>
);

export default Header;