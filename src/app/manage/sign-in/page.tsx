import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-serif text-3xl font-medium text-brand-navy">
        Sign in to Manage
      </h1>
      <p className="mt-3 text-slate-600">
        Single-admin access. Credentials are issued out-of-band.
      </p>
      <div className="mt-8">
        <SignInForm />
      </div>
    </div>
  );
}
