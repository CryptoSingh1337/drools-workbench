export type FileItem = {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileItem[];
};

export const useFileStore = defineStore("file", () => {
  const currentPath = ref<string[]>([]);

  const rootFiles: FileItem[] = [
    {
      name: "Documents",
      type: "folder",
      children: [
        { name: "Resume.pdf", type: "file", extension: "pdf" },
        { name: "Notes.txt", type: "file", extension: "txt" },
      ],
    },
    {
      name: "Images",
      type: "folder",
      children: [
        { name: "photo1.jpg", type: "file", extension: "jpg" },
        { name: "photo2.png", type: "file", extension: "png" },
      ],
    },
    {
      name: "Readme.md",
      type: "file",
      extension: "md",
    },
  ];

  const getFiles = computed(() => {
    let files = rootFiles;
    for (const folder of currentPath.value) {
      const found = files.find((f) => f.name === folder && f.type === "folder");
      if (!found || !found.children) return [];
      files = found.children;
    }
    return files;
  });

  function navigateTo(path: string[]) {
    currentPath.value = path;
  }

  function goBackTo(level: number) {
    currentPath.value = currentPath.value.slice(0, level + 1);
  }

  return { currentPath, getFiles, navigateTo, goBackTo, rootFiles };
});
