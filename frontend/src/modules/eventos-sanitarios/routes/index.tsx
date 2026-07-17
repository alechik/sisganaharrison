import { Route } from "react-router-dom";
import EventoSanitarioCreatePage from "../pages/EventoSanitarioCreatePage";
import EventoSanitarioDetailPage from "../pages/EventoSanitarioDetailPage";
import EventoSanitarioListPage from "../pages/EventoSanitarioListPage";
import { EVENTO_SANITARIO_ROUTES } from "../constants";

export const eventoSanitarioRoutes = (
  <>
    <Route path={EVENTO_SANITARIO_ROUTES.list} element={<EventoSanitarioListPage />} />
    <Route path={EVENTO_SANITARIO_ROUTES.create} element={<EventoSanitarioCreatePage />} />
    <Route
      path={`${EVENTO_SANITARIO_ROUTES.list}/:id`}
      element={<EventoSanitarioDetailPage />}
    />
  </>
);

export {
  EventoSanitarioListPage,
  EventoSanitarioCreatePage,
  EventoSanitarioDetailPage,
};
