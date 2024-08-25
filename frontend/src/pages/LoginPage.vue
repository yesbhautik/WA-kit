<script setup>
import { RouterLink } from "vue-router";
import GitHubIcon from "../assets/github.png"
</script>

<template>
    <section class="grid place-items-center min-h-screen">
        <section class="grid place-items-center">
            <h1 class="text-white mb-5 text-lg">Whatsapp AI Bot Server 🚀</h1>
            <RouterLink to="/setup-profile" class="bg-slate-300 py-2 px-8 rounded text-sm flex items-center"><img :src="GitHubIcon" alt="GitHub icon" class="w-5 rounded-lg mr-2">Login with GitHub</RouterLink>
        </section>
    </section>
</template>