import Pyro4
import os
import datetime

# Create a Proxy object for the remote server
Client = Pyro4.Proxy("PYRONAME:RMI.calculator")

# Get user's name
name = input("What is your name? ").strip()

# Get current date and time
now = datetime.datetime.now()
print('date: ' + now.strftime('%d-%m-%y') + ' Time: ' + now.strftime('%H:%M:%S'))

# Call the get_usid method from the server
print(Client.get_usid(name))

# Prompt the user to enter the number of calculations
print("Enter the number of calculations to be done")
n = int(input("Enter n: "))

while n > 0:
    n = n - 1

    # Get the numbers to be used in the calculation
    a = int(input("Enter a: "))
    b = int(input("Enter b: "))

    # Display the menu of calculation choices
    print("Enter number for desired calculations: \n" +
          '1. ADD \n' +
          '2. SUBTRACT \n' +
          '3. MULTIPLY \n' +
          '4. DIVISION \n' +
          '5. EXPONENTIATION \n')

    # Loop to ensure the user enters a valid choice (1-5)
    while True:
        c = int(input('Enter your choice: '))

        if c == 1:
            print(Client.add(a, b))
            break  # Exit the loop once a valid input is received
        elif c == 2:
            print(Client.subtract(a, b))
            break
        elif c == 3:
            print(Client.multiply(a, b))
            break
        elif c == 4:
            print(Client.division(a, b))
            break
        elif c == 5:
            print(Client.exp(a))
            break
        else:
            print('Invalid input. Please enter a number between 1 and 5.')
            # Menu will be displayed again after invalid input
            print("Enter number for desired calculations: \n" +
                  '1. ADD \n' +
                  '2. SUBTRACT \n' +
                  '3. MULTIPLY \n' +
                  '4. DIVISION \n' +
                  '5. EXPONENTIATION \n')

