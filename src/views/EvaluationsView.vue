<script setup>
import { ref, onMounted } from 'vue';
import api from '../axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Save, AlertTriangle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore();

// 1. State Management
const criteria = ref([]);
const suppliers = ref([]);
const matrixData = ref({}); // Struktur objek bersarang: { supplier_id: { criterion_id: value } }

const isLoading = ref(true);
const isSaving = ref(false);
const alertMessage = ref({ type: '', text: '' });

// 2. Load Semua Data Awal (Menggunakan Promise.all agar efisien)
const loadMatrixData = async () => {
  isLoading.value = true;
  alertMessage.value = { type: '', text: '' };

  try {
    const [resCriteria, resSuppliers, resEvaluations] = await Promise.all([
      api.get('/criteria'),
      api.get('/suppliers'),
      api.get('/evaluations')
    ]);

    criteria.value = resCriteria.data.data;
    suppliers.value = resSuppliers.data.data;

    const rawEvaluations = resEvaluations.data.data;

    // 3. Merakit Struktur Matriks 2D secara Reaktif
    const initialMatrix = {};
    suppliers.value.forEach(supplier => {
      initialMatrix[supplier.id] = {};
      criteria.value.forEach(criterion => {
        // Cari apakah sudah ada nilai evaluasi sebelumnya di database
        const match = rawEvaluations.find(
          e => e.supplier_id === supplier.id && e.criterion_id === criterion.id
        );
        // Jika ada pakai nilai lama, jika belum ada berikan string kosong atau 0
        initialMatrix[supplier.id][criterion.id] = match ? match.actual_value : '';
      });
    });

    matrixData.value = initialMatrix;

  } catch (err) {
    console.error('Gagal memuat matriks penilaian:', err);
    alertMessage.value = { type: 'error', text: 'Gagal menyinkronkan data dari server.' };
  } finally {
    isLoading.value = false;
  }
};

// 4. Action: Menyimpan Matriks secara Massal (Bulk Save)
const handleBulkSave = async () => {
  isSaving.value = true;
  alertMessage.value = { type: '', text: '' };

  // Konversi kembali objek bersarang 2D menjadi format Array of Objects untuk API Laravel
  const evaluationsPayload = [];

  try {
    suppliers.value.forEach(supplier => {
      criteria.value.forEach(criterion => {
        const val = matrixData.value[supplier.id][criterion.id];

        // Validasi frontend: pastikan semua sel terisi angka sebelum dikirim
        if (val === '' || val === null) {
          throw new Error(`Nilai untuk ${supplier.name} pada kriteria ${criterion.name} belum diisi.`);
        }

        evaluationsPayload.push({
          supplier_id: supplier.id,
          criterion_id: criterion.id,
          actual_value: parseFloat(val)
        });
      });
    });

    // Kirim satu request bulk POST ke backend
    await api.post('/evaluations/bulk', { evaluations: evaluationsPayload });

    alertMessage.value = { type: 'success', text: 'Matriks penilaian berhasil diperbarui secara keseluruhan.' };
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    alertMessage.value = {
      type: 'error',
      text: err.message || err.response?.data?.message || 'Gagal menyimpan matriks.'
    };
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadMatrixData();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Matriks Penilaian</h2>
        <p class="text-zinc-500 mt-1 text-sm md:text-base">
          Isi nilai aktual masing-masing supplier pada setiap parameter kriteria yang ditentukan.
        </p>
      </div>
      <Button
        v-if="suppliers.length > 0 && criteria.length > 0 && !isLoading && authStore.isOwner"
        @click="handleBulkSave"
        class="bg-zinc-900 hover:bg-zinc-800 gap-2 px-5 py-5 text-sm cursor-pointer"
        :disabled="isSaving"
      >
        <Save class="w-4 h-4" v-if="!isSaving" />
        <Loader2 class="w-4 h-4 animate-spin" v-else />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan Matriks' }}
      </Button>
    </div>

    <div
      v-if="alertMessage.text"
      :class="`p-4 rounded-xl border text-sm transition-all duration-300 ${
        alertMessage.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`"
    >
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" v-if="alertMessage.type === 'error'" />
        <span>{{ alertMessage.text }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Membangun grid matriks penilaian dinamis...</p>
    </div>

    <div v-else-if="suppliers.length === 0 || criteria.length === 0" class="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4 mt-8">
      <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-zinc-900">Data Master Belum Lengkap</h3>
        <p class="text-zinc-500 text-sm mt-1 leading-relaxed">
          Sebelum mengisi matriks, Anda wajib memiliki minimal **1 data Kriteria** dan **1 data Supplier** di dalam sistem. Silakan lengkapi data master Anda terlebih dahulu via menu navigasi samping.
        </p>
      </div>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <Table class="min-w-[800px]">
          <TableHeader class="bg-zinc-50">
            <TableRow>
              <TableHead class="w-56 font-bold text-zinc-800 align-middle">Nama Supplier</TableHead>

              <TableHead
                v-for="criterion in criteria"
                :key="criterion.id"
                class="font-semibold text-zinc-700 p-4 min-w-[160px]"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-xs bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-medium">
                      {{ criterion.code }}
                    </span>
                    <span class="text-zinc-900 font-medium">{{ criterion.name }}</span>
                  </div>
                  <div class="text-[11px] font-normal text-zinc-500 capitalize">
                    Tipe: {{ criterion.type }} (Skala input: {{ criterion.weight_input }})
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-zinc-50/30 transition-colors">
              <TableCell class="font-semibold text-zinc-900 py-4 font-sans border-r border-zinc-100 bg-zinc-50/50">
                <div class="space-y-0.5">
                  <p>{{ supplier.name }}</p>
                  <p class="text-xs font-mono font-medium text-zinc-500">{{ supplier.code }}</p>
                </div>
              </TableCell>

              <TableCell v-for="criterion in criteria" :key="criterion.id" class="p-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  v-model="matrixData[supplier.id][criterion.id]"
                  placeholder="0.00"
                  required
                  :disabled="!authStore.isOwner"
                  :class="['h-10 text-zinc-900 font-medium border-zinc-200', !authStore.isOwner ? 'bg-zinc-100' : 'bg-white focus-visible:ring-zinc-900']"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

  </div>
</template>
