import pygad
import sys
import json

def parse_args(args):
    return {
        "daily_study_time": int(args[1]),
        "days_to_exam": int(args[2]),
        "vocab_goal": int(args[3]),
        "grammar_goal": int(args[4]),
        "vocab_group_sizes": list(map(int, args[5].split(','))),
        "grammar_group_sizes": list(map(int, args[6].split(','))),
        "num_generations": int(args[7]),
        "sol_per_pop": int(args[8])
    }

def fitness_function(ga_instance, solution, solution_idx):
    params = ga_instance.custom_data
    vocab_groups = len(params["vocab_group_sizes"])
    grammar_groups = len(params["grammar_group_sizes"])
    total_activities = vocab_groups + grammar_groups + 1
    
    vocab_group_counts = {f"V{i+1}": 0 for i in range(vocab_groups)}
    grammar_group_counts = {f"G{i+1}": 0 for i in range(grammar_groups)}
    total_time_penalty = 0
    balance_penalty = 0
    time_bonus = 0
    balance_bonus = 0
    
    for day in range(params["days_to_exam"]):
        day_start = day * params["daily_study_time"]
        slots = solution[day_start:day_start + params["daily_study_time"]]
        time_used = sum(1 if 1 <= s <= vocab_groups else 
                        2 if vocab_groups < s < total_activities 
                        else 0 for s in slots)
        
        if time_used > params["daily_study_time"]:
            total_time_penalty -= 50 * (time_used - params["daily_study_time"])
        elif time_used == params["daily_study_time"]:
            time_bonus += 75
        
        vocab_count = sum(1 for s in slots if 1 <= s <= vocab_groups)
        grammar_count = sum(1 for s in slots if vocab_groups < s < total_activities)
        total_active = vocab_count + grammar_count
        if total_active > 0:
            vocab_ratio = vocab_count / total_active
            if vocab_ratio > 0.8 or vocab_ratio < 0.2:
                balance_penalty -= 20
            elif 0.4 <= vocab_ratio <= 0.6:
                balance_bonus += 20
    
    for day in range(params["days_to_exam"]):
        day_start = day * params["daily_study_time"]
        slots = solution[day_start:day_start + params["daily_study_time"]]
        for s in slots:
            s = int(s)
            if 1 <= s <= vocab_groups:
                vocab_group_counts[f"V{s}"] += 1
            elif vocab_groups < s < total_activities:
                grammar_group_counts[f"G{s - vocab_groups}"] += 1
    
    sequence_penalty = 0
    for i in range(vocab_groups - 1):
        if (vocab_group_counts[f"V{i+2}"] > 0 and 
            vocab_group_counts[f"V{i+1}"] < params["vocab_group_sizes"][i]):
            sequence_penalty -= 10
    for i in range(grammar_groups - 1):
        if (grammar_group_counts[f"G{i+2}"] > 0 and 
            grammar_group_counts[f"G{i+1}"] < params["grammar_group_sizes"][i]):
            sequence_penalty -= 10
    
    total_vocab = min(sum(vocab_group_counts.values()), params["vocab_goal"])
    total_grammar = min(sum(grammar_group_counts.values()), params["grammar_goal"])
    progress = total_vocab + 0.5 * total_grammar
    
    return progress + sequence_penalty + total_time_penalty + balance_penalty + time_bonus + balance_bonus

if __name__ == "__main__":
    params = parse_args(sys.argv)
    vocab_groups = len(params["vocab_group_sizes"])
    grammar_groups = len(params["grammar_group_sizes"])
    total_activities = vocab_groups + grammar_groups + 1
    gene_space = list(range(total_activities))
    
    ga_instance = pygad.GA(
        num_generations=params["num_generations"],
        sol_per_pop=params["sol_per_pop"],
        num_genes=params["days_to_exam"] * params["daily_study_time"],
        gene_space=gene_space,
        fitness_func=fitness_function,
        num_parents_mating=2,
        mutation_percent_genes=10,
        gene_type=int,
        custom_data=params 
    )
    
    ga_instance.run()
    solution, solution_fitness, _ = ga_instance.best_solution()
    
    result = {
        "daily_plan": solution[:params["daily_study_time"]].tolist(),
        "score": float(solution_fitness)
    }
    
    print(json.dumps(result))