import { strings } from '@/content/strings';

/** Composant racine. Provisoire : le routage arrivera à l'étape 5. */
export function App() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <p>{strings.demo.banner}</p>
      <h1 className="text-3xl font-semibold">{strings.app.name}</h1>
      <p className="mt-2">{strings.app.tagline}</p>
    </main>
  );
}
