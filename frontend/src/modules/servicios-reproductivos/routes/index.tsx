import { Route } from "react-router-dom";
import ServicioReproductivoCreatePage from "../pages/ServicioReproductivoCreatePage";
import ServicioReproductivoDetailPage from "../pages/ServicioReproductivoDetailPage";
import ServicioReproductivoEditPage from "../pages/ServicioReproductivoEditPage";
import ServicioReproductivoListPage from "../pages/ServicioReproductivoListPage";
import { SERVICIO_REPRODUCTIVO_ROUTES } from "../constants";

export const servicioReproductivoRoutes = (
  <>
    <Route path={SERVICIO_REPRODUCTIVO_ROUTES.list} element={<ServicioReproductivoListPage />} />
    <Route path={SERVICIO_REPRODUCTIVO_ROUTES.create} element={<ServicioReproductivoCreatePage />} />
    <Route
      path={`${SERVICIO_REPRODUCTIVO_ROUTES.list}/:id`}
      element={<ServicioReproductivoDetailPage />}
    />
    <Route
      path={`${SERVICIO_REPRODUCTIVO_ROUTES.list}/:id/editar`}
      element={<ServicioReproductivoEditPage />}
    />
  </>
);

export {
  ServicioReproductivoListPage,
  ServicioReproductivoCreatePage,
  ServicioReproductivoEditPage,
  ServicioReproductivoDetailPage,
};
