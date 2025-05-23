import FacebookLoginButton from "@/components/FacebookLoginButton";

const ApiPage = () => {
    return (
        <div>
            <h1 className="p-4 text-2xl font-bold">API Integration</h1>

            <div className="m-4">
                <FacebookLoginButton />
            </div>
        </div>
    )
}

export default ApiPage;