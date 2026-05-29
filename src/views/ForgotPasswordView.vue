<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, KeyRound, ShieldCheck, AlertTriangle } from 'lucide-vue-next';

const router = useRouter();

// Step 1: Minta Email, Step 2: Input OTP & Password Baru
const currentStep = ref(1);

// Form Data
const form = ref({
  email: '',
  otp: '',
  password: ''
});

// UI States
const isLoading = ref(false);
const serverError = ref('');
const successMessage = ref('');

// Fungsi Step 1
const handleSendOtp = async () => {
  isLoading.value = true;
  serverError.value = '';
  try {
    const res = await api.post('/forgot-password/send-otp', { email: form.value.email });
    successMessage.value = res.data.meta.message;
    currentStep.value = 2; // Pindah ke layar input OTP
  } catch (err) {
    serverError.value = err.response?.data?.meta?.message || 'Email tidak ditemukan di dalam sistem.';
  } finally {
    isLoading.value = false;
  }
};

// Fungsi Step 2
const handleResetPassword = async () => {
  isLoading.value = true;
  serverError.value = '';
  try {
    const res = await api.post('/forgot-password/reset', {
      email: form.value.email,
      otp: form.value.otp,
      password: form.value.password
    });

    alert(res.data.meta.message); // Notifikasi sukses
    router.push('/login'); // Lempar kembali ke halaman login
  } catch (err) {
    serverError.value = err.response?.data?.meta?.message || 'OTP salah atau terjadi kesalahan.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900">
    <div class="w-full max-w-md">

      <div class="mb-8 text-center">
        <div class="w-12 h-12 bg-zinc-900 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg">
          <KeyRound class="w-6 h-6 text-white" v-if="currentStep === 1" />
          <ShieldCheck class="w-6 h-6 text-white" v-else />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ currentStep === 1 ? 'Lupa Kata Sandi?' : 'Verifikasi OTP' }}
        </h1>
        <p class="text-zinc-500 text-sm mt-2">
          {{ currentStep === 1
          ? 'Masukkan email akun Anda. Kami akan mengirimkan 6 digit kode OTP untuk memulihkan akses.'
          : 'Masukkan kode 6 digit yang baru saja dikirimkan ke email Anda beserta kata sandi baru.'
          }}
        </p>
      </div>

      <div class="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 md:p-8">

        <div v-if="serverError" class="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ serverError }}</span>
        </div>

        <div v-if="successMessage && currentStep === 2" class="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-100 flex items-start gap-2">
          <Mail class="w-4 h-4 shrink-0 mt-0.5" />
          <span>{{ successMessage }}</span>
        </div>

        <form v-if="currentStep === 1" @submit.prevent="handleSendOtp" class="space-y-5">
          <div class="space-y-2">
            <Label for="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              v-model="form.email"
              placeholder="owner@example.com"
              required
              class="h-11 focus-visible:ring-zinc-900"
            />
          </div>
          <Button type="submit" class="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-base cursor-pointer" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Memproses...' : 'Kirim Kode OTP' }}
          </Button>
        </form>

        <form v-else @submit.prevent="handleResetPassword" class="space-y-5">
          <div class="space-y-2">
            <Label for="otp">Kode OTP (6 Digit)</Label>
            <Input
              id="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              v-model="form.otp"
              placeholder="000000"
              required
              class="h-11 text-center text-lg tracking-[0.5em] font-mono focus-visible:ring-zinc-900"
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Kata Sandi Baru</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Minimal 8 karakter"
              required
              class="h-11 focus-visible:ring-zinc-900"
            />
          </div>
          <Button type="submit" class="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-base cursor-pointer" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Memverifikasi...' : 'Ganti Kata Sandi' }}
          </Button>
        </form>

      </div>

      <div class="mt-6 text-center">
        <router-link to="/login" class="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Kembali ke halaman Login
        </router-link>
      </div>

    </div>
  </div>
</template>
