<script lang="ts" setup>
import { type FileItem } from "@/stores/files";

const fileStore = useFileStore();

const breadcrumbLinks = computed(() => [
  {
    label: "Home",
    icon: "i-heroicons-home",
    click: () => fileStore.navigateTo([]),
  },
  ...fileStore.currentPath.map((folder, idx) => ({
    label: folder,
    click: () => fileStore.goBackTo(idx),
  })),
]);

const searchQuery = ref("");
const selectedView = ref<"grid" | "list">("grid");
const selectedItems = ref<Set<string>>(new Set());

const filteredFiles = computed(() => {
  const files = fileStore.getFiles;
  if (!searchQuery.value) return files;

  return files.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const folderCount = computed(
  () => filteredFiles.value.filter((item) => item.type === "folder").length
);

const fileCount = computed(() => filteredFiles.value.filter((item) => item.type === "file").length);

function enterFolder(folderName: string) {
  fileStore.navigateTo([...fileStore.currentPath, folderName]);
}

function getFileIcon(item: FileItem) {
  if (item.type === "folder") return "i-heroicons-folder";

  const iconMap: Record<string, string> = {
    pdf: "i-heroicons-document-text",
    txt: "i-heroicons-document",
    md: "i-heroicons-document-text",
    jpg: "i-heroicons-photo",
    png: "i-heroicons-photo",
    jpeg: "i-heroicons-photo",
    gif: "i-heroicons-photo",
    doc: "i-heroicons-document-text",
    docx: "i-heroicons-document-text",
    xls: "i-heroicons-table-cells",
    xlsx: "i-heroicons-table-cells",
    ppt: "i-heroicons-presentation-chart-bar",
    pptx: "i-heroicons-presentation-chart-bar",
    zip: "i-heroicons-archive-box",
    rar: "i-heroicons-archive-box",
  };

  return iconMap[item.extension || ""] || "i-heroicons-document";
}

function getFileColor(item: FileItem) {
  if (item.type === "folder") return "text-blue-500";

  const colorMap: Record<string, string> = {
    pdf: "text-red-500",
    txt: "text-gray-500",
    md: "text-blue-600",
    jpg: "text-green-500",
    png: "text-green-500",
    jpeg: "text-green-500",
    gif: "text-green-500",
    doc: "text-blue-600",
    docx: "text-blue-600",
    xls: "text-green-600",
    xlsx: "text-green-600",
    ppt: "text-orange-500",
    pptx: "text-orange-500",
    zip: "text-purple-500",
    rar: "text-purple-500",
  };

  return colorMap[item.extension || ""] || "text-gray-500";
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
}

function toggleItemSelection(itemName: string) {
  if (selectedItems.value.has(itemName)) {
    selectedItems.value.delete(itemName);
  } else {
    selectedItems.value.add(itemName);
  }
}

function selectAll() {
  if (selectedItems.value.size === filteredFiles.value.length) {
    selectedItems.value.clear();
  } else {
    selectedItems.value = new Set(filteredFiles.value.map((item) => item.name));
  }
}

const viewOptions = [
  { value: "grid", label: "Grid", icon: "i-heroicons-squares-2x2" },
  { value: "list", label: "List", icon: "i-heroicons-list-bullet" },
];
</script>

<template>
  <UContainer class="m-0 flex h-screen max-w-screen bg-gray-50 !p-0 dark:bg-gray-900">
    <aside
      class="flex w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="border-b border-gray-200 p-6 dark:border-gray-700">
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-folder-open" class="h-8 w-8 text-blue-500" />
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">File Explorer</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Navigate your files</p>
          </div>
        </div>
      </div>
      <div class="space-y-3 p-4">
        <div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">Folders</span>
            <span class="text-lg font-bold text-blue-600 dark:text-blue-400">{{
              folderCount
            }}</span>
          </div>
        </div>
        <div class="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-green-700 dark:text-green-300">Files</span>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">{{
              fileCount
            }}</span>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <h3 class="mb-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Quick Access
        </h3>
        <div class="space-y-1">
          <UButton
            v-for="item in fileStore.rootFiles.filter((f) => f.type === 'folder')"
            :key="item.name"
            variant="ghost"
            class="w-full justify-start"
            :class="
              fileStore.currentPath[0] === item.name
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : ''
            "
            @click="fileStore.navigateTo([item.name])"
          >
            <UIcon :name="getFileIcon(item)" class="mr-3 h-4 w-4" :class="getFileColor(item)" />
            {{ item.name }}
          </UButton>
        </div>
      </div>
    </aside>
    <main class="flex flex-1 flex-col overflow-hidden">
      <header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="px-6 py-4">
          <div class="mb-4 flex items-center justify-between">
            <UBreadcrumb :links="breadcrumbLinks" class="flex-1" />
            <UButtonGroup size="sm" orientation="horizontal">
              <UButton
                v-for="option in viewOptions"
                :key="option.value"
                :variant="selectedView === option.value ? 'solid' : 'ghost'"
                :icon="option.icon"
                @click="selectedView = option.value"
              >
                {{ option.label }}
              </UButton>
            </UButtonGroup>
          </div>
          <div class="flex items-center justify-between gap-4">
            <div class="max-w-md flex-1">
              <UInput
                v-model="searchQuery"
                placeholder="Search files and folders..."
                icon="i-heroicons-magnifying-glass"
                size="lg"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing>
                  <UButton
                    v-show="searchQuery !== ''"
                    color="primary"
                    variant="link"
                    icon="i-heroicons-x-mark-20-solid"
                    :padded="false"
                    @click="searchQuery = ''"
                  />
                </template>
              </UInput>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                v-if="selectedItems.size > 0"
                color="error"
                variant="soft"
                icon="i-heroicons-trash"
                size="sm"
              >
                Delete ({{ selectedItems.size }})
              </UButton>
              <UButton variant="outline" icon="i-heroicons-arrow-up-tray" size="sm">
                Upload
              </UButton>
              <UButton color="primary" icon="i-heroicons-plus" size="sm"> New </UButton>
            </div>
          </div>
        </div>
      </header>
      <div class="flex-1 overflow-y-auto p-6">
        <div
          v-if="filteredFiles.length === 0"
          class="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-folder-open" class="mb-4 h-16 w-16 opacity-50" />
          <p class="text-lg font-medium">
            {{ searchQuery ? "No files found" : "This folder is empty" }}
          </p>
          <p class="text-sm">
            {{ searchQuery ? "Try adjusting your search terms" : "Add some files to get started" }}
          </p>
        </div>
        <div
          v-else-if="selectedView === 'grid'"
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <div
            v-for="item in filteredFiles"
            :key="item.name"
            class="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
            :class="selectedItems.has(item.name) ? 'border-blue-500 ring-2 ring-blue-500' : ''"
            @click="item.type === 'folder' ? enterFolder(item.name) : null"
            @contextmenu.prevent="toggleItemSelection(item.name)"
          >
            <div
              class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <UCheckbox
                :model-value="selectedItems.has(item.name)"
                @update:model-value="toggleItemSelection(item.name)"
                @click.stop
              />
            </div>
            <div class="flex flex-col items-center text-center">
              <div
                class="mb-3 rounded-lg bg-gray-50 p-3 transition-transform group-hover:scale-110 dark:bg-gray-700"
              >
                <UIcon :name="getFileIcon(item)" class="h-8 w-8" :class="getFileColor(item)" />
              </div>
              <h3
                class="w-full truncate text-sm font-medium text-gray-900 dark:text-white"
                :title="item.name"
              >
                {{ item.name }}
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ item.type === "folder" ? "Folder" : item.extension?.toUpperCase() || "File" }}
              </p>
            </div>
            <div
              class="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div class="flex justify-center gap-1">
                <UButton
                  v-if="item.type === 'file'"
                  icon="i-heroicons-eye"
                  size="xs"
                  variant="soft"
                  @click.stop
                />
                <UButton
                  icon="i-heroicons-ellipsis-horizontal"
                  size="xs"
                  variant="soft"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-600 dark:bg-gray-700"
          >
            <div class="flex items-center">
              <div class="mr-4 flex items-center">
                <UCheckbox
                  :model-value="
                    selectedItems.size === filteredFiles.length && filteredFiles.length > 0
                  "
                  :indeterminate="
                    selectedItems.size > 0 && selectedItems.size < filteredFiles.length
                  "
                  @update:model-value="selectAll"
                />
              </div>
              <div
                class="grid flex-1 grid-cols-4 gap-4 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                <div>Name</div>
                <div>Type</div>
                <div>Modified</div>
                <div>Size</div>
              </div>
            </div>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-600">
            <div
              v-for="item in filteredFiles"
              :key="item.name"
              class="flex cursor-pointer items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              :class="selectedItems.has(item.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
              @click="item.type === 'folder' ? enterFolder(item.name) : null"
            >
              <div class="mr-4 flex items-center">
                <UCheckbox
                  :model-value="selectedItems.has(item.name)"
                  @update:model-value="toggleItemSelection(item.name)"
                  @click.stop
                />
              </div>

              <div class="grid flex-1 grid-cols-4 items-center gap-4">
                <div class="flex items-center">
                  <UIcon
                    :name="getFileIcon(item)"
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="getFileColor(item)"
                  />
                  <span class="truncate font-medium text-gray-900 dark:text-white">{{
                    item.name
                  }}</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.type === "folder" ? "Folder" : item.extension?.toUpperCase() || "File" }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ new Date().toLocaleDateString() }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.type === "folder" ? "—" : formatFileSize(Math.random() * 1000000) }}
                </div>
              </div>
              <div class="ml-4">
                <UButton
                  icon="i-heroicons-ellipsis-horizontal"
                  variant="ghost"
                  size="sm"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </UContainer>
</template>
