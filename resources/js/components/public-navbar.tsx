import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login, logout, register } from '@/routes';

export default function PublicNavbar() {
    const { auth } = usePage().props;

    const { cartCount } = usePage<SharedData>().props

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
                                    <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href={auth.user.role === 'admin' ? '/admin/dashboard' : '/'}
                            >
                                <Button variant="outline" size="sm">
                                    {auth.user.role === 'admin' ? 'Dashboard' : 'My Orders'}
                                </Button>
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.post(logout.url())}
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
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
