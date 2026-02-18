"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { addToCollection, store } from "@/lib/store";

interface Post {
  id?: string;
  createdAt?: number;
  title: string;
  content: string;
  category: string;
  likes: number;
  likedByMe: boolean;
}

const CATEGORIES = ["经验分享", "踩坑记录", "求助提问", "爆料吐槽", "成交喜报"];

const SEED_POSTS: Post[] = [
  {
    id: "seed-1",
    createdAt: Date.now() - 86400000 * 2,
    title: "分享我做闲鱼 3 个月的心得",
    content: "刚开始什么都不会，商品挂了2周零成交。后来认真研究了标题写法，第一周改完立竿见影，浏览量翻了3倍。最关键的是——别怕亏，前10单哪怕让利也要换好评，信誉起来后价格可以慢慢往上提。",
    category: "经验分享",
    likes: 42,
    likedByMe: false,
  },
  {
    id: "seed-2",
    createdAt: Date.now() - 86400000,
    title: "踩坑：千万别在标题里写「最」字",
    content: "今天才知道「最便宜」「最好」这类最高级词会被系统降权。我之前一直用「全网最低价」，难怪曝光一直上不去。改掉之后同一个商品浏览量多了一倍……损失了好多天流量。大家注意啊！",
    category: "踩坑记录",
    likes: 28,
    likedByMe: false,
  },
  {
    id: "seed-3",
    createdAt: Date.now() - 3600000 * 5,
    title: "今天成交了一单 3800 的相机，开心！",
    content: "挂了快一个月，期间被各种砍价。坚持没降价，因为成色真的很好。最后来了个识货的买家，直接问「能优惠50吗」，我说「可以，就这一件」，当场成交。有时候等等是对的！",
    category: "成交喜报",
    likes: 65,
    likedByMe: false,
  },
  {
    id: "seed-4",
    createdAt: Date.now() - 3600000 * 2,
    title: "有没有人知道怎么处理恶意买家？",
    content: "买家收货后说商品有问题要退货，但拍的照片明显是他自己弄坏的。卖了这么多东西第一次遇到这种情况，平台客服怎么联系？有没有维权成功的前辈给指个路",
    category: "求助提问",
    likes: 11,
    likedByMe: false,
  },
];

export default function UserSharingPage() {
  const [tab, setTab] = useState<"feed" | "post">("feed");
  const [category, setCategory] = useState("全部");

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = store.get<Post[]>("us_posts", []);
    // Merge seed posts with saved (seed posts shown if no saved posts yet, or always)
    const seedIds = SEED_POSTS.map((p) => p.id);
    const userPosts = saved.filter((p) => !seedIds.includes(p.id));
    return [...userPosts, ...SEED_POSTS].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
  });

  const [likedPosts, setLikedPosts] = useState<string[]>(() =>
    store.get<string[]>("us_liked", [])
  );

  // Post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("经验分享");

  const handlePost = () => {
    if (!newTitle.trim()) { showToast("请填写标题", "warning"); return; }
    if (!newContent.trim()) { showToast("请填写内容", "warning"); return; }

    addToCollection<Post>("us_posts", {
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      likes: 0,
      likedByMe: false,
    }, 50);

    const saved = store.get<Post[]>("us_posts", []);
    const seedIds = SEED_POSTS.map((p) => p.id);
    const userPosts = saved.filter((p) => !seedIds.includes(p.id));
    setPosts([...userPosts, ...SEED_POSTS].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)));

    setNewTitle(""); setNewContent(""); setNewCategory("经验分享");
    setTab("feed");
    showToast("已发布！", "success");
  };

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.includes(postId);
    const nextLiked = isLiked
      ? likedPosts.filter((id) => id !== postId)
      : [...likedPosts, postId];
    store.set("us_liked", nextLiked);
    setLikedPosts(nextLiked);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const allCategories = ["全部", ...CATEGORIES];

  const filtered = category === "全部"
    ? posts
    : posts.filter((p) => p.category === category);

  const CATEGORY_COLORS: Record<string, string> = {
    "经验分享": "text-lime-400 bg-lime-500/15",
    "踩坑记录": "text-orange-400 bg-orange-500/15",
    "求助提问": "text-blue-400 bg-blue-500/15",
    "爆料吐槽": "text-red-400 bg-red-500/15",
    "成交喜报": "text-yellow-400 bg-yellow-500/15",
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  };

  return (
    <div>
      <PageHeader
        title="用户分享"
        subtitle={`${posts.length} 条社区内容`}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Tabs */}
        <div className="flex rounded-xl bg-card p-1">
          {(["feed", "post"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all touch-feedback ${
                tab === t ? "bg-lime-500 text-white" : "text-muted"
              }`}
            >
              {t === "feed" ? "💬 社区动态" : "✍️ 发布分享"}
            </button>
          ))}
        </div>

        {/* Feed tab */}
        {tab === "feed" && (
          <>
            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {allCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all touch-feedback ${
                    category === c
                      ? "bg-lime-500 text-white"
                      : "border border-border text-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-4xl">💬</span>
                <p className="mt-3 text-sm font-medium">该分类暂无内容</p>
                <p className="mt-1 text-xs text-muted">成为第一个分享的人吧</p>
                <button
                  onClick={() => setTab("post")}
                  className="mt-4 rounded-xl bg-lime-500 px-6 py-2.5 text-sm font-semibold text-white touch-feedback"
                >
                  发布分享
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((post) => (
                  <div key={post.id} className="rounded-xl bg-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[post.category] ?? "text-muted bg-muted/10"}`}>
                        {post.category}
                      </span>
                      <span className="text-[10px] text-muted/60 ml-auto">
                        {timeAgo(post.createdAt ?? 0)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{post.title}</p>
                    <p className="mt-1.5 text-xs text-muted leading-relaxed">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id!)}
                        className={`flex items-center gap-1.5 text-xs touch-feedback ${
                          likedPosts.includes(post.id!) ? "text-red-400" : "text-muted"
                        }`}
                      >
                        <span>{likedPosts.includes(post.id!) ? "❤️" : "🤍"}</span>
                        <span>{post.likes + (likedPosts.includes(post.id!) && !post.likedByMe ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Post tab */}
        {tab === "post" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">发布内容</p>

              {/* Category */}
              <div>
                <p className="mb-1.5 text-xs text-muted">选择分类</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewCategory(c)}
                      className={`rounded-full px-3 py-1 text-xs transition-all touch-feedback ${
                        newCategory === c
                          ? "bg-lime-500 text-white"
                          : "border border-border text-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="标题（简短有力）"
                maxLength={40}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="分享你的经验、踩坑、喜报或问题..."
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
              <p className="text-right text-xs text-muted">{newContent.length}/500</p>
            </div>

            <button
              onClick={handlePost}
              className="w-full rounded-xl bg-lime-500 py-3.5 text-sm font-semibold text-white touch-feedback"
            >
              🚀 发布分享
            </button>

            <p className="text-center text-xs text-muted/60">
              请遵守社区规范，分享真实经验，共建友好氛围
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
