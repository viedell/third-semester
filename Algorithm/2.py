activities_data = [
    ('A', 1, 4),
    ('B', 3, 5),
    ('C', 0, 6),
    ('D', 5, 7),
    ('E', 8, 9),
    ('F', 5, 9)
]

def activity_selector(data, sort_key):
    processed_data = []
    for name, start, finish in data:
        duration = finish - start
        processed_data.append((name, start, finish, duration))

    sorted_activities = sorted(processed_data, key=lambda x: x[sort_key])
    
    selected_activities = []
    last_finish_time = -1

    for name, start, finish, duration in sorted_activities:
        if start >= last_finish_time:
            selected_activities.append(name)
            last_finish_time = finish
            
    return selected_activities

selected_v1 = activity_selector(activities_data, 2)
print("--- Versi 1: Finish Time ---")
print(f"Aktivitas Terpilih: {', '.join(selected_v1)}")
print(f"Jumlah Aktivitas: {len(selected_v1)}")

selected_v2 = activity_selector(activities_data, 3)
print("\n--- Versi 2: Duration ---")
print(f"Aktivitas Terpilih: {', '.join(selected_v2)}")
print(f"Jumlah Aktivitas: {len(selected_v2)}")
