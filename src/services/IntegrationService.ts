import { AuthService } from "./AuthService";

const FACEBOOK_APP_ID = import.meta.env.VITE_FB_APP_ID;
const REDIRECT_URI =
    import.meta.env.VITE_FB_REDIRECT_URI || "http://localhost:3000/api/integration/facebook/callback";

export const IntegrationService = {
    loginWithFacebookPopup: () => {
        return new Promise((resolve, reject) => {
            const userId = AuthService.getCurrentUserId();
            const scope = [
                "public_profile",
                "email",
                "pages_show_list",
                "pages_messaging",
                "pages_read_engagement",
                'whatsapp_business_messaging',
                'whatsapp_business_management',
                "business_management"
            ].join(",");

            if (!userId) {
                console.log("Chamara user id", userId);
                throw 'No user id found'
            } else {
                console.log("Chamara user id", userId);
            }

            const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
                REDIRECT_URI
            )}&scope=${encodeURIComponent(scope)}&response_type=code&state=${userId}`;

            window.open(url, "_blank", "width=600,height=700");

            // Add listener for messages from popup
            const handleMessage = (event: MessageEvent) => {
                console.log("Chamara handle callback", event.data)
                console.log("Chamara handle callback full event", event)
                if (event.origin !== window.location.origin) return;

                const { type, payload, error } = event.data;

                if (type === "facebook-success") {
                    window.removeEventListener("message", handleMessage);
                    resolve(payload);
                } else if (type === "facebook-failure") {
                    window.removeEventListener("message", handleMessage);
                    reject(error || "Facebook login failed");
                }
            };

            window.addEventListener("message", handleMessage);
        });
    }
};
