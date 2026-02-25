const FilterManager = {
  loadFilterState: function () {
    const savedFilter = Utils.getStorageItem("guideFilter", "guideFilter");
    if (savedFilter) {
      const { filter, minimized } = JSON.parse(savedFilter);

      document.querySelectorAll(".filter-btn").forEach((btn) => {
        if (btn.getAttribute("data-filter") === filter) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      if (minimized) {
        document
          .getElementById("minimizeCompletedToggle")
          .classList.add("active");
      } else {
        document
          .getElementById("minimizeCompletedToggle")
          .classList.remove("active");
      }

      this.applyCurrentFilter(filter);
    }
  },

  saveFilterState: function () {
    const filter = document
      .querySelector(".filter-btn.active")
      .getAttribute("data-filter");
    const isMinimized = document
      .getElementById("minimizeCompletedToggle")
      .classList.contains("active");
    Utils.setStorageItem(
      "guideFilter",
      JSON.stringify({ filter: filter, minimized: isMinimized })
    );
  },

  applyCurrentFilter: function (filter) {
    if (!filter) {
      filter = document
        .querySelector(".filter-btn.active")
        .getAttribute("data-filter");
    }

    const steps = document.querySelectorAll(".step");
    const lastCompletedStep = document.querySelector(".step.highlight");
    const isMinimized = document
      .getElementById("minimizeCompletedToggle")
      .classList.contains("active");
    const sections = document.querySelectorAll(".guide-section");
    const chapters = document.querySelectorAll(".guide-chapter");

    if (lastCompletedStep) {
      lastCompletedStep.style.display = "block";
      const parentSection = lastCompletedStep.closest(".guide-section");
      const parentChapter = lastCompletedStep.closest(".guide-chapter");
      if (parentSection) {
        parentSection.style.display = "block";
        parentSection.querySelector(".section-content").classList.add("active");
        parentSection.querySelector(".section-header").classList.add("active");
      }
      if (parentChapter) {
        parentChapter.style.display = "block";
        parentChapter.querySelector(".chapter-content").classList.add("active");
      }
    }

    steps.forEach((step) => {
      if (step === lastCompletedStep) return;

      const isCompleted = step.classList.contains("completed");

      if (filter === "all") {
        step.style.display = "block";
      } else if (filter === "completed") {
        step.style.display = isCompleted ? "block" : "none";
      } else if (filter === "incomplete") {
        step.style.display = !isCompleted ? "block" : "none";
      }
    });

    steps.forEach((step) => {
      const stepContent = step.querySelector(".step-content");
      const isCompleted = step.classList.contains("completed");

      if (stepContent) {
        if (isMinimized && isCompleted) {
          stepContent.style.display = "none";
        } else {
          stepContent.style.display = "block";
        }
      }
    });

    sections.forEach((section) => {
      if (lastCompletedStep && section.contains(lastCompletedStep)) return;

      const sectionSteps = section.querySelectorAll(".step");
      const visibleSteps = Array.from(sectionSteps).filter(
        (step) => step.style.display !== "none"
      );
      const allStepsCompleted = Array.from(sectionSteps).every((step) =>
        step.classList.contains("completed")
      );

      if (section.classList.contains("footnotes-section")) {
        section.style.display = "block";
      } else {
        if (filter === "incomplete" && allStepsCompleted) {
          section.style.display = "none";
        } else {
          section.style.display = visibleSteps.length > 0 ? "block" : "none";
        }
      }
    });

    chapters.forEach((chapter) => {
      if (lastCompletedStep && chapter.contains(lastCompletedStep)) return;

      const chapterSections = Array.from(
        chapter.querySelectorAll(".guide-section")
      ).filter((section) => !section.classList.contains("footnotes-section"));

      const visibleSections = chapterSections.filter(
        (section) => section.style.display !== "none"
      );

      chapter.style.display = visibleSections.length > 0 ? "block" : "none";
    });

    this.saveFilterState();
  },
};
