import { useMemo } from 'react';
import { GuideProvider } from '../context/GuideContext';
import { useGuideData } from '../hooks/useGuideData';
import type { ChapterWithSections } from '../types/guide';
import Header from '../components/layout/Header';
import Nav from '../components/layout/Nav';
import Footer from '../components/layout/Footer';
import GuideView from '../components/guide/GuideView';
import SideNav from '../components/guide/SideNav';
import Toast from '../components/ui/Toast';

function MainGuideContent() {
  const { data, loading, error } = useGuideData('/BRUHsailer/data/guide_data.json');

  const { chapters, allStepIds } = useMemo(() => {
    if (!data) return { chapters: [], allStepIds: [] };

    const ids: string[] = [];
    const chapterData: ChapterWithSections[] = data.chapters.map((chapter, ci) => {
      let count = 0;
      const sections = chapter.sections.map((section) => {
        const steps = section.steps.map((step) => {
          count++;
          const stepId = `${ci + 1}-${count}`;
          ids.push(stepId);
          return { step, stepId };
        });
        return { section, steps };
      });
      return { chapter, chapterIndex: ci, sections };
    });

    return { chapters: chapterData, allStepIds: ids };
  }, [data]);

  if (loading) return <div className="container" style={{ padding: 40 }}>Loading guide...</div>;
  if (error || !data) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Failed to load guide data. Please try refreshing the page.</p>
          {error && <p>Error: {error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Nav updatedOn={data.updatedOn} />
      <div className="page-layout">
        <SideNav chapters={chapters} totalSteps={allStepIds.length} />
        <div className="guide-main">
          <GuideView guideData={data} chapters={chapters} allStepIds={allStepIds} />
        </div>
      </div>
      <Footer />
      <Toast />
    </>
  );
}

export default function MainGuide() {
  return (
    <GuideProvider namespace="main">
      <MainGuideContent />
    </GuideProvider>
  );
}
