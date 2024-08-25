<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="grid place-items-center min-h-screen">
    <div
      class="w-full max-w-sm p-4 border rounded-lg shadow sm:p-6 md:p-8 bg-gray-800 border-gray-700"
    >
      <form class="space-y-6" action="#">
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
            required
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
            required
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
            required
          />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="mr-3 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
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
