import { Navigate, Route } from "react-router-dom";
import {
  InseminacionArtificialCreatePage,
  MontaNaturalCreatePage,
} from "../pages/ServicioReproductivoCreatePage";
import ServicioReproductivoDetailPage from "../pages/ServicioReproductivoDetailPage";
import ServicioReproductivoEditPage from "../pages/ServicioReproductivoEditPage";
import {
  InseminacionArtificialListPage,
  MontaNaturalListPage,
} from "../pages/ServicioReproductivoListPage";
import { SERVICIO_REPRODUCTIVO_ROUTES } from "../constants";

export const servicioReproductivoRoutes = (
  <>
    <Route
      path={SERVICIO_REPRODUCTIVO_ROUTES.list}
      element={<Navigate to={SERVICIO_REPRODUCTIVO_ROUTES.montaNatural} replace />}
    />
    <Route
      path={`${SERVICIO_REPRODUCTIVO_ROUTES.list}/crear`}
      element={<Navigate to={SERVICIO_REPRODUCTIVO_ROUTES.createMontaNatural} replace />}
    />
    <Route path={SERVICIO_REPRODUCTIVO_ROUTES.montaNatural} element={<MontaNaturalListPage />} />
    <Route
      path={SERVICIO_REPRODUCTIVO_ROUTES.createMontaNatural}
      element={<MontaNaturalCreatePage />}
    />
    <Route
      path={SERVICIO_REPRODUCTIVO_ROUTES.inseminacionArtificial}
      element={<InseminacionArtificialListPage />}
    />
    <Route
      path={SERVICIO_REPRODUCTIVO_ROUTES.createInseminacionArtificial}
      element={<InseminacionArtificialCreatePage />}
    />
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
  MontaNaturalListPage,
  InseminacionArtificialListPage,
  MontaNaturalCreatePage,
  InseminacionArtificialCreatePage,
  ServicioReproductivoEditPage,
  ServicioReproductivoDetailPage,
};
