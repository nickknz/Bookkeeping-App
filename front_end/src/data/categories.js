const CATEGORY_VISUALS = {
  food: { color: "#FA6400", bg: "#FFF3E8" },
  transport: { color: "#3491FA", bg: "#E8F3FF" },
  shopping: { color: "#F54A45", bg: "#FFECE8" },
  fruit: { color: "#36C361", bg: "#E8F8ED" },
  snack: { color: "#FF7D00", bg: "#FFF3E8" },
  housing: { color: "#3491FA", bg: "#E8F3FF" },
  fun: { color: "#B37FEB", bg: "#F3EEFF" },
  med: { color: "#36C361", bg: "#E8F8ED" },
  edu: { color: "#FAAD14", bg: "#FFFBE6" },
  tel: { color: "#3491FA", bg: "#E8F3FF" },
  cloth: { color: "#EB2F96", bg: "#FFF0F6" },
  beauty: { color: "#EB2F96", bg: "#FFF0F6" },
  social: { color: "#FA6400", bg: "#FFF3E8" },
  travel: { color: "#13C2C2", bg: "#E6FFFB" },
  salary: { color: "#36C361", bg: "#E8F8ED" },
  bonus: { color: "#FAAD14", bg: "#FFFBE6" },
  invest: { color: "#3491FA", bg: "#E8F3FF" },
  part: { color: "#B37FEB", bg: "#F3EEFF" },
  red: { color: "#F54A45", bg: "#FFECE8" },
  refund: { color: "#13C2C2", bg: "#E6FFFB" },
  other: { color: "#8C8C8C", bg: "#F5F5F5" },
  otherin: { color: "#8C8C8C", bg: "#F5F5F5" },
};

const FALLBACK_VISUAL = CATEGORY_VISUALS.other;

export function getCategoryVisual(icon) {
  return CATEGORY_VISUALS[icon] || FALLBACK_VISUAL;
}

export function withCategoryVisual(category) {
  if (!category) {
    return { id: null, code: "other", icon: "other", name: "未知", type: "expense", ...FALLBACK_VISUAL };
  }
  return { ...category, ...getCategoryVisual(category.icon || category.code) };
}

export function getCategoryByIcon(icon) {
  return { icon: icon || "other", name: "未知", ...getCategoryVisual(icon) };
}
