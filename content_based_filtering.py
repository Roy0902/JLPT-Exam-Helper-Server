import sys
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def content_based_filtering(daily_study_plan, daily_study_time, days_to_exam, 
                          vocab_group_sizes, grammar_group_sizes, vocab_item_features, 
                          grammar_item_features, group_mapping):
    
    print("Starting content_based_filtering", file=sys.stderr)
    print("Vocab item features sample:", json.dumps(vocab_item_features[:5], indent=2), file=sys.stderr)
    
    try:
        # Preprocess vocab features by subtopic_id
        vocab_cluster_data = {}
        all_vocab_items = []
        for item in vocab_item_features:
            subtopic_id = item["subtopic_id"]
            if subtopic_id not in vocab_cluster_data:
                vocab_cluster_data[subtopic_id] = []
            vocab_cluster_data[subtopic_id].append(item)
            all_vocab_items.append((item["word"], subtopic_id, 
                                   item.get("part_of_speech", "Unknown"),
                                   item.get("is_common", 0),
                                   "vocabulary", item["item_id"]))

        # Preprocess grammar features by subtopic_id
        grammar_cluster_data = {}
        all_grammar_items = []
        for item in grammar_item_features:
            subtopic_id = item["subtopic_id"]
            if subtopic_id not in grammar_cluster_data:
                grammar_cluster_data[subtopic_id] = []
            grammar_cluster_data[subtopic_id].append(item)
            all_grammar_items.append((subtopic_id, item["item_id"]))

        # Vectorize vocab features
        if vocab_item_features:
            pos_texts = [item.get("part_of_speech", "Unknown") for item in vocab_item_features]
            vectorizer = TfidfVectorizer(lowercase=True, token_pattern=r"(?u)\b\w+\b")
            pos_vectors = vectorizer.fit_transform(pos_texts).toarray()
            is_common_values = np.array([[item.get("is_common", 0)] for item in vocab_item_features])
            combined_vectors = np.hstack((pos_vectors, is_common_values))
        else:
            combined_vectors = np.array([])

        used_item_ids = set()
        daily_materials = []

        for plans in daily_study_plan:
            day_items_assigned = []
            mapped_slots = [group_mapping.get(str(p)) if p != 0 else 0 for p in plans]

            day_vocab_items = [(w, sid, pos, is_common, typ, iid) for w, sid, pos, is_common, typ, iid in all_vocab_items 
                              if sid in mapped_slots and sid != 0]
            day_grammar_items = [(sid, iid) for sid, iid in all_grammar_items 
                                if sid in mapped_slots and sid != 0]

            day_vocab_indices = [i for i, item in enumerate(vocab_item_features) 
                                if item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]
            day_vocab_vectors = combined_vectors[[i for i, item in enumerate(vocab_item_features) 
                                                 if item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]] if day_vocab_indices else np.array([])

            vocab_sorted_indices = []
            if len(day_vocab_vectors) > 0:
                seed_vector = day_vocab_vectors[0] if len(day_vocab_vectors) == 1 else np.mean(day_vocab_vectors, axis=0)
                similarity_scores = cosine_similarity([seed_vector], day_vocab_vectors)[0]
                day_vocab_words = [(i, similarity_scores[i], all_vocab_items[day_vocab_indices[i]][3]) 
                                  for i in range(len(similarity_scores))]
                vocab_sorted = sorted(day_vocab_words, key=lambda x: (x[1], x[2]), reverse=True)
                vocab_sorted_indices = [x[0] for x in vocab_sorted]
            else:
                vocab_sorted_indices = [i for i, item in enumerate(vocab_item_features) 
                                       if item["subtopic_id"] in mapped_slots and item["subtopic_id"] != 0]
                vocab_sorted_indices.sort(key=lambda i: vocab_item_features[i].get("is_common", 0), reverse=True)

            for slot_idx, subtopic_id in enumerate(mapped_slots):
                ga_group_id = plans[slot_idx]
                if subtopic_id == 0:
                    continue
                if subtopic_id not in vocab_cluster_data and subtopic_id not in grammar_cluster_data:
                    continue

                is_vocab_cluster = ga_group_id <= len(vocab_group_sizes)
                
                try:
                    size = (vocab_group_sizes[ga_group_id - 1] if is_vocab_cluster 
                            else grammar_group_sizes[ga_group_id - len(vocab_group_sizes) - 1])
                except IndexError:
                    print(f"IndexError: ga_group_id {ga_group_id} out of range for {'vocab' if is_vocab_cluster else 'grammar'} group sizes", file=sys.stderr)
                    continue

                if is_vocab_cluster:
                    cluster_items = [(w, sid, pos, is_common, typ, iid) for w, sid, pos, is_common, typ, iid in day_vocab_items 
                                    if sid == subtopic_id and iid not in used_item_ids]
                    if not cluster_items:
                        continue
                        
                    cluster_indices = [i for i in vocab_sorted_indices 
                                     if all_vocab_items[day_vocab_indices[i]][1] == subtopic_id and 
                                     all_vocab_items[day_vocab_indices[i]][5] not in used_item_ids]
                    if cluster_indices:
                        item_id = all_vocab_items[day_vocab_indices[cluster_indices[0]]][5]
                        used_item_ids.add(item_id)
                        day_items_assigned.append(item_id)
                else:
                    cluster_items = [(sid, iid) for sid, iid in day_grammar_items 
                                    if sid == subtopic_id and iid not in used_item_ids]
                    if not cluster_items:
                        continue
                        
                    item_id = cluster_items[0][1]
                    used_item_ids.add(item_id)
                    day_items_assigned.append(item_id)

            # Only append non-empty day_items_assigned
            if day_items_assigned:  # Check if the list has any item_ids
                daily_materials.append(day_items_assigned)

        print("Generated daily_materials sample:", json.dumps(daily_materials[:2], indent=2), file=sys.stderr)
        return daily_materials
    
    except Exception as e:
        print(f"Error in content_based_filtering: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        print("Input received, keys:", json.dumps(list(input_data.keys()), indent=2), file=sys.stderr)
        materials = content_based_filtering(input_data["dailyStudyPlan"], input_data["dailyStudyTime"], 
                                          input_data["daysToExam"], input_data["vocabGroupSizes"], 
                                          input_data["grammarGroupSizes"], input_data["vocabItemFeatures"], 
                                          input_data["grammarItemFeatures"], input_data["groupMapping"])
        print(json.dumps(materials))
    except Exception as e:
        print(f"Main error: {str(e)}", file=sys.stderr)
        sys.exit(1)