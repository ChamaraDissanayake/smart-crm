import { ALLOWED_EXTENSIONS } from '@/utils/allowedExtentions';
import { truncateMiddle } from '@/utils/textHelpers';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaPaperclip, FaTimes, FaFileImage, FaFilePdf, FaFileAlt, FaFileAudio, FaFileVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';

type AttachmentType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface PendingAttachment {
    file: File;
    type: AttachmentType;
    previewUrl?: string;
    caption: string;
}

interface AttachmentHandlerProps {
    onAttachmentsChange: (attachments: PendingAttachment[]) => void;
}
export interface AttachmentHandlerRef {
    handleRemove: (fileName: string) => void;
}

export const AttachmentHandler = forwardRef<AttachmentHandlerRef, AttachmentHandlerProps>(
    ({ onAttachmentsChange }, ref) => {

        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const previousUrlsRef = useRef<string[]>([]);
        const MAX_FILES = 5;

        const MAX_SIZES = {
            image: 16 * 1024 * 1024,     // 16MB
            video: 16 * 1024 * 1024,     // 16MB
            audio: 16 * 1024 * 1024,     // 16MB
            document: 100 * 1024 * 1024, // 100MB
            other: 100 * 1024 * 1024     // 100MB
        };

        const isAllowedFile = (file: File) => {
            const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
            return ALLOWED_EXTENSIONS.includes(extension);
        };

        // Check if file is duplicate by name + size
        const isDuplicate = (file: File) =>
            attachments.some(att => att.file.name === file.name && att.file.size === file.size);

        // Handle file type selection
        const handleSelectType = (type: AttachmentType) => {
            if (fileInputRef.current) {
                fileInputRef.current.accept =
                    type === 'image' ? 'image/*' :
                        type === 'video' ? 'video/*' :
                            type === 'audio' ? 'audio/*' :
                                type === 'document' ? '.pdf,.doc,.docx,.txt' : '*';
                fileInputRef.current.click();
                setIsMenuOpen(false);
            }
        };

        // Process selected files
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            const newAttachments: PendingAttachment[] = [];

            for (const file of Array.from(files)) {
                if (attachments.length + newAttachments.length >= MAX_FILES) {
                    toast.warn(`Only ${MAX_FILES} attachments can be sent at once.`);
                    break;
                }

                if (isDuplicate(file)) {
                    toast.warn(`Duplicate file (${file.name}) detected and skipped.`);
                    continue;
                }

                if (!(isAllowedFile(file))) {
                    toast.warn(`File type not allowed: ${file.name}`);
                    continue;
                }

                const type: AttachmentType =
                    file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                            file.type.startsWith('audio/') ? 'audio' :
                                file.type === 'application/pdf' ? 'document' :
                                    'other';

                // Per-file type size validation
                const maxFileSize = MAX_SIZES[type] || MAX_SIZES.other;
                if (file.size > maxFileSize) {
                    toast.warn(`${file.name} exceeds the max size for ${type} (${(maxFileSize / 1024 / 1024).toFixed(0)}MB).`);
                    continue;
                }

                const newAttachment: PendingAttachment = {
                    file,
                    type,
                    caption: '',
                };

                if (type === 'image' || type === 'video') {
                    newAttachment.previewUrl = URL.createObjectURL(file);
                }

                newAttachments.push(newAttachment);
            }

            if (newAttachments.length === 0) {
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const updatedAttachments = [...attachments, ...newAttachments];
            setAttachments(updatedAttachments);
            onAttachmentsChange(updatedAttachments);

            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        const handleRemove = (filename: string) => {
            const removed = attachments.find(att => att.file.name === filename);
            if (removed?.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            const updatedAttachments = attachments.filter(att => att.file.name !== filename);

            setAttachments(updatedAttachments);
            onAttachmentsChange(updatedAttachments);
        };


        useImperativeHandle(ref, () => ({
            handleRemove
        }));

        // Update caption
        const handleCaptionChange = (index: number, caption: string) => {
            const updatedAttachments = [...attachments];
            updatedAttachments[index] = { ...updatedAttachments[index], caption };
            setAttachments(updatedAttachments);
            onAttachmentsChange(updatedAttachments);
        };

        useEffect(() => {
            const prevUrls = previousUrlsRef.current;
            const currentUrls = attachments
                .map(a => a.previewUrl)
                .filter((url): url is string => !!url);

            const removedUrls = prevUrls.filter(url => !currentUrls.includes(url));

            removedUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });

            previousUrlsRef.current = currentUrls;
        }, [attachments]);

        return (
            <div className="space-y-2">
                {/* Attachment Previews */}
                {attachments.length > 0 && (
                    <div className="p-3 mb-6 space-y-2 bg-gray-300">
                        {attachments.map((attachment, index) => (
                            <div key={index} className="relative p-2 border rounded-md bg-gray-50">
                                <div className="flex items-start gap-3">
                                    {attachment.previewUrl && (attachment.type === 'image' || attachment.type === 'video') ? (
                                        attachment.type === 'image' ? (
                                            <img
                                                src={attachment.previewUrl}
                                                alt="Preview"
                                                className="object-cover w-16 h-16 rounded-md"
                                            />
                                        ) : (
                                            <video
                                                src={attachment.previewUrl}
                                                className="object-cover w-16 h-16 rounded-md"
                                                controls
                                            />
                                        )
                                    ) : (
                                        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md">
                                            {attachment.type === 'document' ? (
                                                <FaFilePdf className="text-2xl text-red-500" />
                                            ) : attachment.type === 'audio' ? (
                                                <FaFileAudio className="text-2xl text-indigo-500" />
                                            ) : attachment.type === 'video' ? (
                                                <FaFileVideo className="text-2xl text-blue-500" />
                                            ) : (
                                                <FaFileAlt className="text-2xl text-gray-500" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="text-sm font-medium max-w-[460px]">
                                            {truncateMiddle(attachment.file.name, 50)}
                                        </div>
                                        {(attachment.type === 'image' || attachment.type === 'video') && (
                                            <input
                                                type="text"
                                                value={attachment.caption}
                                                onChange={(e) => handleCaptionChange(index, e.target.value)}
                                                placeholder="Add a caption..."
                                                className="w-full p-1 mt-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        )}

                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemove(attachment.file.name)}
                                    className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2"
                                    title="Remove attachment"
                                >
                                    <FaTimes className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Attachment Button and Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                        title="Attach file"
                    >
                        <FaPaperclip />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute left-0 z-10 w-48 mb-2 bg-white border border-gray-200 rounded-md shadow-lg bottom-full">
                            <button
                                onClick={() => handleSelectType('image')}
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                <FaFileImage className="mr-2 text-green-500" />
                                Photo
                            </button>
                            <button
                                onClick={() => handleSelectType('video')}
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                <FaFileVideo className="mr-2 text-purple-500" />
                                Video
                            </button>
                            <button
                                onClick={() => handleSelectType('audio')}
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                <FaFileAudio className="mr-2 text-blue-500" />
                                Audio
                            </button>
                            <button
                                onClick={() => handleSelectType('document')}
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                <FaFilePdf className="mr-2 text-red-500" />
                                Document
                            </button>
                            <button
                                onClick={() => handleSelectType('other')}
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                <FaFileAlt className="mr-2 text-gray-500" />
                                Other File
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                    />
                </div>
            </div>
        );
    }
);
