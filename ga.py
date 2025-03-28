import pygad
import sys
import json
import sys

#Parameters from the server
def parse_args(args):
    return {
        "daily_study_time": int(args[1]),
        "days_to_exam": int(args[2]),
        "vocab_goal": int(args[3]),
        "grammar_goal": int(args[4]),
        "vocab_group_sizes": list(map(int, args[5].split(','))),
        "grammar_group_sizes": list(map(int, args[6].split(','))),
        "num_generations": int(args[7]),
        "sol_per_pop": int(args[8]),
        "just_pass": args[9].lower() == "true",
        "level": args[10] 
    }

jlpt_passing = {
    "N5": {"pass_score": 80, "section_min": 38},
    "N4": {"pass_score": 90, "section_min": 38},
    "N3": {"pass_score": 95, "section_min": 19},
    "N2": {"pass_score": 90, "section_min": 19},
    "N1": {"pass_score": 100, "section_min": 19}
}

PARAMS = None

def get_vocab_subgroup(activity, vocab_group_sizes):
    if activity == 0:  # Idle time
        return None
    total = 0
    for i, size in enumerate(vocab_group_sizes, 1):  # Start at 1 for subgroup numbering
        total += size
        if activity <= total:
            return i
    return None  

#Fitness function
def fitness_function(ga_instance, solution, solution_idx):
    global PARAMS
    vocab_groups = len(PARAMS["vocab_group_sizes"])
    grammar_groups = len(PARAMS["grammar_group_sizes"])
    total_activities = vocab_groups + grammar_groups + 1
    
    vocab_group_counts = {f"V{i+1}": 0 for i in range(vocab_groups)}
    grammar_group_counts = {f"G{i+1}": 0 for i in range(grammar_groups)}
    total_time_penalty = 0
    time_bonus = 0
    balance_penalty = 0
    subgroup_bonus = 0

    vocab_threshold = sum(PARAMS["vocab_group_sizes"])  
    
    for day in range(PARAMS["days_to_exam"]):
        day_start = day * PARAMS["daily_study_time"]
        slots = solution[day_start:day_start + PARAMS["daily_study_time"]]
        time_used = sum(1.5 if 1 <= s <= vocab_threshold else 
                        3 if vocab_threshold < s < total_activities else 
                        0 for s in slots)
        
        if time_used > PARAMS["daily_study_time"]:
            total_time_penalty -= 50 * (time_used - PARAMS["daily_study_time"])
        elif time_used <= PARAMS["daily_study_time"]:
            time_bonus += 50 * (PARAMS["daily_study_time"] - time_used + 1)
        
        vocab_count = sum(1 for s in slots if 1 <= s <= vocab_threshold)
        grammar_count = sum(1 for s in slots if vocab_threshold < s < total_activities)
        total_active = vocab_count + grammar_count
        if total_active > 0:
            vocab_ratio = vocab_count / total_active
            if vocab_ratio < 0.2:
                balance_penalty -= 100

        subgroup_counts = {}
        for s in slots:
            if 1 <= s <= vocab_threshold:  
                subgroup = get_vocab_subgroup(s, PARAMS["vocab_group_sizes"])
                subgroup_counts[subgroup] = subgroup_counts.get(subgroup, 0) + 1
        
        for count in subgroup_counts.values():
            if count > 1:  
                subgroup_bonus += 10 * (count - 1)
    
    for day in range(PARAMS["days_to_exam"]):
        day_start = day * PARAMS["daily_study_time"]
        slots = solution[day_start:day_start + PARAMS["daily_study_time"]]
        for s in slots:
            s = int(s)
            if 1 <= s <= vocab_groups:
                vocab_group_counts[f"V{s}"] += 1
            elif vocab_groups < s < total_activities:
                grammar_group_counts[f"G{s - vocab_groups}"] += 1
    
    sequence_penalty = 0
    for i in range(vocab_groups - 1):
        if (vocab_group_counts[f"V{i+2}"] > 0 and 
            vocab_group_counts[f"V{i+1}"] < PARAMS["vocab_group_sizes"][i]):
            sequence_penalty -= 25
    for i in range(grammar_groups - 1):
        if (grammar_group_counts[f"G{i+2}"] > 0 and 
            grammar_group_counts[f"G{i+1}"] < PARAMS["grammar_group_sizes"][i]):
            sequence_penalty -= 25
    
    total_vocab = min(sum(vocab_group_counts.values()), PARAMS["vocab_goal"])
    total_grammar = min(sum(grammar_group_counts.values()), PARAMS["grammar_goal"])
    progress = total_vocab + total_grammar
    
    return progress + sequence_penalty + total_time_penalty + balance_penalty + time_bonus + subgroup_bonus

if __name__ == "__main__":
    PARAMS = parse_args(sys.argv)

    level_data = jlpt_passing[PARAMS["level"]]
    if PARAMS["just_pass"] == "true":
        total_max = PARAMS["vocab_goal"] + PARAMS["grammar_goal"]
        passing_proportion = level_data["pass_score"] / 180  
        vocab_groups = max(int(PARAMS["vocab_goal"] * passing_proportion), level_data["section_min"])
        grammar_groups = max(int(PARAMS["grammar_goal"] * passing_proportion), level_data["section_min"])
    else:
        vocab_groups = PARAMS["vocab_goal"]
        grammar_groups = PARAMS["grammar_goal"]

    total_activities = vocab_groups + grammar_groups + 1
    gene_space = list(range(total_activities))
    
    ga_instance = pygad.GA(
        num_generations=PARAMS["num_generations"],
        sol_per_pop=PARAMS["sol_per_pop"],
        num_genes=PARAMS["days_to_exam"] * PARAMS["daily_study_time"],
        gene_space=gene_space,
        fitness_func=fitness_function,
        num_parents_mating=2,
        mutation_percent_genes=10,
        gene_type=int,
    )
    
    ga_instance.run()
    solution, solution_fitness, _ = ga_instance.best_solution()
    
    result = {
        "study_plan": solution.tolist(),
        "score": float(solution_fitness),
        "total_activity": total_activities
    }
    
    print(json.dumps(result))