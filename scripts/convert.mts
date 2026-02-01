import fs from "fs";
import path from "path";

// ====================================
// Type Definitions
// ====================================

interface RGBColor {
  red?: number;
  green?: number;
  blue?: number;
}

interface Color {
  rgbColor?: RGBColor;
}

interface ForegroundColor {
  color?: Color;
}

interface FontSize {
  magnitude?: number;
}

interface WeightedFontFamily {
  fontFamily?: string;
}

interface Link {
  url?: string;
}

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  foregroundColor?: ForegroundColor;
  fontSize?: FontSize;
  weightedFontFamily?: WeightedFontFamily;
  link?: Link;
}

interface TextRun {
  content: string;
  textStyle?: TextStyle;
}

interface RichLinkProperties {
  title?: string;
  uri?: string;
}

interface RichLink {
  richLinkProperties: RichLinkProperties;
  textStyle?: TextStyle;
}

interface ParagraphElement {
  textRun?: TextRun;
  richLink?: RichLink;
}

interface Bullet {
  listId: string;
  nestingLevel: number;
}

interface ParagraphStyle {
  alignment?: string;
}

interface Paragraph {
  elements?: ParagraphElement[];
  bullet?: Bullet;
  paragraphStyle?: ParagraphStyle;
}

interface ContentItem {
  paragraph?: Paragraph;
}

interface DocumentBody {
  content: ContentItem[];
}

interface DocumentTab {
  body: DocumentBody;
}

interface Tab {
  documentTab: DocumentTab;
}

interface GoogleDocsData {
  tabs: Tab[];
}

// Guide data structure types
interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  fontSize?: number;
  fontFamily?: string;
  url?: string;
  isLink?: boolean;
}

interface FormattedText {
  text: string;
  formatting?: TextFormatting;
  url?: string;
  isLink?: boolean;
}

interface StepMetadata {
  gp_stack?: string;
  items_needed?: string;
  skills_quests_met?: string;
  total_time?: string;
  "Skills/quests met to do step?:"?: string;
}

interface NestedContent {
  level: number;
  content: FormattedText[];
}

interface GuideStep {
  content: FormattedText[] | FormattedText;
  nestedContent: NestedContent[];
  metadata: StepMetadata;
  additionalContent?: FormattedText[][];
}

interface Footnote {
  content: FormattedText[];
  type: string;
  level?: number;
}

interface GuideSection {
  title: string;
  steps: GuideStep[];
  footnotes: Footnote[];
}

interface GuideChapter {
  title: string;
  sections: GuideSection[];
  footnotes: Footnote[];
  titleFormatted?: FormattedText[];
}

interface GuideStructure {
  title: string;
  chapters: GuideChapter[];
}

interface CombinedGuide {
  title: string;
  chapters: GuideChapter[];
  updatedOn?: string;
}

interface MetadataPattern {
  regex: RegExp;
  key: string;
}

// ====================================
// Core Functions
// ====================================

function extractTextWithFormatting(
  element: ParagraphElement
): FormattedText | null {
  if (element.textRun) {
    const text = element.textRun.content;
    const formatting: TextFormatting = {};

    if (element.textRun.textStyle) {
      const style = element.textRun.textStyle;

      if (style.bold) {
        formatting.bold = true;
      }

      if (style.italic) {
        formatting.italic = true;
      }

      if (style.underline) {
        formatting.underline = true;
      }

      if (style.strikethrough) {
        formatting.strikethrough = true;
      }

      if (
        style.foregroundColor &&
        style.foregroundColor.color &&
        style.foregroundColor.color.rgbColor
      ) {
        const rgb = style.foregroundColor.color.rgbColor;
        formatting.color = {
          r: rgb.red || 0,
          g: rgb.green || 0,
          b: rgb.blue || 0,
        };
      }

      if (style.fontSize && style.fontSize.magnitude) {
        formatting.fontSize = style.fontSize.magnitude;
      }

      if (style.weightedFontFamily && style.weightedFontFamily.fontFamily) {
        formatting.fontFamily = style.weightedFontFamily.fontFamily;
      }

      if (style.link) {
        formatting.url = style.link.url;
        formatting.isLink = true;
      }
    }

    return {
      text,
      formatting,
    };
  }

  if (element.richLink) {
    const richLink = element.richLink;
    const formatting: TextFormatting = {};

    if (richLink.textStyle) {
      const style = richLink.textStyle;

      if (style.bold) {
        formatting.bold = true;
      }

      if (style.italic) {
        formatting.italic = true;
      }

      formatting.underline = true;

      if (style.fontSize && style.fontSize.magnitude) {
        formatting.fontSize = style.fontSize.magnitude;
      }

      if (style.weightedFontFamily && style.weightedFontFamily.fontFamily) {
        formatting.fontFamily = style.weightedFontFamily.fontFamily;
      }
    }

    const linkText = richLink.richLinkProperties.title || "Link";
    const linkUrl = richLink.richLinkProperties.uri || "";

    return {
      text: linkText,
      url: linkUrl,
      isLink: true,
      formatting,
    };
  }

  return null;
}

