import Linkify from 'linkify-react';
import { JSX } from 'react';
import { FaDownload } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface RenderLinkArgs {
  attributes: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  content: string;
  tagName: string;
}

interface LinkifyMessageProps {
  content: string;
  className?: string;
}

const linkifyOptions = {
  formatHref: (href: string) => href,
  target: '_blank',
  className: 'text-blue-600 hover:underline break-all',
  render: ({ attributes, content }: RenderLinkArgs): JSX.Element => {
    const href = attributes.href ?? '';
    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(href);

    const handleDownload = async (e: React.MouseEvent, url: string) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Fetch the image data
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Extract filename from URL or generate one
        const filename = url.split('/').pop() || `download-${Date.now()}.${blob.type.split('/')[1]}`;

        // Create and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab if download fails
        window.open(url, '_blank');
      }
    };

    if (isImage) {
      return (
        <div className="relative flex flex-col gap-2 group">
          <div className="relative flex justify-center overflow-hidden border rounded-md bg-gray-50">
            <img
              src={href}
              alt="preview"
              className="object-contain max-h-60"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => handleDownload(e, href)}
              className="absolute w-8 h-8 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100 bg-white/90 hover:bg-white"
              title="Download image"
            >
              <FaDownload className="w-4 h-4 text-gray-700" />
            </Button>
          </div>
          <a {...attributes} className="text-blue-600 hover:underline">
            {content}
          </a>
        </div>
      );
    }

    return <a {...attributes}>{content}</a>;
  }
};

export const LinkifyMessage = ({ content, className }: LinkifyMessageProps) => {
  return (
    <div className={className}>
      <Linkify options={linkifyOptions}>
        {content}
      </Linkify>
    </div>
  );
};