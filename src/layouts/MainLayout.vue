<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  LayoutDashboard, ListTree, Users, Calculator,
  Trophy, LogOut, Menu, X, Calendar, UserCog
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

// State untuk mengontrol sidebar di mode mobile
const isMobileMenuOpen = ref(false);

const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
});

const firstName = computed(() => {
  const name = authStore.user?.name || 'Owner';
  return name.split(' ')[0];
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const navigation = computed(() => {
  const menus = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Kriteria', path: '/criteria', icon: ListTree, ownerOnly: true },
    { name: 'Supplier', path: '/suppliers', icon: Users },
    { name: 'Matriks Penilaian', path: '/evaluations', icon: Calculator },
    { name: 'Hasil Keputusan', path: '/rankings', icon: Trophy, ownerOnly: true },
    { name: 'Riwayat Keputusan', path: '/history', icon: Calendar, ownerOnly: true },
    { name: 'Manajemen Karyawan', path: '/users', icon: UserCog, ownerOnly: true }
  ];

  return menus.filter(item => {
    if (item.ownerOnly && !authStore.isOwner) return false;
    return true;
  })
})
</script>

<template>
  <div class="min-h-screen flex bg-zinc-50 font-sans text-zinc-900 overflow-x-hidden">

    <div
      v-if="isMobileMenuOpen"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/assets/images/logo.png" alt="logo" class="w-8 h-8 rounded-lg">
          <span class="font-semibold text-lg tracking-tight text-zinc-800">Mie Ngacoan</span>
        </div>
        <button @click="closeMobileMenu" class="md:hidden text-zinc-500 hover:text-zinc-900">
          <X class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          exact-active-class="bg-zinc-100 text-zinc-900 font-semibold"
        >
          <component :is="item.icon" class="w-5 h-5 text-zinc-500" />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-zinc-100">
        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
        >
          <LogOut class="w-5 h-5" />
          Keluar Sistem
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-screen md:ml-64 w-full transition-all duration-300">

      <header class="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">

        <div class="flex items-center gap-4">
          <button @click="isMobileMenuOpen = true" class="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100">
            <Menu class="w-6 h-6" />
          </button>

          <div>
            <h1 class="text-lg md:text-2xl font-semibold tracking-tight text-zinc-900 truncate">
              {{ timeGreeting }}, {{ firstName }}
            </h1>
            <p class="text-sm text-zinc-500 mt-0.5 hidden md:block">
              Berikut adalah ringkasan data pengambilan keputusan Anda hari ini.
            </p>
          </div>
        </div>

        <div class="w-9 h-9 md:w-10 md:h-10 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 shrink-0">
          <span class="text-sm font-medium text-zinc-600 cursor-default">
            {{ firstName.charAt(0).toUpperCase() }}
          </span>
        </div>
      </header>

      <div class="flex-1 p-4 md:p-8 max-w-full overflow-hidden">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

    </main>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>
