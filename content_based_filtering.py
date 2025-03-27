def parse_args(args):
    return {
        "item_id": int(args[1]),
        "daily_study_time": int(args[2]),
        "study_plan": list(int(args[3]),
        "days_to_exam": int(args[4]),
        "difficulty": list(map(int, args[5].split(','))),
        "is_common": list(map(int, args[6].split(','))),
        "part_of_speech": int(args[8])
    }
