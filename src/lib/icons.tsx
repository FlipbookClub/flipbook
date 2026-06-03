// Icon shim — maps the icon names the app uses (originally Lucide) onto the
// Hugeicons free set, rendered via @hugeicons/react-native (react-native-svg
// under the hood, already a dependency). Call sites keep importing the same
// names with the same `{ size, color }` API; only the import path changed from
// "lucide-react-native" to "@/lib/icons". To re-skin an icon, swap the glyph in
// the map below — nothing else changes.
import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BookmarkCheck01Icon,
  BookOpen01Icon,
  BookPlusIcon,
  BubbleChatIcon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  CircleDashedIcon,
  CloudOffIcon,
  Compass01Icon,
  CreditCardIcon,
  Delete02Icon,
  Home01Icon,
  ImageAdd01Icon,
  InboxIcon,
  Leaf01Icon,
  LibrariesIcon,
  LinkSquare02Icon,
  Logout03Icon,
  Message01Icon,
  Moon02Icon,
  Notification03Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Rocket01Icon,
  Search01Icon,
  Settings01Icon,
  Settings02Icon,
  Share08Icon,
  SmileIcon,
  SparklesIcon,
  SquareLock02Icon,
  Sun03Icon,
  Tick02Icon,
  Upload01Icon,
  User03Icon,
  UserGroup02Icon,
  UserGroupIcon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";

// Matches the subset of the Lucide prop API the app actually uses.
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

function make(icon: IconSvgElement): ComponentType<IconProps> {
  function Icon({ size = 24, color = "#000000", strokeWidth, style }: IconProps) {
    return (
      <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={strokeWidth} style={style} />
    );
  }
  return Icon;
}

export const Bell = make(Notification03Icon);
export const BookOpen = make(BookOpen01Icon);
export const BookPlus = make(BookPlusIcon);
export const BookmarkCheck = make(BookmarkCheck01Icon);
export const Check = make(Tick02Icon);
export const CheckCircle2 = make(CheckmarkCircle02Icon);
export const ChevronLeft = make(ArrowLeft01Icon);
export const ChevronRight = make(ArrowRight01Icon);
export const CircleDashed = make(CircleDashedIcon);
export const CloudOff = make(CloudOffIcon);
export const Compass = make(Compass01Icon);
export const CreditCard = make(CreditCardIcon);
export const ExternalLink = make(LinkSquare02Icon);
export const Eye = make(ViewIcon);
export const EyeOff = make(ViewOffSlashIcon);
export const ImagePlus = make(ImageAdd01Icon);
export const Inbox = make(InboxIcon);
export const Leaf = make(Leaf01Icon);
export const Lock = make(SquareLock02Icon);
export const LogOut = make(Logout03Icon);
export const MessageCircle = make(BubbleChatIcon);
export const MessageSquare = make(Message01Icon);
export const Moon = make(Moon02Icon);
export const MoreVertical = make(MoreVerticalIcon);
export const Pencil = make(PencilEdit01Icon);
export const Plus = make(PlusSignIcon);
export const Rocket = make(Rocket01Icon);
export const Search = make(Search01Icon);
export const Settings = make(Settings01Icon);
export const Settings2 = make(Settings02Icon);
export const Share2 = make(Share08Icon);
export const ShieldCheck = make(CheckmarkBadge01Icon);
export const Smile = make(SmileIcon);
export const Sparkles = make(SparklesIcon);
export const Sun = make(Sun03Icon);
export const Trash2 = make(Delete02Icon);
export const Upload = make(Upload01Icon);
export const User = make(UserIcon);
export const Users = make(UserGroupIcon);
export const X = make(Cancel01Icon);

// App-specific glyphs (not Lucide names) — chosen per founder direction for the
// nav tabs and community actions.
export const Home = make(Home01Icon); // Community tab
export const Libraries = make(LibrariesIcon); // Library tab
export const UserProfile = make(User03Icon); // Profile tab
export const UserGroup2 = make(UserGroup02Icon); // Join community
