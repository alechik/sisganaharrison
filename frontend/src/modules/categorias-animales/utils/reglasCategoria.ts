import { CategoriaAnimal, CategoriaAnimalRegla } from "../types";
import { hoyISO } from "@/utils/reglasReproductivas";

export function edadEnMeses(
  fechaNacimiento?: string | null,
  edadDeclarada?: number | null,
  referencia = hoyISO()
): number | null {
  if (fechaNacimiento) {
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    const ref = new Date(`${referencia}T00:00:00`);
    if (Number.isNaN(nacimiento.getTime()) || nacimiento > ref) {
      return null;
    }
    let meses =
      (ref.getFullYear() - nacimiento.getFullYear()) * 12 +
      (ref.getMonth() - nacimiento.getMonth());
    if (ref.getDate() < nacimiento.getDate()) {
      meses -= 1;
    }
    return Math.max(0, meses);
  }
  return edadDeclarada ?? null;
}

export function mensajeCategoriaIncompatible(params: {
  categoria?: CategoriaAnimal | null;
  sexo?: string | null;
  fechaNacimiento?: string | null;
  edad?: number | null;
  castrado?: boolean;
}): string | null {
  const regla = params.categoria?.regla;
  if (!regla) {
    return null;
  }

  const sexo = (params.sexo ?? "").toUpperCase();
  const castrado = Boolean(params.castrado);
  const edad = edadEnMeses(params.fechaNacimiento, params.edad);

  if (sexo === "H" && castrado) {
    return "La castración solo aplica a machos.";
  }

  if (sexo === "M" && castrado && edad !== null && edad >= 13 && edad <= 15) {
    return "No hay categoría definida para machos castrados de 13 a 15 meses. NOVILLOS inicia a los 16 meses; TORILLOS es para machos enteros.";
  }

  if (regla.sexo && sexo && sexo !== regla.sexo) {
    return `La categoría ${params.categoria?.nombre} solo admite sexo ${regla.sexo === "H" ? "hembra" : "macho"}.`;
  }

  if (regla.castrado === true && !castrado) {
    return `La categoría ${params.categoria?.nombre} requiere un macho castrado.`;
  }

  if (regla.castrado === false && castrado) {
    return `La categoría ${params.categoria?.nombre} es para machos enteros, no castrados.`;
  }

  if (edad === null) {
    return null;
  }

  if (
    edad < regla.edad_min_meses ||
    (regla.edad_max_meses !== null && edad > regla.edad_max_meses)
  ) {
    const rango =
      regla.edad_max_meses === null
        ? `${regla.edad_min_meses} meses o más`
        : `${regla.edad_min_meses} a ${regla.edad_max_meses} meses`;
    return `La categoría ${params.categoria?.nombre} corresponde a animales de ${rango}. La edad calculada es de ${edad} meses.`;
  }

  return null;
}

export function textoRegla(regla?: CategoriaAnimalRegla | null): string | null {
  if (!regla) {
    return null;
  }
  const sexo = regla.sexo === "H" ? "hembras" : regla.sexo === "M" ? "machos" : "ambos sexos";
  const edad =
    regla.edad_max_meses === null
      ? `${regla.edad_min_meses}+ meses`
      : `${regla.edad_min_meses}-${regla.edad_max_meses} meses`;
  const caracteristica = regla.caracteristica || regla.condicion;
  const partes = [`${edad}`, sexo, caracteristica].filter(Boolean);
  const peso = textoPesoReferencia(regla);
  if (peso) {
    partes.push(`ref. ${peso}`);
  }
  if (regla.indice_aumento != null) {
    partes.push(`índice ${regla.indice_aumento} kg / ${regla.cambio_peso_meses ?? 2} meses`);
  }
  return partes.join(" · ");
}

export function textoPesoReferencia(regla?: CategoriaAnimalRegla | null): string | null {
  if (!regla || (regla.peso_min_kg == null && regla.peso_max_kg == null)) {
    return null;
  }
  const min = regla.peso_min_kg;
  const max = regla.peso_max_kg;
  const rango =
    min != null && max != null && min !== max ? `${min}–${max} kg` : `${min ?? max} kg`;
  return regla.peso_referencia_meses
    ? `${rango} a los ${regla.peso_referencia_meses} meses`
    : rango;
}

export function categoriaCriaCodigo(sexo?: string | null): "TERNEROS_H" | "TERNEROS_M" {
  return (sexo ?? "").toUpperCase() === "H" ? "TERNEROS_H" : "TERNEROS_M";
}

export function categoriaCria(
  categorias: CategoriaAnimal[],
  sexo?: string | null
): CategoriaAnimal | null {
  const preferido = categoriaCriaCodigo(sexo);
  return (
    categorias.find((item) => item.codigo === preferido) ??
    categorias.find((item) => item.codigo === "TERNEROS") ??
    categorias.find((item) => item.codigo === (preferido === "TERNEROS_H" ? "TERNERA" : "TERNERO")) ??
    null
  );
}
