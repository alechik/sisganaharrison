import { Route } from "react-router-dom";
import AnimalCreatePage from "../pages/AnimalCreatePage";
import AnimalDeletedPage from "../pages/AnimalDeletedPage";
import AnimalDetailPage from "../pages/AnimalDetailPage";
import AnimalEditPage from "../pages/AnimalEditPage";
import AnimalListPage from "../pages/AnimalListPage";
import { ANIMAL_ROUTES } from "../constants";

export const animalRoutes = (
  <>
    <Route path={ANIMAL_ROUTES.list} element={<AnimalListPage />} />
    <Route path={ANIMAL_ROUTES.create} element={<AnimalCreatePage />} />
    <Route path={ANIMAL_ROUTES.deleted} element={<AnimalDeletedPage />} />
    <Route path={`${ANIMAL_ROUTES.list}/:id`} element={<AnimalDetailPage />} />
    <Route path={`${ANIMAL_ROUTES.list}/:id/editar`} element={<AnimalEditPage />} />
  </>
);

export {
  AnimalListPage,
  AnimalCreatePage,
  AnimalEditPage,
  AnimalDetailPage,
  AnimalDeletedPage,
};
