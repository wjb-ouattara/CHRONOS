/**
 * Fait télécharger un texte comme fichier, entièrement dans le navigateur :
 * on crée un Blob (fichier en mémoire), une adresse temporaire vers lui, et
 * un lien <a download> qu'on « clique » par programme.
 */
export function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Libère la mémoire une fois le téléchargement lancé.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
