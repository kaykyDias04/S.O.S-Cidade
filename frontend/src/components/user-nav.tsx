import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "next/navigation";

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const username = (user.name || user.email || "").split("@")[0];
  const nameWithSpaces = username.replace(/\./g, " ");
  const fullName = toTitleCase(nameWithSpaces);
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "?";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <DropdownMenu>
      <div className="flex items-center gap-3 ml-auto">
        <span className="hidden sm:block text-sm font-medium text-slate-700">
          Olá, {firstName}
        </span>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-slate-200 text-sky-900 hover:bg-slate-300 cursor-pointer"
            aria-label="Menu do usuário"
          >
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarFallback className="rounded-full text-sm font-semibold text-sky-900">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        className="w-56 rounded-lg bg-white"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarFallback className="rounded-full bg-slate-200 text-xs font-semibold text-sky-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight text-black">
              <span className="truncate font-medium">{fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email || (user.role === 'GESTOR' ? 'Gestor' : 'Cidadão')}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
