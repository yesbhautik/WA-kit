<script setup>
import { onMounted, reactive, ref } from "vue";
import { useToast } from "vue-toast-notification";
import { supabase } from "../lib/supabase";
import HomeHeader from "../components/HomeHeader.vue";
import Modal from "../components/Modal.vue";

const $toast = useToast();
const formData = reactive({ users: [], number: "" });
const isModalVisible = ref(false);

const openModal = async (id) => {
  try {
    if (!id) {
      $toast.error("Contact ID is required!", {
        position: "top-right",
      });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, contact")
      .eq("id", id);

    if (error) {
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (data) {
      console.log("MATCH DATA >>", data);
      formData.number = data[0].contact;
      isModalVisible.value = true;
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const closeModal = () => {
  isModalVisible.value = false;
  formData.number = "";
};

const fetchData = async () => {
  try {
    const { data } = await supabase.auth.getSession();

    const { data: usersData, error } = await supabase
      .from("users")
      .select("*")
      .eq("createdBy", data.session.user.id);

    if (error) {
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (usersData) {
      formData.users.push(...usersData);
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <!-- Modal -->
  <Modal
    v-if="isModalVisible"
    :show="isModalVisible"
    @close="closeModal"
    @submit="submitBtn"
    title="Contact Data"
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

  <HomeHeader />
  <section>
    <div
      v-if="formData.users.length == 0"
      class="text-white flex justify-center items-center flex-col h-[500px]"
    >
      <h3 class="pb-1 text-xl font-semibold">No Account add yet.</h3>
      <p>Please add account</p>
    </div>
    <div v-else class="grid grid-cols-4 gap-4 w-4/5 m-auto">
      <div v-for="data in formData.users">
        <div
          class="text-white bg-blue-950 p-4 rounded-sm cursor-pointer flex justify-between items-center"
        >
          <span>{{ data.contact }}</span
          ><button
            class="py-1.5 px-2 text-sm font-medium focus:outline-none rounded-lg border focus:z-10 focus:ring-1 ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
            @click="() => openModal(data.id)"
          >
            Setting
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
