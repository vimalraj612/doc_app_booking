import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { UserCircle, LogOut } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  user: { name: string; profileImage?: string };
  onLogout: () => void;
  onProfileOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileOpen }) => (
  <div className="flex items-center justify-between py-2 px-4 bg-white shadow-sm rounded-lg mb-2">
    <div className="flex items-center gap-2">
      <span className="font-bold text-lg text-blue-700">Patient Dashboard</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onProfileOpen}
        title="Profile"
        className="flex items-center gap-2 focus:outline-none group bg-transparent border-none p-0 m-0 cursor-pointer"
        type="button"
      >
        <Avatar className="w-8 h-8 group-hover:ring-2 group-hover:ring-blue-400">
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-base whitespace-nowrap group-hover:text-blue-700 transition-colors">{user.name}</span>
  <UserCircle className="w-5 h-5 text-blue-600 group-hover:text-blue-800 transition-colors" />
      </button>
      <LogOut
        className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
        onClick={onLogout}
      />
    </div>
  </div>
);

export default Header;