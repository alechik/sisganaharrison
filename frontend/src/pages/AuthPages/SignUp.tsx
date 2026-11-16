import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Registro | SITBO"
        description="Sistema de Trazabilidad Bobina (SITBO)"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
