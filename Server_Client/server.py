# server.py
import socket
import threading

def handle_client(client_socket, client_address, client_id):
    print(f"\n=== Client #{client_id} connected from {client_address} ===")
    
    try:
        while True:
            # Receive message from client
            message = client_socket.recv(1024).decode('utf-8')
            
            if not message:
                print(f"Client #{client_id} disconnected")
                break
                
            if message.lower() == 'quit':
                print(f"Client #{client_id} requested to quit")
                break
                
            print(f"Client #{client_id} says: {message}")
            
            # Server can now respond with its own message
            server_response = input(f"Reply to Client #{client_id}: ")
            
            if server_response.lower() == 'quit':
                client_socket.send("Server is shutting down. Goodbye!".encode('utf-8'))
                break
                
            # Send server's response back to client
            client_socket.send(server_response.encode('utf-8'))
            print(f"Sent to Client #{client_id}: {server_response}")
            
    except ConnectionResetError:
        print(f"Client #{client_id} disconnected unexpectedly")
    except Exception as e:
        print(f"Error with Client #{client_id}: {e}")
    finally:
        client_socket.close()
        print(f"=== Connection with Client #{client_id} closed ===\n")

def start_server():
    # Create a socket object
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    # Server configuration
    host = 'localhost'
    port = 12346
    
    # Bind the socket to the address and port
    server_socket.bind((host, port))
    
    # Listen for incoming connections
    server_socket.listen(5)
    print(f"=== Chat Server started on {host}:{port} ===")
    print("Waiting for incoming connections...")
    print("Type 'quit' to stop the server\n")
    
    client_count = 0
    
    try:
        while True:
            # Accept a connection from a client
            client_socket, client_address = server_socket.accept()
            client_count += 1
            
            # Create a new thread for each client
            client_thread = threading.Thread(
                target=handle_client, 
                args=(client_socket, client_address, client_count)
            )
            client_thread.daemon = True
            client_thread.start()
            
    except KeyboardInterrupt:
        print("\nServer is shutting down...")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close the server socket
        server_socket.close()
        print("Server socket closed")

if __name__ == "__main__":
    start_server()