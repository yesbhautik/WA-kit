<script setup>
import { reactive, ref } from "vue";
import Modal from "./Modal.vue";
import { useToast } from "vue-toast-notification";
import { supabase } from "../lib/supabase";
import router from "../router";

const $toast = useToast();
const isModalVisible = ref(false);
const formData = reactive({
  number: "",
});

const openModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  formData.number = "";
};

const submitBtn = async () => {
  try {
    if (!formData.number) {
      $toast.error("Mobile number is required!", {
        position: "top-right",
      });
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (data && data.session) {
      let { data: users, error } = await supabase
        .from("users")
        .select(
          `
          id,
          createdBy
        `
        )
        .eq("contact", parseInt(formData.number));

      if (error) {
        console.log("Get Number Error >>", error);
        return;
      }

      if (users && users.length > 0) {
        $toast.error("Number is already exist!", {
          position: "top-right",
        });
        return;
      }
      const { data: insertData, error: insertDataError } = await supabase
        .from("users")
        .insert([{ contact: formData.number, createdBy: data.session.user.id }])
        .select();

      if (insertDataError) {
        $toast.error(insertDataError.message, {
          position: "top-right",
        });
        return;
      }

      if (insertData) {
        closeModal();
        $toast.success("Number add successfully!", {
          position: "top-right",
        });
      }
    } else {
      router.push("/login");
    }
  } catch (error) {
    console.log("Error >>", error);

    $toast.error("Something went wrong!", {
      position: "top-right",
    });
    return;
  }
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
        @submit="submitBtn"
        title="My Modal"
      >
        <div>
          <label for="number" class="block mb-2 text-sm font-medium text-white"
            >Number</label
          >
          <input
            type="number"
            name="number"
            v-model="formData.number"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:ring-2 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter new number"
            required
          />
        </div>
      </Modal>
    </div>
  </section>
</template>
