import numpy as np

def floyd_warshall(graph):

    n = len(graph)
    
    # Salin matriks awal untuk menyimpan hasil
    dist = [row[:] for row in graph]

    # 1. Loop K: Verteks Perantara (k)
    for k in range(n):      
        # 2. Loop I: Verteks Awal (i)
        for i in range(n):
            # 3. Loop J: Verteks Akhir (j)
            for j in range(n):
                
                # Cek apakah jalur baru (i -> k -> j) lebih pendek dari 
                # jalur yang sudah ada (i -> j).
                
                # Pastikan kedua komponen jalur i->k dan k->j dapat diakses 
                # (bukan INF) sebelum melakukan penjumlahan.
                if dist[i][k] != float('inf') and dist[k][j] != float('inf'):
                    
                    # Formula Pemrograman Dinamis
                    new_distance = dist[i][k] + dist[k][j]
                    
                    if new_distance < dist[i][j]:
                        dist[i][j] = new_distance

    return dist

INF = float('inf')

# Matriks Jarak Awal (A0): 4 Verteks
graph_initial = [
    [0, 3, INF, 7],     # Dari 1 (0)
    [8, 0, 2, INF],     # Dari 2 (1)
    [5, INF, 0, 1],     # Dari 3 (2)
    [2, INF, INF, 0]    # Darilara 4 (3)
]

# Jalankan Algoritma
shortest_paths = floyd_warshall(graph_initial)

# Tampilkan Hasil dalam format matriks
print("Matriks Jarak Terpendek Akhir (Floyd-Warshall):")
print(np.array(shortest_paths))