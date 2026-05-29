<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Lock } from 'lucide-vue-next'

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const isLoading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMsg.value = '';

  try {
    await authStore.login(form.value);
    router.push('/'); // Redirect ke Dashboard
  } catch (err) {
    // Tangkap error 401 atau 422 dari backend
    errorMsg.value = err.response?.data?.meta?.message || 'Login gagal, periksa koneksi Anda.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
    <Card class="w-full max-w-md shadow-xl border-zinc-200">
      <CardHeader class="space-y-1 text-center">
        <img src="/assets/images/logo.png" alt="Logo" class="w-24 h-24 mx-auto" />
        <CardTitle class="text-2xl font-bold tracking-tight">Selamat Datang</CardTitle>
        <CardDescription>
          Masukkan kredensial Anda.
          </CardDescription>
      </CardHeader>

      <form @submit.prevent="handleLogin">
        <CardContent class="grid gap-4">
          <div v-if="errorMsg" class="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
            {{ errorMsg }}
          </div>

          <div class="grid gap-2">
            <Label for="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@example.com"
              v-model="form.email"
              required
              class="focus-visible:ring-zinc-900"
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              required
              class="focus-visible:ring-zinc-900"
            />
          </div>
        </CardContent>

        <CardFooter class="mt-4">
          <Button
            type="submit"
            class="w-full bg-zinc-900 hover:bg-zinc-800 py-6 text-base cursor-pointer"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Memproses...' : 'Masuk ke Sistem' }}
          </Button>
        </CardFooter>
      </form>
    <div class="mt-2 text-center">
      <router-link to="/forgot-password" class="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
        Lupa Password?
      </router-link>
    </div>
    </Card>

  </div>
</template>
