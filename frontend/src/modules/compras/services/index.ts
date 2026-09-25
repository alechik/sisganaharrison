export {
  getOrdenesCompra,
  getOrdenesPendientes,
  getOrdenCompra,
  createOrdenCompra,
  updateOrdenCompra,
  autorizarOrdenCompra,
  rechazarOrdenCompra,
  downloadOrdenCompraPdf,
} from "./ordenCompraService";
export {
  getCuarentenas,
  getCuarentena,
  createCuarentena,
  updateCuarentena,
  generarCuarentenaDesdeOrden,
  completarCuarentena,
  downloadCuarentenaPdf,
} from "./cuarentenaService";
export {
  getIngresos,
  getIngreso,
  getCuarentenasDisponiblesIngreso,
  getPendientesIngreso,
  createIngreso,
  downloadIngresoPdf,
} from "./ingresoService";

