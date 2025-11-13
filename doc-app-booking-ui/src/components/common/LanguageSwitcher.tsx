import { Globe } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="w-5 h-5 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-[9999] min-w-[120px]"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={16}
      >
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'bg-blue-50 font-medium' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('ta')}
          className={locale === 'ta' ? 'bg-blue-50 font-medium' : ''}
        >
          தமிழ்
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
