import { useEffect, useState } from "react";
import { getGrupos } from "../services";
import { Grupo } from "../types";

export const useGruposByLote = (loteId: number | null) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loteId) {
      setGrupos([]);
      return;
    }

    let activo = true;
    setLoading(true);

    getGrupos({ lote_id: loteId, activo: true, per_page: 100, sort_by: "nombre", sort_dir: "asc" })
      .then((response) => {
        if (activo) {
          setGrupos(response.data);
        }
      })
      .catch(() => {
        if (activo) {
          setGrupos([]);
        }
      })
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [loteId]);

  return {
    options: grupos.map((grupo) => ({ value: String(grupo.id), label: grupo.nombre })),
    grupos,
    loading,
  };
};
