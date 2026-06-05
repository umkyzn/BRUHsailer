import { HashRouter, Routes, Route } from 'react-router-dom';
import MainGuide from './pages/MainGuide';
import LandlubberGuide from './pages/LandlubberGuide';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainGuide />} />
        <Route path="/landlubber" element={<LandlubberGuide />} />
      </Routes>
    </HashRouter>
  );
}
