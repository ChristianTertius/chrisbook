import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            ChrisBook
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ChrisBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
