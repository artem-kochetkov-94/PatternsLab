import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CatalogPage } from "./pages/CatalogPage";
import { PatternPage } from "./pages/PatternPage";

export function App() {
  return (
    <Routes>
      {/* Общий каркас (меню + контент) оборачивает все страницы. */}
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="pattern/:id" element={<PatternPage />} />
      </Route>
    </Routes>
  );
}
