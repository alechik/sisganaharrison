import { Route } from "react-router-dom";
import { SOCIO_ROUTES, TIPO_CLIENTE, TIPO_PROVEEDOR } from "../constants";
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
    <Route path={SOCIO_ROUTES.clientes} element={<SocioListPage tipo={TIPO_CLIENTE} />} />
    <Route path={SOCIO_ROUTES.clientesCreate} element={<SocioCreatePage tipo={TIPO_CLIENTE} />} />
    <Route path={SOCIO_ROUTES.proveedores} element={<SocioListPage tipo={TIPO_PROVEEDOR} />} />
    <Route path={SOCIO_ROUTES.proveedoresCreate} element={<SocioCreatePage tipo={TIPO_PROVEEDOR} />} />
    <Route path={SOCIO_ROUTES.deleted} element={<SocioDeletedPage />} />
    <Route path={SOCIO_ROUTES.tipos} element={<TipoPersonaListPage />} />
    <Route path={SOCIO_ROUTES.tiposCreate} element={<TipoPersonaCreatePage />} />
    <Route path={`${SOCIO_ROUTES.tipos}/:id/editar`} element={<TipoPersonaEditPage />} />
    <Route path="/socios-de-negocio/:id" element={<SocioDetailPage />} />
    <Route path="/socios-de-negocio/:id/editar" element={<SocioEditPage />} />
  </>
);
