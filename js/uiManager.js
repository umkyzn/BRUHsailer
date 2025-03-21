const UIManager = {
  attachEventListeners: function () {
    document.querySelectorAll(".section-header").forEach((header) => {
      header.addEventListener("click", function () {
        const content = this.nextElementSibling;
        content.classList.toggle("active");
        this.classList.toggle("active");
      });
    });

    document.querySelectorAll(".chapter-title").forEach((header) => {
      header.addEventListener("click", function () {
        const content = this.nextElementSibling;
        content.classList.toggle("active");
        this.classList.toggle("active");
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
              stepContent.style.display = "none";
            }
          }
        } else {
          stepElement.classList.remove("completed");

          const stepContent = stepElement.querySelector(".step-content");
          if (stepContent) {
            stepContent.style.display = "block";
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

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.remove("active");
        });
        this.classList.add("active");

        const filter = this.getAttribute("data-filter");
        FilterManager.applyCurrentFilter(filter);
      });
    });

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const steps = document.querySelectorAll(".step");

      steps.forEach((step) => {
        const content = step
          .querySelector(".step-description")
          .textContent.toLowerCase();
        const isVisible = content.includes(searchTerm);
        step.style.display = isVisible ? "block" : "none";
      });

      document.querySelectorAll(".guide-section").forEach((section) => {
        const visibleSteps = Array.from(section.querySelectorAll(".step")).some(
          (step) => step.style.display !== "none"
        );

        if (visibleSteps) {
          section.style.display = "block";
          section.querySelector(".section-content").classList.add("active");
          section.querySelector(".section-header").classList.add("active");
        } else {
          section.style.display = "none";
        }
      });
    });
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
