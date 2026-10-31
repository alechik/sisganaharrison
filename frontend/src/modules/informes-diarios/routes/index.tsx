import { Route } from "react-router-dom";
import InformeCreatePage from "../pages/InformeCreatePage";
import InformeDetailPage from "../pages/InformeDetailPage";
import InformeEditPage from "../pages/InformeEditPage";
import InformeListPage from "../pages/InformeListPage";
import { INFORME_DIARIO_ROUTES } from "../constants";

export const informeDiarioRoutes = (
  <>
    <Route path={INFORME_DIARIO_ROUTES.list} element={<InformeListPage />} />
    <Route path={INFORME_DIARIO_ROUTES.create} element={<InformeCreatePage />} />
    <Route path={`${INFORME_DIARIO_ROUTES.list}/:id`} element={<InformeDetailPage />} />
    <Route path={`${INFORME_DIARIO_ROUTES.list}/:id/editar`} element={<InformeEditPage />} />
  </>
);
