def quick_sort_simple(arr):
    # Base Case
    if len(arr) <= 1:
        return arr

    # 1. Choose Pivot (using the first element for simplicity)
    pivot = arr[0][1] # Score of the first student

    # 2. Partition: Create three lists based on score relative to the pivot
    less = []
    equal = []
    greater = []

    for student in arr:
        score = student[1]
        if score < pivot:
            less.append(student)
        elif score == pivot:
            equal.append(student)
        else:
            greater.append(student)

    # 3. Conquer (Recursive Call) and Combine
    return quick_sort_simple(less) + equal + quick_sort_simple(greater)

students_quick = [("Andi", 78), ("Budi", 65), ("Citra", 85), ("Dewi", 72), ("Eka", 90)]
sorted_students_quick = quick_sort_simple(students_quick)

print("\n--- Quick Sort Simple ---")
print("Original List:", students_quick)
print("Sorted List:", sorted_students_quick)