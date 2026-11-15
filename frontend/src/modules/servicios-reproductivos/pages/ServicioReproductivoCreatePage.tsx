import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { InseminacionForm, ServicioReproductivoForm } from "../components";
import { TIPO_INSEMINACION_ARTIFICIAL, TIPO_MONTA_NATURAL } from "../constants";

interface Props {
  tipoServicio: string;
}

export default function ServicioReproductivoCreatePage({ tipoServicio }: Props) {
  const esIa = tipoServicio === TIPO_INSEMINACION_ARTIFICIAL;
  const title = esIa ? "Nueva inseminación artificial" : "Nueva monta natural";
  const crumb = esIa
    ? breadcrumbs.servicioReproductivoCrearInseminacion
    : breadcrumbs.servicioReproductivoCrearMonta;
  const cardTitle = esIa ? "Formulario de Inseminación Artificial" : "Formulario de Monta Natural";

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle={title} items={crumb} />
      <ComponentCard title={cardTitle}>
        {esIa ? (
          <InseminacionForm />
        ) : (
          <ServicioReproductivoForm tipoServicioFijo={tipoServicio} />
        )}
      </ComponentCard>
    </div>
  );
}

export function MontaNaturalCreatePage() {
  return <ServicioReproductivoCreatePage tipoServicio={TIPO_MONTA_NATURAL} />;
}

export function InseminacionArtificialCreatePage() {
  return <ServicioReproductivoCreatePage tipoServicio={TIPO_INSEMINACION_ARTIFICIAL} />;
}
