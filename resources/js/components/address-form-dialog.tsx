import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { store as addressStore } from '@/actions/App/Http/Controllers/AddressController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import SearchSelect from '@/components/search-select';
import type { Region } from '@/types/address';

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

export default function AddressFormDialog({
  open,
  onOpenChange,
  provinces = [],
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinces?: Region[];
  onSuccess?: () => void;
}) {
  const [cities, setCities] = useState<Region[]>([]);
  const { data, setData, post, processing, reset, errors } =
    useForm<FormShape>(empty);

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

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(addressStore().url, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onOpenChange(false);
        toast.success('Alamat ditambahkan');
        onSuccess?.();
      },
      onError: () => toast.error('Periksa kembali isian form.'),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Alamat Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="recipient_name">Nama Penerima</Label>
            <Input
              id="recipient_name"
              value={data.recipient_name}
              onChange={(e) => setData('recipient_name', e.target.value)}
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
              <p className="text-xs text-destructive">{errors.full_address}</p>
            )}
          </div>

          <div>
            <Label>Provinsi</Label>
            <SearchSelect
              options={provinces.map((p) => ({ value: p.id, label: p.name }))}
              value={data.province_id}
              onValueChange={(val) => {
                const prov = provinces.find((p) => p.id === val);
                setData((prev) => ({
                  ...prev,
                  province_id: val,
                  province_name: prov?.name ?? '',
                  city_id: '',
                  city_name: '',
                }));
              }}
              placeholder="Pilih provinsi"
              searchPlaceholder="Cari provinsi..."
            />
          </div>

          <div>
            <Label>Kota / Kabupaten</Label>
            <SearchSelect
              options={cities.map((c) => ({ value: c.id, label: c.name }))}
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
              placeholder="Pilih kota"
              searchPlaceholder="Cari kota..."
            />
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
  );
}
