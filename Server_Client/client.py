# client.py
import socket
import threading
import time

def receive_messages(client_socket):
    """Thread function to continuously receive messages from server"""
    while True:
        try:
            message = client_socket.recv(1024).decode('utf-8')
            if not message:
                print("\nServer disconnected")
                break
            print(f"\nServer says: {message}")
            print("You: ", end="", flush=True)  # Prompt for next input
        except:
            break

def start_client():
    # Server configuration
    host = 'localhost'
    port = 12346
    
    try:
        # Create a socket object
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        print(f"Attempting to connect to {host}:{port}...")
        
        # Connect to the server
        client_socket.connect((host, port))
        print(f"Connected to server at {host}:{port}")
        print("You can start chatting now! (Type 'quit' to exit)")
        print("-" * 50)
        
        # Start a thread to receive messages
        receive_thread = threading.Thread(target=receive_messages, args=(client_socket,))
        receive_thread.daemon = True
        receive_thread.start()
        
        while True:
            # Get user input
            message = input("You: ")
            
            if message.lower() == 'quit':
                client_socket.send("quit".encode('utf-8'))
                print("Disconnecting from server...")
                break
                
            # Send message to server
            client_socket.send(message.encode('utf-8'))
            
            # Small delay to prevent flooding
            time.sleep(0.1)
            
    except ConnectionRefusedError:
        print(f"Could not connect to server at {host}:{port}.")
        print("Make sure the server is running and the port is correct.")
    except KeyboardInterrupt:
        print("\nClient is shutting down...")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        try:
            client_socket.close()
            print("Connection closed")
        except:
            pass

if __name__ == "__main__":
    start_client()