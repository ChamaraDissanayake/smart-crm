import { Button } from "@/components/ui/button";
import { useCallback } from "react";

const ApiPage = () => {
    const fbLoging = useCallback(() => {
        const FACEBOOK_APP_ID = "YOUR_APP_ID"; // Replace with your actual App ID
        const redirectUri = encodeURIComponent("https://your-crm.com/auth/facebook/callback");

        const scope = [
            "public_profile",
            "email",
            "pages_show_list",
            "pages_messaging",
            "whatsapp_business_messaging",
            "whatsapp_business_management",
            "business_management"
        ].join(",");

        const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}`;

        window.location.href = fbLoginUrl;
    }, []);
    return (
        <div>
            <h1 className="p-4 text-2xl font-bold">API Integration</h1>

            <Button
                type="button"
                onClick={fbLoging}
                className="m-4 gap-2 bg-[#28ba3e] hover:bg-[#24a137] text-white"
            >
                <img src="/whatsapp-logo.png" alt="WhatsApp Logo" className="w-6 h-6" />
                Connect WhatsApp
            </Button>
        </div>
    )
}

export default ApiPage;