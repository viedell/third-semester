def merge_sort_simple(arr):
    # Base Case
    if len(arr) <= 1:
        return arr

    # 1. Divide
    mid = len(arr) // 2
    left = merge_sort_simple(arr[:mid])
    right = merge_sort_simple(arr[mid:])

    # 2. Conquer (Merge)
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        # Compare scores (element index 1)
        if left[i][1] <= right[j][1]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

students = [("Andi", 78), ("Budi", 65), ("Citra", 85), ("Dewi", 72), ("Eka", 90)]
sorted_students_merge = merge_sort_simple(students)

print("--- Merge Sort Simple ---")
print("Original List:", students)
print("Sorted List:", sorted_students_merge)