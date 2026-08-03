import type { EntreesDossier } from '~/demos/ftp/completion'
import { describe, expect, it } from 'vitest'
import { COMMANDES_ADMIN, COMMANDES_CLIENT, COMMANDES_SIMULATION, completer } from '~/demos/ftp/completion'
import { creerEtat, entreesPourCompletion, executerCommande } from '~/demos/ftp/simulation'

// Arborescence data/ de la démo, telle que la sert le binaire de la v1.0.
const RACINE: EntreesDossier = {
  dossiers: ['Moveto', 'important'],
  fichiers: ['zab.txt', 'zib.txt', 'zub.txt'],
  masques: [],
}

const VIDE: EntreesDossier = { dossiers: [], fichiers: [], masques: [] }

function tab(saisie: string, entrees = RACINE, commandes: readonly string[] = COMMANDES_SIMULATION) {
  return completer(saisie, entrees, commandes)
}

describe('complétion des commandes', () => {
  it('complète une commande sans ambiguïté et ouvre le mot suivant', () => {
    expect(tab('re')).toEqual({ saisie: 'Reveal ', candidats: [] })
  })

  it('ignore la casse de la saisie mais rétablit celle de la commande', () => {
    expect(tab('TERM').saisie).toBe('Terminate ')
  })

  it('étend jusqu\'au préfixe commun sans lister', () => {
    // Help et Hide : le premier Tab ne peut que redresser la casse.
    expect(tab('h')).toEqual({ saisie: 'H', candidats: [] })
  })

  it('liste seulement au Tab qui n\'ajoute plus rien', () => {
    // Deuxième appui : Help et Hide ne partagent rien de plus que le « H ».
    expect(tab('H')).toEqual({ saisie: 'H', candidats: ['Help', 'Hide'] })
  })

  it('ne touche à rien quand aucune commande ne correspond', () => {
    expect(tab('xyz')).toEqual({ saisie: 'xyz', candidats: [] })
  })

  it('propose toutes les commandes sur un champ vide', () => {
    expect(tab('').candidats).toEqual([...COMMANDES_SIMULATION])
  })
})

describe('complétion des arguments', () => {
  it('ne propose que des dossiers à Cd, plus le parent', () => {
    // Aucun préfixe commun entre « .. », « important » et « Moveto » : le
    // premier Tab n'a rien à étendre, il liste directement. Ordre alphabétique
    // localisé, comme la sortie de List.
    expect(tab('Cd ').candidats).toEqual(['..', 'important', 'Moveto'])
  })

  it('ne propose que des fichiers à Get', () => {
    // Les trois fichiers commencent par « z » : le premier Tab l'ajoute, le
    // second liste.
    expect(tab('Get ')).toEqual({ saisie: 'Get z', candidats: [] })
    expect(tab('Get z').candidats).toEqual(['zab.txt', 'zib.txt', 'zub.txt'])
  })

  it('complète un fichier sans ambiguïté', () => {
    expect(tab('Get za')).toEqual({ saisie: 'Get zab.txt ', candidats: [] })
  })

  it('respecte la casse des noms de fichiers', () => {
    // Le serveur refuserait « moveto » : mieux vaut ne rien proposer.
    expect(tab('Cd mov')).toEqual({ saisie: 'Cd mov', candidats: [] })
    expect(tab('Cd Mov').saisie).toBe('Cd Moveto ')
  })

  it('ne propose à Reveal que les fichiers masqués', () => {
    const entrees: EntreesDossier = { dossiers: [], fichiers: ['zab.txt'], masques: ['zub.txt'] }
    expect(tab('Reveal ', entrees).saisie).toBe('Reveal zub.txt ')
    expect(tab('Get ', entrees).saisie).toBe('Get zab.txt ')
  })

  it('ne propose rien pour une commande sans argument', () => {
    expect(tab('List ')).toEqual({ saisie: 'List ', candidats: [] })
    expect(tab('End ')).toEqual({ saisie: 'End ', candidats: [] })
  })

  it('s\'arrête au-delà du premier argument', () => {
    // Aucune commande de la démo n'en prend deux.
    expect(tab('Get zab.txt z')).toEqual({ saisie: 'Get zab.txt z', candidats: [] })
  })

  it('ne propose rien dans un dossier vide', () => {
    expect(tab('Cd ', VIDE).candidats).toEqual([])
  })
})

describe('commandes selon le port du vrai serveur', () => {
  it('n\'expose pas Get sur le port admin', () => {
    expect(tab('', RACINE, COMMANDES_ADMIN).candidats).not.toContain('Get')
    expect(tab('G', RACINE, COMMANDES_ADMIN)).toEqual({ saisie: 'G', candidats: [] })
  })

  it('n\'expose ni Hide ni Terminate sur le port client', () => {
    const candidats = tab('', RACINE, COMMANDES_CLIENT).candidats
    expect(candidats).not.toContain('Hide')
    expect(candidats).not.toContain('Terminate')
  })
})

describe('accord avec le moteur de simulation', () => {
  it('propose exactement le contenu du dossier courant', () => {
    const etat = creerEtat()
    expect(entreesPourCompletion(etat)).toEqual(RACINE)

    executerCommande(etat, 'cd important')
    expect(entreesPourCompletion(etat)).toEqual({
      dossiers: ['test'],
      fichiers: ['test.txt'],
      masques: [],
    })
  })

  it('bascule un fichier vers les masqués après Hide', () => {
    const etat = creerEtat()
    executerCommande(etat, 'hide zab.txt')

    const entrees = entreesPourCompletion(etat)
    expect(entrees.fichiers).not.toContain('zab.txt')
    expect(entrees.masques).toEqual(['zab.txt'])
    // Le fichier masqué ne doit plus être proposé à Get.
    expect(completer('Get zab', entrees, COMMANDES_SIMULATION).saisie).toBe('Get zab')
  })

  it('complète une commande que le moteur accepte réellement', () => {
    const etat = creerEtat()
    const { saisie } = completer('cd imp', entreesPourCompletion(etat), COMMANDES_SIMULATION)

    expect(saisie).toBe('cd important ')
    // La commande complétée doit être exécutable telle quelle.
    expect(executerCommande(etat, saisie).lignes).toEqual(['Dossier courant : data/important/'])
  })
})
