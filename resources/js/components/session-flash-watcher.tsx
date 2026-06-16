import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FlashProps = { flash?: { success?: string; error?: string } };

export default function SessionFlashWatcher() {
  const { flash } = usePage<FlashProps>().props;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return null;
}
