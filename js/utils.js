const Utils = {
  getGuideStorageNamespace: function () {
    if (window.GUIDE_STORAGE_NAMESPACE) {
      return window.GUIDE_STORAGE_NAMESPACE;
    }

    const guideDataPath = (window.GUIDE_DATA_PATH || "").toLowerCase();
    if (guideDataPath) {
      const fileName = guideDataPath.split("/").pop() || "";
      const normalized = fileName
        .replace(/\.json$/, "")
        .replace(/^guide_data[_-]?/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return normalized || "main";
    }

    const pathname = (window.location.pathname || "")
      .toLowerCase()
      .replace(/\/+$/, "");

    if (pathname.includes("/landlubber")) {
      return "landlubber";
    }

    return "main";
  },

  getStorageKey: function (baseKey) {
    return `${baseKey}:${this.getGuideStorageNamespace()}`;
  },

  getStorageItem: function (baseKey, legacyKey = null) {
    const scopedKey = this.getStorageKey(baseKey);
    const scopedValue = localStorage.getItem(scopedKey);
    if (scopedValue !== null) {
      return scopedValue;
    }

    if (!legacyKey) {
      return null;
    }

    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      localStorage.setItem(scopedKey, legacyValue);
    }

    return legacyValue;
  },

  setStorageItem: function (baseKey, value) {
    localStorage.setItem(this.getStorageKey(baseKey), value);
  },

  removeStorageItem: function (baseKey) {
    localStorage.removeItem(this.getStorageKey(baseKey));
  },

  showToast: function (message = "Progress saved", duration = 2000) {
    const toast = document.getElementById("saveToast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  },
};
