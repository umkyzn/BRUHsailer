const UIManager = {
  isHighlightModeActive: false,
  highlightColor: "green",

  getHighlightColorStorageKey: function () {
    return "highlightColorPreference";
  },
  setHighlightColor: function (color) {
    const validColors = ["green", "yellow", "blue", "pink"];
    if (validColors.includes(color)) {
      this.highlightColor = color;
      localStorage.setItem(this.getHighlightColorStorageKey(), color);
      document.querySelectorAll(".color-picker-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === color);
      });
    } else {
      console.warn(`Invalid highlight color: ${color}`);
    }
  },
  initializeHighlightColor: function () {
    const savedColor = localStorage.getItem(this.getHighlightColorStorageKey());
    if (savedColor) {
      this.setHighlightColor(savedColor);
    } else {
      this.setHighlightColor(this.highlightColor);
    }
  },
  attachEventListeners: function () {
    const self = this;
    document.querySelectorAll(".color-picker-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const color = e.target.dataset.color;
        self.setHighlightColor(color);
      });
    });

    document.querySelectorAll(".section-header").forEach((header) => {
      header.addEventListener("click", function () {
        const sectionElement = this.closest(".guide-section");
        if (sectionElement) {
          const content = sectionElement.querySelector(".section-content");
          if (content) {
            content.classList.toggle("active");
            this.classList.toggle("active");
          } else {
            console.warn(
              "Could not find .section-content within section:",
              sectionElement
            );
          }
        } else {
          console.warn(
            "Could not find parent .guide-section for header:",
            this
          );
        }
      });
    });

    document.querySelectorAll(".chapter-title").forEach((header) => {
      header.addEventListener("click", function () {
        const chapterElement = this.closest(".guide-chapter");
        if (chapterElement) {
          const content = chapterElement.querySelector(".chapter-content");
          if (content) {
            content.classList.toggle("active");
            this.classList.toggle("active");
          } else {
            console.warn(
              "Could not find .chapter-content within chapter:",
              chapterElement
            );
          }
        } else {
          console.warn("Could not find parent .guide-chapter for title:", this);
        }
      });
    });

    document.querySelectorAll(".checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const stepId = this.id.replace("check-", "");
        const stepElement = document.getElementById(`step-${stepId}`);

        if (this.checked) {
          stepElement.classList.add("completed");

          const isMinimized = document
            .getElementById("minimizeCompletedToggle")
            .classList.contains("active");

          if (isMinimized) {
            const stepContent = stepElement.querySelector(".step-content");
            if (stepContent) {
              stepContent.classList.add("hidden-by-completion");
            }
          }
        } else {
          stepElement.classList.remove("completed");

          const stepContent = stepElement.querySelector(".step-content");
          if (stepContent) {
            stepContent.classList.remove("hidden-by-completion");
          }
        }

        ProgressManager.saveProgress();
        ProgressManager.updateProgress();

        const activeFilter = document
          .querySelector(".filter-btn.active")
          .getAttribute("data-filter");
        FilterManager.applyCurrentFilter(activeFilter);
      });
    });

    document.querySelectorAll(".step-header").forEach((header) => {
      header.addEventListener("click", function (e) {
        if (e.target.type !== "checkbox") {
          const checkbox = this.querySelector(".checkbox");
          checkbox.checked = !checkbox.checked;

          const changeEvent = new Event("change");
          checkbox.dispatchEvent(changeEvent);
        }
      });
    });

    let previousFilter = null;
    const searchInput = document.getElementById("searchInput");

    function setFilter(filterName) {
      const btn = document.querySelector(`.filter-btn[data-filter="${filterName}"]`);
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (window.FilterManager && typeof window.FilterManager.applyCurrentFilter === 'function') {
        window.FilterManager.applyCurrentFilter(filterName);
      } else if (typeof FilterManager !== 'undefined' && typeof FilterManager.applyCurrentFilter === 'function') {
        FilterManager.applyCurrentFilter(filterName);
      }
    }

    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    const debouncedSearch = debounce(() => {
      const searchTerm = searchInput.value.trim();
      if (searchTerm.length > 0 && previousFilter === null) {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) previousFilter = activeBtn.getAttribute('data-filter');
      }
      if (searchTerm.length > 0) {
        setFilter('all');
      }
      if (searchTerm.length === 0) {
        if (previousFilter && previousFilter !== 'all') {
          setFilter(previousFilter);
        } else {
          setFilter('all');
        }
        previousFilter = null;
      }
      self.performSearch();
    }, 750);
    searchInput.addEventListener("input", debouncedSearch);

    function handleClearSearch() {
      if (searchInput.value.trim().length === 0) {
        if (previousFilter && previousFilter !== 'all') {
          setFilter(previousFilter);
        } else {
          setFilter('all');
        }
        previousFilter = null;
        self.performSearch();
      }
    }
    searchInput.addEventListener("paste", () => {
      setTimeout(handleClearSearch.bind(self), 0);
    });
    searchInput.addEventListener("cut", () => {
      setTimeout(handleClearSearch.bind(self), 0);
    });

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        setFilter(this.getAttribute("data-filter"));
      });
    });

    const highlightToggleButton = document.getElementById("highlightToggle");
    const guideContent = document.getElementById("guideContent");

    if (highlightToggleButton) {
      highlightToggleButton.addEventListener("click", () => {
        self.toggleHighlightMode();
      });
    }

    if (guideContent) {
      guideContent.addEventListener("mouseup", () => {
        self.handleHighlightSelection();
      });
    }
    if (guideContent) {
      guideContent.addEventListener("click", (event) => {
        if (
          self.isHighlightModeActive &&
          event.target.classList.contains("highlighted-text")
        ) {
          self.removeHighlight(event.target);
        }
      });
    }
    const highlightControlWrapper = document.querySelector(
      ".highlight-control-wrapper"
    );
    const highlightColorPicker = document.getElementById(
      "highlightColorPicker"
    );
    let leaveTimeout;

    if (highlightControlWrapper && highlightColorPicker) {
      highlightControlWrapper.addEventListener("mouseenter", () => {
        clearTimeout(leaveTimeout);
        const button = document.getElementById("highlightToggle");
        if (!button) return;

        highlightColorPicker.classList.add("visible");
      });

      const hidePicker = () => {
        leaveTimeout = setTimeout(() => {
          highlightColorPicker.classList.remove("visible");
        }, 350);
      };

      highlightControlWrapper.addEventListener("mouseleave", hidePicker);
      highlightColorPicker.addEventListener("mouseenter", () => {
        clearTimeout(leaveTimeout);
      });
      highlightColorPicker.addEventListener("mouseleave", hidePicker);
    }
  },

  clearSearchHighlights: function () {
    document.querySelectorAll(".search-highlight").forEach((span) => {
      const parent = span.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      }
    });
  },

  highlightSearchTerm: function (element, searchTerm) {
    if (!element || !searchTerm || searchTerm.length === 0) return 0;

    const term = searchTerm.toLowerCase();
    let matchCount = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodesToProcess = [];

    let currentNode;
    while (currentNode = walker.nextNode()) {
        if (currentNode.nodeValue.toLowerCase().includes(term) &&
            !currentNode.parentElement.classList.contains('search-highlight')) {
            nodesToProcess.push(currentNode);
        }
    }

    nodesToProcess.forEach(textNode => {
        const nodeValue = textNode.nodeValue;
        const lcNodeValue = nodeValue.toLowerCase();
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let index;

        while ((index = lcNodeValue.indexOf(term, lastIndex)) > -1) {
            matchCount++;

            if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(nodeValue.substring(lastIndex, index)));
            }

            const highlightSpan = document.createElement("span");
            highlightSpan.className = "search-highlight";
            highlightSpan.textContent = nodeValue.substring(index, index + term.length);
            fragment.appendChild(highlightSpan);

            lastIndex = index + term.length;
        }

        if (lastIndex < nodeValue.length) {
            fragment.appendChild(document.createTextNode(nodeValue.substring(lastIndex)));
        }

        if (fragment.childNodes.length > 0 && textNode.parentNode) {
             textNode.parentNode.replaceChild(fragment, textNode);
        }
    });

    return matchCount;
  },


  performSearch: function () {
    this.clearSearchHighlights();
    const searchInput = document.getElementById("searchInput");
    const searchTerm = searchInput.value.trim().toLowerCase();
    const steps = document.querySelectorAll(".step");
    let overallMatchFound = false;

    if (!searchTerm) {
      steps.forEach(step => step.classList.remove("hidden-by-search"));
      document.querySelectorAll(".guide-section, .guide-chapter").forEach(el => el.classList.remove("hidden-by-search"));

      document.querySelectorAll(".section-content.active, .chapter-content.active").forEach(content => {
        if (!content.closest('.guide-section')?.classList.contains('hidden-by-filter') &&
            !content.closest('.guide-chapter')?.classList.contains('hidden-by-filter')) {

        } else {
           content.classList.remove("active");
           const header = content.previousElementSibling;
           if (header) header.classList.remove("active");
        }
      });
      return;
    }

    steps.forEach((step) => {
      let stepMatchCount = 0;
      const allTextMatch = step.innerText.toLowerCase().includes(searchTerm);

      const description = step.querySelector(".step-description");
      const meta = step.querySelector(".step-meta");
      const footnotes = step.querySelectorAll(".footnote-content");

      if (description) {
        stepMatchCount += this.highlightSearchTerm(description, searchTerm);
      }
      if (meta) {
        stepMatchCount += this.highlightSearchTerm(meta, searchTerm);
      }
      footnotes.forEach(footnote => {
        stepMatchCount += this.highlightSearchTerm(footnote, searchTerm);
      });

      const isVisible = allTextMatch;
      step.classList.toggle("hidden-by-search", !isVisible);
      step.style.display = isVisible ? "block" : "none";
      if (isVisible) {
        overallMatchFound = true;
      }
    });

    document.querySelectorAll(".guide-section").forEach((section) => {
      const visibleStepsInSection = Array.from(section.querySelectorAll(".step")).some(
        (step) => step.style.display !== "none"
      );
      section.classList.toggle("hidden-by-search", !visibleStepsInSection);
      if (visibleStepsInSection) {
        overallMatchFound = true;
        const content = section.querySelector(".section-content");
        const header = section.querySelector(".section-header");
        if (content && !content.classList.contains('active')) content.classList.add("active");
        if (header && !header.classList.contains('active')) header.classList.add("active");
      }
    });

    document.querySelectorAll(".guide-chapter").forEach((chapter) => {
       const visibleSectionsInChapter = Array.from(chapter.querySelectorAll(".guide-section")).some(
         (section) => !section.classList.contains("hidden-by-search")
       );
       chapter.classList.toggle("hidden-by-search", !visibleSectionsInChapter);

        if (visibleSectionsInChapter) {
            overallMatchFound = true;
            const content = chapter.querySelector(".chapter-content");
            const title = chapter.querySelector(".chapter-title");
            if (content && !content.classList.contains('active')) content.classList.add("active");
            if (title && !title.classList.contains('active')) title.classList.add("active");
        }
    });

  },

  getHighlightStorageKey: function () {
    return Utils.getStorageKey("userHighlights");
  },
  saveHighlights: function () {
    const highlights = [];
    document
      .querySelectorAll("#guideContent .highlighted-text")
      .forEach((span, index) => {
        const range = document.createRange();
        range.selectNodeContents(span);
        const parentStep = span.closest(".step");
        if (!parentStep || !parentStep.id) {
          console.warn(
            "Highlighted text found outside a step or step lacks ID, cannot save reliably.",
            span
          );
          return;
        }
        const parentId = parentStep.id;
        const colorClass = Array.from(span.classList).find((cls) =>
          cls.startsWith("highlight-")
        );
        const color = colorClass
          ? colorClass.replace("highlight-", "")
          : this.highlightColor;

        highlights.push({
          parentId: parentId,
          htmlContent: span.innerHTML,
          color: color,
        });
      });
    localStorage.setItem(
      this.getHighlightStorageKey(),
      JSON.stringify(highlights)
    );
  },

  loadHighlights: function () {
    const savedHighlights = JSON.parse(
      localStorage.getItem(this.getHighlightStorageKey()) || "[]"
    );
    if (!savedHighlights.length) return;
    savedHighlights.forEach((highlightData) => {
      const parentElement = document.getElementById(highlightData.parentId);
      if (!parentElement) {
        console.warn(
          `Parent element ${highlightData.parentId} not found for highlight.`
        );
        return;
      }
      const walker = document.createTreeWalker(
        parentElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      let node;
      while ((node = walker.nextNode())) {
        const index = node.nodeValue.indexOf(highlightData.htmlContent);
        if (index !== -1) {
          if (node.parentElement.classList.contains("highlighted-text")) {
            continue;
          }

          try {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + highlightData.htmlContent.length);

            const span = document.createElement("span");
            const colorToApply = highlightData.color || "green";
            span.className = `highlighted-text highlight-${colorToApply}`;
            range.surroundContents(span);
            break;
          } catch (e) {
            console.error("Error re-applying highlight:", e, highlightData);
          }
        }
      }
    });
  },
  removeHighlight: function (spanElement) {
    if (!spanElement || !spanElement.classList.contains("highlighted-text"))
      return;

    const parent = spanElement.parentNode;
    while (spanElement.firstChild) {
      parent.insertBefore(spanElement.firstChild, spanElement);
    }
    parent.removeChild(spanElement);
    parent.normalize();

    this.saveHighlights();
  },

  removeAllHighlights: function () {
    document
      .querySelectorAll("#guideContent .highlighted-text")
      .forEach((span) => {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
      });
    localStorage.removeItem(this.getHighlightStorageKey());
  },
  showSaveToast: function (message = "Progress saved") {
    Utils.showToast(message);
  },
  jumpToLastCompletedStep: function () {
    const completedSteps = document.querySelectorAll(".step.completed");
    if (completedSteps.length > 0) {
      const lastCompletedStep = completedSteps[completedSteps.length - 1];

      const chapterContent = lastCompletedStep.closest(".chapter-content");
      if (chapterContent) {
        chapterContent.classList.add("active");
        const chapterHeader = chapterContent.previousElementSibling;
        if (chapterHeader) {
          chapterHeader.classList.add("active");
        }
      }
      const sectionContent = lastCompletedStep.closest(".section-content");
      if (sectionContent) {
        sectionContent.classList.add("active");
        const sectionHeader = sectionContent.previousElementSibling;
        if (sectionHeader) {
          sectionHeader.classList.add("active");
        }
      }

      setTimeout(() => {
        lastCompletedStep.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  },
  toggleHighlightMode: function () {
    this.isHighlightModeActive = !this.isHighlightModeActive;
    document.body.classList.toggle(
      "highlight-mode-active",
      this.isHighlightModeActive
    );
    const highlightToggleButton = document.getElementById("highlightToggle");
    if (highlightToggleButton) {
      highlightToggleButton.classList.toggle(
        "active",
        this.isHighlightModeActive
      );
    }
    document.body.classList.toggle(
      "highlight-cursor-active",
      this.isHighlightModeActive
    );
  },
  handleHighlightSelection: function () {
    console.log("handleHighlightSelection called", this.isHighlightModeActive);
    if (!this.isHighlightModeActive) return;

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const guideContent = document.getElementById("guideContent");

    if (
      !guideContent ||
      !guideContent.contains(range.commonAncestorContainer)
    ) {
      console.log("Selection not inside guideContent or guideContent missing", guideContent, range.commonAncestorContainer);
      return;
    }

    let stepContent = null;
    let node = range.startContainer;
    while (node && node !== guideContent) {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("step-content")) {
        stepContent = node;
        break;
      }
      node = node.parentNode;
    }
    if (!stepContent) {
      console.warn("Highlight selection is not inside a .step-content element. Aborting highlight.");
      return;
    }

    console.log("Selection IS inside step-content", stepContent);
    try {
      const highlightColor = this.highlightColor;
      const walker = document.createTreeWalker(
        stepContent,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const intersectedNodes = [];
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        let intersects = false;
        if (typeof range.intersectsNode === 'function') {
          intersects = range.intersectsNode(currentNode);
        } else {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(currentNode);
          intersects =
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0;
        }
        if (intersects) {
          intersectedNodes.push(currentNode);
        }
      }
      let didHighlight = false;
      for (const node of intersectedNodes) {
        let highlightStart = 0;
        let highlightEnd = node.nodeValue.length;
        if (node === range.startContainer) {
          highlightStart = range.startOffset;
        }
        if (node === range.endContainer) {
          highlightEnd = range.endOffset;
        }
        if (highlightStart >= highlightEnd) continue;
        const fragment = document.createDocumentFragment();
        const before = node.nodeValue.slice(0, highlightStart);
        const middle = node.nodeValue.slice(highlightStart, highlightEnd);
        const after = node.nodeValue.slice(highlightEnd);
        if (before) fragment.appendChild(document.createTextNode(before));
        if (middle) {
          const span = document.createElement("span");
          span.className = `highlighted-text highlight-${highlightColor}`;
          span.textContent = middle;
          fragment.appendChild(span);
        }
        if (after) fragment.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(fragment, node);
        didHighlight = true;
      }
      selection.removeAllRanges();
      if (didHighlight) {
        this.mergeAdjacentHighlights(stepContent);
        this.saveHighlights();
      }
    } catch (e) {
      console.error("Error applying highlight:", e);
      selection.removeAllRanges();
    }
  },
  mergeAdjacentHighlights: function(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.ELEMENT_NODE,
      null,
      false
    );
    let node = walker.currentNode;
    while (node) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.classList &&
        node.classList.contains("highlighted-text")
      ) {
        let next = node.nextSibling;
        while (
          next &&
          next.nodeType === Node.ELEMENT_NODE &&
          next.classList &&
          next.classList.contains("highlighted-text") &&
          next.className === node.className
        ) {
          node.textContent += next.textContent;
          let toRemove = next;
          next = next.nextSibling;
          toRemove.parentNode.removeChild(toRemove);
        }
      }
      node = walker.nextNode();
    }
  },
  initializeHighlights: function () {
    this.loadHighlights();
  },
  toggleDarkMode: function () {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  },
  initializeDarkMode: function () {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    } else if (localStorage.getItem("darkMode") === "false") {
      document.body.classList.remove("dark-mode");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-mode");
      }
    }
  },
};
