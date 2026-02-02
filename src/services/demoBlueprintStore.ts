import { BlueprintListItem } from "@/types/blueprint";

const STORAGE_KEY = "demo_blueprint_clones_v1";

function readFromStorage(): BlueprintListItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read demo blueprints from storage:", error);
    return [];
  }
}

function writeToStorage(items: BlueprintListItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to write demo blueprints to storage:", error);
  }
}

export const demoBlueprintStore = {
  getClones(): BlueprintListItem[] {
    return readFromStorage();
  },

  addClone(item: BlueprintListItem) {
    const items = readFromStorage();
    items.unshift(item); // Add to beginning (newest first)
    writeToStorage(items);
  },

  removeClone(id: string) {
    const items = readFromStorage();
    const filtered = items.filter(blueprint => blueprint.Id !== id);
    writeToStorage(filtered);
  },

  clear() {
    writeToStorage([]);
  }
};
