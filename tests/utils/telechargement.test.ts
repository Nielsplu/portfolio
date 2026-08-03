import { afterEach, describe, expect, it, vi } from 'vitest'
import { telechargerAvecProgression } from '~/utils/telechargement'

/** Réponse dont le corps arrive en plusieurs morceaux, comme sur le réseau. */
function reponseEnFlux(morceaux: number[][], entetes: Record<string, string> = {}) {
  const flux = new ReadableStream<Uint8Array>({
    start(controleur) {
      for (const m of morceaux) controleur.enqueue(new Uint8Array(m))
      controleur.close()
    },
  })
  return new Response(flux, { status: 200, headers: entetes })
}

function simulerFetch(reponse: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponse))
}

afterEach(() => vi.unstubAllGlobals())

describe('telechargerAvecProgression', () => {
  it('recolle les morceaux dans l\'ordre', async () => {
    simulerFetch(reponseEnFlux([[0, 97, 115], [109], [1, 2]]))

    const tampon = await telechargerAvecProgression('/demos/ftp/ftp.wasm')

    expect([...new Uint8Array(tampon)]).toEqual([0, 97, 115, 109, 1, 2])
  })

  it('rapporte une fraction croissante quand la taille est annoncée', async () => {
    simulerFetch(reponseEnFlux([[1, 2], [3, 4], [5, 6, 7, 8]], { 'content-length': '8' }))
    const releves: Array<[number | null, number, number | null]> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', (f, recus, total) => releves.push([f, recus, total]))

    expect(releves).toEqual([
      [0.25, 2, 8],
      [0.5, 4, 8],
      [1, 8, 8],
    ])
  })

  it('rapporte null quand aucune taille n\'est annoncée', async () => {
    // Sans Content-Length, afficher un pourcentage reviendrait à l'inventer.
    simulerFetch(reponseEnFlux([[1, 2], [3]]))
    const fractions: Array<number | null> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', f => fractions.push(f))

    expect(fractions).toEqual([null, null])
  })

  it('ignore Content-Length quand la réponse est compressée', async () => {
    // GitHub Pages sert le binaire en gzip : Content-Length porte la taille
    // transférée (1,2 Mo) alors que le flux livre du décompressé (4,4 Mo).
    simulerFetch(reponseEnFlux([[1, 2, 3, 4]], { 'content-length': '2', 'content-encoding': 'gzip' }))
    const releves: Array<[number | null, number, number | null]> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', (f, recus, total) => releves.push([f, recus, total]))

    expect(releves).toEqual([[null, 4, null]])
  })

  it('accepte Content-Length quand l\'encodage est identity', async () => {
    simulerFetch(reponseEnFlux([[1, 2]], { 'content-length': '4', 'content-encoding': 'identity' }))
    const fractions: Array<number | null> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', f => fractions.push(f))

    expect(fractions).toEqual([0.5])
  })

  it('ignore un Content-Length inexploitable', async () => {
    simulerFetch(reponseEnFlux([[1, 2]], { 'content-length': '0' }))
    const fractions: Array<number | null> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', f => fractions.push(f))

    expect(fractions).toEqual([null])
  })

  it('plafonne la fraction à 1 si le serveur annonce moins qu\'il n\'envoie', async () => {
    simulerFetch(reponseEnFlux([[1, 2, 3, 4]], { 'content-length': '2' }))
    const fractions: Array<number | null> = []

    await telechargerAvecProgression('/demos/ftp/ftp.wasm', f => fractions.push(f))

    expect(fractions).toEqual([1])
  })

  it('lève une erreur nommant l\'URL sur une réponse en échec', async () => {
    simulerFetch(new Response('', { status: 404 }))

    await expect(telechargerAvecProgression('/demos/ftp/ftp.wasm')).rejects.toThrow(/ftp\.wasm.*404/)
  })

  it('n\'appelle pas le rappel si le corps est vide', async () => {
    simulerFetch(reponseEnFlux([]))
    const surProgression = vi.fn()

    const tampon = await telechargerAvecProgression('/demos/ftp/ftp.wasm', surProgression)

    expect(tampon.byteLength).toBe(0)
    expect(surProgression).not.toHaveBeenCalled()
  })
})
