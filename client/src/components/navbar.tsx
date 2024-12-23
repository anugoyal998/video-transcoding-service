import * as React from "react";
import { Menu, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/state/useAuth";
import { api } from "@/api";
import Cookies from "js-cookie";

type NavItem = {
  title: string;
  href: string;
};

const navItems: NavItem[] = [{ title: "Videos", href: "/videos" }];

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex px-4 h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Video Transcode
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileLink
              href="/"
              className="flex items-center"
              onOpenChange={setIsOpen}
            >
              <span className="font-bold">Video Transcode</span>
            </MobileLink>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navItems.map((item, index) => (
                  <MobileLink
                    key={index}
                    href={item.href}
                    onOpenChange={setIsOpen}
                  >
                    {item.title}
                  </MobileLink>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="ghost" className="w-9 px-0">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}

function UserNav() {
  const auth = useAuth((state) => state.auth);
  const [isLoading, setIsLoading] = React.useState(false);
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");
  async function handleLogout() {
    if (!accessToken || !refreshToken) return;
    try {
      setIsLoading(true);
      await api.post(
        "/auth/logout",
        { refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      window.location.reload()
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={auth.profilePhotoUrl} alt="profile-photo" />
            <AvatarFallback>{auth.name}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{auth.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {auth.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout} disabled={isLoading}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MobileLinkProps extends React.PropsWithChildren {
  href: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
}: MobileLinkProps) {
  return (
    <a
      href={href}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={cn(className)}
    >
      {children}
    </a>
  );
}
