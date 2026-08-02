/** Avancement du téléchargement, de 0 à 1. `null` si la taille est inconnue. */
export type SurProgression = (fraction: number | null, recus: number, total: number | null) => void

/**
 * Télécharge en lisant le flux plutôt qu'en attendant `arrayBuffer()`, afin de
 * rapporter l'avancement. Le binaire de la démo FTP pèse 4,4 Mo : sur une
 * connexion mobile, sans retour, on ne sait pas si ça progresse ou si c'est
 * bloqué.
 *
 * Sans `Content-Length` — réponse compressée sans taille annoncée — aucun
 * pourcentage n'est calculable : on rapporte les octets reçus et `null`, à
 * charge de l'appelant d'afficher une progression indéterminée.
 */
export async function telechargerAvecProgression(
  url: string,
  surProgression?: SurProgression,
): Promise<ArrayBuffer> {
  const reponse = await fetch(url)
  if (!reponse.ok) throw new Error(`échec du téléchargement de ${url} (${reponse.status})`)

  const annonce = reponse.headers.get('content-length')
  const total = annonce ? Number.parseInt(annonce, 10) : null

  // Sans corps lisible en flux, on retombe sur le chargement d'un bloc.
  if (!reponse.body) return reponse.arrayBuffer()

  const lecteur = reponse.body.getReader()
  const morceaux: Uint8Array[] = []
  let recus = 0

  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    morceaux.push(value)
    recus += value.length
    // Un serveur peut annoncer moins qu'il n'envoie : on plafonne à 1 plutôt
    // que d'afficher 103 %.
    surProgression?.(total ? Math.min(recus / total, 1) : null, recus, total)
  }

  const tampon = new Uint8Array(recus)
  let position = 0
  for (const morceau of morceaux) {
    tampon.set(morceau, position)
    position += morceau.length
  }
  return tampon.buffer
}
