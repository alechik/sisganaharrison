import { Route } from "react-router-dom";
import CategoriaAnimalCreatePage from "../pages/CategoriaAnimalCreatePage";
import CategoriaAnimalDeletedPage from "../pages/CategoriaAnimalDeletedPage";
import CategoriaAnimalDetailPage from "../pages/CategoriaAnimalDetailPage";
import CategoriaAnimalEditPage from "../pages/CategoriaAnimalEditPage";
import CategoriaAnimalListPage from "../pages/CategoriaAnimalListPage";
import { CATEGORIA_ANIMAL_ROUTES } from "../constants";

export const categoriaAnimalRoutes = (
  <>
    <Route path={CATEGORIA_ANIMAL_ROUTES.list} element={<CategoriaAnimalListPage />} />
    <Route path={CATEGORIA_ANIMAL_ROUTES.create} element={<CategoriaAnimalCreatePage />} />
    <Route path={CATEGORIA_ANIMAL_ROUTES.deleted} element={<CategoriaAnimalDeletedPage />} />
    <Route path={`${CATEGORIA_ANIMAL_ROUTES.list}/:id`} element={<CategoriaAnimalDetailPage />} />
    <Route
      path={`${CATEGORIA_ANIMAL_ROUTES.list}/:id/editar`}
      element={<CategoriaAnimalEditPage />}
    />
  </>
);

export {
  CategoriaAnimalListPage,
  CategoriaAnimalCreatePage,
  CategoriaAnimalEditPage,
  CategoriaAnimalDetailPage,
  CategoriaAnimalDeletedPage,
};
