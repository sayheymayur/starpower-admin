import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard"
        description="Create a new account to access the dashboard and manage your settings."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
