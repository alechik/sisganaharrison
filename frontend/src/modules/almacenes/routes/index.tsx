import { Route } from "react-router-dom";
import { ALMACEN_ROUTES } from "../constants";
import AlmacenCreatePage from "../pages/AlmacenCreatePage";
import AlmacenDeletedPage from "../pages/AlmacenDeletedPage";
import AlmacenDetailPage from "../pages/AlmacenDetailPage";
import AlmacenEditPage from "../pages/AlmacenEditPage";
import AlmacenListPage from "../pages/AlmacenListPage";

export const almacenRoutes = (
  <>
    <Route path={ALMACEN_ROUTES.list} element={<AlmacenListPage />} />
    <Route path={ALMACEN_ROUTES.create} element={<AlmacenCreatePage />} />
    <Route path={ALMACEN_ROUTES.deleted} element={<AlmacenDeletedPage />} />
    <Route path={`${ALMACEN_ROUTES.list}/:id`} element={<AlmacenDetailPage />} />
    <Route path={`${ALMACEN_ROUTES.list}/:id/editar`} element={<AlmacenEditPage />} />
  </>
);
