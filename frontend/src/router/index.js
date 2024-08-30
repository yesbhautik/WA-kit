import {createRouter, createWebHistory} from "vue-router"
import LoginPage from "../pages/LoginPage.vue"
import SetupProfilePage from "../pages/SetupProfilePage.vue";
import SetupApiPage from "../pages/SetupApiPage.vue";
import Home from "../pages/Home.vue";
import VerifyEmail from "../pages/VerifyEmail.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "Login",
            component: LoginPage
        }, 
        {
            path: "/setup-profile",
            name: "Setup Profile",
            component: SetupProfilePage
        },
        {
            path: "/setup-api",
            name: "Setup API",
            component: SetupApiPage
        },
        {
            path: "/",
            name: "Home",
            component: Home
        },
        {
            path: "/verify-email/:token",
            name: "Verify Email",
            component: VerifyEmail
        },
    ]
})

export default router;