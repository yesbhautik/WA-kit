<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const verifyToken = async (token) => {
  try {
    const response = await fetch(`/api/users/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
    } else {
    }
  } catch (error) {
    console.log({ error });
  }
};

onMounted(() => {
  console.log("Component Mounted!!");

  console.log("TOKEN >>", route.params.token);
  verifyToken(route.params.token);
});
</script>

<template></template>
