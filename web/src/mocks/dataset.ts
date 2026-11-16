// Générateur DÉTERMINISTE du jeu de données de démonstration.
// Même graine → exactement les mêmes données (vérifié par les tests).
//
// Le jeu de données a deux parties :
//  - `clips` : ce que l'API expose (conforme au contrat `Clip`) ;
//  - `hidden` : la « vérité terrain » et les vecteurs de caractéristiques,
//    utilisés UNIQUEMENT pour simuler la recherche. Ils ne sortent jamais
//    de `mocks/` : la vraie API n'exposera pas ses embeddings.

import type { BehaviourCode, Clip, Species } from '@/domain/types';
import { between, createRandom, integerBetween, weightedPick, type Random } from '@/lib/random';

import { behaviours, frequencyWeight } from './behaviours';
import { moonPhaseAt } from './moon';
import { cameras, habitatBaseTemperature, sites } from './sites';
import { add, gaussianVector, normalize, scale } from './vectors';

export const DEFAULT_SEED = 20_240_615;
export const CLIP_COUNT = 400;
export const CLIP_DURATION_S = 15; // comme PanAf20K

/**
 * Bruit ajouté au vecteur de chaque clip. Réglé pour que la recherche soit
 * utile mais IMPARFAITE (faux positifs, vrais positifs mal classés) : sinon
 * le reclassement n'aurait rien à corriger. Voir le test de qualité.
 */
export const FEATURE_NOISE = 0.3;

/** Informations cachées d'un clip (jamais exposées par l'API). */
export interface HiddenClipInfo {
  labels: BehaviourCode[];
  features: number[];
}

export interface MockDataset {
  clips: Clip[];
  hidden: Map<string, HiddenClipInfo>;
  /** Un vecteur « prototype » par comportement. */
  prototypes: Map<BehaviourCode, number[]>;
}

/** Nuit = avant 6 h ou à partir de 19 h (proche de l'équateur, jours de ~12 h). */
export const isNightHour = (hour: number) => hour < 6 || hour >= 19;

/**
 * Heure de la journée (décimale). Profil réaliste : surtout de jour, avec
 * deux pics (matin et fin d'après-midi), et un peu d'activité nocturne.
 */
function sampleHour(random: Random): number {
  const r = random();
  const normal = (mu: number, sigma: number) => {
    const u = 1 - random();
    const v = random();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  let hour: number;
  if (r < 0.35)
    hour = normal(8.5, 1.5); // pic du matin
  else if (r < 0.65)
    hour = normal(16, 1.8); // pic de fin d'après-midi
  else if (r < 0.88)
    hour = between(random, 6, 19); // reste de la journée
  else hour = between(random, 19, 30) % 24; // nuit : 19 h → 6 h
  return ((hour % 24) + 24) % 24;
}

/** 1 à 3 comportements, tirés selon leur fréquence, sans doublon. */
function sampleLabels(random: Random): BehaviourCode[] {
  const count = weightedPick(random, [1, 2, 3], (n) => (n === 1 ? 6 : n === 2 ? 3 : 1));
  const labels: BehaviourCode[] = [];
  while (labels.length < count) {
    const pool = behaviours.filter((b) => !labels.includes(b.code));
    const picked = weightedPick(random, pool, (b) => frequencyWeight[b.frequency]).code;
    // « Aucun comportement » exclut tous les autres.
    if (picked === 'NONE') return labels.length === 0 ? ['NONE'] : labels;
    labels.push(picked);
  }
  return labels;
}

function sampleSpecies(random: Random): Species | null {
  const r = random();
  return r < 0.7 ? 'chimpanzee' : r < 0.95 ? 'gorilla' : null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function generateDataset(seed = DEFAULT_SEED): MockDataset {
  const random = createRandom(seed);

  // 1. Prototypes : une direction aléatoire par comportement.
  const prototypes = new Map(behaviours.map((b) => [b.code, normalize(gaussianVector(random))]));
  // Petit biais propre à chaque site (même caméra, même décor…).
  const siteBias = new Map(sites.map((s) => [s.id, scale(gaussianVector(random), 0.12)]));

  // Période couverte : 1er janvier 2024 → 30 juin 2025.
  const start = Date.UTC(2024, 0, 1);
  const spanDays = 546;

  const clips: Clip[] = [];
  const hidden = new Map<string, HiddenClipInfo>();

  for (let i = 0; i < CLIP_COUNT; i++) {
    const id = `C${String(i + 1).padStart(4, '0')}`;
    const camera = cameras[integerBetween(random, 0, cameras.length - 1)];
    const site = sites.find((s) => s.id === camera?.siteId);
    if (!camera || !site) throw new Error('Caméra ou site introuvable');

    // Date-heure LOCALE de la caméra (aucun fuseau, voir le contrat).
    const hour = sampleHour(random);
    const day = new Date(start + integerBetween(random, 0, spanDays - 1) * 86_400_000);
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const s = integerBetween(random, 0, 59);
    const localDateTime = `${String(day.getUTCFullYear())}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}T${pad(h)}:${pad(m)}:${pad(s)}`;
    const isNight = isNightHour(hour);

    // Température : base de l'habitat + cycle jour/nuit (max vers 14 h) + bruit.
    const diurnal = 4 * Math.cos(((hour - 14) / 24) * 2 * Math.PI);
    const temperature = habitatBaseTemperature[site.habitat] + diurnal + between(random, -1.5, 1.5);

    // Quelques valeurs manquantes, comme dans les vraies données.
    const missingDate = random() < 0.03;
    const missingTemperature = random() < 0.05;

    const labels = sampleLabels(random);
    const species = sampleSpecies(random);
    const thumbnailSeed = integerBetween(random, 1, 2 ** 31 - 1);

    // Vecteur du clip = somme des prototypes de ses comportements + biais du site + bruit.
    const signal = normalize(
      labels.reduce<number[]>(
        (acc, code) => add(acc, prototypes.get(code) ?? []),
        gaussianVector(random).map(() => 0),
      ),
    );
    const features = add(
      add(signal, siteBias.get(site.id) ?? []),
      scale(gaussianVector(random), FEATURE_NOISE),
    );

    clips.push({
      id,
      siteId: site.id,
      cameraId: camera.id,
      recordedAt: missingDate ? null : localDateTime,
      durationS: CLIP_DURATION_S,
      isNight,
      temperatureC: missingTemperature ? null : Math.round(temperature * 10) / 10,
      moonPhase: missingDate ? null : Math.round(moonPhaseAt(localDateTime) * 1000) / 1000,
      species,
      thumbnailSeed,
    });
    hidden.set(id, { labels, features });
  }

  return { clips, hidden, prototypes };
}
