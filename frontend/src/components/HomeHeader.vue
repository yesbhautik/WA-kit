<script setup>
import { onMounted, reactive, ref } from "vue";
import Modal from "./Modal.vue";
import { useToast } from "vue-toast-notification";
import { supabase } from "../lib/supabase";
import router from "../router";

const $toast = useToast();
const isModalVisible = ref(false);
const isPairingModal = ref(false);
const isAuthenticated = ref(false);
const formData = reactive({
  number: "",
  countryCode: "91",
  pairingCode: "",
});

const openModal = (name) => {
  if (name == "contact") {
    isModalVisible.value = true;
  } else if (name == "pairingcode") {
    isPairingModal.value = true;
  }
};

const closeModal = (name) => {
  if (name == "contact") {
    isModalVisible.value = false;
    formData.number = "";
  } else if (name == "pairingcode") {
    isPairingModal.value = false;
  }
};

const copyPairingCode = () => {
  navigator.clipboard.writeText(formData.pairingCode).then(() => {
    $toast.success("Text copied successfully!", {
      position: "top-right",
    });
  });
};

const checkAuth = async () => {
  const { data: user } = await supabase.auth.getUser();
  isAuthenticated.value = !!user;
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
        .eq("contact", parseInt(formData.countryCode + formData.number));

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

      const result = await fetch("/api/whatsapp/pairing-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.countryCode + formData.number,
          isUpdate: false,
        }),
        credentials: "include",
      });

      const response = await result.json();
      console.log("response >>", response);

      if (response.success) {
        const { data: insertData, error: insertDataError } = await supabase
          .from("users")
          .insert([
            {
              contact: formData.countryCode + formData.number,
              createdBy: data.session.user.id,
            },
          ])
          .select();

        if (insertDataError) {
          $toast.error(insertDataError.message, {
            position: "top-right",
          });
          return;
        }

        if (insertData) {
          closeModal("contact");
          $toast.success("Number add successfully!", {
            position: "top-right",
          });
          formData.pairingCode = response.data.pairingCode;
          openModal("pairingcode");
        }
      } else {
        $toast.error("Something went wrong, try again!", {
          position: "top-right",
        });
        return;
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

const logoutBtn = async () => {
  try {
    const { error } = supabase.auth.signOut();
    if (error) {
      $toast.error("Something went wrong!", {
        position: "top-right",
      });
    }
    router.push("/login");
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

onMounted(() => {
  checkAuth();

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session;
  });
});
</script>

<template>
  <section class="mb-3 p-2 px-5 flex justify-between items-center">
    <h2 class="text-white">Connected WhatsApp Accounts</h2>
    <div v-if="isAuthenticated">
      <button
        @click="() => openModal('contact')"
        class="mr-3 text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700"
      >
        Add Account
      </button>
      <button
        @click="logoutBtn"
        class="mr-3 text-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700"
      >
        Logout
      </button>

      <!-- Modal for add contact -->
      <Modal
        v-if="isModalVisible"
        :show="isModalVisible"
        @close="() => closeModal('contact')"
        @submit="submitBtn"
        title="Add Contact"
      >
        <div>
          <label for="number" class="block mb-2 text-sm font-medium text-white">
            Number
          </label>
          <div class="flex space-x-2">
            <select
              name="countryCode"
              v-model="formData.countryCode"
              class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:ring-2 block p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              required
            >
              <option value="1">+1 (USA)</option>
              <option value="91">+91 (India)</option>
              <option value="44">+44 (UK)</option>
              <option value="61">+61 (Australia)</option>
            </select>

            <input
              type="text"
              name="number"
              v-model="formData.number"
              class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:ring-2 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              placeholder="Enter new number"
              required
            />
          </div>
        </div>
      </Modal>

      <!-- Modal for Pairing code -->
      <Modal
        v-if="isPairingModal"
        :show="isPairingModal"
        @close="() => closeModal('pairingcode')"
        @copyCode="copyPairingCode"
        title=""
      >
        <h2 class="text-2xl text-center font-semibold text-green-500">
          Pairing Successful!
        </h2>
        <p class="text-gray-400 mt-1 mb-5 text-sm text-center">
          Your device has been linked from two step away.
        </p>

        <div
          class="bg-gray-800 border border-gray-600 text-gray-300 text-center text-xl font-semibold h-12 mt-4 p-2 rounded-lg"
        >
          {{ formData.pairingCode }}
        </div>
      </Modal>
    </div>
  </section>
</template>
