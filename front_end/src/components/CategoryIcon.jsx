import {
  Utensils, Bus, ShoppingBag, Apple, Cookie,
  Home, Gamepad2, Stethoscope, BookOpen, Smartphone,
  Shirt, Sparkles, Users, Plane, MoreHorizontal,
  Banknote, Trophy, TrendingUp, Briefcase, Gift, RefreshCw,
} from 'lucide-react';

const iconMap = {
  food: Utensils,
  transport: Bus,
  shopping: ShoppingBag,
  fruit: Apple,
  snack: Cookie,
  housing: Home,
  fun: Gamepad2,
  med: Stethoscope,
  edu: BookOpen,
  tel: Smartphone,
  cloth: Shirt,
  beauty: Sparkles,
  social: Users,
  travel: Plane,
  other: MoreHorizontal,
  salary: Banknote,
  bonus: Trophy,
  invest: TrendingUp,
  part: Briefcase,
  red: Gift,
  refund: RefreshCw,
  otherin: MoreHorizontal,
};

export default function CategoryIcon({ id, color = 'currentColor' }) {
  const Icon = iconMap[id] ?? MoreHorizontal;
  return <Icon size={20} strokeWidth={1.8} color={color} />;
}
