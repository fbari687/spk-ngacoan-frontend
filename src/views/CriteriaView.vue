<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, ListTree } from 'lucide-vue-next';

// 1. State Management
const criteria = ref([]);
const isLoading = ref(true);
const isSubmitLoading = ref(false);
const isDialogOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const serverError = ref('');

const form = ref({
  name: '',
  type: 'benefit',
  weight_input: 1,
});

// 2. Fetch Data Kriteria
const fetchCriteria = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/criteria');
    criteria.value = response.data.data;
  } catch (err) {
    console.error('Gagal memuat kriteria:', err);
  } finally {
    isLoading.value = false;
  }
};

// 3. Handle Dialog (Buka Form Tambah / Edit)
const openAddDialog = () => {
  isEditing.value = false;
  currentId.value = null;
  serverError.value = '';
  form.value = { name: '', type: 'benefit', weight_input: 1 };
  isDialogOpen.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  serverError.value = '';
  form.value = {
    name: item.name,
    type: item.type,
    weight_input: item.weight_input,
  };
  isDialogOpen.value = true;
};

// 4. Action: Simpan Data (Store / Update)
const handleSubmit = async () => {
  isSubmitLoading.value = true;
  serverError.value = '';
  try {
    if (isEditing.value) {
      await api.put(`/criteria/${currentId.value}`, form.value);
    } else {
      await api.post('/criteria', form.value);
    }
    isDialogOpen.value = false;
    await fetchCriteria(); // Reload data & otomatis update bobot ternormalisasi
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Terjadi kesalahan sistem.';
  } finally {
    isSubmitLoading.value = false;
  }
};

// 5. Action: Hapus Kriteria
const handleDelete = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus kriteria ini? Semua bobot sistem akan dihitung ulang secara otomatis.')) {
    try {
      await api.delete(`/criteria/${id}`);
      await fetchCriteria();
    } catch (err) {
      alert('Gagal menghapus kriteria.');
    }
  }
};

// Format desimal menjadi persentase agar UI terasa premium dan mudah dibaca Owner
const formatPercentage = (value) => {
  return `${(parseFloat(value) * 100).toFixed(1)}%`;
};

onMounted(() => {
  fetchCriteria();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Parameter Kriteria</h2>
        <p class="text-zinc-500 mt-1 text-sm md:text-base">
          Kelola kriteria penilaian EDAS. Setiap penambahan atau perubahan data akan menyeimbangkan bobot secara otomatis.
        </p>
      </div>
      <Button @click="openAddDialog" class="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 gap-2 px-4 py-5 text-sm cursor-pointer">
        <Plus class="w-4 h-4" /> Tambah Kriteria
      </Button>
    </div>

    <div v-if="isLoading" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Sinkronisasi data kriteria server...</p>
    </div>

    <div v-else-if="criteria.length === 0" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm p-6 text-center">
      <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        <ListTree class="w-6 h-6" />
      </div>
      <div>
        <p class="font-medium text-zinc-900">Belum Ada Kriteria</p>
        <p class="text-sm text-zinc-500 mt-1">Klik tombol di atas untuk membuat parameter kriteria pertama Anda.</p>
      </div>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div class="overflow-x-auto w-full">
      <Table class="w-full min-w-[600px] md:min-w-full">
        <TableHeader class="bg-zinc-50">
          <TableRow>
            <TableHead class="w-24 font-semibold text-zinc-700 whitespace-nowrap">Kode</TableHead>
            <TableHead class="font-semibold text-zinc-700 whitespace-nowrap">Nama Kriteria</TableHead>
            <TableHead class="w-32 font-semibold text-zinc-700 whitespace-nowrap">Tipe</TableHead>
            <TableHead class="w-32 font-semibold text-zinc-700 text-center whitespace-nowrap">Skala Input</TableHead>
            <TableHead class="w-40 font-semibold text-zinc-700 text-right whitespace-nowrap">Bobot Relatif</TableHead>
            <TableHead class="w-28 text-right font-semibold text-zinc-700 whitespace-nowrap">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in criteria" :key="item.id" class="hover:bg-zinc-50/50 transition-colors">
            <TableCell class="font-mono font-medium text-zinc-600">{{ item.code }}</TableCell>
            <TableCell class="font-medium text-zinc-900">{{ item.name }}</TableCell>
            <TableCell>
              <Badge
                :variant="item.type === 'benefit' ? 'success' : 'destructive'"
                class="capitalize font-medium px-2.5 py-0.5 rounded-full"
                :class="item.type === 'benefit' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
              >
                {{ item.type }}
              </Badge>
            </TableCell>
            <TableCell class="text-center font-medium">{{ item.weight_input }}</TableCell>
            <TableCell class="text-right font-semibold text-zinc-900">
              {{ formatPercentage(item.normalized_weight) }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEditDialog(item)" class="p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-100 cursor-pointer">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="handleDelete(item.id)" class="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      </div>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-zinc-900">
            {{ isEditing ? 'Perbarui Kriteria' : 'Tambah Kriteria Baru' }}
          </DialogTitle>
          <DialogDescription>
            Isi parameter kriteria dengan benar. Sistem EDAS akan otomatis menyesuaikan konversi bobot desimalnya.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
          <div v-if="serverError" class="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
            {{ serverError }}
          </div>

          <div class="space-y-2">
            <Label for="name">Nama Kriteria</Label>
            <Input id="name" v-model="form.name" placeholder="Contoh: Harga Bahan Baku" required class="focus-visible:ring-zinc-900" />
          </div>

          <div class="space-y-2">
            <Label for="type">Tipe Kriteria</Label>
            <select
              id="type"
              v-model="form.type"
              class="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 cursor-pointer"
            >
              <option value="benefit">Benefit (Semakin besar nilai, semakin baik)</option>
              <option value="cost">Cost (Semakin kecil nilai, semakin baik)</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="weight_input">Prioritas Kepentingan (Skala 1 - 5)</Label>
            <select
              id="weight_input"
              v-model.number="form.weight_input"
              class="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 cursor-pointer"
            >
              <option value="1">1 - Sangat Rendah</option>
              <option value="2">2 - Rendah</option>
              <option value="3">3 - Cukup / Sedang</option>
              <option value="4">4 - Tinggi</option>
              <option value="5">5 - Sangat Tinggi</option>
            </select>
          </div>

          <DialogFooter class="pt-4">
            <Button type="submit" class="w-full bg-zinc-900 hover:bg-zinc-800 cursor-pointer" :disabled="isSubmitLoading">
              <Loader2 v-if="isSubmitLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitLoading ? 'Menyimpan...' : 'Simpan Parameter' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  </div>
</template>
