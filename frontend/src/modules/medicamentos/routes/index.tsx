import { Route } from "react-router-dom";
import MedicamentoCreatePage from "../pages/MedicamentoCreatePage";
import MedicamentoDeletedPage from "../pages/MedicamentoDeletedPage";
import MedicamentoDetailPage from "../pages/MedicamentoDetailPage";
import MedicamentoEditPage from "../pages/MedicamentoEditPage";
import MedicamentoListPage from "../pages/MedicamentoListPage";
import { MEDICAMENTO_ROUTES } from "../constants";

export const medicamentoRoutes = (
  <>
    <Route path={MEDICAMENTO_ROUTES.list} element={<MedicamentoListPage />} />
    <Route path={MEDICAMENTO_ROUTES.create} element={<MedicamentoCreatePage />} />
    <Route path={MEDICAMENTO_ROUTES.deleted} element={<MedicamentoDeletedPage />} />
    <Route path={`${MEDICAMENTO_ROUTES.list}/:id`} element={<MedicamentoDetailPage />} />
    <Route path={`${MEDICAMENTO_ROUTES.list}/:id/editar`} element={<MedicamentoEditPage />} />
  </>
);

export {
  MedicamentoListPage,
  MedicamentoCreatePage,
  MedicamentoEditPage,
  MedicamentoDetailPage,
  MedicamentoDeletedPage,
};
