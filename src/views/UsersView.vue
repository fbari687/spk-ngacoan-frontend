<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';
import { useAuthStore } from '../stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, UserCog, Mail, ShieldCheck } from 'lucide-vue-next';

// 1. Otoritas Owner
const authStore = useAuthStore();
const router = useRouter();

// Blokade jika user iseng mencoba masuk via URL (Double protection selain middleware)
if (!authStore.isOwner) {
  router.push('/');
}

// 2. State Management
const users = ref([]);
const isLoading = ref(true);
const isSubmitLoading = ref(false);
const isDialogOpen = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const serverError = ref('');

const form = ref({
  name: '',
  username: '',
  email: '',
  password: '', // Opsional saat edit
});

// 3. Fetch Data Pengelola
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/users');
    users.value = response.data.data;
  } catch (err) {
    console.error('Gagal memuat daftar pengelola:', err);
  } finally {
    isLoading.value = false;
  }
};

// 4. Handle Dialog
const openAddDialog = () => {
  isEditing.value = false;
  currentId.value = null;
  serverError.value = '';
  form.value = { name: '', username: '', email: '', password: '' };
  isDialogOpen.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  serverError.value = '';
  form.value = {
    name: item.name,
    username: item.username || '',
    email: item.email,
    password: '', // Kosongkan, hanya isi jika mau ganti password
  };
  isDialogOpen.value = true;
};

// 5. Action: Simpan Data
const handleSubmit = async () => {
  isSubmitLoading.value = true;
  serverError.value = '';
  try {
    if (isEditing.value) {
      await api.put(`/users/${currentId.value}`, form.value);
    } else {
      await api.post('/users', form.value);
    }
    isDialogOpen.value = false;
    await fetchUsers();
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Terjadi kesalahan sistem.';
  } finally {
    isSubmitLoading.value = false;
  }
};

// 6. Action: Hapus Pengelola
const handleDelete = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus akun pengelola ini? Akses mereka ke sistem akan dicabut secara permanen.')) {
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (err) {
      alert('Gagal menghapus pengelola.');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-zinc-900">Manajemen Pengelola</h2>
        <p class="text-zinc-500 mt-1">
          Daftarkan dan kelola staf.
        </p>
      </div>
      <Button @click="openAddDialog" class="bg-zinc-900 hover:bg-zinc-800 gap-2 px-4 py-5 text-sm w-full sm:w-auto cursor-pointer">
        <Plus class="w-4 h-4" /> Tambah Pengelola
      </Button>
    </div>

    <div v-if="isLoading" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Menghubungkan ke pusat data pengguna...</p>
    </div>

    <div v-else-if="users.length === 0" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm p-6 text-center">
      <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        <UserCog class="w-6 h-6" />
      </div>
      <div>
        <p class="font-medium text-zinc-900">Belum Ada Pengelola</p>
        <p class="text-sm text-zinc-500 mt-1">Klik tombol di atas untuk mendaftarkan akun pengelola pertama.</p>
      </div>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader class="bg-zinc-50">
            <TableRow>
              <TableHead class="font-semibold text-zinc-700">Nama Lengkap</TableHead>
              <TableHead class="font-semibold text-zinc-700">Email Login</TableHead>
              <TableHead class="w-32 font-semibold text-zinc-700">Role</TableHead>
              <TableHead class="w-28 text-right font-semibold text-zinc-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in users" :key="item.id" class="hover:bg-zinc-50/50 transition-colors">
              <TableCell class="font-medium text-zinc-900">{{ item.name }}</TableCell>
              <TableCell class="text-zinc-600">
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4 text-zinc-400" />
                  {{ item.email }}
                </div>
              </TableCell>
              <TableCell>
                <Badge class="bg-blue-50 text-blue-700 border-blue-200 font-medium capitalize">
                  {{ item.role }}
                </Badge>
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
            {{ isEditing ? 'Update Akun Pengelola' : 'Daftarkan Pengelola Baru' }}
          </DialogTitle>
          <DialogDescription>
            Atur kredensial akses staf. Password minimal 8 karakter.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
          <div v-if="serverError" class="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
            {{ serverError }}
          </div>

          <div class="space-y-2">
            <Label for="name">Nama Lengkap</Label>
            <Input id="name" v-model="form.name" placeholder="Nama lengkap staf" required class="focus-visible:ring-zinc-900" />
          </div>

          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="form.username"
              placeholder="Contoh: pengelola_toko"
              required
              class="focus-visible:ring-zinc-900"
            />
          </div>

          <div class="space-y-2">
            <Label for="email">Email Login</Label>
            <Input id="email" type="email" v-model="form.email" placeholder="staf@example.com" required class="focus-visible:ring-zinc-900" />
          </div>

          <div class="space-y-2">
            <Label for="password">Password {{ isEditing ? '(Kosongkan jika tidak ganti)' : '' }}</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Min. 8 karakter"
              :required="!isEditing"
              class="focus-visible:ring-zinc-900"
            />
          </div>

          <div class="p-4 bg-zinc-50 rounded-lg border border-zinc-200 flex items-start gap-3">
            <ShieldCheck class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p class="text-[11px] text-zinc-600 leading-relaxed">
              Akun yang dibuat akan memiliki hak akses sebagai <strong>Pengelola</strong>. Mereka dapat menginput data master dan matriks, namun tidak dapat mengalkulasi hasil atau mengelola kriteria.
            </p>
          </div>

          <DialogFooter class="pt-4">
            <Button type="submit" class="w-full bg-zinc-900 hover:bg-zinc-800 cursor-pointer" :disabled="isSubmitLoading">
              <Loader2 v-if="isSubmitLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitLoading ? 'Memproses Akun...' : 'Simpan Data Pengelola' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  </div>
</template>
