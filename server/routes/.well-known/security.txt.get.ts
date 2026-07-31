// Contact sécurité, RFC 9116 : la voie normalisée pour signaler une faille.
//
// Généré par une route et non déposé dans public/ : le champ Expires doit
// rester dans le futur, et les dossiers commençant par un point ne sont pas
// toujours recopiés. La route est prérendue (voir nuxt.config).
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public

  // Un an après le build : chaque déploiement la repousse, un site abandonné
  // la laisse expirer.
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
