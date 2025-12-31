<template>
  <div class="drawer min-h-screen bg-base-200" :class="{ 'lg:drawer-open': isSidebarOpen }">
    <!-- Sidebar Toggle -->
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" :checked="isSidebarOpen" />
    
    <!-- Main Content -->
    <div class="drawer-content flex flex-col transition-all duration-300 min-h-screen">
      <!-- Navbar -->
      <nav class="navbar glass-panel sticky top-0 z-30 print:hidden h-16 px-6 gap-2">
        <div class="flex-none">
          <!-- Mobile Toggle -->
          <label for="sidebar-drawer" class="btn btn-ghost btn-square lg:hidden" @click="isSidebarOpen = !isSidebarOpen">
            <Menu class="w-5 h-5" />
          </label>
           <!-- Desktop Toggle (Moved back to Top) -->
          <button class="btn btn-ghost btn-sm px-0 hidden lg:flex" @click="toggleSidebar">
            <component :is="isSidebarOpen ? PanelLeftClose : PanelLeftOpen" class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex-1"></div>
        
        <div class="flex-none gap-2">
          <!-- Theme Toggle -->
          <button class="btn btn-ghost btn-circle hover:bg-base-200 transition-colors" @click="toggleDark">
            <Sun v-if="isDark" class="w-5 h-5 text-warning" />
            <Moon v-else class="w-5 h-5 text-primary" />
          </button>
          <!-- Search -->
          <button class="btn btn-ghost btn-circle hover:bg-base-200 transition-colors" @click="showSearchModal = true">
            <Search class="w-5 h-5" />
          </button>
          <!-- User Menu -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder ring ring-primary ring-offset-base-100 ring-offset-2">
              <div class="bg-neutral text-neutral-content rounded-full w-10">
                <span>DR</span>
              </div>
            </label>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100/90 backdrop-blur rounded-box w-52 border border-base-200">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li class="text-error"><a>Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>
      
      <!-- Breadcrumb Bar (Below Navbar) -->
      <div class="flex items-center px-6 py-2 gap-2 border-b border-base-content/5 bg-base-100/30 backdrop-blur print:hidden">
        <!-- Breadcrumbs -->
        <div class="text-sm breadcrumbs">
          <ul>
            <li>
              <NuxtLink to="/" class="flex items-center gap-1 opacity-70 hover:opacity-100">
                <Home class="w-4 h-4" />
              </NuxtLink>
            </li>
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
              <NuxtLink 
                v-if="index < breadcrumbs.length - 1" 
                :to="crumb.path"
                class="opacity-70 hover:opacity-100 font-medium"
              >
                {{ crumb.label }}
              </NuxtLink>
              <span v-else class="font-bold text-primary">{{ crumb.label }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Page Content -->
      <main class="flex-1 p-6 relative print:bg-white print:p-0">
        <!-- Background Gradient Orb -->
        <div class="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/5 to-secondary/5 -z-10 pointer-events-none print:hidden"></div>
        <div class="animate-fade-in">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- Sidebar -->
    <div class="drawer-side z-40 print:hidden">
      <label for="sidebar-drawer" class="drawer-overlay"></label>
      <aside class="glass-sidebar w-72 min-h-full flex flex-col">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-base-content/5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/30">
              R
            </div>
            <div>
              <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">RIPAC</h1>
            </div>
          </div>
        </div>
        
        <!-- Menu -->
        <ul class="menu p-4 gap-2 text-base font-medium flex-1">
          <li>
            <NuxtLink to="/" :class="{ 'active !bg-primary/10 !text-primary': route.path === '/' }">
              <Home class="w-5 h-5" />
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/doctors" :class="{ 'active !bg-primary/10 !text-primary': route.path.startsWith('/doctors') }">
              <UserRound class="w-5 h-5" />
              Doctors
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/patients" :class="{ 'active !bg-primary/10 !text-primary': route.path.startsWith('/patients') }">
              <Users class="w-5 h-5" />
              Patients
            </NuxtLink>
          </li>
          <li class="mt-auto">
             <NuxtLink to="/settings" :class="{ 'active !bg-primary/10 !text-primary': route.path === '/settings' }">
              <Settings class="w-5 h-5" />
              Settings
            </NuxtLink>
          </li>
        </ul>
        
        <!-- Footer -->
        <div class="p-4 text-xs text-center opacity-40">
          v1.0.0
        </div>
      </aside>
    </div>
    
    <!-- Command Palette -->
    <CommandPalette v-model="showSearchModal" />
  </div>
</template>

<script setup lang="ts">
import { Home, Users, UserRound, Settings, Search, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';

const route = useRoute();
const { isDark, toggleDark } = useTheme();

const isSidebarOpen = ref(true); // Default open on desktop
const showSearchModal = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
    // Force drawer toggle check
    const drawerCheckbox = document.getElementById('sidebar-drawer') as HTMLInputElement;
    if (drawerCheckbox) drawerCheckbox.checked = isSidebarOpen.value;
};

const breadcrumbs = computed(() => {
  const path = route.path;
  if (path === '/') return [];

  const parts = path.split('/').filter(Boolean);
  const crumbs = [];
  let currentPath = '';

  for (const part of parts) {
    currentPath += `/${part}`;
    let label = part.charAt(0).toUpperCase() + part.slice(1);
    
    // Custom label mapping
    if (part === 'patients') label = 'Patients';
    if (part === 'doctors') label = 'Doctors';
    if (part === 'settings') label = 'Settings';
    if (part === 'registrations') label = 'Registrations';
    if (part === 'new') label = 'New Registration';
    
    // ID detection (simple heuristic)
    if (part.match(/^[0-9a-fA-F-]{10,}$/)) { 
      label = 'Details'; 
    }

    crumbs.push({ path: currentPath, label });
  }
  return crumbs;
});

// Keyboard shortcut for search
useKeyboardShortcuts([
  { key: 'k', ctrl: true, handler: () => showSearchModal.value = true, description: 'Search' },
]);
</script>
