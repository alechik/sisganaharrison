import { Route } from "react-router-dom";
import { SALIDA_ROUTES } from "../constants";
import SalidaCreatePage from "../pages/SalidaCreatePage";
import SalidaDetailPage from "../pages/SalidaDetailPage";
import SalidaListPage from "../pages/SalidaListPage";

export const salidasRoutes = (
  <>
    <Route path={SALIDA_ROUTES.list} element={<SalidaListPage />} />
    <Route path={SALIDA_ROUTES.create} element={<SalidaCreatePage />} />
    <Route path="/salidas/:id" element={<SalidaDetailPage />} />
  </>
);
