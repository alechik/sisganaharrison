import { Route } from "react-router-dom";
import { CATEGORIA_PRODUCTO_ROUTES } from "../constants";
import CategoriaProductoCreatePage from "../pages/CategoriaProductoCreatePage";
import CategoriaProductoDeletedPage from "../pages/CategoriaProductoDeletedPage";
import CategoriaProductoDetailPage from "../pages/CategoriaProductoDetailPage";
import CategoriaProductoEditPage from "../pages/CategoriaProductoEditPage";
import CategoriaProductoListPage from "../pages/CategoriaProductoListPage";

export const categoriaProductoRoutes = (
  <>
    <Route path={CATEGORIA_PRODUCTO_ROUTES.list} element={<CategoriaProductoListPage />} />
    <Route path={CATEGORIA_PRODUCTO_ROUTES.create} element={<CategoriaProductoCreatePage />} />
    <Route path={CATEGORIA_PRODUCTO_ROUTES.deleted} element={<CategoriaProductoDeletedPage />} />
    <Route path={`${CATEGORIA_PRODUCTO_ROUTES.list}/:id`} element={<CategoriaProductoDetailPage />} />
    <Route path={`${CATEGORIA_PRODUCTO_ROUTES.list}/:id/editar`} element={<CategoriaProductoEditPage />} />
  </>
);
