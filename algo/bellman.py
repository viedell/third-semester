def bellman_ford(vertices, edges, source):
    # Inisialisasi jarak
    distance = {v: float('inf') for v in vertices}
    distance[source] = 0

    # Relaksasi edge sebanyak V-1 kali
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w

    # Deteksi negative weight cycle
    for u, v, w in edges:
        if distance[u] + w < distance[v]:
            print("Negative weight cycle terdeteksi!")
            return None

    return distance


# Daftar vertex
vertices = [1, 2, 3, 4, 5, 6, 7]

# Daftar edge (u, v, weight)
edges = [
    (1, 2, 6),
    (1, 3, 5),
    (1, 4, 5),
    (3, 2, -2),
    (4, 3, -2),
    (2, 5, -1),
    (3, 5, 1),
    (4, 6, -1),
    (5, 7, 3),
    (6, 7, 3)
]

# Jalankan Bellman-Ford
source = 1
result = bellman_ford(vertices, edges, source)

# Tampilkan hasil
if result:
    print("Jarak terpendek dari simpul", source)
    for v in result:
        print(f"Ke simpul {v} = {result[v]}")