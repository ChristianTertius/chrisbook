import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({ items }: { items: NavItem[] }) {
  const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isCurrentUrl(item.href)}>
                  <Link href={item.href || '#'}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return <NavCollapsibleItem key={item.title} item={item} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavCollapsibleItem({ item }: { item: NavItem }) {
  const { isCurrentOrParentUrl } = useCurrentUrl();

  const isParentActive = isCurrentOrParentUrl(item.href);
  const anyChildActive =
    item.children?.some((c) => isCurrentOrParentUrl(c.href)) ?? false;
  const isActive = isParentActive || anyChildActive;

  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <Collapsible
      asChild
      className="group/collapsible"
      open={open}
      onOpenChange={setOpen}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isCurrentOrParentUrl(subItem.href)}
                >
                  <Link href={subItem.href || '#'}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
