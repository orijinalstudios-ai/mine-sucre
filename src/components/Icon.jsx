import React from 'react';
import {
  BookOpen,
  Settings,
  Heart,
  Play,
  Pause,
  Sparkles,
  PlusCircle,
  Plus,
  Lock,
  LockOpen,
  Hourglass,
  FilePenLine,
  Scroll,
  X,
  Search,
  Trash2,
  Calendar,
  MapPin,
  Camera,
  ImagePlus,
  Images,
  Mic,
  Music,
  Volume2,
  Tag,
  ArrowLeft,
  Mail,
  Printer,
  Download,
  SlidersHorizontal,
  Clock,
  Smartphone,
  Laptop,
  Check,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  Link,
  Feather,
  Compass,
} from 'lucide-react';

const iconMap = {
  // Navigation & Core
  'menu_book': BookOpen,
  'settings': Settings,
  'favorite': Heart,
  'auto_stories': BookOpen,
  'compass': Compass,
  'add_circle': PlusCircle,
  'plus': Plus,
  'lock': Lock,
  'lock_open': LockOpen,
  'hourglass_top': Hourglass,

  // Media & Actions
  'play_arrow': Play,
  'pause': Pause,
  'edit_note': FilePenLine,
  'stylus_note': Feather,
  'history_edu': Scroll,
  'close': X,
  'search': Search,
  'delete': Trash2,
  'calendar_today': Calendar,
  'location_on': MapPin,
  'photo_camera': Camera,
  'add_photo_alternate': ImagePlus,
  'photo_library': Images,
  'mic': Mic,
  'music_note': Music,
  'volume_up': Volume2,
  'label': Tag,
  'arrow_back': ArrowLeft,
  'drafts': Mail,
  'print': Printer,
  'download': Download,
  'tune': SlidersHorizontal,
  'lock_clock': Clock,
  'auto_awesome': Sparkles,
  'smartphone': Smartphone,
  'laptop': Laptop,
  'check': Check,
  'eye': Eye,
  'eye_off': EyeOff,
  'sparkles': Sparkles,
  'cloud_sync': Cloud,
  'sync': RefreshCw,
  'link': Link,
};

const fillableIcons = new Set(['favorite', 'heart', 'play_arrow', 'play']);

export default function Icon({
  name,
  className = '',
  size = 18,
  filled = false,
  strokeWidth = 2,
  style,
  ...props
}) {
  const IconComponent = iconMap[name] || Sparkles;

  const isFillApplicable = (filled || className.includes('filled')) && fillableIcons.has(name);

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`inline-block shrink-0 align-middle transition-colors ${className}`}
      fill={isFillApplicable ? 'currentColor' : 'none'}
      style={style}
      {...props}
    />
  );
}
