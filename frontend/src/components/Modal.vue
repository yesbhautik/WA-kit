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
import { defineComponent } from "vue";

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
  emits: ["close"],
  setup(props, { emit }) {
    const closeModal = () => {
      emit("close");
    };

    return {
      closeModal,
    };
  },
});
</script>
