import sys
import json
import numpy as np
from collections import defaultdict

def cosine_similarity(vec_a, vec_b):
    dot_product = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    return dot_product / (norm_a * norm_b) if norm_a * norm_b != 0 else 0

def parse_args(args):    
    plan_snippet = json.loads(args[1])  
    item_features = json.loads(args[2]) 
    return plan_snippet, item_features

# Content-based filtering function
def content_based_filtering(plan_snippet, item_features):

    items_by_subtopic = {}
    for item in item_features:
        subtopic_id = item['subtopic_id']
        category = item['category_name']
        subtopic_dict = items_by_subtopic.setdefault(subtopic_id, {})
        category_list = subtopic_dict.setdefault(category, [])
        category_list.append({
            'item_id': item['item_id'],
            'difficulty': item['difficulty']
        })

    # Map plan slots to specific items
    study_plan = []
    used_items = set()  
    subtopic_indices = {}  

    for slot in plan_snippet:
        if slot == 0:
            refined_plan.append(None)  
            continue

        # Determine if it's vocab or grammar based on slot value
        vocab_count = sum(1 for item in item_features 
                            if item['category_name'] == 'Vocabulary') // len(set(item['subtopic_id'] 
                            for item in item_features if item['category_name'] == 'Vocabulary'))
        is_vocab = slot <= vocab_count
        subtopic_idx = (slot - 1) if is_vocab else (slot - vocab_count - 1)
        
        # Get subtopic_id from item_features (assuming order matches GA input)
        subtopic_ids = sorted(set(item['subtopic_id'] for item in item_features))
        subtopic_id = subtopic_ids[subtopic_idx % len(subtopic_ids)]  # Cycle through subtopics
        category = 'Vocabulary' if is_vocab else 'Grammar'

        # Initialize index for this subtopic if not present
        if subtopic_id not in subtopic_indices:
            subtopic_indices[subtopic_id] = 0

        # Get candidate items for this subtopic and category
        candidates = [item for item in items_by_subtopic[subtopic_id][category] if item['item_id'] not in used_items]
        
        if not candidates:
            refined_plan.append(None)  # No available items
            continue

        # Select item based on similarity to previous item (if any)
        selected_item = candidates[0]  # Default to first available
        if refined_plan and refined_plan[-1] is not None:
            prev_item = next((item for item in item_features if item['item_id'] == refined_plan[-1]), None)
            if prev_item:
                prev_features = np.array([prev_item['difficulty']])
                selected_item = max(
                    candidates,
                    key=lambda x: cosine_similarity(
                        np.array([x['difficulty']]),
                        prev_features
                    ),
                    default=candidates[0]
                )

        study_plan.append(selected_item['item_id'])
        used_items.add(selected_item['item_id'])
        subtopic_indices[subtopic_id] += 1

    return study_plan

# Main execution
if __name__ == "__main__":
    try:
        plan_snippet, item_features = parse_args(sys.argv)
        
        study_plan = content_based_filtering(plan_snippet, item_features)
        
        result = {
            "study_plan": study_plan
        }

        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))