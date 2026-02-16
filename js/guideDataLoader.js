const getGuideDataPath = () => {
  if (window.GUIDE_DATA_PATH) {
    return window.GUIDE_DATA_PATH;
  }

  const path = window.location.pathname.toLowerCase();
  if (path.includes("/landlubber")) {
    return "../data/guide_data_landlubber.json";
  }

  return "data/guide_data.json";
};

const GuideDataLoader = {
  async loadGuideData() {
    try {
      const response = await fetch(getGuideDataPath());
      if (!response.ok) {
        throw new Error("Failed to load guide data");
      }

      const guideData = await response.json();
      const guideContent = document.getElementById("guideContent");

      guideContent.innerHTML = "";

      const lastUpdated = document.getElementById("lastUpdated");

      lastUpdated.innerHTML = `
        Last updated: ${guideData.updatedOn}
      `;

      guideData.chapters.forEach((chapter, chapterIndex) => {
        const chapterElement = document.createElement("div");
        chapterElement.className = "guide-chapter";

        const chapterHeader = document.createElement("h2");
        chapterHeader.className = "chapter-title";
        if (chapter.titleFormatted) {
          chapterHeader.appendChild(
            this.renderFormattedContent(chapter.titleFormatted)
          );
        } else {
          chapterHeader.textContent = chapter.title;
        }

        const chapterContent = document.createElement("div");
        chapterContent.className = "chapter-content";

        let chapterStepCount = 0;

        chapter.sections.forEach((section, sectionIndex) => {
          const sectionElement = document.createElement("div");
          sectionElement.className = "guide-section";

          const sectionHeader = document.createElement("div");
          sectionHeader.className = "section-header";
          sectionHeader.setAttribute(
            "data-section",
            `${chapterIndex + 1}.${sectionIndex + 1}`
          );

          const sectionId = `${chapterIndex + 1}.${sectionIndex + 1}`;

          sectionHeader.innerHTML = `
            <h2 class="section-title">${section.title}</h2>
            <span class="section-time"></span>
          `;

          const sectionContent = document.createElement("div");
          sectionContent.className = "section-content";

          section.steps.forEach((step, stepIndex) => {
            chapterStepCount++;

            const stepElement = document.createElement("div");
            stepElement.className = "step";
            stepElement.id = `step-${chapterIndex + 1}-${chapterStepCount}`;

            const stepHeader = document.createElement("div");
            stepHeader.className = "step-header";

            const timeDisplay =
              step.metadata && step.metadata.total_time
                ? step.metadata.total_time
                : "";

            stepHeader.innerHTML = `
              <div class="checkbox-container">
                <input type="checkbox" class="checkbox" id="check-${
                  chapterIndex + 1
                }-${chapterStepCount}">
                <span class="step-number">Step ${chapterStepCount}</span>
              </div>
              <span class="step-time">Time: ${timeDisplay}</span>
            `;

            const stepContent = document.createElement("div");
            stepContent.className = "step-content";

            const description = document.createElement("div");
            description.className = "step-description";

            if (step.content && Array.isArray(step.content)) {
              description.appendChild(
                this.renderFormattedContent(step.content)
              );

              if (step.nestedContent && step.nestedContent.length > 0) {
                step.nestedContent.forEach((nested) => {
                  const nestedElement = document.createElement("div");
                  nestedElement.className = `nested-content level-${nested.level}`;

                  if (nested.content && Array.isArray(nested.content)) {
                    nestedElement.appendChild(
                      this.renderFormattedContent(nested.content)
                    );
                  }

                  description.appendChild(nestedElement);
                });
              }
            }

            stepContent.appendChild(description);

            if (step.metadata && Object.keys(step.metadata).length > 0) {
              const metaContainer = document.createElement("div");
              metaContainer.className = "step-meta";

              const metadata = step.metadata;

              for (const key in metadata) {
                if (key === "total_time") continue;
                if (key === "skills_quests_met") continue;

                let displayName;
                if (key === "gp_stack") {
                  displayName = "GP Stack";
                } else if (key === "items_needed") {
                  displayName = "Items Needed";
                } else {
                  displayName = key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                }

                const metaItem = document.createElement("div");
                metaItem.className = "meta-item";

                const metaValue = metadata[key];

                metaItem.innerHTML = `
                  <strong>${displayName}:</strong>
                  <span>${metaValue}</span>
                `;
                metaContainer.appendChild(metaItem);
              }

              if (metaContainer.children.length > 0) {
                stepContent.appendChild(metaContainer);
              }
            }

            stepElement.appendChild(stepHeader);
            stepElement.appendChild(stepContent);
            sectionContent.appendChild(stepElement);
          });

          sectionElement.appendChild(sectionHeader);
          sectionElement.appendChild(sectionContent);
          chapterContent.appendChild(sectionElement);
        });

        if (chapter.footnotes && chapter.footnotes.length > 0) {
          const footnotesSection = document.createElement("div");
          footnotesSection.className = "guide-section footnotes-section";

          const footnotesHeader = document.createElement("div");
          footnotesHeader.className = "section-header footnotes-header";
          footnotesHeader.innerHTML = `
            <h2 class="section-title">End of chapter notes</h2>
          `;

          const footnotesContent = document.createElement("div");
          footnotesContent.className = "section-content footnotes-content";

          chapter.footnotes.forEach((footnote, footnoteIndex) => {
            if (footnote.content && Array.isArray(footnote.content)) {
              footnotesContent.appendChild(
                this.renderFormattedContent(footnote.content)
              );
            }
          });

          footnotesSection.appendChild(footnotesHeader);
          footnotesSection.appendChild(footnotesContent);
          chapterContent.appendChild(footnotesSection);
        }

        chapterElement.appendChild(chapterHeader);
        chapterElement.appendChild(chapterContent);
        guideContent.appendChild(chapterElement);
      });

      UIManager.attachEventListeners();
      ProgressManager.loadProgress();
      ProgressManager.updateProgress();

      const activeFilter = document
        .querySelector(".filter-btn.active")
        .getAttribute("data-filter");
      FilterManager.applyCurrentFilter(activeFilter);
    } catch (error) {
      console.error("Error loading guide data:", error);
      document.getElementById("guideContent").innerHTML = `
        <div class="error-message">
          <p>Failed to load guide data. Please try refreshing the page.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  },

  /**
   * Renders formatted content from the guide data
   * @param {Array} contentArray - Array of content items
   * @returns {HTMLElement} - Container with formatted content
   */
  renderFormattedContent(contentArray) {
    const container = document.createElement("div");

    contentArray.forEach((item) => {
      if (item.url && item.isLink) {
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.text;
        link.target = "_blank";
        link.className = "drive-link";
        this.applyFormatting(link, item.formatting);
        container.appendChild(link);
      } else if (
        item.formatting &&
        item.formatting.url &&
        item.formatting.isLink
      ) {
        const link = document.createElement("a");
        link.href = item.formatting.url;
        link.textContent = item.text;
        link.target = "_blank";
        link.className = "drive-link";
        this.applyFormatting(link, item.formatting);
        container.appendChild(link);
      } else if (/(https?:\/\/[^\s]+)/g.test(item.text)) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlMatches = item.text.match(urlRegex);
        let remainingText = item.text;

        urlMatches.forEach((url) => {
          const parts = remainingText.split(url);

          if (parts[0]) {
            const textSpan = document.createElement("span");
            textSpan.textContent = parts[0];
            this.applyFormatting(textSpan, item.formatting);
            container.appendChild(textSpan);
          }

          const link = document.createElement("a");
          link.href = url;
          link.textContent = url;
          link.target = "_blank";
          this.applyFormatting(link, item.formatting);
          container.appendChild(link);

          remainingText = parts.slice(1).join(url);
        });

        if (remainingText) {
          const textSpan = document.createElement("span");
          textSpan.textContent = remainingText;
          this.applyFormatting(textSpan, item.formatting);
          container.appendChild(textSpan);
        }
      } else {
        const span = document.createElement("span");
        span.textContent = item.text;
        this.applyFormatting(span, item.formatting);
        container.appendChild(span);
      }
    });

    return container;
  },

  /**
   * Applies formatting to HTML elements
   * @param {HTMLElement} element - Element to apply formatting to
   * @param {Object} formatting - Formatting options
   */
  applyFormatting(element, formatting) {
    if (!formatting) return;

    if (formatting.bold) {
      element.style.fontWeight = "bold";
    } else {
      element.style.fontWeight = "normal";
    }

    if (formatting.italic) element.style.fontStyle = "italic";
    else {
      element.style.fontStyle = "normal";
    }

    let textDecoration = "";
    if (formatting.underline) textDecoration += "underline ";
    if (formatting.strikethrough) textDecoration += "line-through ";

    if (textDecoration) {
      element.style.textDecoration = textDecoration.trim();
    } else {
      element.style.textDecoration = "none";
    }

    if (formatting.fontSize) {
      element.style.fontSize = `${formatting.fontSize + 2}px`;
    }

    if (formatting.fontFamily) {
      element.style.fontFamily = formatting.fontFamily;
    }

    if (formatting.color) {
      const color = formatting.color;
      if (
        color.r !== undefined &&
        color.g !== undefined &&
        color.b !== undefined
      ) {
        element.style.color = `rgb(${Math.round(color.r * 255)}, ${Math.round(
          color.g * 255
        )}, ${Math.round(color.b * 255)})`;
      }
    }
  },
};
