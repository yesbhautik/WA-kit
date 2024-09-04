import {createRouter, createWebHistory} from "vue-router"
import LoginPage from "../pages/LoginPage.vue"
import SetupProfilePage from "../pages/SetupProfilePage.vue";
import SetupApiPage from "../pages/SetupApiPage.vue";
import Home from "../pages/Home.vue";
import SignUpPage from "../pages/SignUp.vue";
import { supabase } from "../lib/supabase";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "Login",
            component: LoginPage
        }, 
        {
            path: "/signup",
            name: "Signup",
            component: SignUpPage
        }, 
        {
            path: "/setup-profile",
            name: "Setup Profile",
            component: SetupProfilePage,
            meta: {requiresAuth: true}
        },
        {
            path: "/setup-api",
            name: "Setup API",
            component: SetupApiPage,
            meta: {requiresAuth: true}
        },
        {
            path: "/",
            name: "Home",
            component: Home,
            meta: {requiresAuth: true}
        },
    ]
})

// Check authentication
const checkAuth = async (next) => {
    const userData = await supabase.auth.getSession();
    console.log("USER DATA >>", userData);
    
    if(!userData.data.session) {
        next("/login");
    } else {
        next();
    }
}

router.beforeEach((to, from, next) => {
    if(to.meta.requiresAuth) {
        console.log("Auth Requires");
        checkAuth(next);
    } else {
        next();
    }
})

export default router;