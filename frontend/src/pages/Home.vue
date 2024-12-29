<script setup>
import { onMounted, reactive, ref } from "vue";
import { useToast } from "vue-toast-notification";
import { supabase } from "../lib/supabase";
import HomeHeader from "../components/HomeHeader.vue";
import Modal from "../components/Modal.vue";
import router from "../router";

const $toast = useToast();
const formData = reactive({
  users: [],
  number: "",
  id: "",
  countryCode: "91",
  pairingCode: "",
  oldNumber: "",
});
const isModalVisible = ref(false);
const isPairingModal = ref(false);

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
      formData.number = data[0].contact.toString().slice(2);
      formData.countryCode = data[0].contact.toString().slice(0, 2);
      formData.id = data[0].id;
      formData.oldNumber = data[0].contact;
      isModalVisible.value = true;
    }
  } catch (error) {
    console.log(error);

    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const closeModal = () => {
  isModalVisible.value = false;
  formData.number = "";
};

// Pairing Modal
const pairCodeModalOpenClose = (match) => {
  isPairingModal.value = match;
};

const copyPairingCode = () => {
  navigator.clipboard.writeText(formData.pairingCode).then(() => {
    $toast.success("Text copied successfully!", {
      position: "top-right",
    });
  });
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
      formData.users = [];
      formData.users.push(...usersData);
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const updateBtn = async () => {
  try {
    if (!formData.number) {
      $toast.error("Mobile number is required!", {
        position: "top-right",
      });
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (data && data.session) {
      let { data: userContact, error } = await supabase
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

      if (userContact && userContact.length > 0) {
        $toast.error("Number is already exist!", {
          position: "top-right",
        });
        return;
      }

      const sendData = {
        phoneNumber: formData.countryCode + formData.number,
        oldNumber: formData.oldNumber,
        isUpdate: true,
      };

      const result = await fetch("/api/whatsapp/pairing-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
        credentials: "include",
      });

      const response = await result.json();
      console.log("response >>", response);

      if (response.success) {
        const { data: updatedData, error: updateDataError } = await supabase
          .from("users")
          .update({
            contact: formData.countryCode + formData.number,
          })
          .eq("id", formData.id)
          .select();

        if (updateDataError) {
          $toast.error(updateDataError.message, {
            position: "top-right",
          });
          return;
        }

        if (updatedData) {
          closeModal();
          $toast.success("Number updated successfully!", {
            position: "top-right",
          });
          formData.pairingCode = response.data.pairingCode;
          pairCodeModalOpenClose(true);
          fetchData();
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

onMounted(() => {
  fetchData();
});
</script>

<template>
  <!-- Modal for update contact -->
  <Modal
    v-if="isModalVisible"
    :show="isModalVisible"
    @close="closeModal"
    @updateBtn="updateBtn"
    title="Update contact"
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
    @close="() => pairCodeModalOpenClose(false)"
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
            Update
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
