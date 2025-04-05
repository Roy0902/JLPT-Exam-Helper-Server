import pygad
import sys
import json
import sys
import numpy as np

def parse_args(args):
    return {
        "daily_study_time": int(args[1]),
        "days_to_exam": int(args[2]),
        "vocab_goal": int(args[3]),
        "grammar_goal": int(args[4]),
        "vocab_group_sizes": list(map(int, args[5].split(','))),
        "grammar_group_sizes": list(map(int, args[6].split(','))),
        "just_pass": args[7].lower() == "true",
        "level": args[8] 
    }

jlpt_passing = {
    "N5": {"pass_score": 80, "section_min": 38},
    "N4": {"pass_score": 90, "section_min": 38},
    "N3": {"pass_score": 95, "section_min": 19},
    "N2": {"pass_score": 90, "section_min": 19},
    "N1": {"pass_score": 100, "section_min": 19}
}

PARAMS = None

def on_start(ga_instance):
    global PARAMS
    vocab_groups = len(PARAMS["vocab_group_sizes"])
    grammar_groups = len(PARAMS["grammar_group_sizes"])
    total_activities = vocab_groups + grammar_groups + 1
    vocab_time_cost = 1.25
    grammar_time_cost = 2
    
    solution_size = PARAMS["days_to_exam"] * PARAMS["daily_study_time"]
    total_vocab_size = sum(PARAMS["vocab_group_sizes"])
    total_grammar_size = sum(PARAMS["grammar_group_sizes"])
    total_material_size = total_vocab_size + total_grammar_size
    
    idle_weight = max(1, solution_size / (total_material_size + 1)) * 0.05
    vocab_weights = PARAMS["vocab_group_sizes"]  
    grammar_weights = PARAMS["grammar_group_sizes"]  
    weights = [idle_weight] + vocab_weights + grammar_weights
    probabilities = [w / sum(weights) for w in weights]  
    
    initial_population = []
    for _ in range(100):
        solution = np.zeros(solution_size, dtype=int)
        for day in range(PARAMS["days_to_exam"]):
            day_start = day * PARAMS["daily_study_time"]
            available_slots = list(range(day_start, day_start + PARAMS["daily_study_time"]))
            np.random.shuffle(available_slots)
            time_left = PARAMS["daily_study_time"]
            
            for slot in available_slots:
                if time_left >= grammar_time_cost:
                    activity = np.random.choice(total_activities, p=probabilities)
                    time_cost = (vocab_time_cost if 1 <= activity <= vocab_groups else 
                                grammar_time_cost if activity > vocab_groups else 0)
                    if time_cost <= time_left:
                        solution[slot] = activity
                        time_left -= time_cost
                elif time_left >= vocab_time_cost:
                    vocab_probs = probabilities[0:vocab_groups + 1] 
                    vocab_probs = [p / sum(vocab_probs) for p in vocab_probs] 
                    activity = np.random.choice(vocab_groups + 1, p=vocab_probs)
                    if activity > 0: 
                        solution[slot] = activity
                        time_left -= vocab_time_cost
                else:
                    break  
        initial_population.append(solution)
    ga_instance.population = np.array(initial_population)
    
#Fitness function
def fitness_function(ga_instance, solution, solution_idx):
    global PARAMS
    vocab_groups = len(PARAMS["vocab_group_sizes"])
    grammar_groups = len(PARAMS["grammar_group_sizes"])
    total_activities = vocab_groups + grammar_groups + 1
    
    vocab_group_counts = {i + 1: 0 for i in range(vocab_groups)} 
    grammar_group_counts = {i + 1: 0 for i in range(grammar_groups)}

    overassignment_penalty = 0 
    time_penalty = 0
    underachievement_penalty = 0
    vocab_balance_penalty = 0

    clustering_bonus = 0

    for day in range(PARAMS["days_to_exam"]):
        day_start = day * PARAMS["daily_study_time"]
        slots = solution[day_start:day_start + PARAMS["daily_study_time"]]
        
        time_used = sum(1.25 if 1 <= s <= vocab_groups else 
                        2 if vocab_groups < s < total_activities else 
                        0 for s in slots)
        
        if time_used > PARAMS["daily_study_time"]:
            return -float('inf')  # Hard constraint: reject infeasible solutions

        time_usage = time_used / PARAMS['daily_study_time']
        target_min = 0.5
        if time_usage > 0.1 and time_usage < target_min:
            time_penalty -= 4

        day_vocab_counts = {i + 1: 0 for i in range(vocab_groups)}  
        day_grammar_counts = {i + 1: 0 for i in range(grammar_groups)}
        
        for s in slots:
            s = int(s)
            if 1 <= s <= vocab_groups:
                day_vocab_counts[s] += 1
                vocab_group_counts[s] += 1  
            elif vocab_groups < s < total_activities:
                day_grammar_counts[s - vocab_groups] += 1
                grammar_group_counts[s - vocab_groups] += 1


        for count in day_vocab_counts.values():
            if count > 1:
                clustering_bonus += count * 2
        
        for count in day_grammar_counts.values():
            if count > 1:
                clustering_bonus += count * 2

    vocab_progress = 0
    for group, count in vocab_group_counts.items():
        group_size = PARAMS["vocab_group_sizes"][group - 1] 
        vocab_progress += min(count, group_size)  
        if count > group_size: 
            overassignment_penalty -= 2 * (count - group_size)  

    vocab_progress = min(vocab_progress, PARAMS["vocab_goal"])

    grammar_progress = 0
    for group, count in grammar_group_counts.items():
        group_size = PARAMS["grammar_group_sizes"][group - 1]  
        grammar_progress += min(count, group_size) 
        if count > group_size:
            overassignment_penalty -= 2 * (count - group_size)

    grammar_progress = min(grammar_progress, PARAMS["grammar_goal"]) 

    progress = vocab_progress + grammar_progress

    total_goal = PARAMS["vocab_goal"] + PARAMS["grammar_goal"]
    if progress < total_goal:
        underachievement_penalty = -2 * (total_goal - progress)
    
    fitness = progress + time_penalty + overassignment_penalty + underachievement_penalty + clustering_bonus + vocab_balance_penalty
    return fitness

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

    total_activities = len(PARAMS["vocab_group_sizes"]) + len(PARAMS["grammar_group_sizes"]) + 1
    gene_space = list(range(total_activities))
    
    ga_instance = pygad.GA(
        num_generations=100,
        sol_per_pop=100,
        num_genes=PARAMS["days_to_exam"] * PARAMS["daily_study_time"],
        gene_space=gene_space,
        fitness_func=fitness_function,
        num_parents_mating=35,
        mutation_percent_genes=12,
        gene_type=int,
        on_start=on_start
    )
    
    ga_instance.run()
    solution, solution_fitness, _ = ga_instance.best_solution()
    
    result = {
        "study_plans": solution.tolist(),
        "score": float(solution_fitness),
    }
    
    print(json.dumps(result))