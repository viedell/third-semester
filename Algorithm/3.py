def calculate_sjf_metrics(service_times):
    
    sorted_times = sorted(service_times)
    
    current_time = 0
    total_time_in_system = 0
    
    for service_time in sorted_times:
        start_time = current_time
        finish_time = start_time + service_time
        time_in_system = finish_time
        
        current_time = finish_time
        total_time_in_system += time_in_system

    num_jobs = len(service_times)
    average_time_in_system = total_time_in_system / num_jobs

    return {
        "sorted_jobs": sorted_times,
        "total_time": total_time_in_system,
        "average_time": average_time_in_system
    }

schedule = [5, 10, 3, 8, 2]

sjf_results = calculate_sjf_metrics(schedule)

print("--- Hasil Perhitungan SJF ---")
print(f"Urutan Layanan (SJF): {sjf_results['sorted_jobs']}")
print(f"Total Waktu dalam Sistem: {sjf_results['total_time']}")
print(f"Rata-rata Waktu dalam Sistem: {sjf_results['average_time']}")
