<template>
  <div>
    <label>测试集合名</label>
    <select v-model="currentCollectionName">
      <option v-for="name in collectionNames">{{ name }}</option>
    </select>
    <label>单元测试名</label>
    <select v-model="currentRunUnitTestName">
      <option v-for="name in currentUnitTestNames">{{ name }}</option>
    </select>
    <button>截图(to do)</button>
    <button>录屏(to do)</button>
    <button @click="runTest">run test</button>
    <label>结果(to do)</label>
    <input type="checkbox" />
    <label>comment</label>
    <textarea></textarea>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import unitTestCollections from "./unitTests";

const collectionNames = unitTestCollections.map(collection => collection.name);
const currentCollectionName = useStorage("collectionName", "");
const currentUnitTests = computed(() => {
  return (
    unitTestCollections.find(
      collection => collection.name === currentCollectionName.value
    ) || {
      name: "null",
      tests: [],
    }
  ).tests;
});
const currentUnitTestNames = computed(() => {
  return currentUnitTests.value.map(unitTest => unitTest.name);
});
const currentRunUnitTestName = useStorage("runUnitTest", "");
const currentRunUnitTest = computed(() => {
  return currentUnitTests.value.find(
    unitTest => unitTest.name === currentRunUnitTestName.value
  );
});
function runTest() {
  if (currentRunUnitTest.value) {
    currentRunUnitTest.value.command();
  }
}
</script>
