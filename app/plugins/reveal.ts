// v-reveal: fades elements in as they scroll into view. Optional delay in ms: v-reveal="120"
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null
  const getObserver = () =>
    (observer ??= new IntersectionObserver(
      entries => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          observer!.unobserve(e.target)
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    ))

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({ class: 'reveal' }),
    mounted(el: HTMLElement, binding) {
      el.classList.add('reveal')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`
      getObserver().observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
