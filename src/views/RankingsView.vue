<script setup>
import { ref, onMounted } from 'vue';
import api from '../axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Calculator, Trophy, Medal, AlertTriangle, Calendar, Eye } from 'lucide-vue-next';

// 1. State Management
const rankings = ref([]);
const criteria = ref([]);
const suppliers = ref([]);
const steps = ref(null); // Menampung objek 'calculation_steps' dari Laravel

const isLoading = ref(true);
const isCalculating = ref(false);
const isStepsOpen = ref(false); // Mengontrol kemunculan modal rincian rumus
const serverError = ref('');
const hasCalculated = ref(false);
const lastCalculatedAt = ref('');

// 2. Ambil Riwayat Terakhir & Data Master Sekaligus saat Halaman Dimuat
const fetchInitialData = async () => {
  isLoading.value = true;
  serverError.value = '';
  try {
    const [resCriteria, resSuppliers, resHistories] = await Promise.all([
      api.get('/criteria'),
      api.get('/suppliers'),
      api.get('/decision-histories')
    ]);

    criteria.value = resCriteria.data.data;
    suppliers.value = resSuppliers.data.data;

    if (resHistories.data.data.length > 0) {
      const latestHistory = resHistories.data.data[0];
      lastCalculatedAt.value = latestHistory.created_at;

      const detailRes = await api.get(`/decision-histories/${latestHistory.id}`);
      rankings.value = detailRes.data.data;
      hasCalculated.value = true;
    }
  } catch (err) {
    console.error('Error in initialization:', err);
    serverError.value = 'Gagal menyinkronkan data keputusan awal dari server.';
  } finally {
    isLoading.value = false;
  }
};

