<script setup>
import { ref, onMounted } from 'vue';
import api from '../axios';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Eye, Trophy, ShieldAlert, Medal } from 'lucide-vue-next';

// State Management
const histories = ref([]);
const selectedRankings = ref([]);
const isLoading = ref(true);
const isDetailLoading = ref(false);
const isDialogOpen = ref(false);
const selectedDate = ref('');

// 1. Fetch Semua Riwayat Sesi
const fetchHistories = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/decision-histories');
    histories.value = response.data.data;
  } catch (err) {
    console.error('Gagal memuat daftar riwayat:', err);
  } finally {
    isLoading.value = false;
  }
};

// 2. Fetch Detail Peringkat Tertentu (Popup Modal)
const openDetailDialog = async (historyItem) => {
  selectedDate.value = historyItem.created_at;
  selectedRankings.value = [];
  isDetailLoading.value = true;
  isDialogOpen.value = true;

  try {
    const response = await api.get(`/decision-histories/${historyItem.id}`);
    selectedRankings.value = response.data.data;
  } catch (err) {
    console.error('Gagal memuat detail riwayat:', err);
    isDialogOpen.value = false;
  } finally {
    isDetailLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
};

// Helper mengekstrak nama pemenang utama dari relasi rankings
const getWinnerName = (rankingsArray) => {
  const winner = rankingsArray.find(r => r.rank === 1);
  return winner ? winner.supplier?.name : 'Tidak Terdeteksi';
};

const getWinnerCode = (rankingsArray) => {
  const winner = rankingsArray.find(r => r.rank === 1);
  return winner ? winner.supplier?.code : '-';
};

onMounted(() => {
  fetchHistories();
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">

    <div>
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">Riwayat Keputusan</h2>
      <p class="text-zinc-500 mt-1 text-sm md:text-base">
        Arsip log hasil perhitungan terdahulu.
      </p>
    </div>

    <div v-if="isLoading" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
      <p class="text-sm text-zinc-500">Membuka lemari arsip data...</p>
    </div>

    <div v-else-if="histories.length === 0" class="h-64 flex flex-col items-center justify-center space-y-4 bg-white border border-zinc-200 rounded-xl shadow-sm text-center p-6">
      <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        <Calendar class="w-6 h-6" />
      </div>
      <div>
        <p class="font-medium text-zinc-900">Belum Ada Riwayat Perhitungan</p>
        <p class="text-sm text-zinc-500 mt-1">Sesi riwayat akan otomatis tercatat setiap kali Owner menekan tombol kalkulasi.</p>
      </div>
    </div>

    <div v-else class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div class="overflow-x-auto w-full">
        <Table class="w-full min-w-[700px]">
          <TableHeader class="bg-zinc-50/80">
            <TableRow>
              <TableHead class="w-56 font-semibold text-zinc-700">Waktu Eksekusi</TableHead>
              <TableHead class="font-semibold text-zinc-700">Rekomendasi Utama (Peringkat 1)</TableHead>
              <TableHead class="w-40 text-center font-semibold text-zinc-700">Jumlah Kandidat</TableHead>
              <TableHead class="w-32 text-right font-semibold text-zinc-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="history in histories" :key="history.id" class="hover:bg-zinc-50/50 transition-colors">
              <TableCell class="font-medium text-zinc-900 text-sm">
                {{ formatDate(history.created_at) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Trophy class="w-4 h-4" />
                  </div>
                  <span class="font-semibold text-zinc-900">{{ getWinnerName(history.rankings) }}</span>
                  <span class="font-mono text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border">{{ getWinnerCode(history.rankings) }}</span>
                </div>
              </TableCell>
              <TableCell class="text-center font-medium text-zinc-600">
                {{ history.rankings?.length || 0 }} Supplier
              </TableCell>
              <TableCell class="text-right">
                <button
                  @click="openDetailDialog(history)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Lihat Hasil Audit
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader class="p-6 pb-4 border-b border-zinc-100">
          <DialogTitle class="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Trophy class="w-5 h-5 text-amber-500" /> Hasil Audit Keputusan
          </DialogTitle>
          <DialogDescription>
            Arsip permanen data peringkat. Sesi dihitung pada:<br/>
            <span class="font-semibold text-zinc-900 text-xs">{{ formatDate(selectedDate) }}</span>
          </DialogDescription>
        </DialogHeader>

        <div v-if="isDetailLoading" class="h-64 flex flex-col items-center justify-center space-y-3">
          <Loader2 class="w-8 h-8 animate-spin text-zinc-500" />
          <p class="text-xs text-zinc-500">Membuka segel log kriptografi...</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-6 pt-2">
          <div class="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <Table>
              <TableHeader class="bg-zinc-50">
                <TableRow>
                  <TableHead class="w-20 text-center font-bold">Rank</TableHead>
                  <TableHead class="w-20 font-bold">Kode</TableHead>
                  <TableHead class="font-bold">Nama Supplier</TableHead>
                  <TableHead class="text-right font-bold">Score (AS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(rank, idx) in selectedRankings" :key="rank.id" :class="idx === 0 ? 'bg-emerald-50/30' : ''">
                  <TableCell class="text-center">
                    <div v-if="idx === 0" class="flex justify-center"><Medal class="w-4 h-4 text-emerald-500" /></div>
                    <div v-else-if="idx === 1" class="flex justify-center"><Medal class="w-4 h-4 text-zinc-400" /></div>
                    <div v-else-if="idx === 2" class="flex justify-center"><Medal class="w-4 h-4 text-amber-700" /></div>
                    <span v-else class="font-mono text-xs font-bold text-zinc-500">{{ rank.rank }}</span>
                  </TableCell>
                  <TableCell class="font-mono text-xs text-zinc-500">{{ rank.supplier?.code }}</TableCell>
                  <TableCell class="font-medium text-zinc-900 text-sm truncate max-w-[180px]">{{ rank.supplier?.name }}</TableCell>
                  <TableCell class="text-right font-mono font-bold text-zinc-900 text-sm">
                    {{ parseFloat(rank.appraisal_score).toFixed(4) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>
