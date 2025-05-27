import { IntegrationService } from "../services/IntegrationService";

export const FacebookLoginButton = () => {
  const handleFacebookLogin = () => {
    IntegrationService.loginWithFacebookPopup();
  };

  return (
    <div>
      <button
        onClick={handleFacebookLogin}
        className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
      >
        Connect with Facebook
      </button>
      <div className="mt-2 text-sm text-gray-600">
        ⚠️ Note:
        Please ensure you're using a Facebook Business account.
        Additionally, a WhatsApp Business account must be linked to your Facebook Business portfolio for the integration to work properly.
      </div>
    </div>
  );
};

export default FacebookLoginButton;