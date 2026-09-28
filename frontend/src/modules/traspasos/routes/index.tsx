import { Route } from "react-router-dom";
import { TRASPASO_ROUTES } from "../constants";
import TraspasoCreatePage from "../pages/TraspasoCreatePage";
import TraspasoDetailPage from "../pages/TraspasoDetailPage";
import TraspasoEditPage from "../pages/TraspasoEditPage";
import TraspasoListPage from "../pages/TraspasoListPage";

export const traspasoRoutes = (
  <>
    <Route path={TRASPASO_ROUTES.list} element={<TraspasoListPage />} />
    <Route path={TRASPASO_ROUTES.create} element={<TraspasoCreatePage />} />
    <Route path="/traspasos/:id/editar" element={<TraspasoEditPage />} />
    <Route path="/traspasos/:id" element={<TraspasoDetailPage />} />
  </>
);