function combineFormattedText(elements: ParagraphElement[]): FormattedText[] {
  const result: FormattedText[] = [];

  for (const element of elements) {
    const formattedText = extractTextWithFormatting(element);
    if (formattedText) {
      result.push(formattedText);
    }
  }

  return result;
}

function parseMetadataString(combinedMetadata: string): StepMetadata {
  const metadataFields: StepMetadata = {};

  const skillsQuestsRegex =
    /Skills\/quests met to do step\?:\s*(.*?)(?=(\n|$|GP stack|Items needed|Total time))/is;
  const skillsQuestsMatch = combinedMetadata.match(skillsQuestsRegex);
  if (skillsQuestsMatch && skillsQuestsMatch[1]) {
    metadataFields["Skills/quests met to do step?:"] =
      skillsQuestsMatch[1].trim();
  }

  const patterns: MetadataPattern[] = [
    {
      regex:
        /GP stack( after step)?:\s*(.*?)(?=(\n|$|Items needed|Skills\/quests|Total time))/is,
      key: "gp_stack",
    },
    {
      regex:
        /Items needed( during step)?:\s*(.*?)(?=(\n|$|GP stack|Skills\/quests|Total time))/is,
      key: "items_needed",
    },
    {
      regex:
        /Skills\/quests met\?( to do step)?:\s*(.*?)(?=(\n|$|GP stack|Items needed|Total time))/is,
      key: "skills_quests_met",
    },
    {
      regex:
        /Total time( taken during step)?:\s*(.*?)(?=(\n|$|GP stack|Items needed|Skills\/quests))/is,
      key: "total_time",
    },
  ];

  patterns.forEach((pattern) => {
    const match = combinedMetadata.match(pattern.regex);
    if (match && match[2]) {
      metadataFields[pattern.key as keyof StepMetadata] = match[2].trim();
    }
  });

  return metadataFields;
}

