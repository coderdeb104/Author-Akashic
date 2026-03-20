
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function DebugPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const maskedKey = supabaseAnonKey 
        ? `${supabaseAnonKey.substring(0, 8)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 8)}`
        : "Not Found";

    return (
        <div className="container mx-auto max-w-4xl">
            <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Debug Information</h1>
            <p className="mt-2 text-muted-foreground">
                This page shows the environment variables your live Vercel application is currently using.
            </p>
            
            <Alert className="mt-8">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to your Supabase project's API settings.</li>
                        <li>Carefully compare the values below with the values in your Supabase dashboard.</li>
                        <li>They must match exactly. Pay close attention to any extra spaces or typos.</li>
                        <li>If they do not match, update the variables in your Vercel project's settings, then redeploy.</li>
                    </ol>
                </AlertDescription>
            </Alert>
            
            <div className="mt-8 grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>NEXT_PUBLIC_SUPABASE_URL</CardTitle>
                        <CardDescription>The URL your application is trying to connect to.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-mono text-sm bg-muted p-4 rounded-md break-all">
                            {supabaseUrl || "Not Found"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>NEXT_PUBLIC_SUPABASE_ANON_KEY</CardTitle>
                        <CardDescription>The public API key your application is using.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="font-mono text-sm bg-muted p-4 rounded-md break-all">
                            {maskedKey}
                        </p>
                        {supabaseAnonKey && (
                            <p className="font-mono text-xs text-muted-foreground mt-4 p-4 bg-muted/50 rounded-md break-all">
                                <b>Full Key:</b> {supabaseAnonKey}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
