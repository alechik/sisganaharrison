import { Route } from "react-router-dom";
import EstablecimientoCreatePage from "../pages/EstablecimientoCreatePage";
import EstablecimientoDeletedPage from "../pages/EstablecimientoDeletedPage";
import EstablecimientoDetailPage from "../pages/EstablecimientoDetailPage";
import EstablecimientoEditPage from "../pages/EstablecimientoEditPage";
import EstablecimientoListPage from "../pages/EstablecimientoListPage";
import { ESTABLECIMIENTO_ROUTES } from "../constants";

export const establecimientoRoutes = (
  <>
    <Route path={ESTABLECIMIENTO_ROUTES.list} element={<EstablecimientoListPage />} />
    <Route path={ESTABLECIMIENTO_ROUTES.create} element={<EstablecimientoCreatePage />} />
    <Route path={ESTABLECIMIENTO_ROUTES.deleted} element={<EstablecimientoDeletedPage />} />
    <Route
      path={`${ESTABLECIMIENTO_ROUTES.list}/:id`}
      element={<EstablecimientoDetailPage />}
    />
    <Route
      path={`${ESTABLECIMIENTO_ROUTES.list}/:id/editar`}
      element={<EstablecimientoEditPage />}
    />
  </>
);

export {
  EstablecimientoListPage,
  EstablecimientoCreatePage,
  EstablecimientoEditPage,
  EstablecimientoDetailPage,
  EstablecimientoDeletedPage,
};
