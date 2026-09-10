import { Route } from "react-router-dom";
import { SOCIO_ROUTES } from "../constants";
import SocioCreatePage from "../pages/SocioCreatePage";
import SocioDeletedPage from "../pages/SocioDeletedPage";
import SocioDetailPage from "../pages/SocioDetailPage";
import SocioEditPage from "../pages/SocioEditPage";
import SocioListPage from "../pages/SocioListPage";
import TipoPersonaCreatePage from "../pages/TipoPersonaCreatePage";
import TipoPersonaEditPage from "../pages/TipoPersonaEditPage";
import TipoPersonaListPage from "../pages/TipoPersonaListPage";

export const sociosDeNegocioRoutes = (
  <>
    <Route path={SOCIO_ROUTES.list} element={<SocioListPage />} />
    <Route path={SOCIO_ROUTES.create} element={<SocioCreatePage />} />
    <Route path={SOCIO_ROUTES.deleted} element={<SocioDeletedPage />} />
    <Route path={SOCIO_ROUTES.tipos} element={<TipoPersonaListPage />} />
    <Route path={SOCIO_ROUTES.tiposCreate} element={<TipoPersonaCreatePage />} />
    <Route path={`${SOCIO_ROUTES.tipos}/:id/editar`} element={<TipoPersonaEditPage />} />
    <Route path="/socios-de-negocio/:id" element={<SocioDetailPage />} />
    <Route path="/socios-de-negocio/:id/editar" element={<SocioEditPage />} />
  </>
);
