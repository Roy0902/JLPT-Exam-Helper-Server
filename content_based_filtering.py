import pygad
import sys
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def content_based_filtering(study_plan, 
                            daily_study_time, 
                            days_to_exam, 
                            vocab_group_sizes, 
                            grammar_group_sizes,
                            item_features):
    
    # Organize vocab_item_features by cluster (item_id)
    cluster_data = {}
    all_words = []
    for item in item_features:
        cluster_id = item["item_id"]
        if cluster_id not in cluster_data:
            cluster_data[cluster_id] = []
        cluster_data[cluster_id].append(item)
        all_words.append((item["word"], cluster_id, item.get("part_of_speech", "None"), item.get("is_common", 0), item["type"]))

    # Separate vocab for vectorization
    vocab_items = [item for item in item_features if item["type"] == "vocab"]
    pos_texts = [item["part_of_speech"] for item in vocab_items]
    vectorizer = TfidfVectorizer(lowercase=True, token_pattern=r"(?u)\b\w+\b")
    pos_vectors = vectorizer.fit_transform(pos_texts).toarray()
    is_common_values = np.array([[item["is_common"]] for item in vocab_items])
    combined_vectors = np.hstack((pos_vectors, is_common_values))
    
    daily_materials = {}
    for day in range(days_to_exam):
        start = day * daily_study_time
        slots = study_plan[start:start + daily_study_time]
        daily_materials[day] = {}
        
        # Get words for this day's clusters
        day_words = [(w, cid, pos, is_common, typ) for w, cid, pos, is_common, typ in all_words if cid in slots and cid != 0]
        if not day_words:
            for slot, cluster_id in enumerate(slots):
                daily_materials[day][slot] = "Rest" if cluster_id == 0 else f"Cluster {cluster_id} (no data)"
            continue
        
        # Vocab processing with similarity
        day_vocab_indices = [i for i, item in enumerate(item_features) if item["type"] == "vocab" and item["item_id"] in slots and item["item_id"] != 0]
        day_vocab_vectors = combined_vectors[[i for i, item in enumerate(vocab_items) if item["item_id"] in slots and item["item_id"] != 0]] if day_vocab_indices else np.array([])
        
        vocab_sorted_indices = []
        if len(day_vocab_vectors) > 0:
            seed_vector = np.mean(day_vocab_vectors, axis=0)
            similarity_scores = cosine_similarity([seed_vector], day_vocab_vectors)[0]
            day_vocab_words = [(i, similarity_scores[i], all_words[day_vocab_indices[i]][3]) for i in range(len(similarity_scores))]
            vocab_sorted = sorted(day_vocab_words, key=lambda x: (x[1], x[2]), reverse=True)
            vocab_sorted_indices = [x[0] for x in vocab_sorted]

        used_words = set()
        for slot, cluster_id in enumerate(slots):
            if cluster_id == 0:
                daily_materials[day][slot] = "Rest"
                continue
            if cluster_id not in cluster_data:
                daily_materials[day][slot] = f"Cluster {cluster_id} (no data)"
                continue
            
            # Determine size based on cluster type
            is_vocab_cluster = cluster_id <= len(vocab_group_sizes)
            size = vocab_group_sizes[cluster_id - 1] if is_vocab_cluster else grammar_group_sizes[cluster_id - len(vocab_group_sizes) - 1]
            
            cluster_words = [(w, cid, pos, is_common, typ) for w, cid, pos, is_common, typ in day_words if cid == cluster_id and w not in used_words]
            if not cluster_words:
                daily_materials[day][slot] = []
                continue
            
            # Handle vocab vs grammar
            if is_vocab_cluster:
                # Vocab: Use similarity + frequency
                cluster_indices = [i for i in vocab_sorted_indices if all_words[day_vocab_indices[i]][1] == cluster_id and all_words[day_vocab_indices[i]][0] not in used_words]
                selected = [all_words[day_vocab_indices[i]] for i in cluster_indices[:size]]
            else:
                # Grammar: Assign directly (no features to sort)
                selected = cluster_words[:size]
            
            for word, _, _, _, _ in selected:
                used_words.add(word)
            daily_materials[day][slot] = [w for w, _, _, _, _ in selected]
    
    return daily_materials


if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())

    study_plan = input_data["studyPlan"]
    daily_study_time = input_data["dailyStudyTime"]
    days_to_exam = input_data["daysToExam"]
    vocab_group_sizes = input_data["vocabGroupSizes"]
    grammar_group_sizes = input_data["grammar_group_sizes"]
    item_features = input_data["itemFeatures"]

    materials = content_based_filtering(study_plan, daily_study_time, days_to_exam, 
                                        vocab_group_sizes, grammar_group_sizes, item_features)
    print(json.dumps(materials))