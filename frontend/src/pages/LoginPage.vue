<script setup>
import { reactive } from "vue";
import { supabase } from "../lib/supabase";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import router from "../router";

const $toast = useToast();

const formData = reactive({
  email: "",
  password: "",
});

const handleSubmit = async () => {
  try {
    if (formData.email == "" || formData.password == "") {
      alert("All fields are required!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.log("Error >>", error);
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }
    console.log("DATA >>>", data);
    if (data) {
      router.push({ name: "Home" });
    }
  } catch (error) {
    console.log("ERROR >>", error);
    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};
</script>

<template>
  <section class="grid place-items-center min-h-screen">
    <div
      class="w-full max-w-sm p-4 border rounded-lg shadow sm:p-6 md:p-8 bg-gray-800 border-gray-700"
    >
      <form class="space-y-6" action="#" @submit.prevent="handleSubmit">
        <h5 class="text-xl font-medium text-white">Sign in to our platform</h5>
        <div>
          <label for="email" class="block mb-2 text-sm text-white">Email</label>
          <input
            type="email"
            name="email"
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter your Email"
            v-model="formData.email"
            required
          />
        </div>

        <div>
          <label for="password" class="block mb-2 text-sm text-white"
            >Password</label
          >
          <input
            type="password"
            name="password"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter your Password"
            v-model="formData.password"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Sign in
        </button>
      </form>
    </div>
  </section>
</template>
