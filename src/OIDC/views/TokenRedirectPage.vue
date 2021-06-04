<template>
  <div>
    <p>Token Redirect page</p>
    <div v-if="hasError">
      access code: {{ accessCode }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
export default defineComponent({
  name: 'openIdConnectTokenRedirect',
  props: {
    hasErrored: {
      type: Boolean,
      default: false

    }
  },
  setup () {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const hasError = ref<boolean>(false)
    const accessCode = route.query.code
    store.dispatch('postCode', accessCode).then((redirectPath: any) => {
      router.push({ path: redirectPath })
    },
    (error: any) => {
      hasError.value = true
    }
  )

    return {
      hasError,
      accessCode
    }
  }
})
</script>
