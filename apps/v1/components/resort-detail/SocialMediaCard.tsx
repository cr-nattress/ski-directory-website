import { Resort } from '@/lib/types';
import { Facebook, Instagram, Youtube, Music, Twitter } from 'lucide-react';

interface SocialMediaCardProps {
  resort: Resort;
}

export function SocialMediaCard({ resort }: SocialMediaCardProps) {
  const { socialMedia } = resort;

  // Don't render the card if there are no social media links
  if (!socialMedia || Object.values(socialMedia).every((link) => !link)) {
    return null;
  }

  const socialLinks = [
    {
      name: 'Facebook',
      url: socialMedia.facebook,
      icon: Facebook,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Instagram',
      url: socialMedia.instagram,
      icon: Instagram,
      color: 'hover:text-pink-600',
    },
    {
      name: 'YouTube',
      url: socialMedia.youtube,
      icon: Youtube,
      color: 'hover:text-red-600',
    },
    {
      name: 'TikTok',
      url: socialMedia.tiktok,
      icon: Music,
      color: 'hover:text-black',
    },
    {
      name: 'X',
      url: socialMedia.x,
      icon: Twitter,
      color: 'hover:text-gray-900',
    },
  ];

  // Filter out links that don't exist
  const availableLinks = socialLinks.filter((link) => link.url);

  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Follow {resort.name}</h3>
      <div className="grid grid-cols-5 gap-3">
        {availableLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 transition-all ${link.color} hover:bg-gray-100`}
              aria-label={`Follow on ${link.name}`}
              title={`Follow on ${link.name}`}
            >
              <Icon className="w-6 h-6" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
