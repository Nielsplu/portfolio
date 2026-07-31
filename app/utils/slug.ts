// Fabrication d'identifiants d'URL à partir d'un titre.
//
// Utilisé pour rendre les fiches projet partageables : le titre « Serveur et
// client FTP en Go » devient `serveur-et-client-ftp-en-go`, qu'on peut lire
// dans une barre d'adresse et coller dans un message.
//
// Dérivé du titre plutôt que saisi à la main dans le contenu : un slug oublié
// ou mal recopié casse un lien en silence, alors qu'un titre est toujours là.

/**
 * Transforme un titre en identifiant d'URL : minuscules, accents retirés,
 * séparateurs réduits à un tiret unique.
 *
 * @example
 * versSlug('Serveur et client FTP en Go') // 'serveur-et-client-ftp-en-go'
 * versSlug('Infrastructure réseau sécurisée') // 'infrastructure-reseau-securisee'
 */
export function versSlug(titre: string): string {
  return titre
    .normalize('NFD')
    // Retire les diacritiques laissés par la décomposition : « é » devient
    // « e » + accent combinant, dont on ne garde que la lettre.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // Tout ce qui n'est ni lettre ni chiffre devient un séparateur, ce qui
    // couvre espaces, apostrophes, points et parenthèses d'un seul coup.
    .replace(/[^a-z0-9]+/g, '-')
    // Pas de tiret en tête ni en queue : « FTP en Go ! » ne doit pas produire
    // « ftp-en-go- ».
    .replace(/^-+|-+$/g, '')
}