// 3. Pemicu Kalkulasi Ulang (Tombol Utama Ditekan)
const calculateEdas = async () => {
  isCalculating.value = true;
  serverError.value = '';
  try {
    const response = await api.post('/calculate-edas');

    // Set data rankings dan langkah perhitungan langsung dari response POST
    rankings.value = response.data.data.rankings;
    steps.value = response.data.data.calculation_steps;

    lastCalculatedAt.value = new Date().toISOString();
    hasCalculated.value = true;
  } catch (err) {
    console.error('Gagal kalkulasi:', err);
    serverError.value = err.response?.data?.meta?.message || 'Gagal menghitung matriks. Pastikan data nilai aktual sudah diisi.';
  } finally {
    isCalculating.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
};

onMounted(() => {
  fetchInitialData();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Hasil Keputusan (EDAS)</h2>
        <p class="text-zinc-500 mt-1 text-sm md:text-base">
          Hasil rekomendasi keputusan supplier terbaik menggunakan pembobotan EDAS.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
        <Button
          v-if="hasCalculated && steps"
          @click="isStepsOpen = true"
          variant="outline"
          class="w-full sm:w-auto gap-2 border-zinc-300 py-5 cursor-pointer"
        >
          <Eye class="w-4 h-4" /> Lihat Langkah Perhitungan
        </Button>
        <Button
          @click="calculateEdas"
          class="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 gap-2 px-6 py-5 shadow-sm font-medium cursor-pointer"
          :disabled="isCalculating || isLoading"
        >
          <Calculator class="w-4 h-4" v-if="!isCalculating" />
          <Loader2 class="w-4 h-4 animate-spin" v-else />
          {{ isCalculating ? 'Menghitung...' : 'Hitung Ulang Data Terbaru' }}
        </Button>
      </div>
    </div>

    <div v-if="serverError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
      <span class="text-sm font-medium leading-relaxed">{{ serverError }}</span>
    </div>

    <div v-if="isLoading" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Menyusun papan peringkat...</p>
    </div>

    <div v-else-if="!hasCalculated" class="h-[50vh] flex flex-col items-center justify-center space-y-5 bg-white border border-zinc-200 rounded-xl shadow-sm p-8 text-center">
      <div class="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
        <Trophy class="w-8 h-8" />
      </div>
      <div class="max-w-md">
        <p class="font-bold text-zinc-900 text-lg">Belum Ada Hasil Kalkulasi</p>
        <p class="text-zinc-500 text-sm mt-1 leading-relaxed">
          Klik tombol <strong>Hitung Ulang Data Terbaru</strong> untuk memicu komputasi algoritma EDAS untuk pertama kalinya.
        </p>
      </div>
    </div>

    <div v-else class="space-y-6 w-full overflow-hidden">
      <div class="flex items-center gap-2 text-xs md:text-sm text-zinc-500 bg-zinc-100 border border-zinc-200 w-fit px-3 py-1.5 rounded-lg font-medium">
        <Calendar class="w-4 h-4 text-zinc-400" />
        <span>Terakhir dikalkulasi pada: <strong>{{ formatDate(lastCalculatedAt) }}</strong></span>
      </div>

      <Card class="border-zinc-800 shadow-lg bg-gradient-to-br from-zinc-800 to-zinc-950 text-white overflow-hidden relative">
        <CardContent class="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 w-full">
            <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy class="w-8 h-8 text-white" />
            </div>
            <div class="space-y-1 w-full overflow-hidden">
              <p class="text-emerald-400 font-semibold text-xs tracking-wider uppercase">Rekomendasi Utama (Rank 1)</p>
              <h3 class="text-2xl md:text-3xl font-bold tracking-tight truncate">{{ rankings[0]?.supplier?.name }}</h3>
              <p class="text-zinc-400 text-xs md:text-sm">
                <span class="font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 text-xs">{{ rankings[0]?.supplier?.code }}</span>
              </p>
            </div>
          </div>
          <div class="text-center md:text-right bg-zinc-900 p-4 rounded-xl border border-zinc-800 shrink-0 w-full md:w-auto min-w-[180px]">
            <p class="text-zinc-400 text-xs mb-0.5">Appraisal Score (AS)</p>
            <p class="text-3xl font-bold font-mono text-emerald-400">{{ parseFloat(rankings[0]?.appraisal_score).toFixed(4) }}</p>
          </div>
        </CardContent>
      </Card>

      <div class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden w-full">
        <div class="overflow-x-auto w-full">
          <Table class="w-full min-w-[500px]">
            <TableHeader class="bg-zinc-50/50">
              <TableRow>
                <TableHead class="w-24 text-center font-bold">Rank</TableHead>
                <TableHead class="w-24 font-bold">Kode</TableHead>
                <TableHead class="font-bold">Nama Pemasok</TableHead>
                <TableHead class="w-48 text-right font-bold">Score (AS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in rankings" :key="item.id" :class="index === 0 ? 'bg-emerald-50/10' : ''">
                <TableCell class="text-center">
                  <div v-if="index === 0" class="flex justify-center"><Medal class="w-5 h-5 text-emerald-500" /></div>
                  <div v-else-if="index === 1" class="flex justify-center"><Medal class="w-5 h-5 text-zinc-400" /></div>
                  <div v-else-if="index === 2" class="flex justify-center"><Medal class="w-5 h-5 text-amber-700" /></div>
                  <span v-else class="font-semibold text-zinc-500 font-mono">{{ item.rank }}</span>
                </TableCell>
                <TableCell class="font-mono text-xs text-zinc-500">{{ item.supplier?.code }}</TableCell>
                <TableCell class="font-medium text-zinc-900">
                  {{ item.supplier?.name }}
                  <Badge v-if="index === 0" class="ml-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50">Terbaik</Badge>
                </TableCell>
                <TableCell class="text-right font-mono font-bold text-zinc-900 text-base">
                  {{ parseFloat(item.appraisal_score).toFixed(4) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

    <Dialog v-model:open="isStepsOpen" v-if="steps">
      <DialogContent class="sm:max-w-[90vw] md:max-w-[80vw] h-[85vh] flex flex-col p-0">
        <DialogHeader class="p-6 pb-2 border-b border-zinc-100">
          <DialogTitle class="text-xl font-bold text-zinc-900">Rumus Komputasi EDAS</DialogTitle>
          <DialogDescription>Rincian nilai matriks.</DialogDescription>
        </DialogHeader>

        <Tabs default-value="av" class="flex-1 flex flex-col overflow-hidden p-6">
          <TabsList class="grid grid-cols-4 bg-zinc-100 p-1 rounded-xl mb-4 shrink-0">
            <TabsTrigger value="av" class="text-xs md:text-sm rounded-lg cursor-pointer">1. Solusi AV</TabsTrigger>
            <TabsTrigger value="pda" class="text-xs md:text-sm rounded-lg cursor-pointer">2. Matriks PDA</TabsTrigger>
            <TabsTrigger value="nda" class="text-xs md:text-sm rounded-lg cursor-pointer">3. Matriks NDA</TabsTrigger>
            <TabsTrigger value="final_score" class="text-xs md:text-sm rounded-lg cursor-pointer">4. SP, SN & AS</TabsTrigger>
          </TabsList>

          <TabsContent value="av" class="flex-1 overflow-y-auto border border-zinc-200 rounded-xl p-4 bg-white">
            <h4 class="font-bold text-zinc-800 text-sm mb-3">Nilai Solusi Rata-rata (AV) tiap Kriteria</h4>
            <Table>
              <TableHeader class="bg-zinc-50">
                <TableRow>
                  <TableHead v-for="c in criteria" :key="c.id" class="font-mono text-center text-zinc-800">{{ c.code }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell v-for="c in criteria" :key="c.id" class="text-center font-mono font-bold text-zinc-900">
                    {{ steps.average_solutions[c.id]?.toFixed(4) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="pda" class="flex-1 overflow-y-auto border border-zinc-200 rounded-xl p-4 bg-white">
            <h4 class="font-bold text-zinc-800 text-sm mb-3">Matriks Jarak Positif dari Rata-rata (PDA)</h4>
            <Table>
              <TableHeader class="bg-zinc-50">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead v-for="c in criteria" :key="c.id" class="font-mono text-center">{{ c.code }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in suppliers" :key="s.id">
                  <TableCell class="font-medium text-zinc-900 text-xs">{{ s.code + ' - ' + s.name }}</TableCell>
                  <TableCell v-for="c in criteria" :key="c.id" class="text-center font-mono text-xs">
                    {{ steps.pda_matrix[s.id]?.[c.id]?.toFixed(4) || '0.0000' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="nda" class="flex-1 overflow-y-auto border border-zinc-200 rounded-xl p-4 bg-white">
            <h4 class="font-bold text-zinc-800 text-sm mb-3">Matriks Jarak Negatif dari Rata-rata (NDA)</h4>
            <Table>
              <TableHeader class="bg-zinc-50">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead v-for="c in criteria" :key="c.id" class="font-mono text-center">{{ c.code }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in suppliers" :key="s.id">
                  <TableCell class="font-medium text-zinc-900 text-xs">{{ s.code + ' - ' + s.name }}</TableCell>
                  <TableCell v-for="c in criteria" :key="c.id" class="text-center font-mono text-xs">
                    {{ steps.nda_matrix[s.id]?.[c.id]?.toFixed(4) || '0.0000' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="final_score" class="flex-1 overflow-y-auto border border-zinc-200 rounded-xl p-4 bg-white">
            <h4 class="font-bold text-zinc-800 text-sm mb-3">Skor Akumulasi Terbobot & Hasil Akhir (AS)</h4>
            <Table>
              <TableHeader class="bg-zinc-50">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead class="text-center">Score SP</TableHead>
                  <TableHead class="text-center">Score SN</TableHead>
                  <TableHead class="text-center">NSP (Norm.)</TableHead>
                  <TableHead class="text-center">NSS (Norm.)</TableHead>
                  <TableHead class="text-right font-bold text-emerald-700 bg-emerald-50/50">Appraisal Score (AS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in suppliers" :key="s.id" class="hover:bg-zinc-50/50 transition-colors">
                  <TableCell class="font-medium text-zinc-900 text-xs">{{ s.code + ' - ' + s.name }}</TableCell>
                  <TableCell class="text-center font-mono text-xs">{{ steps.sp_scores[s.id]?.toFixed(4) }}</TableCell>
                  <TableCell class="text-center font-mono text-xs">{{ steps.sn_scores[s.id]?.toFixed(4) }}</TableCell>
                  <TableCell class="text-center font-mono text-xs text-blue-600 font-medium">{{ steps.nsp_scores[s.id]?.toFixed(4) }}</TableCell>
                  <TableCell class="text-center font-mono text-xs text-violet-600 font-medium">{{ steps.nss_scores[s.id]?.toFixed(4) }}</TableCell>
                  <TableCell class="text-right font-mono text-sm font-bold text-emerald-600 bg-emerald-50/30">
                    {{ steps.as_scores?.[s.id]?.toFixed(4) || '0.0000' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

  </div>
</template>
