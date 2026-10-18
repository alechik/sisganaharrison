import { Route } from "react-router-dom";
import { SUBCATEGORIA_PRODUCTO_ROUTES } from "../constants";
import SubcategoriaProductoCreatePage from "../pages/SubcategoriaProductoCreatePage";
import SubcategoriaProductoDeletedPage from "../pages/SubcategoriaProductoDeletedPage";
import SubcategoriaProductoDetailPage from "../pages/SubcategoriaProductoDetailPage";
import SubcategoriaProductoEditPage from "../pages/SubcategoriaProductoEditPage";
import SubcategoriaProductoListPage from "../pages/SubcategoriaProductoListPage";

export const subcategoriaProductoRoutes = (
  <>
    <Route path={SUBCATEGORIA_PRODUCTO_ROUTES.list} element={<SubcategoriaProductoListPage />} />
    <Route path={SUBCATEGORIA_PRODUCTO_ROUTES.create} element={<SubcategoriaProductoCreatePage />} />
    <Route path={SUBCATEGORIA_PRODUCTO_ROUTES.deleted} element={<SubcategoriaProductoDeletedPage />} />
    <Route path={`${SUBCATEGORIA_PRODUCTO_ROUTES.list}/:id`} element={<SubcategoriaProductoDetailPage />} />
    <Route path={`${SUBCATEGORIA_PRODUCTO_ROUTES.list}/:id/editar`} element={<SubcategoriaProductoEditPage />} />
  </>
);
