export interface ForbiddenWord {
  word: string;
  level: "high" | "medium" | "low";
  category: string;
  suggestion?: string;
}

export interface WordCategory {
  name: string;
  icon: string;
  words: ForbiddenWord[];
}

export const forbiddenWordsData: WordCategory[] = [
  {
    name: "极限用语",
    icon: "🔴",
    words: [
      { word: "最好", level: "high", category: "极限用语", suggestion: "很好/优质" },
      { word: "最低价", level: "high", category: "极限用语", suggestion: "超值价/优惠价" },
      { word: "最便宜", level: "high", category: "极限用语", suggestion: "性价比高" },
      { word: "最优", level: "high", category: "极限用语", suggestion: "优质/出色" },
      { word: "最佳", level: "high", category: "极限用语", suggestion: "出色/推荐" },
      { word: "最新", level: "medium", category: "极限用语", suggestion: "新款/近期" },
      { word: "最高", level: "high", category: "极限用语", suggestion: "很高/较高" },
      { word: "最大", level: "high", category: "极限用语", suggestion: "较大/大号" },
      { word: "最小", level: "high", category: "极限用语", suggestion: "较小/小号" },
      { word: "第一", level: "high", category: "极限用语", suggestion: "领先/前列" },
      { word: "唯一", level: "high", category: "极限用语", suggestion: "稀有/少见" },
      { word: "顶级", level: "high", category: "极限用语", suggestion: "高端/优质" },
      { word: "极致", level: "medium", category: "极限用语", suggestion: "精致/用心" },
      { word: "绝无仅有", level: "high", category: "极限用语", suggestion: "少见/难得" },
      { word: "史无前例", level: "high", category: "极限用语", suggestion: "难得一见" },
      { word: "万能", level: "high", category: "极限用语", suggestion: "多功能/实用" },
      { word: "全网最低", level: "high", category: "极限用语", suggestion: "超值优惠" },
      { word: "销量第一", level: "high", category: "极限用语", suggestion: "热销/畅销" },
      { word: "独一无二", level: "medium", category: "极限用语", suggestion: "独特/个性" },
      { word: "无与伦比", level: "medium", category: "极限用语", suggestion: "出众/出色" },
    ],
  },
  {
    name: "虚假宣传",
    icon: "🟡",
    words: [
      { word: "100%", level: "high", category: "虚假宣传", suggestion: "建议删除" },
      { word: "永久", level: "high", category: "虚假宣传", suggestion: "长期/持久" },
      { word: "保证", level: "medium", category: "虚假宣传", suggestion: "尽力/努力" },
      { word: "假一赔十", level: "high", category: "虚假宣传", suggestion: "正品保障" },
      { word: "假一赔百", level: "high", category: "虚假宣传", suggestion: "正品保障" },
      { word: "零风险", level: "high", category: "虚假宣传", suggestion: "低风险" },
      { word: "无效退款", level: "medium", category: "虚假宣传", suggestion: "支持退换" },
      { word: "包治", level: "high", category: "虚假宣传", suggestion: "建议删除" },
      { word: "根治", level: "high", category: "虚假宣传", suggestion: "建议删除" },
      { word: "秒杀", level: "medium", category: "虚假宣传", suggestion: "特惠/优惠" },
      { word: "抢购", level: "low", category: "虚假宣传", suggestion: "可保留" },
      { word: "限时", level: "low", category: "虚假宣传", suggestion: "可保留" },
      { word: "清仓", level: "low", category: "虚假宣传", suggestion: "可保留" },
      { word: "亏本卖", level: "medium", category: "虚假宣传", suggestion: "超值/让利" },
      { word: "跳楼价", level: "medium", category: "虚假宣传", suggestion: "特惠价" },
      { word: "全新未拆", level: "low", category: "虚假宣传", suggestion: "如实描述" },
    ],
  },
  {
    name: "权威背书",
    icon: "🟠",
    words: [
      { word: "国家级", level: "high", category: "权威背书", suggestion: "建议删除" },
      { word: "央视", level: "high", category: "权威背书", suggestion: "建议删除" },
      { word: "CCTV", level: "high", category: "权威背书", suggestion: "建议删除" },
      { word: "专家推荐", level: "high", category: "权威背书", suggestion: "好评推荐" },
      { word: "明星同款", level: "medium", category: "权威背书", suggestion: "网红同款/热门款" },
      { word: "驰名商标", level: "high", category: "权威背书", suggestion: "知名品牌" },
      { word: "国家认证", level: "high", category: "权威背书", suggestion: "品质认证" },
      { word: "质检合格", level: "low", category: "权威背书", suggestion: "可保留(需有证明)" },
      { word: "获奖", level: "medium", category: "权威背书", suggestion: "需提供证明" },
      { word: "特供", level: "high", category: "权威背书", suggestion: "建议删除" },
      { word: "军用", level: "high", category: "权威背书", suggestion: "建议删除" },
      { word: "政府", level: "high", category: "权威背书", suggestion: "建议删除" },
    ],
  },
  {
    name: "平台禁用",
    icon: "🔵",
    words: [
      { word: "微信", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "wx", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "加我", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "淘宝", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "拼多多", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "京东", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "抖音", level: "medium", category: "平台禁用", suggestion: "建议删除" },
      { word: "小红书", level: "medium", category: "平台禁用", suggestion: "建议删除" },
      { word: "QQ", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "电话", level: "medium", category: "平台禁用", suggestion: "建议删除" },
      { word: "私聊", level: "medium", category: "平台禁用", suggestion: "闲鱼聊" },
      { word: "站外交易", level: "high", category: "平台禁用", suggestion: "建议删除" },
      { word: "线下交易", level: "medium", category: "平台禁用", suggestion: "当面验货" },
    ],
  },
  {
    name: "敏感词汇",
    icon: "⚫",
    words: [
      { word: "高仿", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "A货", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "仿品", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "复刻", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "1:1", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "原单", level: "medium", category: "敏感词汇", suggestion: "慎用" },
      { word: "尾单", level: "medium", category: "敏感词汇", suggestion: "慎用" },
      { word: "刷单", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "代购", level: "low", category: "敏感词汇", suggestion: "海淘/自用" },
      { word: "水货", level: "medium", category: "敏感词汇", suggestion: "非国行" },
      { word: "翻新", level: "medium", category: "敏感词汇", suggestion: "官方翻新(需证明)" },
      { word: "破解", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "盗版", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "走私", level: "high", category: "敏感词汇", suggestion: "建议删除" },
      { word: "免税", level: "medium", category: "敏感词汇", suggestion: "慎用" },
    ],
  },
];

export function getAllWords(): ForbiddenWord[] {
  return forbiddenWordsData.flatMap((cat) => cat.words);
}
