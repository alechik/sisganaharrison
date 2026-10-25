import { Route } from "react-router-dom";
import TareaCreatePage from "../pages/TareaCreatePage";
import TareaDetailPage from "../pages/TareaDetailPage";
import TareaEditPage from "../pages/TareaEditPage";
import TareaListPage from "../pages/TareaListPage";
import { TAREA_ROUTES } from "../constants";

export const tareaRoutes = (
  <>
    <Route path={TAREA_ROUTES.list} element={<TareaListPage />} />
    <Route path={TAREA_ROUTES.create} element={<TareaCreatePage />} />
    <Route path={`${TAREA_ROUTES.list}/:id`} element={<TareaDetailPage />} />
    <Route path={`${TAREA_ROUTES.list}/:id/editar`} element={<TareaEditPage />} />
  </>
);
