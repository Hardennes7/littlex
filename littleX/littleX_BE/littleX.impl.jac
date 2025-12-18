
impl search_tweets {
    transformed = vectorizer.fit_transform([query, tweet]);
    similarity = cosine_similarity(transformed[0], transformed[1])[0];
    return similarity;
}

impl Profile.update {
    self.username = visitor.new_username;
    report self;
}

impl Profile.get {
        follwers=[{"id": jid(i), "username": i.username} for i in [self-->(`?Profile)]];
        report {"user": self, "followers": follwers};
    }

impl Profile.follow{
        current_profile = [root-->(`?Profile)];
        current_profile[0] +>:Follow():+> self;
        report self;
    }

impl Profile.un_follow {
        current_profile = [root-->(`?Profile)];
        follow_edge = [edge current_profile[0] ->:Follow:-> self];
        del follow_edge[0];
        report self;
    }

impl Tweet.update {
        self.content = visitor.updated_content;
        report self;
    }

impl Tweet.delete {
        del self;
        disengage;
    }

impl Tweet.like_tweet {
        current_profile = [root-->(`?Profile)];
        self +>:Like():+> current_profile[0];
        report self;
    }

impl Tweet.remove_like {
        current_profile = [root-->(`?Profile)];
        like_edge = [edge self ->:Like:-> current_profile[0]];
        del like_edge[0];
        report self;
    }

impl Tweet.comment {
        current_profile = [root-->(`?Profile)];
        comment_node = current_profile[0] +>:Post():+> Comment(content=visitor.content);
        grant(comment_node[0], level=ConnectPerm);
        self ++> comment_node[0];
        report comment_node[0];
    }

impl Tweet.get_info {
        return TweetInfo(
            username=[self<-:Post:<-][0].username,
            id=jid(self),
            content=self.content,
            embedding=self.embedding,
            likes=[i.username for i in [self->:Like:->]],
            comments=[{"username": [i<--(`?Profile)][0].username, "id": jid(i), "content": i.content} for i in [self-->(`?Comment)]]
        );
    }

impl Tweet.get {
        tweet_info = self.get_info();
        similarity = search_tweets(visitor.search_query, tweet_info.content);
        visitor.results.append({"Tweet_Info": tweet_info, "similarity": similarity});
    }

impl Comment.update {
        self.content = visitor.updated_content;
        report self;
    }

impl Comment.delete {
        del self;
        disengage;
    }

impl visit_profile.visit_profile {
        visit [-->(`?Profile)] else {
            new_profile = here ++> Profile();
            grant(new_profile[0], level=ConnectPerm);
            visit new_profile;
        }
    }

impl load_user_profiles.load_profiles {
        self.profiles: list = [];

        for each_root in allroots() {
            profile = [each_root --> (`?Profile)][0];
            self.profiles.append(
                {"name": profile.username, "id": jid(profile)}
            );
        }
    }

impl load_user_profiles.report_profiles {
    report self.profiles;
}

impl create_tweet.tweet {
        embedding = vectorizer.fit_transform([self.content]).toarray().tolist();
        tweet_node = here +>:Post():+> Tweet(content=self.content, embedding=embedding);
        grant(tweet_node[0], level=ConnectPerm);
        report tweet_node;
    }

impl load_feed.load {
        visit [-->(`?Tweet)];
        for user_node in [->:Follow:->(`?Profile)] {
            visit [user_node-->(`?Tweet)];
        }
    }

impl load_feed.report_feed {
        self.results.sort(key=lambda x:dict:x['similarity'][0], reverse=True);
        report self.results;
}

# --- Extended feature implementations ---
impl curate_feed {
    # Collaborative filtering + content similarity based curation
    user = [root-->(`?Profile)][0] if [root-->(`?Profile)] else None;
    all_tweets = [t for t in [-->(`?Tweet)]];

    # gather liked tweet embeddings for the user
    liked_embeddings = [];
    if user:
        for liked in [user->:Like:->(`?Tweet)]:
            if liked.embedding:
                liked_embeddings.extend(liked.embedding if isinstance(liked.embedding, list) else [liked.embedding]);

    # score other tweets by similarity to liked embeddings and recency
    scored = [];
    for tw in all_tweets:
        score = 0.0;
        if liked_embeddings and tw.embedding:
            try:
                sim = cosine_similarity(numpy.array(liked_embeddings).mean(axis=0).reshape(1, -1), numpy.array(tw.embedding).reshape(1, -1))[0][0]
                score += float(sim) * 1.0
            except Exception:
                pass
        # boost recent content slightly
        score += 0.01
        scored.append((score, tw))

    scored.sort(key=lambda x: x[0], reverse=True)
    visitor.results = [ {"tweet": jid(t[1]), "score": t[0]} for t in scored[:50] ]
    report visitor.results
}

impl gen_hashtags {
    # Simple TF-IDF based hashtag generation
    try:
        transformed = vectorizer.fit_transform([self.content])
        features = vectorizer.get_feature_names_out()
        scores = transformed.toarray()[0]
        idxs = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:6]
        tags = ["#" + features[i] for i in idxs if scores[i] > 0]
        report tags
    except Exception:
        # fallback: take top words by simple split
        words = [w for w in self.content.lower().split() if len(w) > 3]
        tags = ["#" + w.strip('.,!?:;') for w in words[:5]]
        report tags
}

impl optimize_thread {
    # lightweight thread optimization: sort messages by engagement and return suggestions
    threads = [th for th in [-->(`?Thread)]]
    target = None
    for th in threads:
        if str(jid(th)) == self.thread_id:
            target = th
            break
    if not target:
        report []

