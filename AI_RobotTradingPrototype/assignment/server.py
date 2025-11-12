import Pyro4
import random
import os
import datetime
import subprocess

now = datetime.datetime.now()
print('date: ' + now.strftime('%d-%m-%y') + ' Time: ' + now.strftime('%H:%M:%S'))

@Pyro4.expose
class Server(object):
    def get_usid(self, name):
        return "Hello, {0}.\nYour Current User Session is {1}:".format(name, random.randint(0, 1000))
    
    def add(self, a, b):
        return "{0} + {1} = {2}".format(a, b, a + b)
    
    def subtract(self, a, b):
        return "{0} - {1} = {2}".format(a, b, a - b)
    
    def multiply(self, a, b):
        return "{0} * {1} = {2}".format(a, b, a * b)
    
    def division(self, a, b):
        return "{0} / {1} = {2}".format(a, b, a / b)
    
    def exp(self, a):
        return "{0} ** {1} = {2}".format(a, a, a ** a)

# Initialize the Pyro4 Daemon
daemon = Pyro4.Daemon()

# Locate the name server
ns = Pyro4.locateNS()

# Register the Server object with the name server
url = daemon.register(Server)
ns.register("RMI.calculator", url)

# Print the server status
print("The Server is now active, please request your calculations or start file transfer")

# Start the Pyro event loop
daemon.requestLoop()

