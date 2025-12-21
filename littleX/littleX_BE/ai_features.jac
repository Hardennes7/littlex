// AI-enhanced graph primitives and walkers for littleX

node Topic {
    has name;
    has trending_score = 0.0;
}

node InterestGroup {
    has name;
    has description = "";
}

node Thread {
    has title = "";
    has messages = [];
}

node EngagementPattern {
    has pattern_type = "";
    has weight = 0.0;
}

edge TopicAffinity {
}

edge GroupMember {
}

edge ConversationFlow {
}

// walker: attach topic affinity to a profile or tweet
walker attach_topic_affinity {
    has node_id, topic_name, score = 1.0;

    root {
        found_topic = [-->(`?Topic) where name == topic_name];
        if not found_topic {
            t = here +>:Topic():+> Topic(name=topic_name, trending_score=score);
            grant(t[0], level=ConnectPerm);
            found_topic = [t[0]];
        }

        // attach affinity edge from provided node (Profile or Tweet) to Topic
        target = node_id;
        // allow passing a numeric jid or a direct node
        if isinstance(target, str) {
            // try match by jid string
            try_target = [-->(`?Profile) where str(jid(_)) == target];
            if try_target {
                target_node = try_target[0];
            } else {
                try_target2 = [-->(`?Tweet) where str(jid(_)) == target];
                target_node = try_target2[0] if try_target2 else None;
            }
        } else {
            target_node = target;
        }

        if target_node and found_topic {
            target_node +>:TopicAffinity():+> found_topic[0];
            // bump topic trending score
            found_topic[0].trending_score = float(found_topic[0].trending_score) + float(score);
        }

    }

    report {"status": "attached"};
}

// walker: create or join an interest group
walker join_interest_group {
    has profile_jid, group_name;

    root {
        g = [-->(`?InterestGroup) where name == group_name];
        if not g {
            g = here +>:InterestGroup():+> InterestGroup(name=group_name, description="Generated group");
            grant(g[0], level=ConnectPerm);
        }

        p = [-->(`?Profile) where str(jid(_)) == profile_jid];
        if p {
            p[0] +>:GroupMember():+> g[0];
        }
    }

    report {"status": "joined", "group": group_name};
}

// walker: update trending scores periodically (simple aggregator)
walker update_topic_trends {
    has decay = 0.9;

    root {
        for t in [-->(`?Topic)] {
            // decay previous score
            t.trending_score = float(t.trending_score) * float(decay);
            // add small boost for recent mentions (count TopicAffinity edges)
            count_aff = len([edge t <-:TopicAffinity:->]);
            t.trending_score = float(t.trending_score) + float(count_aff) * 0.1;
        }
    }

    report {"status": "updated"};
}

// walker: report top N trending topics
walker get_trending_topics {
    has top = 10;

    root {
        topics = [t for t in [-->(`?Topic)]];
        topics.sort(key=lambda x: float(x.trending_score or 0.0), reverse=True);
        out = [];
        for t in topics[:top] {
            out.append({"id": jid(t), "name": t.name, "score": float(t.trending_score or 0.0)});
        }
    }

    report {"trending": out};
}
