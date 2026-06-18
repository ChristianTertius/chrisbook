import { useEffect, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
  store as addressStore,
  update as addressUpdate,
  destroy as addressDestroy,
} from '@/actions/App/Http/Controllers/AddressController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Address, Region } from '@/types/address';
import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import SessionFlashWatcher from '@/components/session-flash-watcher';

type FormShape = {
  recipient_name: string;
  phone: string;
  full_address: string;
  province_id: string;
  province_name: string;
  city_id: string;
  city_name: string;
  postal_code: string;
  is_default: boolean;
};

const empty: FormShape = {
  recipient_name: '',
  phone: '',
  full_address: '',
  province_id: '',
  province_name: '',
  city_id: '',
  city_name: '',
  postal_code: '',
  is_default: false,
};

export default function AddressIndex({
  addresses,
  provinces = [],
}: {
  addresses: Address[];
  provinces?: Region[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [cities, setCities] = useState<Region[]>([]);
  const { data, setData, post, put, processing, reset, errors } =
    useForm<FormShape>(empty);

  // muat kota saat provinsi berubah
  useEffect(() => {
    if (!data.province_id) {
      setCities([]);
      return;
    }
    fetch(`/shipping/cities?province_id=${data.province_id}`)
      .then((r) => r.json())
      .then((rows: Region[]) => setCities(rows))
      .catch(() => toast.error('Gagal memuat daftar kota.'));
  }, [data.province_id]);

  function openCreate() {
    setEditing(null);
    reset();
    setOpen(true);
  }

  function openEdit(a: Address) {
    setEditing(a);
    setData({
      recipient_name: a.recipient_name,
      phone: a.phone,
      full_address: a.full_address,
      province_id: a.province_id,
      province_name: a.province_name,
      city_id: a.city_id,
      city_name: a.city_name,
      postal_code: a.postal_code ?? '',
      is_default: a.is_default,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const opts = {
      preserveScroll: true,
      onSuccess: () => {
        setOpen(false);
        reset();
        toast.success(editing ? 'Alamat diperbarui' : 'Alamat ditambahkan');
      },
      onError: () => toast.error('Periksa kembali isian form.'),
    };
    if (editing) {
      put(addressUpdate({ address: editing.id }).url, opts);
    } else {
      post(addressStore().url, opts);
    }
  }

  function confirmDelete(a: Address) {
    router.delete(addressDestroy({ address: a.id }).url, {
      preserveScroll: true,
      onSuccess: () => toast.success('Alamat dihapus'),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Head title="Alamat Saya" />
      <PublicNavbar />
      <SessionFlashWatcher />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Alamat Saya</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="mr-1 h-4 w-4" /> Tambah Alamat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? 'Edit Alamat' : 'Tambah Alamat'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <div>
                    <Label htmlFor="recipient_name">Nama Penerima</Label>
                    <Input
                      id="recipient_name"
                      value={data.recipient_name}
                      onChange={(e) =>
                        setData('recipient_name', e.target.value)
                      }
                    />
                    {errors.recipient_name && (
                      <p className="text-xs text-destructive">
                        {errors.recipient_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">No. HP</Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="full_address">Alamat Lengkap</Label>
                    <Textarea
                      id="full_address"
                      value={data.full_address}
                      onChange={(e) => setData('full_address', e.target.value)}
                    />
                    {errors.full_address && (
                      <p className="text-xs text-destructive">
                        {errors.full_address}
                      </p>
                    )}
                  </div>

                  {/* Provinsi */}
                  <div>
                    <Label>Provinsi</Label>
                    <Select
                      value={data.province_id}
                      onValueChange={(val) => {
                        const prov = provinces.find((p) => p.id === val);
                        setData((prev) => ({
                          ...prev,
                          province_id: val,
                          province_name: prov?.name ?? '',
                          city_id: '',
                          city_name: '', // reset kota
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kota */}
                  <div>
                    <Label>Kota / Kabupaten</Label>
                    <Select
                      value={data.city_id}
                      disabled={!data.province_id}
                      onValueChange={(val) => {
                        const city = cities.find((c) => c.id === val);
                        setData((prev) => ({
                          ...prev,
                          city_id: val,
                          city_name: city?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kota" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="postal_code">Kode Pos (opsional)</Label>
                    <Input
                      id="postal_code"
                      value={data.postal_code}
                      onChange={(e) => setData('postal_code', e.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={data.is_default}
                      onCheckedChange={(v) => setData('is_default', Boolean(v))}
                    />
                    Jadikan alamat utama
                  </label>

                  <DialogFooter>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Daftar alamat */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {addresses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada alamat tersimpan.
              </p>
            )}
            {addresses.map((a) => (
              <div key={a.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {a.recipient_name}
                      {a.is_default && <Badge className="ml-2">Utama</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(a)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus alamat ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Alamat “{a.recipient_name}” akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDelete(a)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="mt-2 text-sm">{a.full_address}</p>
                <p className="text-sm text-muted-foreground">
                  {a.city_name}, {a.province_name} {a.postal_code}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
