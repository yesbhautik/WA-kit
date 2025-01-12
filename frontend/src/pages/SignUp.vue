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
  name: "",
  verifyOTP: false,
  otp: "",
});

const verifyOTPHandler = async () => {
  console.log("OTP >>", formData.otp);
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: "email",
    });

    if (error) {
      console.log("Error >>", error);
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (data) {
      $toast.success("User verify successfully!", {
        position: "top-right",
      });
      router.push("/setup-api");
    }
    console.log("VERIFY USER DATA >>", data);
  } catch (error) {
    console.log("Error >>", error);

    $toast.error("Something went wrong!", {
      position: "top-right",
    });
  }
};

const handleSubmit = async () => {
  try {
    if (
      formData.email == "" ||
      formData.password == "" ||
      formData.name == ""
    ) {
      $toast.error("All fields are required!", {
        position: "top-right",
      });
      return;
    }

    if (formData.password.length < 6) {
      $toast.error("Password length must be 6 character long!", {
        position: "top-right",
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
        emailRedirectTo: "http://localhost:5173/setup-api",
      },
    });

    if (error) {
      console.log("Error >>", error);
      $toast.error(error.message, {
        position: "top-right",
      });
      return;
    }

    if (data) {
      $toast.success(
        "Register successfully!, we send you email verify your account",
        {
          position: "top-right",
        }
      );
      formData.verifyOTP = true;
    }
    console.log("DATA >>>", data);
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
      <form
        v-if="!formData.verifyOTP"
        class="space-y-6"
        action="#"
        @submit.prevent="handleSubmit"
      >
        <h5 class="text-xl font-medium text-white">Sign up to our platform</h5>
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-white"
            >Name</label
          >
          <input
            type="text"
            name="name"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter your name"
            v-model="formData.name"
            required
          />
        </div>
        <div>
          <label for="email" class="block mb-2 text-sm font-medium text-white"
            >Email</label
          >
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
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-white"
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
          Sign Up
        </button>
        <span class="text-sm block text-center text-slate-300">
          Already have an account?
          <RouterLink to="/login" class="underline decoration-slate-50"
            >Signin</RouterLink
          >
        </span>
      </form>

      <form v-else @submit.prevent="verifyOTPHandler">
        <div class="text-center">
          <h5 class="text-xl font-medium text-white">Verify your OTP</h5>
          <p class="text-sm text-white mt-1">We sent OTP to your email</p>
        </div>
        <div class="mt-5">
          <input
            type="text"
            name="otp"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter OTP"
            v-model="formData.otp"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full text-white mt-3 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Verify
        </button>
      </form>
    </div>
  </section>
</template>