function parseGuideData(data: GoogleDocsData): GuideStructure {
  const content = data.tabs[0].documentTab.body.content;

  const guideStructure: GuideStructure = {
    title: "",
    chapters: [],
  };

  let currentChapter: GuideChapter | null = null;
  let currentSection: GuideSection | null = null;
  let currentStep: GuideStep | null = null;
  let processingNestedBullets = false;
  let currentStepListId: string | null = null;
  let lastStepCompleted = false;
  let inChapterFootnotes = false;

  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    if (!item.paragraph) {
      continue;
    }

    const paragraph = item.paragraph;
    const elements = paragraph.elements || [];

    if (elements.length === 0) {
      continue;
    }

    const combinedText = elements
      .filter((e) => e.textRun)
      .map((e) => e.textRun!.content)
      .join("")
      .trim();

    if (
      combinedText &&
      combinedText.includes("Chapter") &&
      paragraph.paragraphStyle &&
      paragraph.paragraphStyle.alignment === "CENTER"
    ) {
      currentChapter = {
        title: combinedText,
        sections: [],
        footnotes: [],
        titleFormatted: combineFormattedText(elements),
      };

      guideStructure.chapters.push(currentChapter);
      currentSection = null;
      currentStep = null;
      processingNestedBullets = false;
      currentStepListId = null;
      lastStepCompleted = false;
      inChapterFootnotes = false;
      continue;
    }

    if (combinedText && /^\d+\.\d+:/.test(combinedText)) {
      if (!currentChapter) {
        currentChapter = {
          title: "Unknown Chapter",
          sections: [],
          footnotes: [],
        };
        guideStructure.chapters.push(currentChapter);
      }

      if (
        combinedText.includes("3.3:") &&
        combinedText.includes("Beyond BRUHsailer")
      ) {
        inChapterFootnotes = true;

        if (!currentChapter.footnotes) {
          currentChapter.footnotes = [];
        }

        currentChapter.footnotes.push({
          content: combineFormattedText(elements),
          type: "chapter_footnote_title",
        });

        continue;
      }

      currentSection = {
        title: combinedText,
        steps: [],
        footnotes: [],
      };

      currentChapter.sections.push(currentSection);
      currentStep = null;
      processingNestedBullets = false;
      currentStepListId = null;
      lastStepCompleted = false;
      inChapterFootnotes = false;
      continue;
    }

    if (
      combinedText &&
      (combinedText.startsWith("Complete ") ||
        combinedText.includes("Complete the ") ||
        combinedText.includes("Finish ")) &&
      !lastStepCompleted
    ) {
      lastStepCompleted = true;
    }

    if (
      lastStepCompleted &&
      combinedText &&
      (combinedText.includes("Stats") ||
        combinedText.includes("Quests missing for quest cape") ||
        /^(Atk|Str|Def|HP|Range|Pray|Magic|RC):/.test(combinedText) ||
        combinedText.match(/^\d+:\d+$/))
    ) {
      inChapterFootnotes = true;
    }

    if (inChapterFootnotes && currentChapter) {
      if (!currentChapter.footnotes) {
        currentChapter.footnotes = [];
      }

      currentChapter.footnotes.push({
        content: combineFormattedText(elements),
        type: "chapter_footnote",
      });

      continue;
    }

    if (paragraph.bullet) {
      const listId = paragraph.bullet.listId;
      const hasNestingLevel = paragraph.bullet.nestingLevel > 0;
      const bulletInfo = paragraph.bullet;

      if (hasNestingLevel) {
        if (
          !currentStep ||
          !currentStepListId ||
          currentStepListId !== listId
        ) {
          processingNestedBullets = true;
          currentStepListId = listId;

          if (!currentSection) {
            if (!currentChapter) {
              currentChapter = {
                title: "Unknown Chapter",
                sections: [],
                footnotes: [],
              };
              guideStructure.chapters.push(currentChapter);
            }

            currentSection = {
              title: "Unknown Section",
              steps: [],
              footnotes: [],
            };

            currentChapter.sections.push(currentSection);
          }

          currentStep = {
            content: [],
            nestedContent: [],
            metadata: {},
          };

          currentSection.steps.push(currentStep);
          currentStepListId = listId;
        }

        const nestedItem: NestedContent = {
          level: bulletInfo.nestingLevel,
          content: combineFormattedText(elements),
        };

        if (!currentStep.nestedContent) {
          currentStep.nestedContent = [];
        }

        currentStep.nestedContent.push(nestedItem);
        processingNestedBullets = true;
        continue;
      } else {
        if (!currentSection) {
          if (!currentChapter) {
            currentChapter = {
              title: "Unknown Chapter",
              sections: [],
              footnotes: [],
            };
            guideStructure.chapters.push(currentChapter);
          }

          currentSection = {
            title: "Unknown Section",
            steps: [],
            footnotes: [],
          };

          currentChapter.sections.push(currentSection);
        }

        currentStep = {
          content: combineFormattedText(elements),
          nestedContent: [],
          metadata: {},
        };

        currentSection.steps.push(currentStep);
        processingNestedBullets = hasNestingLevel;
        currentStepListId = listId;
        continue;
      }
    }

    if (combinedText && currentStep) {
      if (Array.isArray(currentStep.content)) {
        let valueFound = false;

        for (let i = 0; i < currentStep.content.length; i++) {
          const item = currentStep.content[i];
          if (
            item &&
            item.text &&
            item.text.includes("Skills/quests met to do step?:")
          ) {
            const value = item.text
              .replace("Skills/quests met to do step?:", "")
              .trim();
            if (value) {
              currentStep.metadata["Skills/quests met to do step?:"] = value;
              valueFound = true;
            }
          }
        }

        if (valueFound) {
          currentStep.content = currentStep.content.filter((item) => {
            return !(
              item.text && item.text.includes("Skills/quests met to do step?:")
            );
          });
        }
      }

      const isMetadata =
        /^(GP stack( after step)?|Items needed( during step)?|Skills\/quests met\?( to do step)?|Skills\/quests met to do step\?|Total time( taken during step)?):/i.test(
          combinedText
        );

      if (isMetadata) {
        const metadataFields = parseMetadataString(combinedText);

        if (Object.keys(metadataFields).length > 0) {
          Object.assign(currentStep.metadata, metadataFields);
        } else {
          if (Array.isArray(currentStep.content)) {
            const firstFormatted = elements[0] ? extractTextWithFormatting(elements[0]) : null;
            currentStep.content.push({
              text: combinedText,
              formatting: firstFormatted?.formatting,
            });
          }
        }
      } else {
        if (processingNestedBullets) {
          if (!currentStep.additionalContent) {
            currentStep.additionalContent = [];
          }

          currentStep.additionalContent.push(combineFormattedText(elements));
        } else if (Array.isArray(currentStep.content)) {
          currentStep.content = currentStep.content.concat(
            combineFormattedText(elements)
          );
        } else {
          if (!currentStep.additionalContent) {
            currentStep.additionalContent = [];
          }

          currentStep.additionalContent.push(combineFormattedText(elements));
        }
      }
    }
  }

  guideStructure.chapters.forEach((chapter) => {
    chapter.sections.forEach((section) => {
      section.steps.forEach((step) => {
        if (
          (step.metadata.skills_quests_met ||
            step.metadata["Skills/quests met to do step?:"]) &&
          Array.isArray(step.content)
        ) {
          step.content = step.content.filter((item) => {
            if (
              item.text &&
              (item.text.includes("Skills/quests met?") ||
                item.text.includes("Skills/quests met to do step?:"))
            ) {
              return false;
            }
            return true;
          });
        }
      });
    });
  });

  for (const chapter of guideStructure.chapters) {
    if (!chapter.footnotes) {
      chapter.footnotes = [];
    }

    for (let i = 0; i < chapter.sections.length; i++) {
      const section = chapter.sections[i];

      if (
        section.title &&
        section.title.includes("3.3:") &&
        section.title.includes("Beyond BRUHsailer")
      ) {
        const sectionsToConvert = chapter.sections.splice(i);

        sectionsToConvert.forEach((sectionToConvert) => {
          chapter.footnotes.push({
            content: [
              {
                text: sectionToConvert.title,
                formatting: { bold: true, fontSize: 14 },
              },
            ],
            type: "chapter_footnote_title",
          });

          sectionToConvert.steps.forEach((step) => {
            if (step.content && Array.isArray(step.content) && step.content.length > 0) {
              chapter.footnotes.push({
                content: step.content,
                type: "chapter_footnote",
              });
            }

            if (step.nestedContent && step.nestedContent.length > 0) {
              step.nestedContent.forEach((nestedItem) => {
                chapter.footnotes.push({
                  content: nestedItem.content,
                  level: nestedItem.level,
                  type: "chapter_footnote_nested",
                });
              });
            }
          });
        });

        break;
      }
    }

    for (const section of chapter.sections) {
      if (!section.footnotes) {
        section.footnotes = [];
      }

      if (section.steps.length > 0) {
        const lastStep = section.steps[section.steps.length - 1];

        if (lastStep.content && Array.isArray(lastStep.content) && lastStep.content.length > 1) {
          const lastStepText = lastStep.content[0].text || "";

          if (
            (lastStepText.startsWith("Complete ") ||
              lastStepText.includes("Complete the ") ||
              lastStepText.includes("Finish ")) &&
            lastStep.content.length > 1
          ) {
            const mainContent = [lastStep.content[0]];

            const footnotesContent = lastStep.content.slice(1);

            lastStep.content = mainContent;

            footnotesContent.forEach((item) => {
              section.footnotes.push({
                content: [item],
                type: "section_footnote",
              });
            });
          }
        }

        if (
          lastStep.metadata &&
          lastStep.metadata.gp_stack &&
          (lastStep.metadata.gp_stack.includes("\u000b") ||
            lastStep.metadata.gp_stack.includes("Items needed:") ||
            lastStep.metadata.gp_stack.includes("Skills/quests met?:") ||
            lastStep.metadata.gp_stack.includes("Total time:"))
        ) {
          const parsedMetadata = parseMetadataString(
            lastStep.metadata.gp_stack
          );
          lastStep.metadata = parsedMetadata;
        }
      }
    }

    const lastSection = chapter.sections[chapter.sections.length - 1];
    if (lastSection && lastSection.steps.length > 0) {
      const stepsToCheck = lastSection.steps.slice(1);
      const lastRealStepIndex = stepsToCheck.findIndex((step) => {
        const stepText =
          (Array.isArray(step.content) && step.content[0] && step.content[0].text) || "";
        return (
          stepText.includes("Stats") ||
          /^(Atk|Str|Def|HP|Range|Pray|Magic|RC):/.test(stepText) ||
          stepText.match(/^\d+:\d+$/) !== null
        );
      });

      if (lastRealStepIndex !== -1) {
        const footnotesSteps = lastSection.steps.splice(lastRealStepIndex + 1);

        footnotesSteps.forEach((step) => {
          if (step.content && Array.isArray(step.content) && step.content.length > 0) {
            chapter.footnotes.push({
              content: step.content,
              type: "chapter_footnote",
            });
          }
        });
      }
    }
  }

  return guideStructure;
}

