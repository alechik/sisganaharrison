import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioForm } from "../components";
import { TIPO_CLIENTE, TIPO_PROVEEDOR } from "../constants";

interface Props {
  tipo: typeof TIPO_CLIENTE | typeof TIPO_PROVEEDOR;
}

export default function SocioCreatePage({ tipo }: Props) {
  const isCliente = tipo === TIPO_CLIENTE;

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle={isCliente ? "Nuevo Cliente" : "Nuevo Proveedor"}
        items={isCliente ? breadcrumbs.socioClienteCrear : breadcrumbs.socioProveedorCrear}
      />
      <ComponentCard title={isCliente ? "Formulario de Cliente" : "Formulario de Proveedor"}>
        <SocioForm defaultTipoNombre={tipo} />
      </ComponentCard>
    </div>
  );
}
