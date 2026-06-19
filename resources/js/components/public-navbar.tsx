import { Link, usePage, router } from '@inertiajs/react';
import {
  BookOpen,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { login, logout, register } from '@/routes';

export default function PublicNavbar() {
  const { auth } = usePage().props;
  const { cartCount } = usePage<{ cartCount: number }>().props as {
    cartCount: number;
  };
  const initials = auth.user
    ? auth.user.name
        .split(' ')
        .map((s: string) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-6 w-6 text-primary" />
          ChrisBook
        </Link>

        <nav className="flex items-center gap-4">
          {auth.user ? (
            <>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{auth.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {auth.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/addresses" className="cursor-pointer">
                        <MapPin className="mr-2 h-4 w-4" />
                        My Addresses
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {auth.user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Settings
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/settings/profile"
                            className="cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/settings/security"
                            className="cursor-pointer"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Security
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.post(logout.url())}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href={login()}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href={register()}>
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
