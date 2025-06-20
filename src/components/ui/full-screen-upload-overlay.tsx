import { Progress } from "@/components/ui/progress";

interface Props {
    show: boolean;
    progress: number;
}

export default function FullScreenUploadOverlay({ show, progress }: Props) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 space-y-4 text-center bg-white shadow-xl rounded-xl w-72">
                <div className="text-lg font-semibold">Uploading...</div>
                <Progress value={progress} />
                <div className="text-sm text-muted-foreground">{progress}%</div>
            </div>
        </div>
    );
}
