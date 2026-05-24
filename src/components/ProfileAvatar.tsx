import { getInitials } from '../lib/profilePhoto';

const sizes = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-28 w-28 text-3xl',
  xl: 'h-36 w-36 text-4xl',
  hero: 'h-44 w-44 text-5xl md:h-52 md:w-52',
};

export function ProfileAvatar({
  name,
  photoUrl,
  size = 'md',
  className = '',
}: {
  name: string;
  photoUrl?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const dim = sizes[size];

  return (
    <div
      className={`profile-avatar-ring relative shrink-0 rounded-full bg-gradient-to-br from-candy-400 via-fuchsia-500 to-galaxy-600 p-[3px] shadow-glow ${className}`}
    >
      <div
        className={`flex items-center justify-center overflow-hidden rounded-full bg-galaxy-950 ${dim}`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-bold text-candy-200">{getInitials(name)}</span>
        )}
      </div>
    </div>
  );
}
