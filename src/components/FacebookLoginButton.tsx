import { IntegrationService } from "../services/IntegrationService";

export const FacebookLoginButton = () => {
  const handleFacebookLogin = () => {
    IntegrationService.loginWithFacebookPopup();
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
    >
      Connect with Facebook
    </button>
  );
};

export default FacebookLoginButton;