<script setup></script>

<template>
  <section class="grid place-items-center min-h-screen">
    <div
      class="w-full max-w-sm p-4 border rounded-lg shadow sm:p-6 md:p-8 bg-gray-800 border-gray-700"
    >
      <form class="space-y-6" action="#">
        <h5 class="text-xl font-medium text-white">Sign in to our platform</h5>
        <div>
          <label
            for="username"
            class="block mb-2 text-sm font-medium text-white"
            >Username</label
          >
          <input
            type="text"
            name="username"
            class="border text-sm rounded-lg outline-none focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label
            for="fullname"
            class="block mb-2 text-sm font-medium text-white"
            >Full name</label
          >
          <input
            type="text"
            name="fullname"
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter your fullname"
            required
          />
        </div>

        <RouterLink to="/setup-api" class="mt-4 block">
          <button
            type="submit"
            class="w-full text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
          >
            Setup your account
          </button>
        </RouterLink>
      </form>
    </div>
  </section>
</template>