    # messages expected as list of dicts: {id, content, likes, comments, created_at}
    msgs = list(target.messages) if hasattr(target, 'messages') else []
    try:
        msgs_sorted = sorted(msgs, key=lambda m: (m.get('likes',0)*1.5 + m.get('comments',0)), reverse=True)
    except Exception:
        msgs_sorted = msgs

    visitor.suggestions = [ {"promote": m.get('id'), "reason": "high engagement"} for m in msgs_sorted[:10] ]
    report visitor.suggestions
}

impl discover_communities {
    # naive community discovery by common topic affinity and group membership
    communities = {}
    for g in [-->(`?InterestGroup)]:
        members = [m for m in [g<-:GroupMember:<-(`?Profile)]]
        if members:
            communities[str(jid(g))] = {"group": g.name, "members": [jid(m) for m in members]}

    # also group by TopicAffinity
    topic_buckets = {}
    for t in [-->(`?Topic)]:
        affiliated = [p for p in [t<-:TopicAffinity:<-(`?Profile)]]
        if affiliated:
            topic_buckets[t.name] = [jid(p) for p in affiliated]

    visitor.groups = {"interest_groups": communities, "topic_buckets": topic_buckets}
    report visitor.groups
}

impl byllm_suggest {
    # Generate content suggestions using a lightweight heuristic. If an llm is available, prefer it.
    try:
        # prefer remote llm if present
        if 'llm' in globals():
            out = llm.chat(context=["You are an assistant that gives short content suggestions. Return a JSON list of 3 short suggestions."], question=self.prompt)
            visitor.suggestions = out
            report visitor.suggestions
    except Exception:
        pass

    # heuristic fallback: split prompt and produce short rewrites
    text = self.prompt
    parts = [p.strip() for p in text.split('.') if p.strip()]
    suggestions = []
    for p in parts[:3]:
        suggestions.append(p[:120] + ("..." if len(p) > 120 else ""))
    visitor.suggestions = suggestions
    report visitor.suggestions
}

impl byllm_start {
    # create a conversation starter
    try:
        if 'llm' in globals():
            out = llm.chat(context=["You are a creative social media assistant. Provide one engaging conversation starter."], question=self.prompt)
            visitor.starter = out
            report visitor.starter
    except Exception:
        pass

    visitor.starter = (self.prompt.split('?')[0] + '?')[:240]
    report visitor.starter
}

impl byllm_summarize {
    # Summarize a thread: collect messages and return a short summary
    target = None
    for th in [-->(`?Thread)]:
        if str(jid(th)) == self.thread_id:
            target = th
            break
    if not target:
        report ""

    texts = [m.get('content','') for m in target.messages] if hasattr(target, 'messages') else []
    combined = ' '.join(texts)
    # very small heuristic summary: first 40 words
    words = combined.split()
    visitor.summary = ' '.join(words[:40]) + ("..." if len(words) > 40 else "")
    report visitor.summary
}

impl predict_viral {
    # Predict virality using simple signals: likes, comments, length, topic trend
    tweet_node = None
    for t in [-->(`?Tweet)]:
        if str(jid(t)) == self.tweet_id:
            tweet_node = t
            break
    if not tweet_node:
        report 0.0

    likes = len([i for i in [tweet_node->:Like:->]])
    comments = len([i for i in [tweet_node-->(`?Comment)]])
    length = len(tweet_node.content) if hasattr(tweet_node, 'content') else 0
    # topic boost: count TopicAffinity edges
    topic_boost = 0.0
    for t in [-->(`?Topic)]:
        if [edge t <-:TopicAffinity:-> tweet_node]:
            topic_boost += float(t.trending_score or 0.0)

    score = float(likes)*0.6 + float(comments)*0.3 + (length/280.0)*0.1 + topic_boost
    visitor.score = score
    report visitor.score
}

impl suggest_post_time {
    # Suggest posting times based on user's historical tweet hours
    user = None
    for p in [-->(`?Profile)]:
        if str(jid(p)) == self.user_id:
            user = p
            break
    if not user:
        report []

    times = []
    for tw in [user-->(`?Tweet)]:
        try:
            dt = datetime.datetime.strptime(tw.created_at, "%Y-%m-%d %H:%M:%S")
            times.append(dt.hour)
        except Exception:
            pass

    if not times:
        visitor.time_suggestions = ["12:00", "18:00"]
        report visitor.time_suggestions

    # return top 3 most common hours as HH:00 strings
    from collections import Counter
    counts = Counter(times)
    top_hours = [h for h,_ in counts.most_common(3)]
    visitor.time_suggestions = [f"{h:02d}:00" for h in top_hours]
    report visitor.time_suggestions
}