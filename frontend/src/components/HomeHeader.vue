<script setup>
import { ref } from "vue";
import Modal from "./Modal.vue";

const isModalVisible = ref(false);

const openModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};
</script>

<template>
  <section class="mb-3 p-2 px-5 flex justify-between items-center">
    <h2 class="text-white">Connected WhatsApp Accounts</h2>
    <div>
      <button
        @click="openModal"
        class="mr-3 text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700"
      >
        Add Account
      </button>

      <Modal
        v-if="isModalVisible"
        :show="isModalVisible"
        @close="closeModal"
        title="My Modal"
      >
        <div>
          <label for="number" class="block mb-2 text-sm font-medium text-white"
            >Number</label
          >
          <input
            type="number"
            name="number"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:ring-2 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter new number"
            required
          />
        </div>
      </Modal>
    </div>
  </section>
</template>
