import { describe, expect, it } from 'vitest'
import { correspond, filtrerParPertinence } from '~/utils/recherche'

/** Score d'un texte pour une requête, ou -1 s'il ne correspond pas. */
function score(texte: string, requete: string): number {
  return correspond(texte, requete)?.score ?? -1
}

describe('correspond', () => {
  it('trouve les lettres dans l\'ordre sans exiger qu\'elles se suivent', () => {
    expect(correspond('Projets réalisés', 'prj')).not.toBeNull()
    expect(correspond('Projets réalisés', 'prjt')).not.toBeNull()
  })

  it('rejette une lettre absente ou dans le désordre', () => {
    expect(correspond('Projets', 'prz')).toBeNull()
    expect(correspond('Projets', 'jorp')).toBeNull()
  })

  it('ignore les accents et la casse', () => {
    expect(correspond('Compétences', 'competences')).not.toBeNull()
    expect(correspond('Infrastructure réseau sécurisée', 'RESEAU')).not.toBeNull()
  })

  it('accepte une requête vide, qui ne filtre rien', () => {
    expect(correspond('Parcours', '')).toEqual({ score: 0, positions: [] })
    expect(correspond('Parcours', '   ')).toEqual({ score: 0, positions: [] })
  })

  it('rapporte la position de chaque lettre retenue', () => {
    expect(correspond('Serveur et client FTP en Go', 'go')?.positions).toEqual([25, 26])
  })

  it('écarte une sous-séquence trop dispersée pour être voulue', () => {
    // p-r-i-s-m-a s'y trouve bien, dans l'ordre, mais éparpillé sur toute la
    // chaîne : ce n'est pas ce que cherchait la personne.
    const disperse = 'Parcours et realisations diverses en masse'
    // Garde-fou : sans cette vérification, le test passerait pour la mauvaise
    // raison si les lettres n'y étaient tout simplement pas.
    expect(disperse.toLowerCase()).toMatch(/p.*r.*i.*s.*m.*a/)
    expect(correspond(disperse, 'prisma')).toBeNull()
    expect(correspond('Warhammer 40k Army Builder Nuxt Prisma', 'prisma')).not.toBeNull()
  })

  it('applique le garde dès deux lettres', () => {
    // « cv » se retrouvait dans la moitié des titres de projets.
    expect(correspond('Warhammer 40k Army Builder Vue', 'cv')).toBeNull()
    expect(correspond('Ouvrir le CV', 'cv')).not.toBeNull()
  })

  it('laisse passer une lettre seule, qui ne couvre aucune étendue', () => {
    expect(correspond('Plateforme microservices', 'p')).not.toBeNull()
  })

  it('cherche chaque mot de la requête séparément', () => {
    const texte = 'Lancer la démo — Serveur et client FTP en Go'
    expect(correspond(texte, 'demo ftp')).not.toBeNull()
    // Ordre indifférent : « ftp » vient après « démo » dans le texte, mais la
    // requête les cite dans l'autre sens.
    expect(correspond(texte, 'ftp demo')).not.toBeNull()
    // Un mot absent suffit à rejeter, même si l'autre correspond.
    expect(correspond(texte, 'demo warhammer')).toBeNull()
  })

  it('trouve une occurrence tardive qu\'un balayage glouton manquerait', () => {
    // Le « g » de « Gestion » viendrait en premier ; le vrai « go » est à la fin.
    expect(correspond('Gestion des transferts en Go', 'go')?.positions).toEqual([26, 27])
  })

  it('classe une suite contiguë devant une suite espacée', () => {
    // Les deux passent le garde de densité : seule la contiguïté les départage.
    expect(score('Démo FTP', 'ftp')).toBeGreaterThan(score('Fatpack', 'ftp'))
  })

  it('pénalise l\'écart entre deux lettres, à contiguïté nulle des deux côtés', () => {
    // Même longueur, même départ, aucune paire contiguë : seul l'écart varie.
    expect(score('zazbzz', 'ab')).toBeGreaterThan(score('zazzzb', 'ab'))
  })

  it('classe un début de mot devant un milieu de mot', () => {
    expect(score('Aller à Contact', 'con')).toBeGreaterThan(score('Seconde chance', 'con'))
  })

  it('classe un libellé court devant un libellé long à correspondance égale', () => {
    expect(score('Go', 'go')).toBeGreaterThan(score('Go, Docker, Traefik et compagnie', 'go'))
  })

  it('ne rend jamais un score négatif pour une correspondance valide', () => {
    // Lettres très éloignées les unes des autres : la pénalité est bornée.
    expect(score('a'.repeat(200) + 'z', 'az')).toBeGreaterThanOrEqual(0)
  })
})

describe('filtrerParPertinence', () => {
  const entrees = [
    { nom: 'Aller à Parcours' },
    { nom: 'Plateforme microservices' },
    { nom: 'Aller à Projets' },
  ]
  const libelle = (e: { nom: string }) => e.nom

  it('écarte ce qui ne correspond pas', () => {
    expect(filtrerParPertinence(entrees, 'zzz', libelle)).toEqual([])
  })

  it('rend tout, dans l\'ordre d\'origine, sur une requête vide', () => {
    expect(filtrerParPertinence(entrees, '', libelle).map(r => r.entree)).toEqual(entrees)
  })

  it('remonte la meilleure correspondance en tête', () => {
    const noms = filtrerParPertinence(entrees, 'proj', libelle).map(r => r.entree.nom)
    expect(noms[0]).toBe('Aller à Projets')
  })

  it('conserve l\'ordre d\'origine à score égal', () => {
    // Deux libellés identiques : rien ne doit les faire permuter d'une frappe
    // à l'autre.
    const doublons = [{ nom: 'Go' }, { nom: 'Go' }]
    const resultat = filtrerParPertinence(doublons, 'go', libelle)
    expect(resultat[0]!.entree).toBe(doublons[0])
    expect(resultat[1]!.entree).toBe(doublons[1])
  })
})
