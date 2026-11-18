import { Route } from "react-router-dom";
import ProductoCreatePage from "../pages/ProductoCreatePage";
import ProductoDeletedPage from "../pages/ProductoDeletedPage";
import ProductoDetailPage from "../pages/ProductoDetailPage";
import ProductoEditPage from "../pages/ProductoEditPage";
import ProductoListPage from "../pages/ProductoListPage";
import { PRODUCTO_ROUTES } from "../constants";

export const productoRoutes = (
  <>
    <Route path={PRODUCTO_ROUTES.list} element={<ProductoListPage />} />
    <Route path={PRODUCTO_ROUTES.create} element={<ProductoCreatePage />} />
    <Route path={PRODUCTO_ROUTES.deleted} element={<ProductoDeletedPage />} />
    <Route path={`${PRODUCTO_ROUTES.list}/:id`} element={<ProductoDetailPage />} />
    <Route path={`${PRODUCTO_ROUTES.list}/:id/editar`} element={<ProductoEditPage />} />
  </>
);

export {
  ProductoListPage,
  ProductoCreatePage,
  ProductoEditPage,
  ProductoDetailPage,
  ProductoDeletedPage,
};
