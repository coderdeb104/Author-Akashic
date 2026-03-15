import { ToneChangerForm } from "@/components/tone-changer/tone-changer-form";

export default function ToneChangerPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold text-primary sm:text-4xl">Tone Changer</h1>
            <p className="mt-2 text-muted-foreground">
                Rewrite any text into a different tone using the power of AI.
            </p>
            <div className="mt-8">
                <ToneChangerForm />
            </div>
        </div>
    );
}
