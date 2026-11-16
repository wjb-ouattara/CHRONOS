// Exécuté avant chaque fichier de test (voir `test.setupFiles` dans vite.config.ts).
// Ajoute les assertions DOM : toBeInTheDocument(), toHaveTextContent()…
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Démonte les composants rendus entre deux tests pour qu'ils restent isolés.
afterEach(() => {
  cleanup();
});

/*
 * jsdom (le navigateur simulé des tests) n'implémente pas showModal() ni
 * close() de <dialog>. Simulation minimale du comportement réel :
 *  - showModal()/close() posent/retirent l'attribut `open` ;
 *  - close() émet l'événement `close` ;
 *  - Échap sur une fenêtre ouverte émet `cancel`, comme un vrai navigateur.
 * Uniquement pour les tests : le vrai navigateur fournit tout cela.
 */
if (typeof HTMLDialogElement !== 'undefined' && !('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    show(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dialog = document.querySelector('dialog[open]');
    if (!dialog) return;
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    if (!cancel.defaultPrevented) (dialog as HTMLDialogElement).close();
  });
}

/* Autres API de navigateur absentes de jsdom, simulées pour les tests. */
// (Test via typeof : TypeScript croit, à tort, que la méthode existe toujours.)
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { value: () => undefined });
}
if (typeof window.matchMedia !== 'function') {
  // Par défaut : aucune préférence particulière (ex. pas de mouvement réduit).
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
