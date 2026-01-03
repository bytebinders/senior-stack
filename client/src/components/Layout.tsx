import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  ShieldAlert, 
  LayoutDashboard, 
  User,
  Menu,
  Moon,
  Sun
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full h-9 w-9 border-2"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      data-testid="button-theme-toggle"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const isAdmin = user.role === "admin";

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 font-bold text-xl text-primary px-2 mb-8 md:mb-0">
        <ShieldAlert className="h-6 w-6" />
        <span>CrimeWatch</span>
      </div>

      <nav className="flex flex-col md:flex-row gap-1 md:items-center md:ml-6">
        <Link href="/">
          <Button 
            variant={location === "/" ? "secondary" : "ghost"} 
            className="justify-start md:justify-center"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        {/* Add more links here if needed */}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <NavContent />
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full pt-4">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2 font-bold text-lg text-primary ml-2">
              <ShieldAlert className="h-5 w-5" />
              <span>CrimeWatch</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-2">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user.role} Account
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
