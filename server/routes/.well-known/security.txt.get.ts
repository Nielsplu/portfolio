// Fichier de contact sécurité, conforme à la RFC 9116.
//
// C'est la voie normalisée pour signaler une faille sur un site : un chercheur
// en sécurité regarde /.well-known/security.txt avant de chercher une adresse au
// hasard. Presque aucun portfolio n'en a.
//
// Généré par une route plutôt que déposé dans public/ pour deux raisons :
//   - le champ Expires est obligatoire et doit rester dans le futur ; le
//     calculer au build évite un fichier périmé qu'on oublierait de mettre à
//     jour, ce qui est précisément le défaut que la RFC cherche à éviter ;
//   - les dossiers commençant par un point ne sont pas toujours recopiés depuis
//     public/ selon l'outil de build.
//
// La route est prérendue (voir nuxt.config) : GitHub Pages n'exécute rien, il
// sert le fichier statique produit à la compilation.
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public

  // La RFC recommande une échéance courte, révisée régulièrement. Un an après
  // le build : chaque déploiement la repousse, un site abandonné la laisse
  // expirer — ce qui est le comportement voulu.
  const expiration = new Date()
  expiration.setFullYear(expiration.getFullYear() + 1)

  const lignes = [
    '# Signalement de vulnérabilité — https://www.rfc-editor.org/rfc/rfc9116',
    '# Merci de décrire le problème et les étapes pour le reproduire.',
    '',
    'Contact: mailto:pluniels@gmail.com',
    `Expires: ${expiration.toISOString()}`,
    'Preferred-Languages: fr, en',
    `Canonical: ${siteUrl}.well-known/security.txt`,
    '',
  ].join('\n')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lignes
})
