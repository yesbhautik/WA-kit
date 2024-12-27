<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
  >
    <div
      class="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow w-full max-w-lg"
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
        <button @click="closeModal" class="text-gray-400 text-2xl">
          &times;
        </button>
      </div>

      <!-- Modal Body -->
      <div>
        <slot></slot>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end mt-4">
        <button
          v-if="isPairingCode"
          @click="copyCode"
          class="mr-3 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-green-600 hover:bg-green-700 focus:ring-green-800"
        >
          Copy Code
        </button>
        <button
          @click="submitBtn"
          v-else="isPairingCode"
          class="mr-3 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Submit
        </button>
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Modal Title",
    },
  },
  emits: ["close", "submit", "copyCode"],
  setup(props, { emit }) {
    const isPairingCode = computed(() => !props.title);

    const closeModal = () => {
      emit("close");
    };

    const submitBtn = () => {
      emit("submit");
    };

    const copyCode = () => {
      emit("copyCode");
    };

    return {
      closeModal,
      submitBtn,
      copyCode,
      isPairingCode,
    };
  },
});
</script>
