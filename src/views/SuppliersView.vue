<script setup>
import { ref, onMounted } from 'vue'
import api from '../axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, Users, MapPin, Phone } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

// 1. State Management
const suppliers = ref([])
const isLoading = ref(true)
const isSubmitLoading = ref(false)
const isDialogOpen = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const serverError = ref('')

const form = ref({
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
})

// 2. Fetch Data Supplier
const fetchSuppliers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/suppliers')
    suppliers.value = response.data.data
  } catch (err) {
    console.error('Gagal memuat supplier:', err)
  } finally {
    isLoading.value = false
  }
}

// 3. Handle Dialog (Buka Form Tambah / Edit)
const openAddDialog = () => {
  isEditing.value = false
  currentId.value = null
  serverError.value = ''
  form.value = { name: '', address: '', latitude: '', longitude: '', phone: '' }
  isDialogOpen.value = true
}

const openEditDialog = (item) => {
  isEditing.value = true
  currentId.value = item.id
  serverError.value = ''
  form.value = {
    name: item.name,
    address: item.address || '',
    latitude: item.latitude ? item.latitude.toString() : '',
    longitude: item.longitude ? item.longitude.toString() : '',
    phone: item.phone || '',
  }
  isDialogOpen.value = true
}

// 4. Action: Simpan Data (Store / Update)
const handleSubmit = async () => {
  isSubmitLoading.value = true
  serverError.value = ''
  try {
    if (isEditing.value) {
      await api.put(`/suppliers/${currentId.value}`, form.value)
    } else {
      await api.post('/suppliers', form.value)
    }
    isDialogOpen.value = false
    await fetchSuppliers() // Reload data
  } catch (err) {
    serverError.value =
      err.response?.data?.message || 'Terjadi kesalahan sistem saat menyimpan data supplier.'
  } finally {
    isSubmitLoading.value = false
  }
}

// 5. Action: Hapus Supplier
const handleDelete = async (id) => {
  if (
    confirm(
      'Apakah Anda yakin ingin menghapus supplier ini? Peringatan: Data perhitungan yang melibatkan supplier ini di masa lalu mungkin akan terpengaruh.',
    )
  ) {
    try {
      await api.delete(`/suppliers/${id}`)
      await fetchSuppliers()
    } catch (err) {
      alert('Gagal menghapus supplier., ' + err)
    }
  }
}

onMounted(() => {
  fetchSuppliers()
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          Mitra Pemasok (Supplier)
        </h2>
        <p class="text-zinc-500 mt-1 text-sm md:text-base">
          Kelola daftar kandidat supplier yang akan dievaluasi dalam matriks keputusan.
        </p>
      </div>
      <Button
        v-if="authStore.isOwner"
        @click="openAddDialog"
        class="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 gap-2 px-4 py-5 text-sm cursor-pointer"
      >
        <Plus class="w-4 h-4" /> Tambah Supplier
      </Button>
    </div>

    <div
      v-if="isLoading"
      class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm"
    >
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Memuat data mitra pemasok...</p>
    </div>

    <div
      v-else-if="suppliers.length === 0"
      class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm p-6 text-center"
    >
      <div
        class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400"
      >
        <Users class="w-6 h-6" />
      </div>
      <div>
        <p class="font-medium text-zinc-900">Belum Ada Supplier</p>
        <p class="text-sm text-zinc-500 mt-1">
          Klik tombol di atas untuk mendaftarkan kandidat supplier pertama Anda.
        </p>
      </div>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader class="bg-zinc-50">
          <TableRow>
            <TableHead class="w-24 font-semibold text-zinc-700">Kode</TableHead>
            <TableHead class="font-semibold text-zinc-700">Nama Pemasok</TableHead>
            <TableHead class="font-semibold text-zinc-700">Alamat Lengkap</TableHead>
            <TableHead class="w-48 font-semibold text-zinc-700">No. Telepon</TableHead>
            <TableHead v-if="authStore.isOwner" class="w-28 text-right font-semibold text-zinc-700"
              >Aksi</TableHead
            >
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="item in suppliers"
            :key="item.id"
            class="hover:bg-zinc-50/50 transition-colors"
          >
            <TableCell class="font-mono font-medium text-zinc-600">{{ item.code }}</TableCell>
            <TableCell class="font-medium text-zinc-900">{{ item.name }}</TableCell>
            <TableCell class="text-zinc-600">
              <div class="flex items-start gap-2">
                <MapPin class="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" v-if="item.address" />
                <span class="truncate max-w-75">{{ item.address || '-' }}</span>
              </div>
            </TableCell>
            <TableCell class="text-zinc-600">
              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4 text-zinc-400 shrink-0" v-if="item.phone" />
                {{ item.phone || '-' }}
              </div>
            </TableCell>
            <TableCell v-if="authStore.isOwner" class="text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEditDialog(item)"
                  class="p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-md hover:bg-zinc-100 cursor-pointer"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  @click="handleDelete(item.id)"
                  class="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent
        class="sm:max-w-106.25"
        @interact-outside="
          (event) => {
            // Jika user mengklik rekomendasi alamat Google Maps, batalkan aksi penutupan dialog
            if (event.target.closest('.pac-container')) {
              event.preventDefault()
            }
          }
        "
      >
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-zinc-900">
            {{ isEditing ? 'Perbarui Data Supplier' : 'Registrasi Supplier Baru' }}
          </DialogTitle>
          <DialogDescription>
            Masukkan informasi detail terkait pemasok. Pastikan nomor kontak aktif untuk keperluan
            operasional.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
          <div
            v-if="serverError"
            class="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100"
          >
            {{ serverError }}
          </div>

          <div class="space-y-2">
            <Label for="name">Nama Pemasok / Toko</Label>
            <Input
              id="name"
              v-model="form.name"
              placeholder="Contoh: Toko Bagus"
              required
              class="focus-visible:ring-zinc-900"
            />
          </div>

          <div class="space-y-2">
            <Label for="address">Alamat Lengkap</Label>
            <textarea
              id="address"
              v-model="form.address"
              placeholder="Contoh: Jl. Sudirman No. 10..."
              rows="3"
              class="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 resize-none"
            ></textarea>
          </div>

          <div class="space-y-2">
            <Label for="phone">Nomor Telepon (Opsional)</Label>
            <Input
              id="phone"
              type="tel"
              v-model="form.phone"
              placeholder="Contoh: 081234567890"
              class="focus-visible:ring-zinc-900"
            />
          </div>

          <DialogFooter class="pt-4">
            <Button
              type="submit"
              class="w-full bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
              :disabled="isSubmitLoading"
            >
              <Loader2 v-if="isSubmitLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitLoading ? 'Menyimpan...' : 'Simpan Data Supplier' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
