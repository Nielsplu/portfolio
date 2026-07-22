// Renvoie l'id de la section actuellement au centre du viewport, pour mettre en
// surbrillance le lien de navigation correspondant. Un seul IntersectionObserver
// sur les sections ; la marge resserre la zone active autour du milieu d'écran.
export function useScrollSpy(ids: string[]) {
  const actif = ref(ids[0] ?? '')

  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) actif.value = entry.target.id
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    onBeforeUnmount(() => observer.disconnect())
  })

  return actif
}
