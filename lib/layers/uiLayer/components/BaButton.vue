<script setup lang="ts">
import { PropType, Ref, ref } from 'vue';

const props = defineProps({
    style: String as PropType<"primary" | 'activate'>
});

</script>

<template>  
  <button class="ba-button">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.ba-button {
  padding: 6px 16px;
  border-radius: 4px;
  border: solid 1px rgb(133, 133, 133);
  font-size: 18px;
  font-weight: bold;
}
</style>
