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
              const sentenceGroups = this.splitContentBySentences(
                step.content
              );

              if (sentenceGroups.length <= 1) {
                description.appendChild(
                  this.renderFormattedContent(step.content)
                );
              } else {
                const taskList = document.createElement("ul");
                taskList.className = "step-task-list";
                sentenceGroups.forEach((group) => {
                  const li = document.createElement("li");
                  li.appendChild(this.renderFormattedContent(group));
                  taskList.appendChild(li);
                });
                description.appendChild(taskList);
              }

              if (step.nestedContent && step.nestedContent.length > 0) {
                step.nestedContent.forEach((nested) => {
                  const nestedElement = document.createElement("div");
                  nestedElement.className = `nested-content level-${nested.level}`;

                  if (nested.content && Array.isArray(nested.content)) {
                    const nestedGroups = this.splitContentBySentences(
                      nested.content
                    );

                    if (nestedGroups.length <= 1) {
                      nestedElement.appendChild(
                        this.renderFormattedContent(nested.content)
                      );
                    } else {
                      const nestedList = document.createElement("ul");
                      nestedList.className = "step-task-list";
                      nestedGroups.forEach((group) => {
                        const li = document.createElement("li");
                        li.appendChild(this.renderFormattedContent(group));
                        nestedList.appendChild(li);
                      });
                      nestedElement.appendChild(nestedList);
                    }
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
   * Splits a content array into per-sentence groups so each sentence can
   * render as its own bullet. Preserves per-segment formatting; never
   * splits inside a link segment. Returns Array<Array<segment>>.
   */
  splitContentBySentences(contentArray) {
    const ABBREVIATIONS = new Set([
      "e.g",
      "i.e",
      "etc",
      "vs",
      "mr",
      "mrs",
      "ms",
      "dr",
      "st",
      "no",
      "approx",
      "ca",
      "cf",
      "ft",
    ]);

    const isLinkSegment = (item) =>
      (item.isLink && item.url) ||
      (item.formatting && item.formatting.isLink && item.formatting.url);

    const isAbbreviationBefore = (text, periodIdx) => {
      let start = periodIdx - 1;
      while (start >= 0 && /[A-Za-z.]/.test(text[start])) start--;
      const token = text.slice(start + 1, periodIdx).toLowerCase();
      return ABBREVIATIONS.has(token);
    };

    // Flatten contentArray into one string with segment offset map.
    const segments = [];
    let flat = "";
    for (const item of contentArray) {
      if (!item || typeof item.text !== "string" || item.text.length === 0) continue;
      const start = flat.length;
      flat += item.text;
      segments.push({
        item,
        start,
        end: flat.length,
        atomic: isLinkSegment(item),
      });
    }

    const segmentAt = (offset) => {
      for (const seg of segments) {
        if (offset >= seg.start && offset < seg.end) return seg;
      }
      return null;
    };

    // Detect sentence boundaries: absolute offsets in `flat` where a new
    // sentence starts. Offset b means split before position b.
    const boundarySet = new Set();
    for (let i = 0; i < flat.length; i++) {
      const ch = flat[i];

      if (ch === "\n") {
        const seg = segmentAt(i);
        if (seg && seg.atomic) continue;
        boundarySet.add(i + 1);
        continue;
      }

      if (ch !== "." && ch !== "!" && ch !== "?") continue;

      const seg = segmentAt(i);
      if (seg && seg.atomic) continue;

      let j = i;
      while (j + 1 < flat.length && /[.!?]/.test(flat[j + 1])) j++;

      if (j + 1 >= flat.length) break;
      if (!/\s/.test(flat[j + 1])) {
        i = j;
        continue;
      }

      let k = j + 1;
      while (k < flat.length && /\s/.test(flat[k])) k++;
      if (k >= flat.length) break;

      if (ch === "." && isAbbreviationBefore(flat, i)) {
        i = j;
        continue;
      }

      boundarySet.add(k);
      i = k - 1;
    }

    const boundaries = [...boundarySet].sort((a, b) => a - b);

    // Walk segments, splitting at boundaries that fall inside or at edges.
    const groups = [[]];
    const pushPiece = (item, text) => {
      if (text.length === 0) return;
      groups[groups.length - 1].push({ ...item, text });
    };
    const closeGroup = () => {
      if (groups[groups.length - 1].length > 0) groups.push([]);
    };

    for (const seg of segments) {
      const inner = boundaries.filter((b) => b > seg.start && b < seg.end);
      let cursor = seg.start;
      for (const b of inner) {
        pushPiece(seg.item, flat.slice(cursor, b));
        closeGroup();
        cursor = b;
      }
      pushPiece(seg.item, flat.slice(cursor, seg.end));
      if (boundarySet.has(seg.end)) closeGroup();
    }

    // Trim leading whitespace on each group's first segment and trailing
    // on each group's last segment; drop segments that become empty and
    // groups that end up empty.
    const cleaned = [];
    for (const group of groups) {
      const trimmed = group.map((seg, idx) => {
        let text = seg.text;
        if (idx === 0) text = text.replace(/^\s+/, "");
        if (idx === group.length - 1) text = text.replace(/\s+$/, "");
        return { ...seg, text };
      }).filter((seg) => seg.text.length > 0);

      if (trimmed.some((seg) => seg.text.trim().length > 0)) {
        cleaned.push(trimmed);
      }
    }

    return cleaned;
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
