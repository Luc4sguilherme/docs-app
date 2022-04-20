import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

import Home from './pages/Home';

function RoutesContainer() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        <Route path="/documents/:id" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesContainer;
