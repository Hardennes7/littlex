

# 1. Extended Nodes for Advanced Features
node trending_topic {
    has name: str;
    has volume: int;
}

node interest_group {
    has title: str;
    has domain: str; # e.g., "Tech", "Film"
}

node conversation_thread {
    has topic: str;
    has summary: str;
    has sentiment_score: float;
}

# 2. Advanced Edges for Relationships
edge topic_affinity {
    has score: float;
}

edge group_membership {
    has role: str; # "Member", "Admin"
}

edge conversation_flow {
    has direction: str;
}