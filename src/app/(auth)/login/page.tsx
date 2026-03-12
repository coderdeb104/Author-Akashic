import { AuthForm } from '@/components/auth/auth-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  return (
    <>
      {searchParams?.message && (
        <div className="mb-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{searchParams.message}</AlertDescription>
          </Alert>
        </div>
      )}
      <AuthForm mode="login" />
    </>
  );
}
