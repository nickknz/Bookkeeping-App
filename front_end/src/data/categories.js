export const CATEGORIES = {
  expense: [
    { id: "food", name: "餐饮", color: "#FA6400", bg: "#FFF3E8" },
    { id: "transport", name: "交通", color: "#3491FA", bg: "#E8F3FF" },
    { id: "shopping", name: "购物", color: "#F54A45", bg: "#FFECE8" },
    { id: "fruit", name: "水果", color: "#36C361", bg: "#E8F8ED" },
    { id: "snack", name: "零食", color: "#FF7D00", bg: "#FFF3E8" },
    { id: "housing", name: "住房", color: "#3491FA", bg: "#E8F3FF" },
    { id: "fun", name: "娱乐", color: "#B37FEB", bg: "#F3EEFF" },
    { id: "med", name: "医疗", color: "#36C361", bg: "#E8F8ED" },
    { id: "edu", name: "教育", color: "#FAAD14", bg: "#FFFBE6" },
    { id: "tel", name: "通讯", color: "#3491FA", bg: "#E8F3FF" },
    { id: "cloth", name: "服饰", color: "#EB2F96", bg: "#FFF0F6" },
    { id: "beauty", name: "美容", color: "#EB2F96", bg: "#FFF0F6" },
    { id: "social", name: "人情", color: "#FA6400", bg: "#FFF3E8" },
    { id: "travel", name: "旅行", color: "#13C2C2", bg: "#E6FFFB" },
    { id: "other", name: "其他", color: "#8C8C8C", bg: "#F5F5F5" },
  ],
  income: [
    { id: "salary", name: "工资", color: "#36C361", bg: "#E8F8ED" },
    { id: "bonus", name: "奖金", color: "#FAAD14", bg: "#FFFBE6" },
    { id: "invest", name: "理财", color: "#3491FA", bg: "#E8F3FF" },
    { id: "part", name: "兼职", color: "#B37FEB", bg: "#F3EEFF" },
    { id: "red", name: "红包", color: "#F54A45", bg: "#FFECE8" },
    { id: "refund", name: "退款", color: "#13C2C2", bg: "#E6FFFB" },
    { id: "otherin", name: "其他", color: "#8C8C8C", bg: "#F5F5F5" },
  ],
};

const ALL_CATEGORIES = [...CATEGORIES.expense, ...CATEGORIES.income];

export function getCategoryById(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) || { name: "未知", color: "#8C8C8C", bg: "#F5F5F5" };
}
