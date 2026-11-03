import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface Props {
  nombre?: string | null;
}

export default function RegistradoPorField({ nombre }: Props) {
  return (
    <div>
      <Label>Registrado por</Label>
      <InputField type="text" value={nombre?.trim() ? nombre : "—"} disabled />
    </div>
  );
}