function processOSRSGuideFile(inputFilePath: string): GuideStructure | null {
  try {
    const fileData = fs.readFileSync(inputFilePath, "utf8");
    const jsonData: GoogleDocsData = JSON.parse(fileData);
    return parseGuideData(jsonData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error processing guide ${inputFilePath}: ${errorMessage}`);
    return null;
  }
}

function combineChapters(chapterData: (GuideStructure | null)[]): CombinedGuide {
  const combinedGuide: CombinedGuide = {
    title: "BRUHsailer Complete Guide",
    chapters: [],
  };

  chapterData.forEach((chapter) => {
    if (chapter && chapter.chapters && chapter.chapters.length > 0) {
      chapter.chapters.forEach((chap) => {
        if (chap.sections) {
          chap.sections.forEach((section) => {
            if (section.steps) {
              section.steps.forEach((step) => {
                if (
                  step.metadata &&
                  step.metadata["Skills/quests met to do step?:"]
                ) {
                  step.metadata.skills_quests_met =
                    step.metadata["Skills/quests met to do step?:"];

                  delete step.metadata["Skills/quests met to do step?:"];
                }
              });
            }
          });
        }
      });

      combinedGuide.chapters = combinedGuide.chapters.concat(chapter.chapters);
    }
  });

  return combinedGuide;
}

function processAndCombineGuideFiles(
  inputFilePaths: string[],
  outputFilePath: string
): void {
  try {
    const chapterData = inputFilePaths.map((filePath) =>
      processOSRSGuideFile(filePath)
    );

    const validChapterData = chapterData.filter((data) => data !== null);

    if (validChapterData.length === 0) {
      throw new Error("No valid chapter data was processed");
    }

    const combinedData = combineChapters(validChapterData);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const finalOutput: CombinedGuide = {
      updatedOn: formattedDate,
      ...combinedData,
    };

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(finalOutput, null, 2),
      "utf8"
    );

    console.log(`Successfully processed and combined guide data.`);
    console.log(`Output saved to: ${outputFilePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error processing and combining guides: ${errorMessage}`);
    process.exit(1);
  }
}

export function extractSkillsQuestsMetFromSteps(
  guideData: GuideStructure
): string | null {
  let skillsQuestsMet: string | null = null;

  guideData.chapters.forEach((chapter) => {
    chapter.sections.forEach((section) => {
      section.steps.forEach((step) => {
        if (step.metadata && step.metadata.skills_quests_met) {
          skillsQuestsMet = step.metadata.skills_quests_met;
        }
      });
    });
  });

  return skillsQuestsMet;
}

function main(): void {
  const args = process.argv.slice(2);
  const currentDir = process.cwd();
  const dataDir = path.join(currentDir, "data");
  const defaultOutputDir = currentDir;

  let defaultInputFiles: string[] = [];
  try {
    if (fs.existsSync(dataDir)) {
      defaultInputFiles = fs
        .readdirSync(dataDir)
        .filter((file) => file.endsWith(".json") && file !== "guide_data.json")
        .map((file) => path.join(dataDir, file));
    } else {
      console.warn(
        `Warning: Data directory not found at ${dataDir}. No default input files loaded.`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading data directory ${dataDir}: ${errorMessage}`);
  }

  const defaultOutputFile = path.join(
    defaultOutputDir,
    "data",
    "guide_data.json"
  );

  const inputFiles = args.length >= 1 ? args.slice(0, -1) : defaultInputFiles;
  const outputFile =
    args.length >= 1 ? args[args.length - 1] : defaultOutputFile;

  if (inputFiles.length === 0) {
    console.error(
      "Error: No input files specified or found in the data directory."
    );
    process.exit(1);
  }

  console.log("Processing the following files:");
  inputFiles.forEach((file) => console.log(`- ${file}`));
  console.log(`Output will be saved to: ${outputFile}`);

  processAndCombineGuideFiles(inputFiles, outputFile);
}

main();
