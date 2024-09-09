<script setup>
import { onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";
import { supabase } from "../lib/supabase";
import { useToast } from "vue-toast-notification";

const $toast = useToast();

const formData = reactive({
  openai_api: "",
  cloudflare_api: "",
  gemini_api: "",
  is_update: false,
});

const handleUpdate = async (e) => {
  try {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();

    const { data: updatedData, error } = await supabase
      .from("api_key")
      .update({
        gemini_api: formData.gemini_api,
        openai_api: formData.openai_api,
        cloudflare_api: formData.cloudflare_api,
        createdBy: data.session.user.id,
      })
      .eq("createdBy", data.session.user.id)
      .select();

    if (error) {
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (updatedData) {
      console.log("User API >>", updatedData);
      formData.cloudflare_api = updatedData[0].cloudflare_api;
      formData.gemini_api = updatedData[0].gemini_api;
      formData.openai_api = updatedData[0].openai_api;
      formData.is_update = true;
      $toast.success("Data updated successfully!", {
        position: "top-right",
      });
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const handleSubmit = async (e) => {
  try {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();

    const { data: insertData, error } = await supabase.from("api_key").insert([
      {
        gemini_api: formData.gemini_api,
        openai_api: formData.openai_api,
        cloudflare_api: formData.cloudflare_api,
        createdBy: data.session.user.id,
      },
    ]);

    if (error) {
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (insertData) {
      formData.cloudflare_api = insertData[0].cloudflare_api;
      formData.gemini_api = insertData[0].gemini_api;
      formData.openai_api = insertData[0].openai_api;
      formData.is_update = true;
      $toast.success("Data add successfully!", {
        position: "top-right",
      });
    }
  } catch (error) {
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const fetchData = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    const { data: userApi, error } = await supabase
      .from("api_key")
      .select()
      .eq("createdBy", data.session.user.id);

    if (error) {
      console.log("Error >>", error);
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (userApi) {
      formData.cloudflare_api = userApi[0].cloudflare_api;
      formData.gemini_api = userApi[0].gemini_api;
      formData.openai_api = userApi[0].openai_api;
      formData.is_update = true;
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
  <section class="grid place-items-center min-h-screen">
    <div
      class="w-full max-w-sm p-4 border rounded-lg shadow sm:p-6 md:p-8 bg-gray-800 border-gray-700"
    >
      <form class="space-y-6">
        <h5 class="text-xl font-medium text-white">Setup your API</h5>
        <div>
          <label
            for="openaiapi"
            class="block mb-2 text-sm font-medium text-white"
            >OpenAI API</label
          >
          <input
            type="text"
            name="openaiapi"
            class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter your openAI API"
            v-model="formData.openai_api"
          />
        </div>
        <div>
          <label
            for="cloudflareapi"
            class="block mb-2 text-sm font-medium text-white"
            >Cloudflare API</label
          >
          <input
            type="text"
            name="cloudflareapi"
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your Cloudflare API"
            v-model="formData.cloudflare_api"
          />
        </div>
        <div>
          <label
            for="geminiapi"
            class="block mb-2 text-sm font-medium text-white"
            >Gemini API</label
          >
          <input
            type="text"
            name="geminiapi"
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your Gemini API"
            v-model="formData.gemini_api"
          />
        </div>

        <div class="flex justify-end">
          <button
            v-if="formData.is_update"
            type="submit"
            class="mr-3 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            @click="handleUpdate"
          >
            Update
          </button>
          <button
            v-else
            type="submit"
            class="mr-3 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            @click="handleSubmit"
          >
            Submit
          </button>
          <RouterLink
            to="/"
            class="bg-slate-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-slate-500 focus:ring-slate-400 hover:text-white"
            >Skip</RouterLink
          >
        </div>
      </form>
    </div>
  </section>
</template>
