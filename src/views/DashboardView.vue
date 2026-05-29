<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  ListTree,
  Trophy,
  Activity,
  Calculator,
  Loader2, Plus
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button/index.js'

// State Management
const isLoading = ref(true);
const dashboardData = ref({
  total_criteria: 0,
  total_suppliers: 0,
  top_supplier: '-',
  system_status: 'Memuat...'
});

// Fetch Data dari Laravel
const fetchDashboardStats = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/dashboard-stats');
    dashboardData.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil metrik dashboard:', error);
    dashboardData.value.system_status = 'Error Koneksi';
  } finally {
    isLoading.value = false;
  }
};

// Computed Properties untuk Mapping UI Kartu agar dinamis
const stats = computed(() => [
  {
    title: 'Total Kriteria',
    value: dashboardData.value.total_criteria.toString(),
    description: 'Parameter penilaian aktif',
    icon: ListTree,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Total Supplier',
    value: dashboardData.value.total_suppliers.toString(),
    description: 'Mitra pemasok terdaftar',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    title: 'Rekomendasi Teratas',
    value: dashboardData.value.top_supplier,
    description: 'Skor EDAS tertinggi saat ini',
    icon: Trophy,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    title: 'Status Sistem',
    value: dashboardData.value.system_status,
    description: dashboardData.value.system_status === 'Optimal' ? 'Sistem siap dikalkulasi' : 'Lengkapi parameter data',
    icon: Activity,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50'
  }
]);

onMounted(() => {
  fetchDashboardStats();
});
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-300">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
      <p class="text-zinc-500 mt-1 text-sm md:text-base">
        Pantau metrik utama dan status kesiapan Sistem Pendukung Keputusan Anda.
      </p>
    </div>

    <div v-if="isLoading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="i in 4" :key="i" class="border-zinc-200 shadow-sm animate-pulse h-32 flex items-center justify-center">
        <Loader2 class="w-6 h-6 animate-spin text-zinc-300" />
      </Card>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title" class="border-zinc-200 shadow-sm transition-all hover:shadow-md">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-zinc-600">
            {{ stat.title }}
          </CardTitle>
          <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`">
            <component :is="stat.icon" :class="`w-5 h-5 ${stat.color}`" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-zinc-900 truncate" :title="stat.value">{{ stat.value }}</div>
          <p class="text-xs text-zinc-500 mt-1">
            {{ stat.description }}
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-4">
      <Card class="col-span-4 border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>Alur Pengambilan Keputusan</CardTitle>
        </CardHeader>
        <CardContent class="text-zinc-600 text-sm leading-relaxed">
          <p>
            Sistem ini menggunakan metode <strong>EDAS (Evaluation Based on Distance from Average Solution)</strong>.
            Untuk mendapatkan hasil rekomendasi terbaru, pastikan Anda telah melalui tahapan berikut:
          </p>
          <ol class="list-decimal list-inside mt-4 space-y-2">
            <li>Memastikan parameter <strong>Kriteria</strong> sudah sesuai.</li>
            <li>Memastikan data <strong>Supplier</strong> terbaru telah terdaftar.</li>
            <li>Mengisi nilai aktual pada tabel <strong>Matriks Penilaian</strong>.</li>
            <li>Menjalankan komputasi di halaman <strong>Hasil Keputusan</strong>.</li>
          </ol>
        </CardContent>
      </Card>

      <Card class="col-span-3 border-zinc-200 shadow-sm bg-zinc-900 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <CardHeader>
          <CardTitle class="text-zinc-100 relative z-10">Status Matriks</CardTitle>
        </CardHeader>
        <CardContent class="relative z-10">
          <div class="flex flex-col items-center justify-center h-40 text-center space-y-4">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center border"
              :class="dashboardData.system_status === 'Optimal' ? 'bg-emerald-900/50 border-emerald-700/50' : 'bg-amber-900/50 border-amber-700/50'"
            >
              <Calculator
                class="w-8 h-8"
                :class="dashboardData.system_status === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'"
              />
            </div>
            <div>
              <p class="font-medium text-lg">{{ dashboardData.system_status === 'Optimal' ? 'Siap Dikalkulasi' : 'Data Belum Lengkap' }}</p>
              <p class="text-sm text-zinc-400 mt-1">
                {{ dashboardData.system_status === 'Optimal' ? 'Data matriks sudah memenuhi syarat.' : 'Periksa kembali tabel Kriteria & Supplier.' }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  </div>
</template>
