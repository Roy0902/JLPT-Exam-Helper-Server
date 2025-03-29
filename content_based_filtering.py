import sys
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def content_based_filtering(daily_study_plan, daily_study_time, days_to_exam, 
                            vocab_group_sizes, grammar_group_sizes, item_features, group_mapping):
    # Preprocess item features by subtopic_id
    cluster_data = {}
    all_items = []
    for item in item_features:
        subtopic_id = item["subtopic_id"]
        if subtopic_id not in cluster_data:
            cluster_data[subtopic_id] = []
        cluster_data[subtopic_id].append(item)
        all_items.append((item["word"], subtopic_id, item.get("part_of_speech", "None"), 
                         item.get("is_common", 0), item["type"], item["item_id"]))

    print(f"Available subtopics in item_features: {list(cluster_data.keys())}", file=sys.stderr)

    # Vectorize vocab features
    vocab_items = [item for item in item_features if item["type"] == "vocabulary"]
    if vocab_items:
        pos_texts = [item["part_of_speech"] for item in vocab_items]
        vectorizer = TfidfVectorizer(lowercase=True, token_pattern=r"(?u)\b\w+\b")
        pos_vectors = vectorizer.fit_transform(pos_texts).toarray()
        is_common_values = np.array([[item["is_common"]] for item in vocab_items])
        combined_vectors = np.hstack((pos_vectors, is_common_values))
    else:
        combined_vectors = np.array([])

    used_words = set()
    daily_materials = []

    for plans in daily_study_plan:
        day_items_assigned = []  # List to store item_ids for this day
        # Map GA group IDs to subtopic_id
        mapped_slots = [group_mapping.get(str(p)) if p != 0 else 0 for p in plans]

        # Filter items based on mapped subtopics
        day_items = [(w, sid, pos, is_common, typ, iid) for w, sid, pos, is_common, typ, iid in all_items 
                     if sid in mapped_slots and sid != 0]

        # Prepare vocab vectors
        day_vocab_indices = [i for i, item in enumerate(item_features) 
                            if item["type"] == "vocabulary" and item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]
        day_vocab_vectors = combined_vectors[[i for i, item in enumerate(vocab_items) 
                                             if item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]] if day_vocab_indices else np.array([])

        vocab_sorted_indices = []
        if len(day_vocab_vectors) > 0:
            seed_vector = day_vocab_vectors[0] if len(day_vocab_vectors) == 1 else np.mean(day_vocab_vectors, axis=0)
            similarity_scores = cosine_similarity([seed_vector], day_vocab_vectors)[0]
            day_vocab_words = [(i, similarity_scores[i], all_items[day_vocab_indices[i]][3]) 
                              for i in range(len(similarity_scores))]
            vocab_sorted = sorted(day_vocab_words, key=lambda x: (x[1], x[2]), reverse=True)
            vocab_sorted_indices = [x[0] for x in vocab_sorted]
        else:
            vocab_sorted_indices = [i for i, item in enumerate(vocab_items) 
                                   if item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]
            vocab_sorted_indices.sort(key=lambda i: vocab_items[i]["is_common"], reverse=True)

        # Iterate over mapped_slots
        for slot_idx, subtopic_id in enumerate(mapped_slots):
            ga_group_id = plans[slot_idx]
            if subtopic_id == 0:  # Skip rest slots
                continue
            if subtopic_id not in cluster_data:
                print(f"Subtopic {subtopic_id} (GA group {ga_group_id}) not found in item_features", file=sys.stderr)
                continue

            # Determine group size using original GA group ID (for validation, not size enforcement)
            is_vocab_cluster = ga_group_id <= len(vocab_group_sizes)
            try:
                size = (vocab_group_sizes[ga_group_id - 1] if is_vocab_cluster 
                        else grammar_group_sizes[ga_group_id - len(vocab_group_sizes) - 1])
            except IndexError:
                print(f"Error: GA group ID {ga_group_id} exceeds group sizes (vocab: {len(vocab_group_sizes)}, grammar: {len(grammar_group_sizes)})", file=sys.stderr)
                continue

            # Select available items
            cluster_items = [(w, sid, pos, is_common, typ, iid) for w, sid, pos, is_common, typ, iid in day_items 
                            if sid == subtopic_id and w not in used_words]
            if not cluster_items:  # Skip if no items available
                continue

            # Assign exactly 1 item
            if is_vocab_cluster:
                cluster_indices = [i for i in vocab_sorted_indices 
                                  if all_items[day_vocab_indices[i]][1] == subtopic_id and 
                                  all_items[day_vocab_indices[i]][0] not in used_words]
                selected = [all_items[day_vocab_indices[cluster_indices[0]]]] if cluster_indices else []
            else:
                selected = [sorted(cluster_items, key=lambda x: x[3], reverse=True)[0]]

            if selected:
                item_id = selected[0][5]  # Single item_id
                used_words.add(selected[0][0])
                day_items_assigned.append(item_id)  # Add to day's list

        daily_materials.append(day_items_assigned)

    return daily_materials

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    materials = content_based_filtering(input_data["dailyStudyPlan"], input_data["dailyStudyTime"], 
                                        input_data["daysToExam"], input_data["vocabGroupSizes"], 
                                        input_data["grammarGroupSizes"], input_data["itemFeatures"], 
                                        input_data["groupMapping"])
    print(json.dumps(materials))